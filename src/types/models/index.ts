import { Model } from "sequelize";
import { TokenInterface } from "./TokenInterface";
import { UserInterface } from "./UserInterface";

export interface UserSchema extends Model<UserInterface>, UserInterface {}
export interface TokenSchema extends Model<TokenInterface>, TokenInterface {}
