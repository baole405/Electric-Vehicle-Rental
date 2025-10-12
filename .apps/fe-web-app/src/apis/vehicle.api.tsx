import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import { TVehicle } from "@/schema/vehicle.schema";
import { BaseResponse } from "@/schema/common/response.type";

const getVehicleList = async () => await apiRequest.get< BaseResponse<TVehicle[]>> (API_SUFFIX.VEHICEL_API);

export const VehicleApi = {
  getVehicleList
};
