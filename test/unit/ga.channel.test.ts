import {
  SpyInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import GoogleAnalytics from "../../src/runtime/channels/GoogleAnalytics";

describe("ga [channel]", () => {
  let channel: GoogleAnalytics;
  let config: any;
  let gaSpy: SpyInstance;

  beforeEach(() => {
    config = {
      id: "UA-XXXX-Y",
      require: ["ecommerce"],
    };
    channel = new GoogleAnalytics("ga", config);

    vi.spyOn(channel as any, "injectScript").mockImplementation(() => {});
    window.ga = function () {};

    gaSpy = vi.spyOn(window, "ga").mockImplementation(() => {
      return true;
    });
  });

  afterEach(async () => {
    await channel.uninstall();
  });

  it("expects init to call ga create with a valid config", async () => {
    config.sendHitTask = false;
    config.debug = false;
    config.trace = false;
    config.sampleRate = 5;

    vi.spyOn(channel as any, "injectScript").mockImplementation(() => {});
    window.ga = function () {};

    const gaSpy = vi.spyOn(window, "ga").mockImplementation(() => {
      return true;
    });

    await channel.install();

    expect(gaSpy).toHaveBeenCalledWith(
      "create",
      config.id,
      expect.objectContaining({
        debug: false,
        require: ["ecommerce"],
        sampleRate: 5,
      }),
      undefined
    );
  });

  it("expects init to call ga create with a valid config including trackerName", async () => {
    config.sendHitTask = false;
    config.debug = false;
    config.trace = false;
    config.sampleRate = 5;
    config.trackerName = "myEngineTracker";

    channel = new GoogleAnalytics("ga", config);

    vi.spyOn(channel as any, "injectScript").mockImplementation(() => {});
    window.ga = function () {};

    const gaSpy = vi.spyOn(window, "ga").mockImplementation(() => {
      return true;
    });

    await channel.install();

    expect(gaSpy).toHaveBeenCalledWith(
      "create",
      config.id,
      expect.objectContaining({
        sampleRate: 5,
      }),
      "myEngineTracker"
    );

    expect(channel["gaSendKey"]).toEqual("myEngineTracker.send");
  });

  it("expects init to call ga for any plugins specified", async () => {
    await channel.install();
    expect(gaSpy).toHaveBeenCalledWith("require", "ecommerce");
  });

  it("expects identify to call ga with the right arguments", async () => {
    await channel.install();
    await channel.identify({ user: { id: 123 } });

    expect(gaSpy).toHaveBeenCalledWith("set", "userId", 123);
  });

  it("expects track to return the correct response shape", async () => {
    const result = await channel.track({
      event: "click",
      props: {
        eventCategory: "button",
        eventLabel: "nav buttons",
        eventValue: 4,
        dimension1: true,
      },
    });

    const expectedResult = {
      hitType: "event",
      eventCategory: "button",
      eventAction: "click",
      eventLabel: "nav buttons",
      eventValue: 4,
      dimension1: true,
    };

    expect(result).toEqual(expectedResult);
  });

  it("expects page to return the correct response shape", async () => {
    const result = await channel.page({
      props: {
        page: "/my-overridden-page?id=1",
        title: "my overridden page",
      },
    });

    const expectedResult = {
      hitType: "pageview",
      page: "/my-overridden-page?id=1",
      title: "my overridden page",
    };

    expect(result).toEqual(expectedResult);

    expect(await channel.page({})).toEqual(
      expect.objectContaining({ hitType: "pageview" })
    );

    it("expects track with trackerName to return the correct response shape", async () => {
      const result = await channel.track({
        event: "click",
        props: {
          eventCategory: "button",
          eventLabel: "nav buttons",
          eventValue: 4,
          dimension1: true,
        },
      });

      const expectedResult = {
        hitType: "event",
        eventCategory: "button",
        eventAction: "click",
        eventLabel: "nav buttons",
        eventValue: 4,
        dimension1: true,
      };

      expect(result).toEqual(expectedResult);
    });
  });
});
