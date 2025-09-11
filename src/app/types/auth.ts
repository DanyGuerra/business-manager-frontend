export type ApiResponse<T = any> = {
  message: string;
  statusCode: number;
  data: T;
};
