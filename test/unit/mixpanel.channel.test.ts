import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import Mixpanel from "../../src/runtime/channels/Mixpanel";

describe("mixpanel [channel]", () => {
  let channel: Mixpanel;
  let config: any;

  beforeAll(() => {
    const parentNode = {
      insertBefore: () => void 0,
    };
    vi.spyOn(document, "getElementsByTagName").mockImplementation((): any => {
      return [{ parentNode }];
    });
  });

  beforeEach(async () => {
    config = {
      token: "1234567890",
    };

    channel = new Mixpanel("mixpanel", config);

    await channel.install();
  });

  afterEach(async () => {
    await channel.uninstall();
  });

  it("expects identify to call `mixpanel.identify` and `mixpanel.people.set` with the right arguments", async () => {
    const identifySpy = vi
      .spyOn(window.mixpanel, "identify")
      .mockImplementation(() => {
        return true;
      });

    const peopleSetSpy = vi
      .spyOn(window.mixpanel.people, "set")
      .mockImplementation(() => {
        return true;
      });

    await channel.identify({
      user: {
        id: 123,
        foo: "bar",
        cookie: "chocolate chip",
      },
    });

    await channel.identify({ user: { id: 123 } });

    expect(identifySpy).toHaveBeenCalledWith(123);

    expect(peopleSetSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        cookie: "chocolate chip",
        foo: "bar",
      })
    );

    expect(identifySpy).toHaveBeenCalledTimes(2);
    expect(peopleSetSpy).toHaveBeenCalledOnce();
  });

  it(" expects track to call `mixpanel.track` with the right arguments", async () => {
    const trackSpy = vi
      .spyOn(window.mixpanel, "track")
      .mockImplementation(() => {
        return true;
      });

    const props = {
      k: "v",
    };

    await channel.track({
      event: "Video played",
      props,
    });

    await channel.track({ event: "Audio played" });

    expect(trackSpy).toHaveBeenNthCalledWith(1, "Video played", props);
    expect(trackSpy).toHaveBeenNthCalledWith(2, "Audio played", undefined);
  });

  it("expects track to call `mixpanel.track` with the right arguments", async () => {
    const trackSpy = vi
      .spyOn(window.mixpanel, "track")
      .mockImplementation(() => {
        return true;
      });

    const props = {
      page: "/products/1",
    };

    await channel.page({ props });

    await channel.track({
      event: "Page View",
      props,
    });

    expect(trackSpy).toHaveBeenNthCalledWith(1, "Page Viewed", props);
    expect(trackSpy).toHaveBeenNthCalledWith(2, "Page View", props);
  });

  it("expects alias to call `mixpanel.alias` with the right arguments", async () => {
    const aliasSpy = vi
      .spyOn(window.mixpanel, "alias")
      .mockImplementation(() => {
        return true;
      });

    await channel.alias({
      alias: "user@example.com",
      original: 123,
    });

    await channel.alias({ alias: "foo@bar.com" });

    expect(aliasSpy).toHaveBeenNthCalledWith(1, "user@example.com", 123);
    expect(aliasSpy).toHaveBeenNthCalledWith(2, "foo@bar.com");
  });

  it("expects init to support extra configs", async () => {
    const config = {
      token: "1234567890",
      secureCookie: true,
      batchRequests: false,
    };

    const channel = new Mixpanel("mixpanel", config);

    const injectScriptSpy = vi
      .spyOn(channel as any, "injectScript")
      .mockImplementation((): any => {
        //
      });

    window.mixpanel = { init() {} };

    const initSpy = vi.spyOn(window.mixpanel, "init").mockImplementation(() => {
      //
    });

    await channel.install();

    expect(injectScriptSpy).toHaveBeenCalled();
    expect(initSpy).toHaveBeenCalledWith(
      config.token,
      expect.objectContaining({
        secure_cookie: true,
        batch_requests: false,
      })
    );

    await channel.uninstall();
  });
});
