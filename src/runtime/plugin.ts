import { defineNuxtPlugin } from "#app";
import NuxtAnalytics from "#analytics";
import { Analytics } from "./Analytics";
import BaseAdapter from "./adapters/BaseAdapter";
import InlineAdapterConstructor from "./adapters/InlineAdapterConstructor";
import { getAdapterConstructor } from "./adapters/factory";
import { internalChannelFactory } from "./channels/factory";
import Component from "./components/TrackEvent";
import Directive from "./directives/TrackEvent";
import { Channel, ModuleOptions } from "./types";
import { createInlineChannel, isInlineAdapter, isInlineChannel } from "./utils";

declare module "#app" {
  interface NuxtApp {
    $analytics: Analytics;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const options = NuxtAnalytics.options as ModuleOptions;

  const env = process.env.NODE_ENV;
  const channels: Channel[] = [];
  const adapters: BaseAdapter[] = [];

  Object.entries(options.channels).forEach(([name, config]) => {
    if (isInlineChannel(config)) {
      channels.push(createInlineChannel(name, config, env));
    } else {
      channels.push(
        internalChannelFactory(config.driver as any, name, config, env)
      );
    }
  });

  options.adapters.forEach((adapter) => {
    if (isInlineAdapter(adapter)) {
      adapters.push(new InlineAdapterConstructor(adapter));
    } else if (typeof adapter == "string") {
      const constructor = getAdapterConstructor(adapter);
      if (constructor) {
        adapters.push(new constructor());
      } else {
        // TODO: resolve file?
      }
    } else {
      adapters.push(new adapter());
    }
  });

  const analytics = new Analytics({
    channels,
    adapters,
    disabled: options.disabled,
    concurrency: options.queueConcurrency,
    env,
  });

  analytics.superProperties(options.superProperties);

  nuxtApp.provide("analytics", analytics);
  nuxtApp.vueApp.component("TrackEvent", Component);
  nuxtApp.vueApp.directive("TrackEvent", Directive);

  nuxtApp.hook("app:mounted", async () => {
    await analytics.boot();
  });

  const _unmount = nuxtApp.vueApp.unmount;
  nuxtApp.vueApp.unmount = async function () {
    await analytics.destroy();
    _unmount(); // Call original unmount
  };
});
