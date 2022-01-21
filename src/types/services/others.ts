export interface LoggedIn {
  userId: string;
  page?: number;
  pageSize?: number;
}

export interface Response {
  status: boolean;
  message: string;
  data?: any;
  metadata?: any;
}
