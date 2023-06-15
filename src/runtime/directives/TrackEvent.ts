import type { DirectiveBinding, ObjectDirective } from "vue";
import { useAnalytics } from "../composables/useAnalytics";
import { SUPPORTS_INTERSECTION } from "../constants";
import { Enumerable, EventProperties } from "../types";
import { hasProp } from "../utils";
import { ElementEvent } from "../events/ElementEvent";

type TrackedElement = HTMLElement & { _observe?: any; _click?: any };
type CbFunc = { (): void };

export type TrackEventDirectiveValue = {
  data: EventProperties;
  observerInit?: IntersectionObserverInit;
  channel?: Enumerable<string>;
  clickAs?: string;
  seenAs?: string;
  onSeen?: CbFunc;
  onClick?: CbFunc;
};

export type TrackEventDirectiveModifiers = {
  once?: boolean;
  seenOnce?: boolean;
  clickOnce?: boolean;
  clickOnly?: boolean;
  seenOnly?: boolean;
  observeQuiet?: boolean;
};

export interface ObserveDirectiveBinding
  extends Omit<DirectiveBinding, "modifiers" | "value"> {
  value?: TrackEventDirectiveValue | EventProperties;
  modifiers: TrackEventDirectiveModifiers;
}

export type TrackEventDirective = ObjectDirective & {
  mounted: (el: TrackedElement, binding: ObserveDirectiveBinding) => void;
  unmounted: (el: TrackedElement, binding: ObserveDirectiveBinding) => void;
};

function mounted(el: TrackedElement, binding: ObserveDirectiveBinding) {
  const modifiers = binding.modifiers || {};
  const clickOnce = !!modifiers.once || !!modifiers.clickOnce;
  const seenOnce = !!modifiers.once || !!modifiers.seenOnce;
  const clickOnly = !!modifiers.clickOnly;
  const seenOnly = !!modifiers.seenOnly;
  let onClick: CbFunc | undefined;
  let onSeen: CbFunc | undefined;
  let channel: string[] | undefined;

  const payload = binding.value;
  let data: EventProperties | undefined;
  let observerOptions = {};
  let clickAs = ElementEvent.Clicked;
  let seenAs = ElementEvent.Seen;

  if (
    payload &&
    hasProp(payload, "data") &&
    (hasProp(payload, "channel") ||
      hasProp(payload, "clickAs") ||
      hasProp(payload, "seenAs") ||
      hasProp(payload, "onClick") ||
      hasProp(payload, "onSeen") ||
      hasProp(payload, "observerInit"))
  ) {
    if (payload.observerInit) {
      observerOptions = payload.observerInit;
    }
    if (payload.clickAs) {
      clickAs = payload.clickAs;
    }
    if (payload.seenAs) {
      seenAs = payload.seenAs;
    }
    if (payload.channel) {
      channel = payload.channel;
    }
    data = payload.data;
    onClick = payload.onClick;
    onSeen = payload.onSeen;
  } else {
    data = payload;
  }

  const { track } = useAnalytics();

  const seenHandler = (
    _entries: IntersectionObserverEntry[],
    _observer: IntersectionObserver
  ) => {
    track(seenAs, data, channel);
    if (onSeen) onSeen();
  };

  const registerClick = () => {
    const handler = function () {
      const _click = el._click?.[binding.instance!.$.uid];
      if (!_click) return; // Just in case, should never fire

      if (clickOnce && _click.clicked) {
        return;
      }

      track(clickAs, data, channel);
      if (onClick) onClick();

      _click.clicked = true;
      if (clickOnce) removeHandler();
    };

    const removeHandler = () => el.removeEventListener("click", handler);

    el.addEventListener("click", handler);

    el._click = Object(el._click);
    el._click![binding.instance!.$.uid] = { clicked: false };

    return removeHandler;
  };

  const registerObserver = () => {
    const unobserve = () => {
      const observe = el._observe?.[binding.instance!.$.uid];
      if (!observe) return;

      observe.observer.unobserve(el);
      delete el._observe![binding.instance!.$.uid];
    };

    if (SUPPORTS_INTERSECTION) {
      const observer = new IntersectionObserver(
        (
          entries: IntersectionObserverEntry[] = [],
          observer: IntersectionObserver
        ) => {
          const _observe = el._observe?.[binding.instance!.$.uid];
          if (!_observe) return; // Just in case, should never fire

          const isIntersecting = entries.some((entry) => entry.isIntersecting);

          // If is not quiet or has already been
          // initted, handle the seen event
          if (
            (!modifiers.observeQuiet || _observe.init) &&
            (!seenOnce || isIntersecting || _observe.init)
          ) {
            seenHandler(entries, observer);
          }

          if (isIntersecting && seenOnce) unobserve();
          else _observe.init = true;
        },
        observerOptions
      );

      el._observe = Object(el._observe);
      el._observe![binding.instance!.$.uid] = { init: false, observer };

      observer.observe(el);
    }

    return unobserve;
  };

  if (clickOnly) {
    return {
      removeClickHandler: registerClick(),
    };
  } else if (seenOnly) {
    return {
      unobserve: registerObserver(),
    };
  }

  return {
    unobserve: registerObserver(),
    removeClickHandler: registerClick(),
  };
}

export const createTrackEventDirective = () => {
  const directive: any = {
    mounted(el: TrackedElement, binding: ObserveDirectiveBinding) {
      const { unobserve, removeClickHandler } = mounted(el, binding);
      this.unobserve = unobserve;
      this.removeClickHandler = removeClickHandler;
    },
    unmounted(el: TrackedElement, binding: ObserveDirectiveBinding) {
      if (this.unobserve) {
        this.unobserve(el, binding);
      }
      if (this.removeClickHandler) {
        this.removeClickHandler(el, binding);
      }
    },
  };
  const instance = Object.create({});
  instance.mounted = directive.mounted.bind(instance);
  instance.unmounted = directive.unmounted.bind(instance);

  return instance as TrackEventDirective;
};

export const TrackEvent = createTrackEventDirective();

export default TrackEvent;
