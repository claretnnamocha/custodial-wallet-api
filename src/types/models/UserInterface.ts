export interface UserInterface {
  id?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  gender?: string;
  dob?: string;
  deleted?: boolean;
  verifiedemail?: boolean;
  verifiedphone?: boolean;
  role?: string;
  active?: boolean;
  createdAt?: Date;
  transform?: Function;
  updatedAt?: Date;
}
