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

describe("ga4 [channel]", () => {
  let channel: GoogleAnalytics4;
  let config: any;
  let gaSpy: SpyInstance;

  beforeEach(() => {
    config = {
      id: "G-XXX",
    };
    channel = new GoogleAnalytics4("ga", config);

    vi.spyOn(channel as any, "injectScript").mockImplementation(() => {});
    window.ga = function () {};

    gaSpy = vi.spyOn(window, "ga").mockImplementation(() => {
      return true;
    });
  });

  afterEach(async () => {
    await channel.uninstall();
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
