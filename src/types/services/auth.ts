export interface SignUpRequest {
  email: string;
  firstname: string;
  lastname: string;
  othernames: string;
  password: string;
  country: string;
  preferredLanguage: string;
  role: string;
  addresses: Object;
  avatar: string;
}

export interface SignInRequest {
  user: string;
  password: string;
}

export interface VerifyRequest {
  token: string;
}

export interface ResendVerifyRequest {
  email: string;
}

export interface InitiateResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}
