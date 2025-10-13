import { StationApi } from "@/apis/station.api";

import { useQuery } from "@tanstack/react-query";

export const useStationHook = () => {

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
  return {
    useStationList,
    useStationById,
  };


};
