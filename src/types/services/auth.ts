export interface SignUpRequest {
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  password: string;
  role: string;
  avatar: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface VerifyRequest {
  token?: string;
  userId: string;
  email?: string;
}

export interface InitiateResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  logOtherDevicesOut: boolean;
}
