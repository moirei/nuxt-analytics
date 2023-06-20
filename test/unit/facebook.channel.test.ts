import {
  SpyInstance,
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import FacebookPixel from "../../src/runtime/channels/FacebookPixel";
import { setTimeout } from "timers";

async function waitForScripts(): Promise<SpyInstance> {
  return new Promise((resolve) => {
    function init() {
      const fbq = vi.spyOn(window, "fbq");
      return resolve(fbq);
    }

    (function wait() {
      // check for the generic script
      if (window.fbq) {
        init();
      } else {
        // generic script hasn't run yet
        setTimeout(wait, 10);
      }
    })();
  });
}

describe("facebook [channel]", () => {
  let channel: FacebookPixel;
  let config: any;

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
      id: "1234567890",
      dataProcessingOptions: {
        method: ["LDU"],
        country: 1,
        state: 1000,
      },
    };
    channel = new FacebookPixel("facebook", config);

    await channel.install();
  });

  afterEach(async () => {
    await channel.uninstall();
  });

  afterAll(() => {
    vi.clearAllTimers();
  });

  it("expects track to call `fbq.track` with the right arguments", async () => {
    const fbqSpy = await waitForScripts();

    const props = { k1: "v1", k2: "v2" };
    await channel.track({
      event: "Search",
      props,
    });

    expect(fbqSpy).toHaveBeenCalledWith("track", "Search", props);
  });

  it("expect page to call `fbq.track` with the right arguments", async () => {
    const fbqSpy = await waitForScripts();

    const props = { page: "/my-page", title: "My Title" };
    await channel.page({ props });

    expect(fbqSpy).toHaveBeenCalledWith("track", "PageView", props);
  });

  it("expects init to call `fbq` with dataProcessingOptions", async () => {
    const { queue } = Object.assign({}, window.fbq);
    const options = Object.values(queue[0]);
    const dataProcessingOptions = options[1];
    const dataProcessingCountry = options[2];
    const dataProcessingState = options[3];

    expect(dataProcessingOptions).toEqual(["LDU"]);
    expect(dataProcessingCountry).toEqual(1);
    expect(dataProcessingState).toEqual(1000);
  });
});
