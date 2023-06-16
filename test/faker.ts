import { faker } from "@faker-js/faker";
import { createInlineChannel } from "../src/runtime/utils";
import { defineChannel } from "../src/runtime/lib";
import { Channel, InlineAdapter, InlineChannel } from "../src/runtime/types";
import BaseAdapter from "../src/runtime/adapters/BaseAdapter";
import InlineAdapterConstructor from "../src/runtime/adapters/InlineAdapterConstructor";

export const fakeChannel = (
  options?: Partial<
    Omit<InlineChannel, "__inline"> & { name?: string; env?: string }
  >
): Channel => {
  const name = options?.name || faker.word.noun();
  const config = defineChannel({
    install: () => void 0,
    uninstall: () => void 0,
    track: () => void 0,
    page: () => void 0,
    identify: () => void 0,
    ...options,
    driver: name || faker.word.noun(),
  });

  return createInlineChannel(name, config, options?.env);
};

export const fakeAdapter = (
  options?: Partial<Omit<InlineAdapter, "__inline">>
): BaseAdapter => {
  return new InlineAdapterConstructor({
    __inline: true,
    ...options,
  });
};
