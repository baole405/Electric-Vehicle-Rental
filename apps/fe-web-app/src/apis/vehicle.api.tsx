import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TVehicle } from "@/schema/vehicle.schema";

const getVehicleList = async () => await apiRequest.get<BaseResponse<TVehicle[]>>(API_SUFFIX.VEHICEL_API);
const getVehicleDetail = async (id: string) => await apiRequest.get<BaseResponse<TVehicle>>(API_SUFFIX.VEHICEL_API + `/${id}`);

export const VehicleApi = {
  getVehicleList,
  getVehicleDetail,
};
