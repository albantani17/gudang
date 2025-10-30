import { usePaginationStore } from "~/stores/pagination.store";
import type { TRole } from "~/types/user";

export type ResponseRole = {
  items: TRole[];
  total: number;
  pagination: {
    limit: number;
    currentPage: number;
    totalPages: number;
  };
};

export const useRoles = () => {
  const { $httpClient } = useNuxtApp();
  const { limit, page, search } = usePaginationStore();

  const find = async (staticQuery?: {
    search?: string;
    limit: number;
    page: number;
  }) => {
    const result = await $httpClient<{ data: ResponseRole }>("/roles", {
      method: "GET",
      query: staticQuery || { search, limit, page },
    });
    return result;
  };

  return {
    find,
  };
};
