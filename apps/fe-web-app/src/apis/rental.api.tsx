import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TRental } from "@/schema/rental.schema";

const getRentalList = async (params?: { renterId?: string; status?: string }) =>
  await apiRequest.get<BaseResponse<TRental[]>>(API_SUFFIX.RENTAL_API, {
    params,
  });

const getRentalById = async (id: string) =>
  await apiRequest.get<BaseResponse<TRental>>(API_SUFFIX.RENTAL_API + `/${id}`);

const createRental = async (payload: Partial<TRental>) =>
  await apiRequest.post<BaseResponse<TRental>>(API_SUFFIX.RENTAL_API, payload);

const updateRental = async (id: string, payload: Partial<TRental>) =>
  await apiRequest.put<BaseResponse<TRental>>(API_SUFFIX.RENTAL_API + `/${id}`, payload);

const deleteRental = async (id: string) => await apiRequest.delete(API_SUFFIX.RENTAL_API + `/${id}`);

export const RentalApi = {
  getRentalList,
  getRentalById,
  createRental,
  updateRental,
  deleteRental,
};
