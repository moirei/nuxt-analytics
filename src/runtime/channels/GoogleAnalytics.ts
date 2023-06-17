import { EventPayload, IdentifyPayload, PagePayload } from "../types";
import BaseChannel from "./BaseChannel";
import { assert } from "../utils";
import { removeFromDOM } from "../lib";

declare global {
  interface Window {
    ga: any;
    ga_debug?: any;
  }
}

declare module "#analytics" {
  interface ChannelsConfig {
    ga: {
      id: string;
      sendHitTask?: boolean;
      trace?: boolean;
      require?: string[];
      debug?: boolean;
      trackerName?: string;
    };
  }
}

export default class GoogleAnalytics extends BaseChannel {
  private gaSendKey = "send";

  public install(): void {
    const { id, ...config } = this.config;

    if (config.trackerName) {
      this.gaSendKey = `${config.trackerName}.send`;
    }

    assert(`You must pass a valid \`id\` to the ${this.name} channel`, id);

    const hasOptions = Object.keys(config).length > 1;

    this.injectScript(config.debug);

    if (config.trace === true) {
      window.ga_debug = { trace: true };
    }

    window.ga("create", id, hasOptions ? config : "auto", config.trackerName);

    if (config.require) {
      config.require.forEach((plugin: string) => {
        window.ga("require", plugin);
      });
    }

    if (config.sendHitTask === false) {
      window.ga("set", "sendHitTask", null);
    }
  }

  public uninstall(): void {
    removeFromDOM('script[src*="google-analytics"]');
    delete window.ga;
  }

  public track(payload: EventPayload): any {
    const gaEvent: any = { hitType: "event" };

    if (payload.props?.nonInteraction) {
      gaEvent.nonInteraction = payload.props.nonInteraction;
      delete payload.props.nonInteraction;
    }

    gaEvent["eventAction"] = payload.event;

    const event = { ...payload.props, ...gaEvent };

    window.ga(this.gaSendKey, event);

    return event;
  }

  public page(payload: PagePayload): any {
    const sendEvent = { hitType: "pageview" };
    const event = { ...sendEvent, ...payload.props };

    for (const key in payload.props) {
      window.ga("set", key, payload.props[key]);
    }

    window.ga(this.gaSendKey, event);

    return event;
  }

  public identify(payload: IdentifyPayload): void {
    window.ga("set", "userId", payload.user.id);
  }

  private injectScript(debug: boolean) {
    /* eslint-disable */
    (function (i, s, o, g, r, a, m) {
      i["GoogleAnalyticsObject"] = r;
      (i[r] =
        i[r] ||
        function () {
          (i[r].q = i[r].q || []).push(arguments);
        }),
        (i[r].l = 1 * new Date());
      (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m);
    })(
      window,
      document,
      "script",
      `https://www.google-analytics.com/analytics${debug ? "_debug" : ""}.js`,
      "ga"
    );

    /* eslint-enable */
  }
}
