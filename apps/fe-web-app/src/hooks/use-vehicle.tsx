import { VehicleApi } from "@/apis/vehicle.api";
import { useQuery } from "@tanstack/react-query";

export const useVehicleHook = () => {
  const useVehicleList = () =>
    useQuery({
      queryKey: ["vehicleList"],
      queryFn: () => VehicleApi.getVehicleList(),
    });

  return {
    useVehicleList,
  };
};
