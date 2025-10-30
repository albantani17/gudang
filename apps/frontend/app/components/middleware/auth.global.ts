export default defineNuxtRouteMiddleware((to) => {
  if (to.path === "/login") {
    return;
  }
  const cookie = useCookie("auth_token");
  console.log(cookie.value);     
  if (!cookie.value) {
    return navigateTo("/login");
  }
});
