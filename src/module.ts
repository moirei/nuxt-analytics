import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImportsDir,
  useLogger,
  addRouteMiddleware,
  addTemplate,
} from "@nuxt/kit";
import serialize from "serialize-javascript";
import { MODULE_ID } from "./runtime/constants";
import type { ModuleOptions } from "./runtime/types";

const logger = useLogger(MODULE_ID);

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_ID,
    configKey: "analytics",
  },
  defaults: {
    env: process.env.NODE_ENV,
    disabled: false,
    trackGlobalPages: true,
    superProperties: {},
    channels: {},
    adapters: [],
    queueConcurrency: 10,
    hooks: {},
  },
  setup(options, nuxt) {
    if (!Object.keys(options.channels).length) {
      logger.error(`[${MODULE_ID}] No channel is defined. Existing`);
      return;
    }

    logger.info(`\`${MODULE_ID}\` setup starting`);

    const resolver = createResolver(import.meta.url);

    addPlugin(resolver.resolve("./runtime/plugin"));

    addImportsDir(resolver.resolve("./runtime/composables"));

    addRouteMiddleware({
      path: resolver.resolve("./runtime/middleware/analytics"),
      name: "analytics",
      global: options.trackGlobalPages,
    });

    addTemplate({
      filename: "analytics.d.ts",
      getContents: () =>
        [
          'import type { ModuleOptions } from "@moirei/nuxt-analytics"',
          "export interface ChannelsConfig{ }",
          "export interface EventUser{",
          "  id: string | number;",
          "  name?: string;",
          "  firstName?: string;",
          "  lastName?: string;",
          "  email?: string;",
          "  createdAt?: string | number;",
          "  updatedAt?: string | number;",
          "  city?: string;",
          "  region?: string;",
          "  country?: string;",
          "  [key: string]: any;",
          "}",
          "declare const options: ModuleOptions",
          "export default { options }",
        ].join("\n"),
    });

    nuxt.options.alias["#analytics"] = addTemplate({
      filename: "analytics.mjs",
      getContents: () =>
        [
          "export default {",
          ` options: ${serialize(options)}`,
          "}",
          //
        ].join("\n"),
    }).dst;

    logger.success(`\`${MODULE_ID}\` setup done`);
  },
});

export * from "./runtime/utils";
export * from "./runtime/events";
export * from "./runtime/channels";
export { ModuleOptions };
export { default as BaseAdapter } from "./runtime/adapters/BaseAdapter";
export { default as BaseChannel } from "./runtime/channels/BaseChannel";
export {
  IAnalytics,
  AdapterSourceLike,
  EventProperties,
  EventPayload,
  PagePayload,
  IdentifyPayload,
  InlineChannel,
  InlineAdapter,
  TrackEventDirectiveValue,
  TrackEventDirectiveModifiers,
} from "./runtime/types";
