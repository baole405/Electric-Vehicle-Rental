import { StationApi } from "@/apis/station.api";
import type { TStation } from "@/schema/station.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStationHook = () => {
  const queryClient = useQueryClient();

  const useStationList = () =>
    useQuery({
      queryKey: ["stationlist"],
      queryFn: () => StationApi.getStationList(),
    });
  const useStationById = (id: string) =>
    useQuery({
      queryKey: ["stationdetail", id],
      queryFn: () => StationApi.getStationById(id),
    });

  const createStation = useMutation({
    mutationFn: (payload: Partial<TStation>) => StationApi.createStation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stationlist"] });
    },
  });

  const updateStation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TStation> }) =>
      StationApi.updateStation(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stationlist"] });
    },
  });

  const deleteStation = useMutation({
    mutationFn: (id: string) => StationApi.deleteStation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stationlist"] });
    },
  });
  return {
    useStationList,
    useStationById,
    createStation,
    updateStation,
    deleteStation,
  };
};
