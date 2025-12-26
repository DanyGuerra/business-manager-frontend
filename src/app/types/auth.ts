export type ApiResponse<T = unknown> = {
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

export type LoginDto = {
  email?: string;
  password?: string;
};

export type SignupDto = {
  email: string;
  username: string;
  name: string;
  password?: string;
};
