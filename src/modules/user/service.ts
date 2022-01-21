import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { User } from "../../models";
import { UserSchema } from "../../types/models";
import { others, others as service, user } from "../../types/services";

/**
 * Change password
 * @param {user.ChangePasswordRequest} params  Request Body
 * @returns {service.Response} Contains status, message and data if any of the operation
 */
const changePassword = async (
  params: user.ChangePasswordRequest
): Promise<service.Response> => {
  try {
    const { userId, oldPassword, password } = params;

    const user: UserSchema = await User.findOne({
      where: { id: userId },
    });

    if (!bcrypt.compareSync(oldPassword, user.password)) {
      return { status: false, message: "Invalid Old password" };
    }

    await user.update({ password });

    return { status: true, message: "Password change Successful" };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to change password",
    };
  }
};

/**
 * Get  User profile
 * @param {others.LoggedIn} params  Request Body
 * @returns {service.Response} Contains status, message and data if any of the operation
 */
const getProfile = async (
  params: others.LoggedIn
): Promise<service.Response> => {
  try {
    const { userId } = params;

    const user: UserSchema = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      return {
        status: false,
        message: " User not found",
      };
    }
    return { status: true, message: "Profile", data: user.transform() };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to get profile",
    };
  }
};

/**
 * Edit profile
 * @param {user.EditProfileRequest} params  Request Body
 * @returns {service.Response} Contains status, message and data if any of the operation
 */
const editProfile = async (
  params: user.EditProfileRequest
): Promise<service.Response> => {
  try {
    const {
      userId,
      username,
      firstname,
      lastname,
      dob,
      country,
      preferredLanguage,
      currency,
    } = params;

    const user: UserSchema = await User.findOne({
      where: { id: userId },
    });

    let update = {};

    if (firstname !== undefined) update["firstname"] = firstname;
    if (lastname !== undefined) update["lastname"] = lastname;
    if (dob !== undefined) update["dob"] = dob;
    if (country !== undefined) update["country"] = country;
    if (preferredLanguage !== undefined)
      update["preferredLanguage"] = preferredLanguage;
    if (currency !== undefined) update["currency"] = currency;

    if (username !== undefined) {
      const duplicate: UserSchema = await User.findOne({
        where: { username, isDeleted: false, id: { [Op.ne]: user.id } },
      });

      if (duplicate)
        return {
          status: false,
          message: "This username has been taken on this platform",
        };

      update["username"] = username;
    }
    await user.update(update);

    return { status: true, message: "Profile edit Successful" };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to edit profile",
    };
  }
};

export { changePassword, editProfile, getProfile };
