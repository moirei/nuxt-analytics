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
import GoogleTagManager from "../../src/runtime/channels/GoogleTagManager";

describe("gtm [channel]", () => {
  let channel: GoogleTagManager;
  let config: any;
  let pushSpy: SpyInstance;

  beforeAll(() => {
    const parentNode = {
      insertBefore: () => void 0,
    };
    vi.spyOn(document, "getElementsByTagName").mockImplementation((): any => {
      return [{ parentNode }];
    });

    vi.useFakeTimers();
  });

  beforeEach(async () => {
    config = {
      id: "GTM-XXXX",
    };
    channel = new GoogleTagManager("gtm", config);

    window.dataLayer = new Array([]);

    await channel.install();

    pushSpy = vi.spyOn(window.dataLayer, "push");
  });

  afterEach(async () => {
    await channel.uninstall();
  });

  it("expects track to push correct data shape", async () => {
    const props = {
      eventCategory: "button",
      eventAction: "click",
      eventLabel: "nav buttons",
      eventValue: 4,
    };

    await channel.track({
      event: "click-button",
      props,
    });

    expect(pushSpy).toHaveBeenCalledWith({ ...props, event: "click-button" });
  });

  it("expects track to include eventAction property", async () => {
    const props = {
      eventCategory: "button",
      eventLabel: "nav buttons",
      eventValue: 4,
    };

    await channel.track({
      event: "click-button",
      props,
    });

    expect(pushSpy).toHaveBeenCalledWith({
      ...props,
      eventAction: "click-button",
      event: "click-button",
    });
  });

  it("expects page to push correct data shape", async () => {
    const props = {
      url: "/my-overridden-page?id=1",
      title: "my overridden page",
    };

    await channel.page({
      props,
    });

    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({ ...props, event: "pageview" })
    );
  });

  it("expects page accept a custom dataLayer name", async () => {
    const customConfig = {
      ...config,
      dataLayer: "customDataLayer",
    };

    channel = new GoogleTagManager("gtm", customConfig);

    (window as any).customDataLayer = new Array([]);

    await channel.install();

    const customDataLayerSpy = vi.spyOn(
      (window as any)["customDataLayer"],
      "push"
    );
    const props = {
      url: "/my-overridden-page?id=1",
      title: "my overridden page",
    };

    await channel.page({ props });

    expect(customDataLayerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ...props,
        event: "pageview",
      })
    );
  });

  it("expects page to accept custom `keyNames` and push the correct data shape", async () => {
    const props = {
      VirtualPageUrl: "/my-overridden-page?id=1",
      VirtualTitle: "my overridden page",
    };

    await channel.page({
      props: {
        event: "VirtualPageView",
        ...props,
      },
    });

    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ...props,
        event: "VirtualPageView",
      })
    );
  });
});
