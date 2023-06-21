// @ts-nocheck
import {
  EventPayload,
  EventProperties,
  IdentifyPayload,
  PagePayload,
} from "../types";
import BaseChannel from "./BaseChannel";
import { removeFromDOM } from "../lib";
import { assert, isEmpty } from "../utils";

declare module "#analytics" {
  interface ChannelsConfig {
    gtm: {
      id: string;
      dataLayer?: string;
      envParams?: EventProperties;
    };
  }
}

export default class GoogleTagManager extends BaseChannel {
  private dataLayer = "dataLayer";

  public install(): void {
    let envParamsString = "";

    if (!isEmpty(this.config.envParams)) {
      envParamsString =
        "&" + new URLSearchParams(this.config.envParams).toString();
    }

    assert(
      `You must pass a valid \`id\` to the ${this.name} channel`,
      this.config.id
    );

    if (this.config.dataLayer) {
      this.dataLayer = this.config.dataLayer;
    }

    this.injectScript(this.config.id, envParamsString);
  }

  public uninstall(): void {
    removeFromDOM('script[src*="gtm.js"]');
    delete window[this.dataLayer];
  }

  public track(payload: EventPayload): void {
    window[this.dataLayer].push({
      ...payload.props,
      event: payload.event,
      eventAction: payload.props?.eventAction || payload.event,
    });
  }

  public page(payload: PagePayload): void {
    return this.track({
      ...payload,
      event: payload.props?.event || "pageview",
    });
  }

  public identify(_payload: IdentifyPayload): void {
    //
  }

  private injectScript(id: string, envParamsString: string) {
    /* eslint-disable */
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({
        "gtm.start": new Date().getTime(),
        event: "gtm.js",
      });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l !== "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src =
        "https://www.googletagmanager.com/gtm.js?id=" +
        i +
        dl +
        envParamsString;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", this.dataLayer, id);

    /* eslint-enable */
  }
}
