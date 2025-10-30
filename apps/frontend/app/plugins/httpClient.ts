export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const token = useCookie("auth_token");

  const httpClient = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    onRequest({ options }) {
      if (token.value) {
        const headers = new Headers({
          ...options.headers,
          Authorization: `Bearer ${token.value}`,
        });
        options.headers = {
          ...headers,
        };
      }

      options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
      } as Headers;
    },
    onResponse({ response }) {
      if (import.meta.dev) {
        console.log("Response:", response.status, response._data);
      }
    },
    onResponseError({ response }) {
      console.error("Response error:", response.status, response._data);

      if (response.status === 401) {
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
