import { Analytics } from "./Analytics";
import {
  EventPayload,
  IAnalytics,
  IdentifyPayload,
  PagePayload,
} from "./types";

export default class Builder implements IAnalytics {
  protected channels?: string[];

  constructor(protected analytics: Analytics) {
    //
  }

  /**
   * Send events only to specified channels.
   *
   * @param channels
   */
  public only(channels: string[]): Builder;
  public only(...channels: string[]): Builder;
  public only(...channels: any[]): Builder {
    this.channels = Array.isArray(channels[0])
      ? channels
      : Array.from(channels);

    return this;
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
    this.channels = (
      Array.isArray(channels[0]) ? channels : Array.from(channels)
    ).map((channel) => "!" + channel);

    return this;
  }

  /**
   * Send track event.
   *
   * @param {EventPayload} payload
   * @returns
   */
  public track(payload: EventPayload): Promise<void> {
    return this.analytics.track({
      ...payload,
      channels: this.channels,
    });
  }

  /**
   * Send page view event.
   *
   * @param {PagePayload} payload
   * @returns
   */
  public page(payload: PagePayload): Promise<void> {
    return this.analytics.page({
      ...payload,
      channels: this.channels,
    });
  }

  /**
   * Send user identify event.
   *
   * @param {IdentifyPayload} payload
   * @returns
   */
  public identify(payload: IdentifyPayload): Promise<void> {
    return this.analytics.identify({
      ...payload,
      channels: this.channels,
    });
  }
}
