export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const token = useCookie("auth_token");

  const httpClient = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    onRequest({ options }) {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token.value) {
        headers.Authorization = `Bearer ${token.value}`;
      }

      options.headers = headers as unknown as Headers;
    },
    onResponse({ response }) {
      if (import.meta.dev) {
        console.log("Response:", response.status, response._data);
      }
    },
    onResponseError({ response }) {
      console.error("Response error:", response.status, response._data);

      if (response.status === 401) {
        token.value = null;
        navigateTo("/login");
      }

      if (response.status === 500) {
        console.error("Server error:", response._data);
      }
    },
  });

  return {
    provide: {
      httpClient,
    },
  };
});
