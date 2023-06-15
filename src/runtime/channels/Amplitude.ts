import { removeFromDOM } from "../lib";
import { EventPayload, IdentifyPayload, PagePayload } from "../types";
import { assert, omit } from "../utils";
import BaseChannel from "./BaseChannel";

declare global {
  interface Window {
    amplitude?: any;
  }
}

declare module "#analytics" {
  interface ChannelsConfig {
    amplitude: {
      apiKey: string;
      options?: any;
    };
  }
}

export default class Amplitude extends BaseChannel {
  private identity?: any;

  public install(): void {
    const { apiKey, options } = this.config;

    assert(
      `You must pass a valid \`apiKey\` to the ${this.name} channel`,
      apiKey
    );

    this.#injectScript();

    this.getInstance().init(apiKey, null, options || {});
  }

  public uninstall(): void {
    removeFromDOM('script[src*="amplitude"]');
  }

  public track(payload: EventPayload): void {
    if (payload.props) {
      this.getInstance().logEvent(payload.event, payload.props);
    } else {
      this.getInstance().logEvent(payload.event);
    }
  }

  public page(payload: PagePayload): void {
    return this.track({
      event: "Page View",
      ...payload,
    });
  }

  public identify(payload: IdentifyPayload): void {
    const props = omit(payload.user, "id");
    props.distinctId = payload.user.id;

    if (!this.identity) {
      this.identity = new window.amplitude.Identify();
    }

    if (props.distinctId) {
      this.getInstance().setUserId(props.distinctId);
    }

    for (const k in props) {
      this.identity.set(k, props[k]);
    }

    this.getInstance().identify(this.identity);
  }

  public optOut() {
    return this.getInstance().setOptOut(true);
  }

  public optIn() {
    return this.getInstance().setOptOut(false);
  }

  public getInstance(): any {
    // @ts-ignore
    window.amplitude.getInstance();
  }

  #injectScript() {
    /* eslint-disable */
    (function (e, t) {
      var n = e.amplitude || { _q: [], _iq: {} };
      var r = t.createElement("script");
      r.type = "text/javascript";
      r.integrity =
        "sha384-RsEu4WZflrqYcEacpfoGSib3qaSvdYwT4D+DrWqeBuDarSzjwUQR1jO8gDiXZd0E";
      r.crossOrigin = "anonymous";
      r.async = true;
      r.src = "https://cdn.amplitude.com/libs/amplitude-6.2.0-min.gz.js";
      r.onload = function () {
        if (!e.amplitude.runQueuedFunctions) {
          console.log("[Amplitude] Error: could not load SDK");
        }
      };
      var i = t.getElementsByTagName("script")[0];
      i.parentNode.insertBefore(r, i);
      function s(e, t) {
        e.prototype[t] = function () {
          this._q.push([t].concat(Array.prototype.slice.call(arguments, 0)));
          return this;
        };
      }
      var o = function () {
        this._q = [];
        return this;
      };
      var a = [
        "add",
        "append",
        "clearAll",
        "prepend",
        "set",
        "setOnce",
        "unset",
      ];
      for (var u = 0; u < a.length; u++) {
        s(o, a[u]);
      }
      n.Identify = o;
      var c = function () {
        this._q = [];
        return this;
      };
      var l = [
        "setProductId",
        "setQuantity",
        "setPrice",
        "setRevenueType",
        "setEventProperties",
      ];
      for (var p = 0; p < l.length; p++) {
        s(c, l[p]);
      }
      n.Revenue = c;
      var d = [
        "init",
        "logEvent",
        "logRevenue",
        "setUserId",
        "setUserProperties",
        "setOptOut",
        "setVersionName",
        "setDomain",
        "setDeviceId",
        "enableTracking",
        "setGlobalUserProperties",
        "identify",
        "clearUserProperties",
        "setGroup",
        "logRevenueV2",
        "regenerateDeviceId",
        "groupIdentify",
        "onInit",
        "logEventWithTimestamp",
        "logEventWithGroups",
        "setSessionId",
        "resetSessionId",
      ];
      function v(e) {
        function t(t) {
          e[t] = function () {
            e._q.push([t].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        for (var n = 0; n < d.length; n++) {
          t(d[n]);
        }
      }
      v(n);
      n.getInstance = function (e) {
        e = (!e || e.length === 0 ? "$default_instance" : e).toLowerCase();
        if (!n._iq) {
          n._iq = {};
        } // we add this line
        if (!n._iq.hasOwnProperty(e)) {
          n._iq[e] = { _q: [] };
          v(n._iq[e]);
        }
        return n._iq[e];
      };
      e.amplitude = n;
    })(window, document);

    /* eslint-enable */
  }
}
