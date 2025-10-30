export const usePaginationStore = defineStore("pagination", {
  state: () => ({
    limit: 10,
    page: 1,
    search: "",
  }),
  actions: {
    setLimit(limit: number) {
      this.limit = limit;
    },
    setPage(page: number) {
      this.page = page;
    },
    setSearch(search: string) {
      this.search = search;
    },
    reset() {
      this.limit = 10;
      this.page = 1;
      this.search = "";
    },
  },
});
