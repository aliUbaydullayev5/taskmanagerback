export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client) {
    const user = localStorage.getItem("user");

    if (!user && to.path !== "/login") {
      return navigateTo("/login");
    }

    if (user && to.path === "/login") {
      return navigateTo("/");
    }
  }
});
