import { ChannelsConfig, EventUser } from "#analytics";
import BaseAdapter from "./adapters/BaseAdapter";

export type Promisable<T> = T | Promise<T>;

export type Enumerable<T> = T | T[];

export type ValueAccessible<T> = T | { (...args: any[]): T };

export type Constructor<T, A extends T = T> = {
  new (...args: any[]): A;
};

export interface IAnalytics {
  track(payload: EventPayload): Promise<void>;
  page(payload: PagePayload): Promise<void>;
  identify(payload: IdentifyPayload): Promise<void>;
}

export type AdapterSourceLike =
  | string
  | InlineAdapter
  | Constructor<BaseAdapter>;

export type EventProperties = Record<PropertyKey, any>;

export type EventPayload = {
  event: string;
  props?: EventProperties;
  channels?: Enumerable<string>;
  user?: EventUser;
};

export type PagePayload = {
  props?: EventProperties;
  channels?: Enumerable<string>;
  user?: EventUser;
};

export type IdentifyPayload = {
  user: EventUser;
  channels?: Enumerable<string>;
};

export interface Channel {
  readonly name: string;
  readonly driver: string;
  readonly disabled: boolean;
  readonly env?: Enumerable<string>;
  install: { (): Promisable<void> };
  uninstall: { (): Promisable<void> };
  track: { (payload: EventPayload): Promisable<void> };
  page: { (payload: PagePayload): Promisable<void> };
  identify: { (payload: IdentifyPayload): Promisable<void> };
}

export interface InlineChannel extends Partial<Omit<Channel, "name">> {
  __inline: true;
  track: { (payload: EventPayload): Promisable<void> };
}

export interface InlineAdapter {
  __inline: true;
  channels?: Enumerable<string>;
  events?: Enumerable<PropertyKey>;
  eventNameAs?: BaseAdapter["eventNameAs"];
  eventPropertiesAs?: BaseAdapter["eventPropertiesAs"];
  mapEventNames?: Record<PropertyKey, string | { (p: EventPayload): string }>;
  mapEventProperties?: Record<
    PropertyKey,
    { (p: EventPayload): void | EventProperties }
  >;
}

type ChannelsConfigKey = keyof ChannelsConfig;
type ChannelsConfigs = {
  [A in ChannelsConfigKey]: ChannelsConfig[A] & {
    driver: A;
    disabled?: boolean;
    env?: Enumerable<string>;
  };
};

export interface ModuleOptions<
  C extends ChannelsConfigKey = ChannelsConfigKey
> {
  // partytown: boolean;
  disabled: boolean;
  trackGlobalPages: boolean;
  superProperties: EventProperties;
  queueConcurrency: number;
  channels: Record<string, ChannelsConfigs[C] | InlineChannel>;
  adapters: AdapterSourceLike[];
}

export interface AnalyticsHooks {
  "track:before": (payload: EventPayload) => Promisable<any>;
  "track:after": (payload: EventPayload) => Promisable<void>;
  "track:channel:before": (
    channel: Channel,
    payload: EventPayload
  ) => Promisable<any>;
  "track:channel:after": (
    channel: Channel,
    payload: EventPayload
  ) => Promisable<void>;
  "page:before": (payload: PagePayload) => Promisable<any>;
  "page:after": (payload: PagePayload) => Promisable<void>;
  "page:channel:before": (
    channel: Channel,
    payload: PagePayload
  ) => Promisable<any>;
  "page:channel:after": (
    channel: Channel,
    payload: PagePayload
  ) => Promisable<void>;
  "identify:before": (payload: IdentifyPayload) => Promisable<any>;
  "identify:after": (payload: IdentifyPayload) => Promisable<void>;
  "identify:channel:before": (
    channel: Channel,
    payload: IdentifyPayload
  ) => Promisable<any>;
  "identify:channel:after": (
    channel: Channel,
    payload: IdentifyPayload
  ) => Promisable<void>;
  // error: {
  //   (error: Error, ...args: any[]): Promisable<any>;
  // };
}
