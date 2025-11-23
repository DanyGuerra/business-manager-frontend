export type ApiResponse<T = any> = {
  message: string;
  statusCode: number;
  data: T;
};

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type UpdatePasswordDto = {
  oldPassword?: string;
  newPassword?: string;
};

export type UpdateUserDto = {
  name?: string;
};
