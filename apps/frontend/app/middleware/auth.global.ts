export default defineNuxtRouteMiddleware((to) => {
  const cookie = useCookie("auth_token");
  if (!cookie.value && to.path !== "/login") {
    return navigateTo("/login");
  }
  if (cookie.value && to.path === "/login") {
    return navigateTo("/");
  }
});
