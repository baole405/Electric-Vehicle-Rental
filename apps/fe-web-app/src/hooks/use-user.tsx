import { UserApi } from "@/apis/user.api";
import type { TUser } from "@/schema/user.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUserHook = () => {
  const queryClient = useQueryClient();

  const useUserList = () =>
    useQuery({
      queryKey: ["userlist"],
      queryFn: () => UserApi.getUsers(),
    });
  const useUserById = (id: string, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: ["userdetail", id],
      queryFn: () => UserApi.getUserById(id),
      enabled: options?.enabled ?? Boolean(id),
    });

  const createUser = useMutation({
    mutationFn: UserApi.createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userlist"] });
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TUser> }) =>
      UserApi.updateUser(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userlist"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => UserApi.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userlist"] });
    },
  });

  return {
    useUserList,
    useUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};
