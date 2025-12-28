import { ApiResponse, User, LoginDto, SignupDto, UpdatePasswordDto, UpdateUserDto } from "@/app/types/auth";
import { useAxios } from "@/lib/axios";

type LoginResponse = { access_token: string };
type SignupResponse = {
  id: string;
  email: string;
  username: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export function useAuthApi() {
  const api = useAxios();

  return {
    login: (data: LoginDto) =>
      api
        .post<ApiResponse<LoginResponse>>("auth/login", data)
        .then((res) => res.data),

    signup: (data: SignupDto) =>
      api
        .post<ApiResponse<SignupResponse>>("auth/signup", data)
        .then((res) => res.data),

    getMe: () =>
      api.get<ApiResponse<User>>("/users/me").then((res) => res.data),

    updatePassword: (data: UpdatePasswordDto) =>
      api
        .post<ApiResponse>("users/update-password", data)
        .then((res) => res.data),

    updateUser: (data: UpdateUserDto) =>
      api.patch<ApiResponse<User>>("/users/update", data).then((res) => res.data),

    logout: () => api.post("auth/logout").then((res) => res.data),
  };
}
