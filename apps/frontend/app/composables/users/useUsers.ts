import { usePaginationStore } from "~/stores/pagination.store";

export type TUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type ResponseUser = {
  items: TUser[];
  total: number;
  pagination: {
    limit: number;
    currentPage: number;
    totalPages: number;
  };
};

export const useUsers = () => {
  const { $httpClient } = useNuxtApp();
  const { search, limit, page } = usePaginationStore();

  const find = async () => {
    const result = await $httpClient<{ data: ResponseUser }>("/users", {
      method: "GET",
      query: { search, limit, page },
    });
    return result;
  };

  const refresh = () => find();

  return {
    find,
    refresh,
  };
};
