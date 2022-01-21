import bcrypt from "bcryptjs";
import randomstring from "randomstring";
import { Op } from "sequelize";
import { v4 as uuid } from "uuid";
import { jwt, mail } from "../../helpers";
import { Token, User } from "../../models";
import { TokenSchema, UserSchema } from "../../types/models";
import { auth, others as service } from "../../types/services";

/**
 * Creates user account
 * @param {auth.SignUpRequest} params  Request Body
 * @returns {service.Response} Contains status, message and data if any of the operation
 */
export const signUp = async (
  params: auth.SignUpRequest
): Promise<service.Response> => {
  try {
    const { email } = params;

    const duplicate = await User.findOne({
      where: { isDeleted: false, email },
    });

    if (duplicate) {
      return {
        status: false,
        message: `This email has been used to open an account on this platform`,
      };
    }
    const id = uuid();
    await User.create({
      id,
      ...params,
    });

    const token = await generateToken({ userId: id });

    await mail.sendgrid.send({
      to: email,
      subject: "Registration Complete",
      text: `Registration successful your token is ${token}`,
      html: `<b>Registration successful</b><p>your token is ${token}`,
    });

    return { status: true, message: "Registration Successful" };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to create account",
    };
  }
};

/**
 * Login
 * @param {auth.SignInRequest} params  Request Body
 * @returns {service.Response} Contains status, message and data if any of the operation
 */
export const signIn = async (
  params: auth.SignInRequest
): Promise<service.Response> => {
  try {
    const { user, password } = params;

    const _user: UserSchema = await User.findOne({
      where: { [Op.or]: [{ phone: user }, { email: user }] },
    });

    if (!_user || !bcrypt.compareSync(password, _user.password)) {
      return { status: false, message: "Invalid username or password" };
    }

    if (!_user.active) {
      return { status: false, message: "Account is banned contact admin" };
    }

    if (!_user.verifiedemail) {
      const token = await generateToken({ userId: _user.id });
      await mail.sendgrid.send({
        to: _user.email,
        subject: "Verify Email",
        text: `Verify email: ${token}`,
        html: `Verify email: ${token}`,
      });
      return { status: false, message: "Please verify your email" };
    }

    const data = _user.transform();
    data.token = jwt.generate({ userId: _user.id });

    return { status: true, message: "Login successful", data };
  } catch (error) {
    return { status: false, message: "Error trying to login" };
  }
};

/**
 * Verify user account
 * @param {auth.VerifyRequest} params  Request Body
 * @returns {service.Response} Contains status, message and data if any of the operation
 */
export const verifyAccount = async (
  params: auth.VerifyRequest
): Promise<service.Response> => {
  try {
    const { token } = params;

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
      return { status: false, message: "An error occured" };
    }

    await user.update({ verifiedemail: true });

    return { status: true, message: "Account verified" };
  } catch (error) {
    return { status: false, message: "Error trying to login" };
  }
};

/**
 * Resend Verification code for user account
 * @param {auth.ResendVerifyRequest} params  Request Body
 * @returns {service.Response} Contains status, message and data if any of the operation
 */
export const resendVerificationAccount = async (
  params: auth.ResendVerifyRequest
): Promise<service.Response> => {
  try {
    const { email } = params;

    const user: UserSchema = await User.findOne({
      where: { email, active: true },
    });

    if (!user) {
      return { status: false, message: "Invalid user" };
    }

    if (user.verifiedemail) {
      return { status: false, message: "You are already verified" };
    }

    const token = await generateToken({ userId: user.id });
    await mail.sendgrid.send({
      to: user.email,
      subject: "Verify Email",
      text: `Verify email: ${token}`,
      html: `Verify email: ${token}`,
    });
    return { status: true, message: "Verification token resent" };
  } catch (error) {
    return { status: false, message: "Error trying to login" };
  }
};

/**
 * Reset user account password
 * @param {auth.InitiateResetRequest} params  Request Body
 * @returns {service.Response} Contains status, message and data if any of the operation
 */
export const initiateReset = async (
  params: auth.InitiateResetRequest
): Promise<service.Response> => {
  try {
    const { email } = params;

    const user: UserSchema = await User.findOne({
      where: { email, isDeleted: false },
    });
    if (!user) {
      return { status: true, message: "Check your email" };
    }

    const token = await generateToken({ userId: user.id, tokenType: "reset" });

    await mail.sendgrid.send({
      to: user.email,
      subject: "Reset Password",
      text: `Reset Password with ${token}`,
      html: `Reset Password with ${token}`,
    });

    return { status: true, message: "Check your email" };
  } catch (error) {
    return { status: false, message: "Error trying to login" };
  }
};

/**
 * Verify user reset token
 * @param {auth.VerifyRequest} params  Request Body
 * @returns {service.Response} Contains status, message and data if any of the operation
 */
export const verifyReset = async (
  params: auth.VerifyRequest
): Promise<service.Response> => {
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
      return { status: false, message: "An error occured" };
    }

    const data = await generateToken({ userId: user.id, tokenType: "update" });

    return { status: true, message: "Valid token", data };
  } catch (error) {
    return { status: false, message: "Error trying to login" };
  }
};

/**
 * Reset user password
 * @param {auth.ResetPasswordRequest} params  Request Body
 * @returns {service.Response} Contains status, message and data if any of the operation
 */
export const resetPassword = async (
  params: auth.ResetPasswordRequest
): Promise<service.Response> => {
  try {
    const { token, password } = params;

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
      return { status: false, message: "An error occured" };
    }
    await user.update({ password });

    return { status: true, message: "Password updated" };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to reset password",
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
