import { UserApi } from "@/apis/user.api";
import { useQuery } from "@tanstack/react-query";

export const useUserHook = () => {
  const useUserById = (id: string) =>
    useQuery({
      queryKey: ["userdetail", id],
      queryFn: () => UserApi.getUserById(id),
    });
  return {
    useUserById,
  };


};
