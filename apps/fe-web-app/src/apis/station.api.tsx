import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TStation } from "@/schema/station.schema";

const getStationList = async () =>
  await apiRequest.get<BaseResponse<TStation[]>>(API_SUFFIX.STATION_API);
const getStationById = async (id: string) =>
  await apiRequest.get<BaseResponse<TStation>>(API_SUFFIX.STATION_API + `/${id}`);
const createStation = async (payload: Partial<TStation>) =>
  await apiRequest.post<BaseResponse<TStation>>(API_SUFFIX.STATION_API, payload);
const updateStation = async (id: string, payload: Partial<TStation>) =>
  await apiRequest.put<BaseResponse<TStation>>(API_SUFFIX.STATION_API + `/${id}`, payload);
const deleteStation = async (id: string) => await apiRequest.delete(API_SUFFIX.STATION_API + `/${id}`);

export const StationApi = {
  getStationList,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
};
