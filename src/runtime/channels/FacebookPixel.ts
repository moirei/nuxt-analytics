// @ts-nocheck
import { removeFromDOM } from "../lib";
import { EventPayload, IdentifyPayload, PagePayload } from "../types";
import { assert } from "../utils";
import BaseChannel from "./BaseChannel";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

declare module "#analytics" {
  interface ChannelsConfig {
    facebook: {
      id: string;
      dataProcessingOptions?: {
        method?: string[];
        country?: number;
        state?: number;
      };
    };
  }
}

export default class FacebookPixel extends BaseChannel {
  public install(): void {
    const { id, dataProcessingOptions } = this.config;

    assert(`You must pass a valid \`id\` to the ${this.name} channel`, id);

    if (window.fbq) {
      return;
    }

    this.injectScript();

    if (dataProcessingOptions) {
      const { method, country, state } = dataProcessingOptions;
      window.fbq("dataProcessingOptions", method, country, state);
    }

    window.fbq("init", id);

    // Leave this call due to Facebook API docs
    // https://developers.facebook.com/docs/facebook-pixel/api-reference#setup

    this.page({});
  }

  public uninstall(): void {
    if (window.fbq) {
      removeFromDOM('script[src*="fbevents.js"]');
      delete window.fbq;
      delete window._fbq;
    }
  }

  public track(payload: EventPayload): void {
    window.fbq("track", payload.event, payload.props);
  }

  public page(payload: PagePayload): void {
    window.fbq("track", "PageView", payload.props);
  }

  public identify(_payload: IdentifyPayload): void {
    //
  }

  private injectScript() {
    /* eslint-disable */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );

    /* eslint-enable */
  }
}
