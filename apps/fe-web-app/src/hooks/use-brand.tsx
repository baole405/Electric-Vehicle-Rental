import { BrandApi } from "@/apis/brand.api";
import type { TBrand } from "@/schema/brand.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useBrandHook = () => {
  const queryClient = useQueryClient();

  const useBrandList = () =>
    useQuery({
      queryKey: ["brandlist"],
      queryFn: () => BrandApi.getBrands(),
    });

  const useBrandsByStation = (stationId: string) =>
    useQuery({
      queryKey: ["brands-by-station", stationId],
      queryFn: () => BrandApi.getBrandsByStation(stationId),
      enabled: !!stationId, // Only run if stationId is provided
    });

  const createBrand = useMutation({
    mutationFn: (payload: Partial<TBrand>) => BrandApi.createBrand(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["brandlist"] });
    },
  });

  const updateBrand = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TBrand> }) =>
      BrandApi.updateBrand(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["brandlist"] });
    },
  });

  const deleteBrand = useMutation({
    mutationFn: (id: string) => BrandApi.deleteBrand(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["brandlist"] });
    },
  });

  return {
    useBrandList,
    useBrandsByStation,
    createBrand,
    updateBrand,
    deleteBrand,
  };
};
