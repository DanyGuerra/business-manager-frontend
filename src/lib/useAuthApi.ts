import { ApiResponse, User } from "@/app/types/auth";
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
    login: (data: any) =>
      api
        .post<ApiResponse<LoginResponse>>("auth/login", data)
        .then((res) => res.data),

    signup: (data: any) =>
      api
        .post<ApiResponse<SignupResponse>>("auth/signup", data)
        .then((res) => res.data),

    getMe: () =>
      api.get<ApiResponse<User>>("/users/me").then((res) => res.data),

    updatePassword: (data: any) =>
      api
        .post<ApiResponse>("users/update-password", data)
        .then((res) => res.data),

    updateUser: (data: any) =>
      api.patch<ApiResponse<User>>("/users/me", data).then((res) => res.data),
  };
}
