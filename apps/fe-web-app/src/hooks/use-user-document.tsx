import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserDocumentApi } from "@/apis/user-document.api";
import type { TCreateUserDocument } from "@/schema/user-document.schema";

const getDocumentQueryKey = (userId: string) => ["userDocuments", userId];

export const useUserDocument = (userId?: string) => {
  const queryClient = useQueryClient();

  const documentQuery = useQuery({
    queryKey: getDocumentQueryKey(userId ?? "unknown"),
    queryFn: () => {
      if (!userId) {
        throw new Error("userId is required to fetch documents");
      }
      return UserDocumentApi.getDocumentsByUser(userId);
    },
    enabled: Boolean(userId),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: TCreateUserDocument) => UserDocumentApi.submitDocuments(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: getDocumentQueryKey(variables.user) });
    },
  });

  return {
    ...documentQuery,
    submitDocument: submitMutation,
  };
};

export const useAllUserDocuments = () =>
  useQuery({
    queryKey: ["userDocumentsAll"],
    queryFn: () => UserDocumentApi.getAllDocuments(),
  });
