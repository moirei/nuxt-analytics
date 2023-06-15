import jiti from "jiti";
import {
  Channel,
  Enumerable,
  EventPayload,
  IdentifyPayload,
  InlineAdapter,
  InlineChannel,
  PagePayload,
  Promisable,
} from "./types";
import { MODULE_ID } from "./constants";

/**
 * @throws {Error}
 * @param {string} message
 */
export const error = (message: string): never => {
  throw new Error(`[${MODULE_ID}] ${message}`);
};

export const assert = <T>(message: string, value: T): T => {
  if (isNil(value)) {
    error(message);
  }
  return value;
};

export const readFile = async <T>(path: string): Promise<T> => {
  const reader = jiti(import.meta.url, {
    interopDefault: true,
    requireCache: false,
  });

  return await reader(path);
};

export const isNil = (value: any): boolean => {
  return value === null || value === undefined;
};

export const isEmpty = (value: any): boolean => {
  return isNil(value) || !Object.keys(value).length;
};

export const hasProp = (value: any, key: string): boolean => {
  if (!value) return false;
  return Object.keys(value).includes(key);
};

export const set = (target: any, key: PropertyKey, value: any) => {
  if (isNil(target)) return;
  if (Array.isArray(target)) {
    target.length = Math.max(target.length, key as any);
    target.splice(key as any, 1, value);
    return value;
  }
  target[key] = value;
  return value;
};

export const get = <T extends any>(target: any, key: string, defu?: any): T => {
  if (hasProp(target, key)) {
    return target[key];
  }
  return defu;
};

export const omit = <T, K extends string>(value: T, key: K): Omit<T, K> => {
  const { [key]: _omitted, ...rest } = value;
  return rest;
};

export const clean = (value: any): any => {
  return Object.fromEntries(
    Object.entries(value).filter(([_, v]) => !isNil(v))
  );
};

export const getAny = <T extends any>(
  target: any,
  keys: string[],
  defu?: any
): T => {
  let data = defu;

  for (const key of keys) {
    const x = get(target, key);
    if (!isNil(x)) {
      data = x;
      break;
    }
  }

  return data;
};

export const onEach = async <T>(
  items: T[],
  callback: { (item: T): Promisable<any> }
): Promise<any> => {
  const promises: Promise<any>[] = [];

  for (const item of items) {
    const p = callback(item);
    promises.push(Promise.resolve(p));
  }

  await Promise.all(promises);
};

export const unwrap = <T>(value: Enumerable<T>): T[] => {
  return Array.isArray(value) ? value : [value];
};

export const isInlineChannel = (value: any): value is InlineChannel =>
  value.__inline === true;

export const isInlineAdapter = (value: any): value is InlineAdapter =>
  value.__inline === true;

export const createInlineChannel = (
  name: string,
  options: InlineChannel,
  env?: string
): Channel => ({
  name,
  driver: name,
  disabled: !!options.disabled,
  env,
  install(...args) {
    if (options.install) {
      return options.install.apply(this, args);
    }
  },
  uninstall(...args) {
    if (options.uninstall) {
      return options.uninstall.apply(this, args);
    }
  },
  track(...args) {
    return options.track.apply(this, args);
  },
  page(...args) {
    if (options.page) {
      return options.page.apply(this, args);
    }
  },
  identify(...args) {
    if (options.identify) {
      return options.identify.apply(this, args);
    }
  },
});

export const normaliseValue = <V>(
  value: V
): V extends any[] ? PropertyKey[] : PropertyKey => {
  if (Array.isArray(value)) {
    return value.map(normaliseValue) as any;
  }

  if (typeof value == "function") {
    return normaliseValue(value()) as any;
  }

  if (typeof value == "object") {
    return String(value) as any;
  }

  return value as any;
};

export const isCallable = <T, F extends { (...args: any[]): T }>(
  value: T | F
): value is F => typeof value === "function";

export const isNamedEvent = (
  payload: EventPayload | PagePayload | IdentifyPayload
): payload is EventPayload => hasProp(payload, "event");

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const upperFirst = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);
