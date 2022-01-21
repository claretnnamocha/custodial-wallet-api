import bcrypt from "bcryptjs";
import randomstring from "randomstring";
import { Op } from "sequelize";
import { v4 as uuid } from "uuid";
import { devEnv } from "../../configs/env";
import { jwt, mail } from "../../helpers";
import { Token, User } from "../../models";
import { TokenSchema, UserSchema } from "../../types/models";
import { auth, others } from "../../types/services";
import * as msg from "../message-templates";
import * as wallet from "../wallet/services";

/**
 * Creates user account
 * @param {auth.SignUpRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const signUp = async (
  params: auth.SignUpRequest
): Promise<others.Response> => {
  try {
    const { email, phone, username } = params;

    for (const param of ["email", "username", "phone"]) {
      const where: object = { [param]: params[param] };
      const duplicate: UserSchema = await User.findOne({ where });
      if (duplicate) {
        return {
          status: false,
          message: `This ${param} has been used to open an account on this platform`,
        };
      }
    }

    const id = uuid();

    await User.create({
      id,
      ...params,
    });

    await wallet.createWallet({ userId: id });

    const token: string = await generateToken({
      userId: id,
      length: 10,
    });

    const { text, html } = msg.registration({ token, username, email });
    mail.pepipost.send({
      to: email,
      subject: "Registration Complete",
      text,
      html,
    });

    return { status: true, message: "Registration Successful" };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to create account".concat(
        devEnv ? ": " + error : ""
      ),
    };
  }
};

/**
 * Login
 * @param {auth.SignInRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const signIn = async (
  params: auth.SignInRequest
): Promise<others.Response> => {
  try {
    const { user, password } = params;

    const _user: UserSchema = await User.findOne({
      where: { [Op.or]: [{ username: user }, { email: user }] },
    });

    if (!_user || !bcrypt.compareSync(password, _user.password)) {
      return { status: false, message: "Invalid username or password" };
    }

    if (!_user.active) {
      return { status: false, message: "Account is banned contact admin" };
    }

    if (!_user.verifiedemail) {
      const token: string = await generateToken({
        userId: _user.id,
        length: 10,
      });

      const { text, html } = msg.verifyEmail({
        token,
        username: _user.username,
        email: _user.email,
      });
      mail.pepipost.send({
        to: _user.email,
        subject: "Verify your email",
        text,
        html,
      });

      return { status: false, message: "Please verify your email" };
    }

    const data: any = _user.toJSON();
    data.token = jwt.generate({
      payload: _user.id,
      loginValidFrom: _user.loginValidFrom,
    });

    return { status: true, message: "Login successful", data };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to login".concat(devEnv ? ": " + error : ""),
    };
  }
};

/**
 * Verify user account
 * @param {auth.VerifyRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const verifyAccount = async (
  params: auth.VerifyRequest
): Promise<others.Response> => {
  try {
    const { token, email } = params;

    if (email) {
      const user: UserSchema = await User.findOne({
        where: { email },
      });

      if (!user) return { status: false, message: "User does not exist" };

      const token: string = await generateToken({
        userId: user.id,
        length: 10,
      });

      const { text, html } = msg.verifyEmail({
        token,
        username: user.username,
        email: user.email,
      });
      mail.pepipost.send({
        to: user.email,
        subject: "Verify your email",
        text,
        html,
      });

      return { status: true, message: "Check your email" };
    }

    const _token: TokenSchema = await Token.findOne({
      where: { token, tokenType: "verify", active: true },
    });

    if (!_token) {
      return { status: false, message: "Invalid token" };
    }

    await _token.update({ active: false });

    if (parseInt(_token.expires) < Date.now()) {
      return { status: false, message: "Token expired" };
    }

    const user: UserSchema = await User.findByPk(_token.UserId);

    if (!user) {
      return { status: false, message: "Invalid token" };
    }

    await user.update({ verifiedemail: true });

    return { status: true, message: "Account verified" };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to verify account".concat(
        devEnv ? ": " + error : ""
      ),
    };
  }
};

/**
 * Reset user account password
 * @param {auth.InitiateResetRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const initiateReset = async (
  params: auth.InitiateResetRequest
): Promise<others.Response> => {
  try {
    const { email } = params;

    const user: UserSchema = await User.findOne({
      where: { email, isDeleted: false },
    });
    if (!user) {
      return { status: true, message: "Check your email" };
    }

    const token = await generateToken({
      userId: user.id,
      tokenType: "reset",
      length: 15,
    });

    const { text, html } = msg.resetPassword({
      token,
      username: user.username,
    });
    mail.pepipost.send({
      to: user.email,
      subject: "Reset Password",
      text,
      html,
    });

    return { status: true, message: "Check your email" };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to login".concat(devEnv ? ": " + error : ""),
    };
  }
};

/**
 * Verify user reset token
 * @param {auth.VerifyRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const verifyReset = async (
  params: auth.VerifyRequest
): Promise<others.Response> => {
  try {
    const { token } = params;

    const _token: TokenSchema = await Token.findOne({
      where: { token, tokenType: "reset", active: true },
    });

    if (!_token) {
      return { status: false, message: "Invalid token" };
    }

    await _token.update({ active: false });

    if (parseInt(_token.expires) < Date.now()) {
      return { status: false, message: "Token expired" };
    }

    const user: UserSchema = await User.findByPk(_token.UserId);

    if (!user) {
      return { status: false, message: "Invalid token" };
    }

    const data: string = await generateToken({
      userId: user.id,
      length: 12,
      tokenType: "update",
    });

    return { status: true, message: "Valid token", data };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to login".concat(devEnv ? ": " + error : ""),
    };
  }
};

/**
 * Reset user password
 * @param {auth.ResetPasswordRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const resetPassword = async (
  params: auth.ResetPasswordRequest
): Promise<others.Response> => {
  try {
    const { token, password, logOtherDevicesOut } = params;

    const _token: TokenSchema = await Token.findOne({
      where: { token, tokenType: "update", active: true },
    });

    if (!_token) {
      return { status: false, message: "Invalid token" };
    }

    await _token.update({ active: false });

    if (parseInt(_token.expires) < Date.now()) {
      return { status: false, message: "Token expired" };
    }

    const user: UserSchema = await User.findByPk(_token.UserId);

    if (!user) {
      return { status: false, message: "Invalid token" };
    }

    let update: any = { password };
    if (logOtherDevicesOut) update.loginValidFrom = Date.now();

    await user.update(update);

    return { status: true, message: "Password updated" };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to reset password".concat(
        devEnv ? ": " + error : ""
      ),
    };
  }
};

const generateToken = async ({
  userId,
  tokenType = "verify",
  medium = "any",
  expiresMins = 5,
  charset = "alphanumeric",
  length = 5,
}) => {
  await Token.update(
    { active: false },
    { where: { UserId: userId, tokenType, active: true } }
  );

  const token = randomstring.generate({
    charset,
    length,
    capitalization: "uppercase",
  });

  await Token.create({
    id: uuid(),
    tokenType,
    token,
    UserId: userId,
    medium,
    expires: Date.now() + 60 * 1000 * expiresMins,
  });

  return token;
};
