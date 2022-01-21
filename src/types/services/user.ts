export interface ChangePasswordRequest {
  userId: string;
  password: string;
  oldPassword: string;
}

export interface EditProfileRequest {
  userId: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  dob?: string;
  country?: string;
  preferredLanguage?: string;
  currency?: string;
}
