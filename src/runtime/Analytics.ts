import defu from "defu";
import { createHooks, Hookable } from "hookable";
import PQueue from "p-queue";
import {
  AnalyticsHooks,
  Channel,
  EventPayload,
  EventProperties,
  IAnalytics,
  IdentifyPayload,
  PagePayload,
  Promisable,
  ValueAccessible,
} from "./types";
import {
  clone,
  error,
  hasProp,
  isCallable,
  isNamedEvent,
  normaliseValue,
  onEach,
  unwrap,
} from "./utils";
import BaseAdapter from "./adapters/BaseAdapter";
import { EventUser } from "#analytics";
import Builder from "./Builder";

export type AnalyticsOptions = {
  channels: Channel[];
  adapters: BaseAdapter[];
  disabled: boolean;
  concurrency?: number;
  env?: string;
};

type HookCallback = (...arguments_: any) => Promise<void> | void;
type InferHooksCallback<HT, HN extends keyof HT> = HT[HN] extends HookCallback
  ? HT[HN]
  : never;

export class Analytics implements IAnalytics {
  private queue: PQueue;
  private hooks: Hookable<AnalyticsHooks>;
  private superProps: EventProperties = {};
  private disabled: boolean;
  private booted = false;
  private channels: Channel[];
  private adapters: BaseAdapter[];
  private env?: string;
  private user?: EventUser;

  constructor(options: AnalyticsOptions) {
    this.channels = options.channels.filter((channel) => !channel.disabled);
    this.adapters = options.adapters;
    this.env = options.env;

    this.disabled =
      options.disabled ||
      (typeof navigator !== "undefined" && navigator.doNotTrack === "1");

    this.queue = new PQueue({
      concurrency: options.concurrency || 10,
      autoStart: false,
    });

    this.hooks = createHooks();
  }

  /**
   * Install channels and start analytics.
   */
  public async boot() {
    if (this.disabled || this.booted) return;

    // booting
    await onEach(this.channels, (channel) => channel.install());
    await onEach(this.adapters, (adapter) => adapter.configure());

    this.booted = true;

    // ready
    this.queue.start();
  }

  /**
   * Stop queue and uninstall channels.
   */
  public async destroy() {
    if (this.booted) {
      this.queue.pause();
      await onEach(this.channels, (channel) => channel.uninstall());
      this.queue.clear();
    }
  }

  /**
   * Send track event.
   *
   * @param {EventPayload} payload
   * @returns
   */
  public track(payload: EventPayload) {
    return this.invoke("track", payload);
  }

  /**
   * Send page view event.
   *
   * @param {PagePayload} payload
   * @returns
   */
  public page(payload: PagePayload) {
    return this.invoke("page", payload);
  }

  /**
   * Send user identify event.
   *
   * @param {IdentifyPayload} payload
   * @returns
   */
  public identify(payload: IdentifyPayload) {
    return this.invoke("identify", payload);
  }

  /**
   * Set super properties.
   *
   * @param {EventProperties} superProps
   * @param {boolean} reset
   * @returns
   */
  public superProperties(superProps: EventProperties, reset = false) {
    if (reset) {
      this.superProps = Object.assign({}, superProps);
    } else {
      this.superProps = defu(superProps, this.superProps);
    }
  }

  /**
   * @throws {Error}
   * @param {string} name
   * @returns {Channel}
   */
  public channel(name: string): Channel {
    const channel = this.channels.find((ch) => ch.name == name);

    if (!channel) {
      error(`Channel [${name}] is unknown`);
    }

    return channel!;
  }

  /**
   * Hook in events cycles.
   *
   * @param name
   * @param fn
   * @returns
   */
  public on<T extends keyof AnalyticsHooks>(
    name: T,
    fn: InferHooksCallback<AnalyticsHooks, T>
  ) {
    return this.hooks.hook(name, fn);
  }

  /**
   * Send events only to specified channels.
   *
   * @param channels
   */
  public only(channels: string[]): Builder;
  public only(...channels: string[]): Builder;
  public only(...channels: any[]): Builder {
    return this.builder().only(...channels);
  }

  /**
   * Send events to all available channels except for
   * the specified channels.
   *
   * @param channels
   */
  public except(channels: string[]): Builder;
  public except(...channels: string[]): Builder;
  public except(...channels: any[]): Builder {
    return this.builder().except(...channels);
  }

