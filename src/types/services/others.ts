export interface LoggedIn {
  userId: string;
  page?: number;
  pageSize?: number;
}

interface ServiceResponse {
  status: boolean;
  message: string;
  data?: any;
  metadata?: any;
}

interface ServiceAndCodeResponse {
  payload: ServiceResponse;
  code: number;
}

export type Response = ServiceResponse | ServiceAndCodeResponse;
