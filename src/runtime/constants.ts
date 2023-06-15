export const MODULE_ID = "nuxt-analytics";

export const IN_BROWSER = typeof window !== "undefined";

export const SUPPORTS_INTERSECTION =
  IN_BROWSER && "IntersectionObserver" in window;
