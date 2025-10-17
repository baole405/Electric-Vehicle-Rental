import { UserApi } from "@/apis/user.api";
import { useQuery } from "@tanstack/react-query";

export const useUserHook = () => {
  const useUserById = (id: string, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: ["userdetail", id],
      queryFn: () => UserApi.getUserById(id),
      enabled: options?.enabled ?? Boolean(id),
    });
  return {
    useUserById,
  };
};
