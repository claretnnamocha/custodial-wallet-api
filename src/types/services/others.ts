export interface LoggedIn {
  userId: string;
}

export interface Response {
  status: boolean;
  message: string;
  data?: any;
}
