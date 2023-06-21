// @ts-nocheck
import { removeFromDOM } from "../lib";
import { EventPayload, IdentifyPayload, PagePayload } from "../types";
import { assert, isEmpty } from "../utils";
import BaseChannel from "./BaseChannel";

declare global {
  interface Window {
    smartlook: any;
  }
}

declare module "#analytics" {
  interface ChannelsConfig {
    smartlook: {
      projectKey: string;
      region?: "eu" | "us";
      cookies?: boolean;
      relayProxyUrl?: string;
      standalone?: boolean;
    };
  }
}

export default class Smartlook extends BaseChannel {
  public install(): Promise<void> {
    assert(
      `You must pass a \`projectKey\` to the ${this.name} channel`,
      this.config.projectKey
    );

    this.injectScript();

    const options = {
      region: this.config.region,
      cookies: this.config.cookies || true,
      relayProxyUrl: this.config.relayProxyUrl,
      standalone: this.config.standalone,
    };

    return new Promise((resolve) => {
      window.smartlook.init(this.config.projectKey, options, () => resolve());
    });
  }

  public uninstall(): void {
    removeFromDOM(`script[id="smartlook"]`);
    delete window.smartlook;
  }

  public track(payload: EventPayload): void {
    if (isEmpty(payload.props)) {
      window.smartlook.track(payload.event);
    } else {
      window.smartlook.track(payload.event, payload.props);
    }
  }

  public page(payload: PagePayload): void {
    return this.track({
      ...payload,
      event: "page_viewed",
    });
  }

  public identify(payload: IdentifyPayload): void {
    const { id, ...props } = payload.user;
    window.smartlook.identify(id, props);
  }

  private injectScript() {
    /* eslint-disable */
    (function (w, d) {
      var o = (w.smartlook = function () {
          o.api.push(arguments);
        }),
        h = d.getElementsByTagName("head")[0];
      var c = d.createElement("script");
      o.api = new Array();
      c.async = true;
      c.type = "text/javascript";
      c.charset = "utf-8";
      c.id = "smartlook";
      c.src = "https://web-sdk.smartlook.com/recorder.js";
      h.appendChild(c);
    })(window, document);

    /* eslint-enable */
  }
}
