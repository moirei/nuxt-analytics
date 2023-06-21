import {
  SpyInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import GoogleAnalytics4 from "../../src/runtime/channels/GoogleAnalytics4";
import { hasScript } from "./utils";

describe("ga4 [channel]", () => {
  let channel: GoogleAnalytics4;
  let config: any;
  let gaSpy: SpyInstance;
  let injectScriptSpy: SpyInstance;

  beforeEach(() => {
    config = {
      id: "G-XXX",
    };
    channel = new GoogleAnalytics4("ga", config);

    injectScriptSpy = vi
      .spyOn(channel as any, "injectScript")
      .mockImplementation(() => {});
    window.ga = function () {};

    gaSpy = vi.spyOn(window, "ga").mockImplementation(() => {
      return true;
    });
  });

  afterEach(async () => {
    await channel.uninstall();
  });

  it("expects gtag script to have been injected", async () => {
    const selector = 'script[src*="gtag/js"]';

    injectScriptSpy.mockRestore();

    expect(hasScript(selector)).toBeFalsy();

    channel["injectScript"]("1234567890");

    expect(hasScript(selector)).toBeTruthy();
  });

  it("expects track to return the correct response shape", async () => {
    await channel.install();

    window.dataLayer = [];

    const result = await channel.track({
      event: "event_name",
      props: {
        k: "v",
      },
    });

    const expectedResult = ["event", "event_name", { k: "v" }];

    expect(result).toEqual(expectedResult);
  });

  it("expects page to return the correct response shape", async () => {
    await channel.install();

    window.dataLayer = [];

    const result = await channel.page({
      props: {
        page: "https://example.com/my-overridden-page?id=1",
        title: "my overridden page",
      },
    });

    const expectedResult = [
      "event",
      "page_view",
      {
        page_location: "https://example.com/my-overridden-page?id=1",
        page_title: "my overridden page",
      },
    ];

    expect(result).toEqual(expectedResult);
  });

  it("expects page to send any data by default", async () => {
    channel = new GoogleAnalytics4("ga", { id: "G-XXX" });

    await channel.install();

    window.dataLayer = [];

    const result = await channel.page({
      props: {
        page: "https://example.com/my-overridden-page?id=1",
        title: "my overridden page",
      },
    });

    expect(result).toBeDefined();
  });
});
