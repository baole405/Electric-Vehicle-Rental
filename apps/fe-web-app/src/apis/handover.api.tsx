import { apiRequest } from "@/lib/http";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TCreateHandover, THandover } from "@/schema/handover.schema";
import { API_SUFFIX } from "./util.api";

const getHandovers = async (params?: { rentalId?: string }) =>
  await apiRequest.get<BaseResponse<THandover[]>>(API_SUFFIX.HANDOVER_API, {
    params,
  });

const createHandover = async (payload: TCreateHandover) => {
  const formData = new FormData();
  formData.append("rental", payload.rental);
  formData.append("stationId", payload.stationId);
  formData.append("type", payload.type);
  if (payload.odoReading !== undefined && payload.odoReading !== null) {
    formData.append("odoReading", String(payload.odoReading));
  }
  if (payload.batteryPercent !== undefined && payload.batteryPercent !== null) {
    formData.append("batteryPercent", String(payload.batteryPercent));
  }
  if (payload.notes) {
    formData.append("notes", payload.notes);
  }
  payload.photos?.forEach((file) => formData.append("photos", file));

  return await apiRequest.post<BaseResponse<THandover>>(API_SUFFIX.HANDOVER_API, formData);
};

export const HandoverApi = {
  getHandovers,
  createHandover,
};
