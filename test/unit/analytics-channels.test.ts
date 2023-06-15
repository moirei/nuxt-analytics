import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  afterAll,
  beforeAll,
} from "vitest";
import { Analytics, AnalyticsOptions } from "../../src/runtime/Analytics";
import { fakeChannel } from "../faker";

describe("analytics-channels", async () => {
  let analytics: Analytics;

  const createAnalytics = (options?: Partial<AnalyticsOptions>) => {
    return new Analytics({
      channels: [],
      adapters: [],
      disabled: false,
      concurrency: 1,
      ...options,
    });
  };

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    analytics.destroy();
  });

  afterAll(() => {
    vi.clearAllTimers();
  });

  it("should send track event to channel", async () => {
    const channel = fakeChannel();

    analytics = createAnalytics({
      channels: [channel],
    });

    await analytics.boot();

    const event = "test-event";
    const spy = vi.spyOn(channel, "track");

    analytics.track({ event });

    await vi.runAllTimersAsync();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ event }));
  });

  it("should send page event to channel", async () => {
    const channel = fakeChannel();

    analytics = createAnalytics({
      channels: [channel],
    });

    await analytics.boot();

    const event = "test-event";
    const spy = vi.spyOn(channel, "page");

    analytics.page({});

    await vi.runAllTimersAsync();

    expect(spy).toHaveBeenCalled();
  });

  it("should send identify event to channel", async () => {
    const channel = fakeChannel();

    analytics = createAnalytics({
      channels: [channel],
    });

    await analytics.boot();

    const user = { id: "1" };
    const spy = vi.spyOn(channel, "identify");

    analytics.identify({ user });

    await vi.runAllTimersAsync();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ user }));
  });

  it("should not use disabled channels", async () => {
    const ch1 = fakeChannel({ disabled: false });
    const ch2 = fakeChannel({ disabled: true });

    analytics = createAnalytics({
      channels: [ch1, ch2],
    });

    await analytics.boot();

    const ch1Spy = vi.spyOn(ch1, "track");
    const ch2Spy = vi.spyOn(ch2, "track");

    analytics.track({ event: "test-event" });

    await vi.runAllTimersAsync();

    expect(ch1Spy).toHaveBeenCalled();
    expect(ch2Spy).not.toHaveBeenCalled();
  });

  it("should send events to channel with env", async () => {
    const ch1 = fakeChannel({ disabled: false, env: "prod" });
    const ch2 = fakeChannel({ disabled: true, env: "dev" });
    const ch3 = fakeChannel({ disabled: false });

    analytics = createAnalytics({
      channels: [ch1, ch2, ch3],
      env: "prod",
    });

    await analytics.boot();

    const ch1Spy = vi.spyOn(ch1, "track");
    const ch2Spy = vi.spyOn(ch2, "track");
    const ch3Spy = vi.spyOn(ch3, "track");

    analytics.track({ event: "test-event" });

    await vi.runAllTimersAsync();

    expect(ch1Spy).toHaveBeenCalled();
    expect(ch2Spy).not.toHaveBeenCalled();
    expect(ch3Spy).toHaveBeenCalled();
  });
});
