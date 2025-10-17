import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TCreateUserPayload, TUser } from "@/schema/user.schema";

const getUserById = async (id: string) =>
  await apiRequest.get<BaseResponse<TUser>>(API_SUFFIX.USER_API + `/${id}`);

const createUser = async (payload: TCreateUserPayload) =>
  await apiRequest.post<BaseResponse<TUser>>(API_SUFFIX.USER_API, payload);

export const UserApi = {
  getUserById,
  createUser,
};
