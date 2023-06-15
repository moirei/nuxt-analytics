import { removeFromDOM } from "../lib";
import { EventPayload, IdentifyPayload, PagePayload } from "../types";
import { assert } from "../utils";
import BaseChannel from "./BaseChannel";

declare global {
  interface Window {
    hj: any;
  }
}

declare module "#analytics" {
  interface ChannelsConfig {
    hotjar: {
      siteId: string;
    };
  }
}

export default class Hotjar extends BaseChannel {
  public install(): void {
    assert(
      `You must pass a \`siteId\` to the ${this.name} channel`,
      this.config.siteId
    );

    this.#injectScript(this.config.siteId);
  }

  public uninstall(): void {
    removeFromDOM(`script[id="hotjar"]`);
    delete window.hj;
  }

  public track(payload: EventPayload): void {
    window.hj("event", payload.event);
  }

  public page(payload: PagePayload): void {
    return this.track({
      ...payload,
      event: "page_viewed",
    });
  }

  public identify(payload: IdentifyPayload): void {
    const { id, ...props } = payload.user;
    window.hj("identify", id, props);
  }

  #injectScript(siteId: string) {
    /* eslint-disable */
    (function (h, o, t, j, a, r) {
      h.hj =
        h.hj ||
        function () {
          (h.hj.q = h.hj.q || []).push(arguments);
        };
      h._hjSettings = { hjid: siteId, hjsv: 6 };
      a = o.getElementsByTagName("head")[0];
      r = o.createElement("script");
      r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      r.id = "hotjar";
      a.appendChild(r);
    })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");

    /* eslint-enable */
  }
}
