import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TUser } from "@/schema/user.schema";


const getUserById = async (id: string) => await apiRequest.get<BaseResponse<TUser>>(API_SUFFIX.USER_API + `/${id}`);

export const UserApi = {
  getUserById,
};
