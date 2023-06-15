import { useNuxtApp } from "nuxt/app";

export const useNuxtAnalytics = () => {
  return useNuxtApp().$analytics;
};
