import { EventUser } from "#analytics";
import { Enumerable, EventProperties } from "../types";
import { useNuxtAnalytics } from "./useNuxtAnalytics";

export const useAnalytics = () => {
  const analytics = useNuxtAnalytics();

  const track = (
    event: string,
    props?: EventProperties,
    channels?: Enumerable<string>
  ) => {
    return analytics.track({ event, props, channels });
  };

  const page = (props?: EventProperties, channels?: Enumerable<string>) => {
    return analytics.page({ props, channels });
  };

  const identify = (
    user: EventUser | string | number,
    channels?: Enumerable<string>
  ) => {
    if (typeof user === "string" || typeof user === "number") {
      user = { id: user };
    }
    return analytics.identify({ user, channels });
  };

  const superProperties = analytics.superProperties.bind(analytics);
  const on = analytics.on.bind(analytics);

  return {
    track,
    page,
    identify,
    superProperties,
    on,
  };
};
