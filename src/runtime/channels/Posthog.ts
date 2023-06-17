import { removeFromDOM } from "../lib";
import {
  EventPayload,
  EventProperties,
  IdentifyPayload,
  PagePayload,
} from "../types";
import { assert, clean } from "../utils";
import BaseChannel from "./BaseChannel";

declare global {
  interface Window {
    posthog: any;
  }
}

declare module "#analytics" {
  interface ChannelsConfig {
    posthog: {
      token: string;
      apiHost?: string;
      autocapture?: boolean;
      capturePageview?: boolean;
      capturePageleave?: boolean;
      crossSubdomainCookie?: boolean;
      disablePersistence?: boolean;
      disableSessionRecording?: boolean;
      enableRecordingConsoleLog?: boolean;
      maskAllText?: boolean;
      maskAllElementAttributes?: boolean;
      optOutCapturingByDefault?: boolean;
      persistence?:
        | "localStorage"
        | "cookie"
        | "memory"
        | "localStorage+cookie";
      propertyBlacklist?: string[];
      sanitizeProperties?: {
        (properties: EventProperties, event: string): EventProperties;
      };
      sessionRecording?: {
        maskAllInputs?: boolean;
        maskInputOptions?: Record<string, boolean>;
        inlineStylesheet?: boolean;
      };
      xhrHeaders?: any;
      advancedDisableDecide?: boolean;
      secureCookie?: boolean;
      customCampaignParams?: any[];
      bootstrap?: {
        distinctID?: string;
        isIdentifiedID?: boolean;
        featureFlags?: EventProperties;
      };
    };
  }
}

export default class Posthog extends BaseChannel {
  public async install(): Promise<void> {
    assert(
      `You must pass a valid \`token\` to the ${this.name} channel`,
      this.config.token
    );

    this.injectScript();

    const options = clean({
      api_host: this.config.apiHost || "https://app.posthog.com",
      bootstrap: this.config.bootstrap,
      autocapture: this.config.autocapture,
      capture_pageview: this.config.capturePageview,
      capture_pageleave: this.config.capturePageleave,
      cross_subdomain_cookie: this.config.crossSubdomainCookie,
      disable_persistence: this.config.disablePersistence,
      disable_session_recording: this.config.disableSessionRecording,
      enable_recording_console_log: this.config.enableRecordingConsoleLog,
      mask_all_text: this.config.maskAllText,
      mask_all_element_attributes: this.config.maskAllElementAttributes,
      opt_out_capturing_by_default: this.config.optOutCapturingByDefault,
      persistence: this.config.persistence,
      property_blacklist: this.config.propertyBlacklist,
      sanitize_properties: this.config.sanitizeProperties,
      session_recording: this.config.sessionRecording,
      xhr_headers: this.config.xhrHeaders,
      advanced_disable_decide: this.config.advancedDisableDecide,
      secure_cookie: this.config.secureCookie,
      custom_campaign_params: this.config.customCampaignParams,
    });

    return new Promise((resolve) => {
      window.posthog.init(this.config.token, {
        ...options,
        loaded: () => resolve(),
      });
    });
  }

  public uninstall(): void {
    removeFromDOM(`script[id="posthog"]`);
    delete window.posthog;
  }

  public track(payload: EventPayload): void {
    window.posthog.capture(payload.event, payload.props);
  }

  public page(payload: PagePayload): void {
    return this.track({
      ...payload,
      event: "$pageview",
    });
  }

  public identify(payload: IdentifyPayload): void {
    const { id, ...user } = payload.user;
    window.posthog.identify(id, user);
  }

  private injectScript() {
    /* eslint-disable */
    (function (t, e) {
      var o, n, p, r;
      e.__SV ||
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i, s, a) {
          function g(t, e) {
            var o = e.split(".");
            2 == o.length && ((t = t[o[0]]), (e = o[1])),
              (t[e] = function () {
                t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
              });
          }
          ((p = t.createElement("script")).type = "text/javascript"),
            (p.async = !0),
            (p.src = s.api_host + "/static/array.js"),
            (p.id = "posthog"),
            (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(
              p,
              r
            );
          var u = e;
          for (
            void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
              u.people = u.people || [],
              u.toString = function (t) {
                var e = "posthog";
                return (
                  "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e
                );
              },
              u.people.toString = function () {
                return u.toString(1) + ".people (stub)";
              },
              o =
                "capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(
                  " "
                ),
              n = 0;
            n < o.length;
            n++
          )
            g(u, o[n]);
          e._i.push([i, s, a]);
        }),
        (e.__SV = 1));
    })(document, window.posthog || []);

    /* eslint-enable */
  }
}
