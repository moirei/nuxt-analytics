import { defineNuxtRouteMiddleware } from "nuxt/app";
import { useAnalytics } from "#imports";
import { Enumerable, EventProperties } from "../types";

declare module "#app" {
  interface PageMeta {
    analytics?:
      | boolean
      | Enumerable<string>
      | {
          channel?: Enumerable<string>;
          props?: EventProperties;
        };
  }
}

export default defineNuxtRouteMiddleware((to) => {
  const { page } = useAnalytics();
  const config = to.meta.analytics;

  if (config === false) {
    return;
  }

  let channels: Enumerable<string> | undefined;
  let props: EventProperties | undefined;

  if (typeof config == "string") {
    channels = config;
  } else if (Array.isArray(config)) {
    channels = config;
  } else if (typeof config == "object") {
    channels = config.channel;
    props = config.props;
  }

  page(props, channels);
});
