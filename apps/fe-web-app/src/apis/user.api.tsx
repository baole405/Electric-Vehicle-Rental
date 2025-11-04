import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TCreateUserPayload, TUser } from "@/schema/user.schema";

const getUsers = async () =>
  await apiRequest.get<BaseResponse<TUser[]>>(API_SUFFIX.USER_API);
const getUserById = async (id: string) =>
  await apiRequest.get<BaseResponse<TUser>>(API_SUFFIX.USER_API + `/${id}`);
const getCurrentUser = async () =>
  await apiRequest.get<BaseResponse<TUser>>(API_SUFFIX.USER_API + `/me`);

const createUser = async (payload: TCreateUserPayload & { role?: TUser["role"]; status?: TUser["status"] }) =>
  await apiRequest.post<BaseResponse<TUser>>(API_SUFFIX.USER_API, payload);
const updateUser = async (id: string, payload: Partial<TUser>) =>
  await apiRequest.put<BaseResponse<TUser>>(API_SUFFIX.USER_API + `/${id}`, payload);
const deleteUser = async (id: string) => await apiRequest.delete(API_SUFFIX.USER_API + `/${id}`);
const changePassword = async (id: string, payload: { currentPassword: string; newPassword: string }) =>
  await apiRequest.put<BaseResponse<{ message: string }>>(
    API_SUFFIX.USER_API + `/${id}/change-password`,
    payload
  );

export const UserApi = {
  getUsers,
  getUserById,
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
