import { VehicleApi } from "@/apis/vehicle.api";
import type { TVehicle } from "@/schema/vehicle.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useVehicleHook = () => {
  const queryClient = useQueryClient();

  const useVehicleList = () =>
    useQuery({
      queryKey: ["vehicleList"],
      queryFn: () => VehicleApi.getVehicleList(),
    });
  const useVehicleById = (id: string, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: ["vehicledetail", id],
      queryFn: () => VehicleApi.getVehicleDetail(id),
      enabled: options?.enabled ?? Boolean(id),
    });

  const updateVehicle = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TVehicle> }) =>
      VehicleApi.updateVehicle(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vehicleList"] });
      void queryClient.invalidateQueries({ queryKey: ["vehicledetail"] });
    },
  });

  return {
    useVehicleList,
    useVehicleById,
    updateVehicle,
  };
};
