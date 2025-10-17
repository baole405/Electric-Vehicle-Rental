import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HandoverApi } from "@/apis/handover.api";
import type { TCreateHandover } from "@/schema/handover.schema";

const handoverKey = (rentalId?: string) => ["handoverList", rentalId ?? "all"];

export const useHandoverHook = (rentalId?: string) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: handoverKey(rentalId),
    queryFn: () => HandoverApi.getHandovers(rentalId ? { rentalId } : undefined),
  });

  const createHandover = useMutation({
    mutationFn: (payload: TCreateHandover) => HandoverApi.createHandover(payload),
    onSuccess: (_, variables) => {
      const relatedKeys = [handoverKey(), handoverKey(variables.rental)];
      relatedKeys.forEach((key) => {
        void queryClient.invalidateQueries({ queryKey: key });
      });
      void queryClient.invalidateQueries({ queryKey: ["rentalList"] });
      void queryClient.invalidateQueries({ queryKey: ["rentalDetail", variables.rental] });
    },
  });

  return {
    ...listQuery,
    createHandover,
  };
};
