export interface UpdateRequest {
  userId: string;
  firstname?: string;
  lastname?: string;
  location?: string;
  dob?: Date;
  avatar?: string;
}

export interface UpdatePasswordRequest {
  userId: string;
  password: string;
  logOtherDevicesOut: boolean;
  newPassword: string;
}

export interface ChangePin {
  userId: string;
  pin: string;
  oldPin: string;
  logOtherDevicesOut: boolean;
}
