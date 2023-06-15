import { ChannelsConfig } from "#analytics";
import { error, set } from "../utils";
import BaseChannel from "./BaseChannel";
import FacebookPixel from "./FacebookPixel";
import Mixpanel from "./Mixpanel";
import Posthog from "./Posthog";
import { Constructor } from "../types";
import Amplitude from "./Amplitude";
import GoogleAnalytics from "./GoogleAnalytics";
import GoogleAnalytics4 from "./GoogleAnalytics4";
import GoogleTagManager from "./GoogleTagManager";
import Hotjar from "./Hotjar";
import Debug from "./Debug";
import Smartlook from "./Smartlook";

const map: Record<keyof ChannelsConfig, Constructor<BaseChannel>> = {
  amplitude: Amplitude,
  debug: Debug,
  facebook: FacebookPixel,
  ga: GoogleAnalytics,
  ga4: GoogleAnalytics4,
  gtm: GoogleTagManager,
  hotjar: Hotjar,
  mixpanel: Mixpanel,
  posthog: Posthog,
  smartlook: Smartlook,
};

export const internalChannelFactory = (
  driver: keyof ChannelsConfig,
  name: string,
  config: any,
  env?: string
  // @ts-ignore
): BaseChannel => {
  const constructor = map[driver];

  if (!constructor) {
    error(`No internal channel defined for [${driver}]`);
  }

  const channel = new constructor(name, config, env);

  set(channel, "driver", driver);

  return channel!;
};
