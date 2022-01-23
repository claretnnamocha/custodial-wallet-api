export interface UserInterface {
  id?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  gender?: string;
  role?: string;
  location?: string;
  ethereumAddress?: string;
  ethereumAccount?: string | any;
  bitcoinAddress?: string;
  bitcoinAccount?: string | any;
  dob?: Date;
  deleted?: boolean;
  verifiedemail?: boolean;
  verifiedphone?: boolean;
  active?: boolean;
  createdAt?: Date;
  loginValidFrom?: string;
  resolveAccount?: Function;
  transform?: Function;
  validatePassword?: Function;
  updatedAt?: Date;
}
