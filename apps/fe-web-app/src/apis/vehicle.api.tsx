import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TVehicle } from "@/schema/vehicle.schema";

const getVehicleList = async () =>
  await apiRequest.get<BaseResponse<TVehicle[]>>(API_SUFFIX.VEHICLE_API);
const getVehicleDetail = async (id: string) =>
  await apiRequest.get<BaseResponse<TVehicle>>(API_SUFFIX.VEHICLE_API + `/${id}`);
const createVehicle = async (payload: Partial<TVehicle>) =>
  await apiRequest.post<BaseResponse<TVehicle>>(API_SUFFIX.VEHICLE_API, payload);
const updateVehicle = async (id: string, payload: Partial<TVehicle>) =>
  await apiRequest.put<BaseResponse<TVehicle>>(API_SUFFIX.VEHICLE_API + `/${id}`, payload);
const deleteVehicle = async (id: string) => await apiRequest.delete(API_SUFFIX.VEHICLE_API + `/${id}`);

export const VehicleApi = {
  getVehicleList,
  getVehicleDetail,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
