import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { Analytics, AnalyticsOptions } from "../../src/runtime/Analytics";
import { fakeAdapter, fakeChannel } from "../faker";
import { Channel } from "../../src/runtime/types";

describe("analytics-adapters", async () => {
  let analytics: Analytics;
  let channel: Channel;

  const createAnalytics = (options?: Partial<AnalyticsOptions>) => {
    return new Analytics({
      channels: [],
      adapters: [],
      disabled: false,
      concurrency: 1,
      ...options,
    });
  };

  beforeEach(() => {
    channel = fakeChannel();
    vi.useFakeTimers();
  });

  afterEach(() => {
    analytics.destroy();
    vi.clearAllTimers();
  });

  it("should apply basic adapters to all events/channels", async () => {
    const adapter = fakeAdapter();

    analytics = createAnalytics({
      channels: [channel],
      adapters: [adapter],
    });

    await analytics.boot();

    const spy = vi.spyOn(adapter, "eventPropertiesAs");

    analytics.track({ event: "test-event" });

    await vi.runAllTimersAsync();

    expect(spy).toHaveBeenCalled();
  });

  it("should apply adapter with specific channels", async () => {
    const ch1 = fakeChannel({ name: "ch-1" });
    const ch2 = fakeChannel({ name: "ch-2" });
    const adt1 = fakeAdapter({ channels: ["ch-1"] });
    const adt2 = fakeAdapter({ channels: ["ch-2"] });

    analytics = createAnalytics({
      channels: [ch1, ch2],
      adapters: [adt1, adt2],
    });

    await analytics.boot();

    const ch1Spy = vi.spyOn(ch1, "track");
    const ch2Spy = vi.spyOn(ch2, "track");
    const adt1Spy = vi.spyOn(adt1, "eventPropertiesAs");
    const adt2Spy = vi.spyOn(adt2, "eventPropertiesAs");

    analytics.track({ event: "test-event" });
    analytics.only("ch-1").track({ event: "test-event" });
    analytics.only("ch-1").track({ event: "test-event" });
    analytics.only("ch-2").track({ event: "test-event" });

    await vi.runAllTimersAsync();

    expect(ch1Spy).toHaveBeenCalledTimes(3);
    expect(ch2Spy).toHaveBeenCalledTimes(2);

    expect(adt1Spy).toHaveBeenCalledTimes(3);
    expect(adt2Spy).toHaveBeenCalledTimes(2);
  });

  it("should apply adapter with specific events", async () => {
    const adt1 = fakeAdapter({ events: ["a", "b"] });
    const adt2 = fakeAdapter({ events: ["c", "d"] });

    analytics = createAnalytics({
      channels: [channel],
      adapters: [adt1, adt2],
    });

    await analytics.boot();

    const channelSpy = vi.spyOn(channel, "track");
    const adt1Spy = vi.spyOn(adt1, "eventPropertiesAs");
    const adt2Spy = vi.spyOn(adt2, "eventPropertiesAs");

    analytics.track({ event: "a" });
    analytics.track({ event: "b" });
    analytics.track({ event: "c" });
    analytics.track({ event: "d" });

    await vi.runAllTimersAsync();

    expect(channelSpy).toHaveBeenCalledTimes(4);

    expect(adt1Spy).toHaveBeenCalledTimes(2);
    expect(adt1Spy).toHaveBeenCalledWith(
      expect.objectContaining({ event: "a" })
    );
    expect(adt1Spy).toHaveBeenCalledWith(
      expect.objectContaining({ event: "b" })
    );

    expect(adt2Spy).toHaveBeenCalledTimes(2);
    expect(adt2Spy).toHaveBeenCalledWith(
      expect.objectContaining({ event: "c" })
    );
    expect(adt2Spy).toHaveBeenCalledWith(
      expect.objectContaining({ event: "d" })
    );
  });

  it("expect adapter to rename event", async () => {
    const adapter = fakeAdapter({
      eventNameAs: (p) => p.event + "-renamed",
    });

    analytics = createAnalytics({
      channels: [channel],
      adapters: [adapter],
    });

    await analytics.boot();

    const channelSpy = vi.spyOn(channel, "track");

    analytics.track({ event: "a" });

    await vi.runAllTimersAsync();

    expect(channelSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: "a-renamed" })
    );
  });

  it("expect adapter to rename event using maps", async () => {
    const adapter = fakeAdapter({
      mapEventNames: {
        "event-1": "event-1-renamed",
        "event-2": (p) => p.event + "-renamed",
      },
    });

    analytics = createAnalytics({
      channels: [channel],
      adapters: [adapter],
    });

    await analytics.boot();

    const channelSpy = vi.spyOn(channel, "track");

    analytics.track({ event: "event-1" });
    analytics.track({ event: "event-2" });
    analytics.track({ event: "event-3" });

    await vi.runAllTimersAsync();

    expect(channelSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: "event-1-renamed" })
    );

    expect(channelSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: "event-2-renamed" })
    );

    expect(channelSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: "event-3" })
    );
  });

  it("expect adapter to change event props", async () => {
    const adapter = fakeAdapter({
      eventPropertiesAs(p) {
        return {
          ...p.props,
          k2: "v2",
        };
      },
    });

    analytics = createAnalytics({
      channels: [channel],
      adapters: [adapter],
    });

    await analytics.boot();

    const channelSpy = vi.spyOn(channel, "track");

    analytics.track({ event: "a", props: { k1: "v1" } });

    await vi.runAllTimersAsync();

    expect(channelSpy).toHaveBeenCalledWith(
      expect.objectContaining({ props: { k1: "v1", k2: "v2" } })
    );
  });

  it("expect adapter to change event props using maps", async () => {
    const adapter = fakeAdapter({
      mapEventProperties: {
        "event-2": (p) => ({
          ...p.props,
          e2: "v",
        }),
      },
    });

    analytics = createAnalytics({
      channels: [channel],
      adapters: [adapter],
    });

    await analytics.boot();

    const channelSpy = vi.spyOn(channel, "track");

    const props = { k1: "v1" };
    analytics.track({ event: "event-1", props });
    analytics.track({ event: "event-2", props });

    await vi.runAllTimersAsync();

    expect(channelSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: "event-1", props })
    );

    expect(channelSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "event-2",
        props: { ...props, e2: "v" },
      })
    );
  });
});
