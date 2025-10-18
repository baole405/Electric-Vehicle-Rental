import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TUser } from "@/schema/user.schema";

type AuthResponse = {
  token: string;
  user: TUser;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  fullName: string;
  phone?: string;
};

const login = async (payload: LoginPayload) =>
  await apiRequest.post<BaseResponse<AuthResponse>>(`${API_SUFFIX.AUTH_API}/login`, payload);

const register = async (payload: RegisterPayload) =>
  await apiRequest.post<BaseResponse<AuthResponse>>(`${API_SUFFIX.AUTH_API}/register`, payload);

export const AuthApi = {
  login,
  register,
};
