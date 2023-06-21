import { SpyInstance, beforeEach, describe, expect, it, vi } from "vitest";
import Posthog from "../../src/runtime/channels/Posthog";
import { removeFromDOM } from "../../src/runtime/lib";
import { hasScript, injectDummyScript } from "./utils";

describe("posthog [channel]", () => {
  let channel: Posthog;
  let config: any;
  let injectScriptSpy: SpyInstance;
  let captureSpy: SpyInstance;
  let identifySpy: SpyInstance;

  beforeEach(async () => {
    config = {
      token: "1234567890",
    };

    channel = new Posthog("posthog", config);

    injectScriptSpy = vi
      .spyOn(channel as any, "injectScript")
      .mockImplementation(() => {});

    captureSpy = vi.fn();
    identifySpy = vi.fn();

    window.posthog = {
      capture: captureSpy,
      identify: identifySpy,
      init: (_: any, { loaded }: any) => loaded && loaded(),
    };
  });

  it("expects injectScript to inject posthog script", async () => {
    injectScriptSpy.mockRestore();
    const selector = 'script[id="posthog"]';

    // used by posthog to anchor its position
    injectDummyScript();

    expect(hasScript(selector)).toBeFalsy();

    channel["injectScript"]();
    window.posthog.init(config.token, {
      api_host: "https://app.posthog.com",
    });

    expect(hasScript(selector)).toBeTruthy();

    removeFromDOM(selector);
  });

  it("expects install to call injectScript", async () => {
    await channel.install();
    expect(injectScriptSpy).toHaveBeenCalled();
  });

  it("expects identify to call `posthog.identify` with the right arguments", async () => {
    await channel.identify({
      user: {
        id: 123,
        foo: "bar",
        cookie: "chocolate chip",
      },
    });

    await channel.identify({ user: { id: 123 } });

    expect(identifySpy).toHaveBeenNthCalledWith(
      1,
      123,
      expect.objectContaining({
        cookie: "chocolate chip",
        foo: "bar",
      })
    );
    expect(identifySpy).toHaveBeenNthCalledWith(2, 123, {});
  });

  it(" expects track to call `posthog.capture` with the right arguments", async () => {
    const props = {
      k: "v",
    };

    await channel.track({
      event: "Video played",
      props,
    });

    await channel.track({ event: "Audio played" });

    expect(captureSpy).toHaveBeenNthCalledWith(1, "Video played", props);
    expect(captureSpy).toHaveBeenNthCalledWith(2, "Audio played", undefined);
  });

  it("expects track to call `posthog.capture` with the right arguments", async () => {
    const props = {
      page: "/products/1",
    };

    await channel.page({ props });

    await channel.track({
      event: "Page View",
      props,
    });

    expect(captureSpy).toHaveBeenNthCalledWith(1, "$pageview", props);
    expect(captureSpy).toHaveBeenNthCalledWith(2, "Page View", props);
  });

  it("expects init to support extra configs", async () => {
    const config = {
      token: "1234567890",
      apiHost: "host",
      autocapture: true,
      capturePageview: true,
      capturePageleave: true,
    };

    const channel = new Posthog("posthog", config);

    injectScriptSpy = vi
      .spyOn(channel as any, "injectScript")
      .mockImplementation(() => {});

    const initSpy = vi.spyOn(window.posthog, "init");

    await channel.install();

    expect(injectScriptSpy).toHaveBeenCalled();
    expect(initSpy).toHaveBeenCalledWith(
      config.token,
      expect.objectContaining({
        api_host: "host",
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
      })
    );
  });
});
