import { apiRequest } from "@/lib/http";
import { API_SUFFIX } from "./util.api";
import type { BaseResponse } from "@/schema/common/response.type";
import type { TBrand, TBrandWithAvailability } from "@/schema/brand.schema";

const getBrands = async () =>
  await apiRequest.get<BaseResponse<TBrand[]>>(API_SUFFIX.BRAND_API);

const getBrandsByStation = async (stationId: string) =>
  await apiRequest.get<BaseResponse<TBrandWithAvailability[]>>(
    `${API_SUFFIX.BRAND_API}/by-station?stationId=${stationId}`
  );

const getBrandById = async (id: string) =>
  await apiRequest.get<BaseResponse<TBrand>>(API_SUFFIX.BRAND_API + `/${id}`);

const createBrand = async (payload: Partial<TBrand>) =>
  await apiRequest.post<BaseResponse<TBrand>>(API_SUFFIX.BRAND_API, payload);

const updateBrand = async (id: string, payload: Partial<TBrand>) =>
  await apiRequest.put<BaseResponse<TBrand>>(API_SUFFIX.BRAND_API + `/${id}`, payload);

const deleteBrand = async (id: string) =>
  await apiRequest.delete(API_SUFFIX.BRAND_API + `/${id}`);

export const BrandApi = {
  getBrands,
  getBrandsByStation,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
