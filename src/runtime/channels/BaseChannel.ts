import {
  Channel,
  Enumerable,
  EventPayload,
  IdentifyPayload,
  PagePayload,
  Promisable,
} from "../types";

export default abstract class BaseChannel implements Channel {
  readonly name: string;
  readonly driver!: string;
  readonly disabled: boolean = false;
  readonly env?: Enumerable<string>;

  constructor(
    name: string,
    protected readonly config: Record<PropertyKey, any> = {},
    env?: Enumerable<string>
  ) {
    this.name = name;
    this.env = env;
  }

  abstract install(): Promisable<void>;
  abstract uninstall(): Promisable<void>;
  abstract track(payload: EventPayload): Promisable<void>;
  abstract page(payload: PagePayload): Promisable<void>;
  abstract identify(payload: IdentifyPayload): Promisable<void>;
}
