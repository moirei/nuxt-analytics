import { EventUser } from "#analytics";
import { EventPayload, IdentifyPayload, PagePayload } from "../types";
import BaseChannel from "./BaseChannel";
import { assert, isEmpty, isUndefined } from "../utils";
import { removeFromDOM } from "../lib";

declare global {
  interface Window {
    mixpanel: any;
  }
}

declare module "#analytics" {
  interface ChannelsConfig {
    mixpanel: {
      token: string;
      apiHost?: string;
      debug?: boolean;
      trackPageview?: boolean;
      batchRequests?: boolean;
      secureCookie?: boolean;
    };
  }
}

export default class Mixpanel extends BaseChannel {
  protected options: any = {};

  public install(): void {
    assert(
      `You must pass a valid \`token\` to the ${this.name} channel`,
      this.config.token
    );

    this.injectScript();

    window.mixpanel.init(this.config.token, {
      api_host: this.config.apiHost,
      debug: this.config.debug,
      track_pageview: this.config.trackPageview,
      batch_requests: this.config.batchRequests,
      secure_cookie: this.config.secureCookie,
    });
  }

  public uninstall(): void {
    removeFromDOM('script[src*="mixpanel"]');
    delete window.mixpanel;
  }

  public track(payload: EventPayload): void {
    if (payload.props && payload.user) {
      payload.props = {
        ...payload.props,
        ...this.getIdentityPayload(payload.user),
      };
    }

    window.mixpanel.track(payload.event, payload.props);
  }

  public page(payload: PagePayload): void {
    return this.track({
      ...payload,
      event: "Page Viewed",
    });
  }

  public identify(payload: IdentifyPayload): void {
    const { distinct_id, ...user } = this.getIdentityPayload(payload.user);
    window.mixpanel.identify(distinct_id);
    if (!isEmpty(user)) {
      window.mixpanel.people.set(user);
    }
  }

  public alias<A, O>(options: { alias: A; original?: O }) {
    const { alias, original } = options;

    if (original) {
      window.mixpanel.alias(alias, original);
    } else {
      window.mixpanel.alias(alias);
    }
  }

  protected getIdentityPayload(user: EventUser) {
    const {
      id,
      firstName,
      lastName,
      name,
      email,
      city,
      region,
      country,
      ...props
    } = user;

    props["distinct_id"] = id;

    if (!isUndefined(firstName)) props["$first_name"] = firstName;
    if (!isUndefined(lastName)) props["$last_name"] = lastName;
    if (!isUndefined(name)) props["$name"] = name;
    if (!isUndefined(email)) props["$email"] = email;
    if (!isUndefined(city)) props["$city"] = city;
    if (!isUndefined(region)) props["$region"] = region;
    if (!isUndefined(country)) props["$country"] = country;

    return props;
  }

  private injectScript() {
    /* eslint-disable */
    (function (c, a) {
      if (!a.__SV) {
        var b = window;
        try {
          var d,
            m,
            j,
            k = b.location,
            f = k.hash;
          d = function (a, b) {
            return (m = a.match(RegExp(b + "=([^&]*)"))) ? m[1] : null;
          };
          f &&
            d(f, "state") &&
            ((j = JSON.parse(decodeURIComponent(d(f, "state")))),
            "mpeditor" === j.action &&
              (b.sessionStorage.setItem("_mpcehash", f),
              history.replaceState(
                j.desiredHash || "",
                c.title,
                k.pathname + k.search
              )));
        } catch (n) {}
        var l, h;
        window.mixpanel = a;
        a._i = [];
        a.init = function (b, d, g) {
          function c(b, i) {
            var a = i.split(".");
            2 == a.length && ((b = b[a[0]]), (i = a[1]));
            b[i] = function () {
              b.push([i].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          var e = a;
          "undefined" !== typeof g ? (e = a[g] = []) : (g = "mixpanel");
          e.people = e.people || [];
          e.toString = function (b) {
            var a = "mixpanel";
            "mixpanel" !== g && (a += "." + g);
            b || (a += " (stub)");
            return a;
          };
          e.people.toString = function () {
            return e.toString(1) + ".people (stub)";
          };
          l =
            "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(
              " "
            );
          for (h = 0; h < l.length; h++) c(e, l[h]);
          var f = "set set_once union unset remove delete".split(" ");
          e.get_group = function () {
            function a(c) {
              b[c] = function () {
                call2_args = arguments;
                call2 = [c].concat(Array.prototype.slice.call(call2_args, 0));
                e.push([d, call2]);
              };
            }
            for (
              var b = {},
                d = ["get_group"].concat(
                  Array.prototype.slice.call(arguments, 0)
                ),
                c = 0;
              c < f.length;
              c++
            )
              a(f[c]);
            return b;
          };
          a._i.push([b, d, g]);
        };
        a.__SV = 1.2;
        b = c.createElement("script");
        b.type = "text/javascript";
        b.async = !0;
        b.src =
          "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL
            ? MIXPANEL_CUSTOM_LIB_URL
            : "file:" === c.location.protocol &&
              "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)
            ? "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"
            : "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
        d = c.getElementsByTagName("script")[0];
        d.parentNode.insertBefore(b, d);
      }
    })(document, window.mixpanel || []);

    /* eslint-enable */
  }
}
