import { Constructor } from "../types";
import { get } from "../utils";
import BaseAdapter from "./BaseAdapter";
import { FacebookAdapter } from "./FacebookAdapter";
import GaAdapter from "./GaAdapter";

const map = {
  facebook: FacebookAdapter,
  ga: GaAdapter,
};

export const getAdapterConstructor = (
  name: string
): Constructor<BaseAdapter> | undefined => {
  return get(map, name);
};
