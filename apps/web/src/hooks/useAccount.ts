import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api.fetch("/profile", { method: "DELETE" }),
  });
}
