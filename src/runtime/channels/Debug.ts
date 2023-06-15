import { EventPayload, IdentifyPayload, PagePayload } from "../types";
import BaseChannel from "./BaseChannel";

declare module "#analytics" {
  interface ChannelsConfig {
    debug: {
      //
    };
  }
}

export default class Debug extends BaseChannel {
  public install(): void {
    //
  }

  public uninstall(): void {
    //
  }

  public track(payload: EventPayload): void {
    this.log(`Tracked event: \`${payload.event}\``, payload);
  }

  public page(payload: PagePayload): void {
    this.log("Page view", payload);
  }

  public identify(payload: IdentifyPayload): void {
    this.log(`Identified user: \`${payload.user.id}\``, payload.user);
  }

  private log(message: string, ...more: any[]) {
    const defaultColor = "color: inherit";
    const color = "darkturquoise"; // `khaki`, `tomato`,

    const params = [
      `%c[%c${this.name}-event%c]`,
      defaultColor,
      `color: ${color}`,
      defaultColor,
      message,
      ...more,
    ];
    console.log(...params);
  }
}