  /**
   * Invoke an operation.
   *
   * @param method
   * @param payload
   */
  public async invoke(method: "track", payload: EventPayload): Promise<any>;
  public async invoke(method: "page", payload: PagePayload): Promise<any>;
  public async invoke(
    method: "identify",
    payload: IdentifyPayload
  ): Promise<any>;
  public async invoke(
    method: "track" | "page" | "identify",
    payload: EventPayload | PagePayload | IdentifyPayload
  ) {
    if (this.disabled) return;

    let channels = this.channels;

    if (this.env) {
      channels = channels.filter((channel) => {
        if (!channel.env) return true;
        const e = unwrap(channel.env);
        return e.includes(this.env!);
      });
    }

    if (payload.channels) {
      const ch = unwrap(payload.channels);
      const exclusive = !!ch.length && !!ch.find((c) => c.startsWith("!"));

      if (exclusive) {
        channels = channels.filter(
          (channel) => !ch.includes("!" + channel.name)
        );
      } else {
        channels = channels.filter((channel) => ch.includes(channel.name));
      }
    }

    if (!channels.length) return;

    if (payload.user) {
      this.user = payload.user;
    } else if (this.user) {
      payload.user = this.user;
    }

    let task: { (): Promisable<void> };

    if (method == "track") {
      task = async () => {
        const r = await this.hooks.callHook(
          "track:before",
          payload as EventPayload
        );
        if (r === false) {
          return;
        } else if (r) {
          payload = r;
        }

        await onEach(channels, async (channel) => {
          const data = clone(payload) as EventPayload;
          let adaptedPayload = this.adaptEventPayload(channel, data);

          const p = await this.hooks.callHook(
            "track:channel:before",
            channel,
            adaptedPayload
          );

          if (p === false) {
            return;
          } else if (p) {
            adaptedPayload = p;
          }

          const tracked = channel.track(adaptedPayload);

          this.hooks.callHook("track:channel:after", channel, adaptedPayload);

          return tracked;
        });

        this.hooks.callHook("track:after", payload as EventPayload);
      };
    } else if (method == "identify") {
      task = async () => {
        const r = await this.hooks.callHook(
          "identify:before",
          payload as IdentifyPayload
        );
        if (r === false) {
          return;
        } else if (r) {
          payload = r;
        }

        await onEach(channels, async (channel) => {
          let data = clone(payload) as IdentifyPayload;

          const p = await this.hooks.callHook(
            "identify:channel:before",
            channel,
            data
          );

          if (p === false) {
            return;
          } else if (p) {
            data = p;
          }

          const identified = channel.identify(data);

          this.hooks.callHook("identify:channel:after", channel, data);

          return identified;
        });

        this.hooks.callHook("identify:after", payload as IdentifyPayload);
      };
    } else if (method == "page") {
      task = async () => {
        const r = await this.hooks.callHook(
          "page:before",
          payload as PagePayload
        );
        if (r === false) {
          return;
        } else if (r) {
          payload = r;
        }

        await onEach(channels, async (channel) => {
          let data = clone(payload) as PagePayload;

          const p = await this.hooks.callHook(
            "page:channel:before",
            channel,
            data
          );

          if (p === false) {
            return;
          } else if (p) {
            data = p;
          }

          const pages = channel.page(data);

          this.hooks.callHook("page:channel:after", channel, data);

          return pages;
        });

        this.hooks.callHook("page:after", payload as PagePayload);
      };
    } else {
      // this shouldn't happen
      error("That was never supposed to happen");
    }

    await this.queue.add(task!);
  }

  private adaptEventPayload(channel: Channel, payload: EventPayload) {
    const adapter = this.getAdapter(channel, payload);

    if (adapter) {
      let props = adapter.eventPropertiesAs(payload);

      if (isNamedEvent(payload)) {
        let event = adapter.eventNameAs(payload);
        if (adapter.hasMappedEventName(event)) {
          event = adapter.getMappedEventName(event);
        } else if (adapter.hasMappedEventName(payload.event)) {
          event = adapter.getMappedEventName(payload.event);
        }
        if (isCallable(event)) {
          event = event(payload);
        } else {
          event = String(normaliseValue(event));
        }
        payload.event = event;

        let propertyAccess:
          | ValueAccessible<EventProperties>
          | string
          | undefined;

        if (adapter.hasMappedEventProperty(event)) {
          propertyAccess = adapter.getMappedEventProperty(event);
        } else if (adapter.hasMappedEventProperty(payload.event)) {
          propertyAccess = adapter.getMappedEventProperty(payload.event);
        }

        if (propertyAccess) {
          if (isCallable(propertyAccess)) {
            propertyAccess = propertyAccess(payload);
          }

          if (typeof propertyAccess === "string") {
            if (hasProp(adapter, propertyAccess)) {
              // @ts-ignore
              if (typeof adapter[propertyAccess] === "function") {
                // @ts-ignore
                props = adapter[propertyAccess](payload);
              } else {
                // @ts-ignore
                props = adapter[propertyAccess];
              }
            }
          } else {
            props = propertyAccess;
          }
        }
      } else {
        // map page and identify events?
      }

      const extraProperties = adapter.extraProperties(payload);

      payload.props = defu(props, extraProperties);
    }

    payload.props = defu(payload.props, this.superProps);

    return payload;
  }

  private getAdapter(
    channel: Channel,
    payload: EventPayload
  ): BaseAdapter | undefined {
    return this.adapters.find((adapter) => {
      const channels = adapter.channels();

      if (
        !channels.includes("*") &&
        channels.length &&
        !(channels.includes(channel.name) || channels.includes(channel.driver))
      ) {
        return false;
      }

      const events = normaliseValue(adapter.events());

      if (!events.includes("*") && isNamedEvent(payload)) {
        if (events.length) {
          return events.includes(payload.event);
        }

        const except = normaliseValue(adapter.except());
        return !except.includes(payload.event);
      }

      return true;
    });
  }

  private builder(): Builder {
    return new Builder(this);
  }
}
