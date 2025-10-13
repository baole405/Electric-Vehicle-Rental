import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TStation } from "@/schema/station.schema";

const getStationList = async () => await apiRequest.get<BaseResponse<TStation[]>>(API_SUFFIX.STATION_API);
const getStationById = async (id: string) => await apiRequest.get<BaseResponse<TStation>>(API_SUFFIX.STATION_API + `/${id}`);

export const StationApi = {
  getStationList,
  getStationById,
};
