import { devEnv } from "../../configs/env";
import { jwt } from "../../helpers";
import { User } from "../../models";
import { UserSchema } from "../../types/models";
import { others, user } from "../../types/services";

/**
 * Get user profile
 * @param {others.LoggedIn} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const getProfile = async (
  params: others.LoggedIn
): Promise<others.Response> => {
  try {
    const { userId } = params;

    const data: UserSchema = await User.findByPk(userId);

    if (!data) return { status: false, message: "Profile not found" };

    return { status: true, message: "Profile", data };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to get Profile".concat(devEnv ? ": " + error : ""),
    };
  }
};

/**
 * Update user profile
 * @param {user.UpdateRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const updateProfile = async (
  params: user.UpdateRequest
): Promise<others.Response> => {
  try {
    const { userId } = params;

    const user: UserSchema = await User.findOne({
      where: { id: userId, isDeleted: false },
    });

    delete params.userId;

    await user.update(params);

    return {
      status: true,
      message: "Profile updated",
    };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to update profile".concat(
        devEnv ? ": " + error : ""
      ),
    };
  }
};

/**
 * Update user password
 * @param {user.UpdatePasswordRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const updatePassword = async (
  params: user.UpdatePasswordRequest
): Promise<others.Response> => {
  try {
    const { userId, newPassword, password, logOtherDevicesOut } = params;

    const user: UserSchema = await User.findOne({
      where: { id: userId, isDeleted: false },
    });

    if (!user.validatePassword(password))
      return { status: false, message: "Old password is Invalid" };

    let update: any = { password: newPassword };
    if (logOtherDevicesOut) update.loginValidFrom = Date.now();

    await user.update({ password: newPassword });
    return { status: true, message: "Password updated" };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to updating password".concat(
        devEnv ? ": " + error : ""
      ),
    };
  }
};

/**
 * Log other devices out
 * @param {others.LoggedIn} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const logOtherDevicesOut = async (
  params: others.LoggedIn
): Promise<others.Response> => {
  try {
    const { userId } = params;

    const user: UserSchema = await User.findByPk(userId);
    await user.update({ loginValidFrom: Date.now().toString() });

    const data: any = jwt.generate({
      payload: user.id,
      loginValidFrom: user.loginValidFrom,
    });

    return {
      status: true,
      message: `Other Devices have been logged out`,
      data,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to log other devices out".concat(
        devEnv ? ": " + error : ""
      ),
    };
  }
};

/**
 * Log out
 * @param {others.LoggedIn} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const signOut = async (
  params: others.LoggedIn
): Promise<others.Response> => {
  try {
    const { userId } = params;

    await User.update(
      { loginValidFrom: Date.now().toString() },
      { where: { id: userId } }
    );

    return { status: true, message: `Signed out` };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to sign out".concat(devEnv ? ": " + error : ""),
    };
  }
};
