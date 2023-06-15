import { EventPayload, EventProperties, InlineAdapter } from "../types";
import { unwrap } from "../utils";
import BaseAdapter from "./BaseAdapter";

export default class InlineAdapterConstructor extends BaseAdapter {
  constructor(protected options: InlineAdapter) {
    super();
  }

  /**
   * {@inheritdoc}
   */
  public channels() {
    return unwrap(this.options.channels || []);
  }

  /**
   * {@inheritdoc}
   */
  public events() {
    return unwrap(this.options.events || []);
  }

  /**
   * Rename event name.
   *
   * @param  {EventPayload}  payload
   * @return {string}
   */
  public eventNameAs(payload: EventPayload): string {
    if (this.options.eventNameAs) {
      return this.options.eventNameAs(payload);
    }
    return super.eventNameAs(payload);
  }

  /**
   * Rename event properties.
   *
   * @param  {EventPayload}  payload
   * @return {EventProperties}
   */
  public eventPropertiesAs(payload: EventPayload): EventProperties {
    if (this.options.eventPropertiesAs) {
      return this.options.eventPropertiesAs(payload);
    }
    return super.eventPropertiesAs(payload);
  }

  /**
   * Configure adapter
   */
  public configure() {
    if (this.options.mapEventNames) {
      this.mapEvents(this.options.mapEventNames);
    }
    if (this.options.mapEventProperties) {
      this.mapEventProperties(this.options.mapEventProperties);
    }
  }
}
