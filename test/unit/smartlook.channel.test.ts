import {
  SpyInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import Smartlook from "../../src/runtime/channels/Smartlook";

describe("smartlook [channel]", () => {
  let channel: Smartlook;
  let config: any;
  let identifySpy: SpyInstance;
  let trackSpy: SpyInstance;
  let injectScriptSpy: SpyInstance;

  beforeEach(async () => {
    config = {
      projectKey: "1234567890",
    };

    channel = new Smartlook("smartlook", config);
    identifySpy = vi.fn();
    trackSpy = vi.fn();

    injectScriptSpy = vi
      .spyOn(channel as any, "injectScript")
      .mockImplementation(() => {
        return true;
      });

    window.smartlook = {
      identify: identifySpy,
      track: trackSpy,
      init: (_0: any, _1: any, loaded: any) => loaded && loaded(),
    };

    await channel.install();
  });

  afterEach(async () => {
    await channel.uninstall();
  });

  it("expects injectScript to inject smartlook script", () => {
    injectScriptSpy.mockRestore();

    const hasScript = () => {
      const scripts = document.querySelectorAll('script[id="smartlook"]');
      return !!Array.from(scripts).length;
    };

    expect(hasScript()).toBeFalsy();

    channel["injectScript"]();

    expect(hasScript()).toBeTruthy();
  });

  it("expects identify to call Smartlook with the right arguments", async () => {
    const props = {
      name: "John doe",
      email: "johndoe@email.com",
    };

    const user = {
      id: "12345678",
      ...props,
    };

    await channel.identify({
      user,
    });

    expect(identifySpy).toHaveBeenCalledWith(user.id, props);
  });

  it("expects track to call Smartlook with the right arguments", async () => {
    await channel.track({
      event: "page_viewed",
    });

    expect(trackSpy).toHaveBeenCalledWith("page_viewed");
  });

  it("expects page to call Smartlook with the right arguments", async () => {
    const props = {
      k: "v",
    };
    await channel.page({
      props,
    });

    await channel.page({});

    expect(trackSpy).toHaveBeenNthCalledWith(1, "page_viewed", props);
    expect(trackSpy).toHaveBeenNthCalledWith(2, "page_viewed");
  });
});
