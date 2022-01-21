export interface SignUpRequest {
  username: string;
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  othernames: string;
  password: string;
  country: string;
  preferredLanguage: string;
  role: string;
  addresses: Array<Object>;
  avatar: string;
}

export interface SignInRequest {
  user: string;
  password: string;
}

export interface VerifyRequest {
  token: string;
  userId?: string;
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
