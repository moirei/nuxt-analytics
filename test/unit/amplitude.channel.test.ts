import {
  SpyInstance,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import Amplitude from "../../src/runtime/channels/Amplitude";
import { hasScript, injectDummyScript } from "./utils";

describe("amplitude [channel]", () => {
  let channel: Amplitude;
  let config: any;
  let initSpy: SpyInstance;
  let identifySpy: SpyInstance;
  let setUserIdSpy: SpyInstance;
  let logEventSpy: SpyInstance;
  let setOptOutSpy: SpyInstance;
  let fakeIndentity: { set: SpyInstance; get: SpyInstance };

  beforeAll(() => {
    // used by amplitude to anchor its position
    injectDummyScript();
  });

  beforeEach(async () => {
    config = {
      apiKey: "AMPLITUDE_KEY",
    };
    channel = new Amplitude("amplitude", config);

    initSpy = vi.fn();
    identifySpy = vi.fn();
    setUserIdSpy = vi.fn();
    logEventSpy = vi.fn();
    setOptOutSpy = vi.fn();

    fakeIndentity = {
      set: vi.fn(),
      get: vi.fn(),
    };

    const instance = {
      init: initSpy,
      identify: identifySpy,
      setUserId: setUserIdSpy,
      logEvent: logEventSpy,
      setOptOut: setOptOutSpy,
    };

    vi.spyOn(channel, "getInstance").mockImplementation(() => instance);

    await channel.install();
  });

  afterEach(async () => {
    await channel.uninstall();
  });

  it("expects script to have been injected", async () => {
    const selector = 'script[src*="amplitude"]';

    expect(hasScript(selector)).toBeTruthy();
  });

  it("expects identify to set the distinct user ID, and calls amplitude with any extra user properties", async () => {
    channel["identity"] = fakeIndentity;

    await channel.identify({
      user: {
        id: "123",
        email: "ben.simmons@sixers.net",
      },
    });

    expect(setUserIdSpy).toHaveBeenCalledWith("123");
    expect(fakeIndentity.set).toHaveBeenCalledWith(
      "email",
      "ben.simmons@sixers.net"
    );
    expect(identifySpy).toHaveBeenCalled();
  });

  it("expects track to send the correct request shape", async () => {
    const props = {
      email: "joel.embiid@sixers.net",
    };

    await channel.track({
      event: "Registered User",
      props,
    });

    await channel.track({
      event: "User Login",
    });

    expect(logEventSpy).toHaveBeenNthCalledWith(1, "Registered User", props);
    expect(logEventSpy).toHaveBeenNthCalledWith(2, "User Login");
  });

  it("expects page to send the correct request shape", async () => {
    const props = {
      url: "/shot-charts/missed-threes",
    };

    await channel.page({ props });

    expect(logEventSpy).toHaveBeenCalledWith("Page View", props);
  });

  it("expects optOut to call amplitude optOut with true", async () => {
    await channel.optOut();
    expect(setOptOutSpy).toHaveBeenCalledWith(true);
  });

  it("expects optIn to call amplitude optOut with false", async () => {
    await channel.optIn();
    expect(setOptOutSpy).toHaveBeenCalledWith(false);
  });
});
