import { removeFromDOM } from "../lib";
import { EventPayload, IdentifyPayload, PagePayload } from "../types";
import { assert } from "../utils";
import BaseChannel from "./BaseChannel";

declare global {
  interface Window {
    dataLayer: any;
  }
}

declare module "#analytics" {
  interface ChannelsConfig {
    ga4: {
      id: string;
      sendPageView?: boolean;
    };
  }
}

export default class GoogleAnalytics4 extends BaseChannel {
  private options: any = {};

  public install(): void {
    const { id, ...options } = this.config;

    assert(`You must pass a valid \`id\` to the ${this.name} channel`, id);

    this.options = {
      send_page_view: true,
      ...options,
    };

    this.injectScript(id);

    window.dataLayer = window.dataLayer || [];
    this.gtag("js", new Date());
    this.gtag("config", id, this.options);
  }

  public uninstall(): void {
    removeFromDOM('script[src*="gtag/js"]');
    delete window.dataLayer;
  }

  public track(payload: EventPayload): void {
    return this.gtag("event", payload.event, payload.props);
  }

  public page(payload: PagePayload): void {
    if (!this.options.send_page_view) {
      return;
    }

    if (payload.props?.page && !payload.props?.page_location) {
      payload.props.page_location = payload.props?.page;
      delete payload.props.page;
    }

    if (payload.props?.title && !payload.props?.page_title) {
      payload.props.page_title = payload.props?.title;
      delete payload.props.title;
    }

    return this.track({
      ...payload,
      event: "page_view",
    });
  }

  public identify(_payload: IdentifyPayload): void {
    //
  }

  gtag(...args: any[]): any {
    window.dataLayer.push(args);
    return args;
  }

  private injectScript(id: string) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
  }
}
