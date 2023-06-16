import {
  AnalyticsHooks,
  Enumerable,
  EventPayload,
  EventProperties,
} from "../types";
import { normaliseValue, unwrap } from "../utils";

export default abstract class BaseAdapter {
  /**
   * List of channels to handle.
   * @var {string[]}
   */
  protected $channels: string[] = [];

  /**
   * List of events to handle.
   * @var {PropertyKey[]}
   */
  protected $events: PropertyKey[] = [];

  /**
   * List of events to omit.
   * @var {PropertyKey[]}
   */
  protected $except: PropertyKey[] = [];

  /**
   * List hooks to register.
   * @var {Partial<AnalyticsHooks>}
   */
  protected $hooks: Partial<AnalyticsHooks> = {};

  private eventNameMap = new Map();
  private eventPropertyMap = new Map();

  public configure() {
    //
  }

  /**
   * Get a list of channels to apply.
   */
  public channels() {
    return this.$channels;
  }

  /**
   * Get a list of events to handle.
   */
  public events(): PropertyKey[] {
    return this.$events;
  }

  /**
   * Get a list of events to omit.
   */
  public except(): PropertyKey[] {
    return this.$except;
  }

  /**
   * Rename event name.
   *
   * @param  {EventPayload}  payload
   * @return {string}
   */
  public eventNameAs(payload: EventPayload): string {
    return payload.event;
  }

  /**
   * Rename event properties.
   *
   * @param  {EventPayload}  payload
   * @return {EventProperties}
   */
  public eventPropertiesAs(payload: EventPayload): EventProperties {
    return payload.props || {};
  }

  /**
   * Get extra event properties.
   *
   * @param  {EventPayload}  payload
   * @return {EventProperties}
   */
  public extraProperties(_payload: EventPayload): EventProperties {
    return {
      //
    };
  }

  /**
   * Map event names.
   * @param {EventProperties}  map
   */
  protected mapEvents(map: EventProperties) {
    Object.entries(map).forEach(([key, value]) => {
      this.eventNameMap.set(normaliseValue(key), value);
    });
  }

  protected mapEventProperties(map: EventProperties) {
    Object.entries(map).forEach(([key, value]) => {
      this.eventPropertyMap.set(normaliseValue(key), value);
    });
  }

  /**
   * Map an event name.
   */
  protected mapEventName(
    key: any,
    value: string | { (p: EventPayload): string }
  ) {
    key = normaliseValue(key);
    this.mapEvents({ [key]: value });
  }

  /**
   * Map event property.
   */
  protected mapEventProperty(
    key: Enumerable<any>,
    value: EventProperties | { (p: EventPayload): EventProperties }
  ) {
    const keys = unwrap(key);
    for (let key of keys) {
      key = normaliseValue(key);
      this.mapEventProperties({ [key]: value });
    }
  }

  /**
   * Register hooks
   */
  protected hooks(hooks: AnalyticsHooks): void;
  protected hooks<H extends keyof AnalyticsHooks>(
    hook: H,
    callback: AnalyticsHooks[H]
  ): void;
  protected hooks<H extends keyof AnalyticsHooks>(
    hooks: H | AnalyticsHooks,
    callback?: AnalyticsHooks[H]
  ) {
    if (callback) {
      this.$hooks[hooks as H] = callback;
    } else {
      this.$hooks = {
        ...this.$hooks,
        ...(hooks as AnalyticsHooks),
      };
    }
  }

  public hasMappedEventName(key: any): boolean {
    return this.eventNameMap.has(normaliseValue(key));
  }

  public getMappedEventName(key: any): any {
    return this.eventNameMap.get(normaliseValue(key));
  }

  public hasMappedEventProperty(key: any): boolean {
    return this.eventPropertyMap.has(normaliseValue(key));
  }

  public getMappedEventProperty(key: any) {
    return this.eventPropertyMap.get(normaliseValue(key));
  }
}
