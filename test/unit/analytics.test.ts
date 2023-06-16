import { describe, it, expect, vi, afterEach, afterAll } from "vitest";
import { Analytics, AnalyticsOptions } from "../../src/runtime/Analytics";
import { fakeAdapter, fakeChannel } from "../faker";
import { BaseAdapter } from "../../src/module";

describe("analytics", async () => {
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

  afterEach(() => {
    analytics.destroy();
  });

  afterAll(() => {
    vi.clearAllTimers();
  });

  it("should install and configure channels and adapters on boot", async () => {
    const channel = fakeChannel();
    const adapter = fakeAdapter();

    analytics = createAnalytics({
      channels: [channel],
      adapters: [adapter],
    });

    const installSpy = vi.spyOn(channel, "install");
    const configureSpy = vi.spyOn(adapter, "configure");

    // expect(analytics["booted"]).toBeFalsy();

    await analytics.boot();

    expect(installSpy).toHaveBeenCalled();
    expect(configureSpy).toHaveBeenCalled();
    // expect(analytics["booted"]).toBeTruthy();
  });

  it("should only install channels in applicable env", async () => {
    const ch1InstallSpy = vi.fn();
    const ch2InstallSpy = vi.fn();
    const ch3InstallSpy = vi.fn();

    const ch1TrackSpy = vi.fn();
    const ch2TrackSpy = vi.fn();
    const ch3TrackSpy = vi.fn();

    const ch1 = fakeChannel({
      env: "a",
      install: ch1InstallSpy,
      track: ch1TrackSpy,
    });
    const ch2 = fakeChannel({
      env: "b",
      install: ch2InstallSpy,
      track: ch2TrackSpy,
    });
    const ch3 = fakeChannel({ install: ch3InstallSpy, track: ch3TrackSpy });

    analytics = createAnalytics({
      channels: [ch1, ch2, ch3],
      env: "a",
    });

    await analytics.boot();
    await analytics.track({ event: "test" });

    expect(ch1InstallSpy).toHaveBeenCalled();
    expect(ch2InstallSpy).not.toHaveBeenCalled();
    expect(ch3InstallSpy).toHaveBeenCalled();

    expect(ch1TrackSpy).toHaveBeenCalled();
    expect(ch2TrackSpy).not.toHaveBeenCalled();
    expect(ch3TrackSpy).toHaveBeenCalled();
  });

  it("should NOT boot analytics if disabled", async () => {
    const channel = fakeChannel();

    analytics = createAnalytics({
      channels: [channel],
      disabled: true,
    });

    const installSpy = vi.spyOn(channel, "install");

    await analytics.boot();

    expect(installSpy).not.toHaveBeenCalled();
  });

  it("should add adapter hooks", async () => {
    const hookSpy = vi.fn();
    const trackSpy = vi.fn();

    class TestAdapter extends BaseAdapter {
      public configure(): void {
        this.hooks("track:before", hookSpy);
      }
    }

    const channel = fakeChannel({
      track: trackSpy,
    });

    analytics = createAnalytics({
      adapters: [new TestAdapter()],
      channels: [channel],
    });

    await analytics.boot();

    await analytics.track({ event: "test" });

    expect(trackSpy).toHaveBeenCalled();
    expect(hookSpy).toHaveBeenCalled();
  });

  it("expect adapter hooks to modify event props", async () => {
    const trackSpy = vi.fn();
    const props = { k1: "v1" };
    const modifyProps = { k2: "v2" };

    class TestAdapter extends BaseAdapter {
      public configure(): void {
        this.hooks("track:before", (payload) => {
          payload.props = {
            ...payload.props,
            ...modifyProps,
          };
        });
      }
    }

    const channel = fakeChannel({
      track: trackSpy,
    });

    analytics = createAnalytics({
      adapters: [new TestAdapter()],
      channels: [channel],
    });

    await analytics.boot();

    await analytics.track({ event: "test", props });

    expect(trackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        props: {
          ...props,
          ...modifyProps,
        },
      })
    );
  });

  it("expects getAdapter to prefer non-empty maps", async () => {
    const trackSpy = vi.fn();

    class EmptyAdapter extends BaseAdapter {
      public configure(): void {
        //
      }
    }

    class PreferredAdapter extends BaseAdapter {
      public configure(): void {
        this.mapEventName("test", "mapped-test");
      }
    }

    const channel = fakeChannel({
      track: trackSpy,
    });

    analytics = createAnalytics({
      adapters: [
        new EmptyAdapter(),
        new PreferredAdapter(),
        new EmptyAdapter(),
      ],
      channels: [channel],
    });

    await analytics.boot();
    await analytics.track({ event: "test" });

    expect(trackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "mapped-test",
      })
    );
  });

  it("should boot analytics once", async () => {
    const channel = fakeChannel();

    analytics = createAnalytics({
      channels: [channel],
    });

    const installSpy = vi.spyOn(channel, "install");

    await analytics.boot();
    await analytics.boot();

    expect(installSpy).toHaveBeenCalledTimes(1);
  });

  it("should uninstall analytics on destroy", async () => {
    const channel = fakeChannel();

    analytics = createAnalytics({
      channels: [channel],
    });

    const uninstallSpy = vi.spyOn(channel, "uninstall");

    await analytics.boot();
    await analytics.destroy();

    expect(uninstallSpy).toHaveBeenCalled();
  });

  it("should get event channel", async () => {
    const channel1 = fakeChannel({ name: "ch-1" });
    const channel2 = fakeChannel({ name: "ch-2" });

    analytics = createAnalytics({
      channels: [channel1, channel2],
    });

    await analytics.boot();

    expect(analytics.channel("ch-1")).toBeDefined();
    expect(analytics.channel("ch-2")).toBeDefined();
  });

  it("should through error getting unknown channel", async () => {
    const channel = fakeChannel();

    analytics = createAnalytics({
      channels: [channel],
    });

    await analytics.boot();

    const fn = () => analytics.channel("unknown-ch");

    expect(fn).toThrow();
  });

  it("should set super props", async () => {
    analytics = createAnalytics();

    analytics.superProperties({
      a: "prop-a",
      b: "prop-b-1",
    });

    analytics.superProperties({
      b: "prop-b-2",
      c: "prop-c",
    });

    const superProps = analytics["superProps"];

    expect(superProps).toHaveProperty("a");
    expect(superProps).toHaveProperty("b");
    expect(superProps).toHaveProperty("c");
    expect(superProps.a).toEqual("prop-a");
    expect(superProps.b).toEqual("prop-b-2");
    expect(superProps.c).toEqual("prop-c");
  });

  it("should reset super props", async () => {
    analytics = createAnalytics();

    analytics.superProperties({
      a: "prop-a",
    });

    analytics.superProperties(
      {
        b: "prop-b",
        c: "prop-c",
      },
      true
    );

    const superProps = analytics["superProps"];

    expect(superProps).not.toHaveProperty("a");
    expect(superProps).toHaveProperty("b");
    expect(superProps).toHaveProperty("c");
    expect(superProps.b).toEqual("prop-b");
    expect(superProps.c).toEqual("prop-c");
  });

  it("expect super props to be included in events", async () => {
    vi.useFakeTimers();

    const channel = fakeChannel({});

    analytics = createAnalytics({
      channels: [channel],
    });

    const trackSpy = vi.spyOn(channel, "track");

    await analytics.boot();

    const event = "test-event";
    const superProps = { a: "prop-a" };
    const props = { b: "prop-b" };

    analytics.superProperties(superProps);
    analytics.track({ event, props });

    await vi.runAllTimersAsync();

    expect(trackSpy).toHaveBeenCalledWith(expect.objectContaining({ event }));
    expect(trackSpy).toHaveBeenCalledWith(
      expect.objectContaining({ props: { ...superProps, ...props } })
    );
  });

  it("should send event to only to specific channels", async () => {
    vi.useFakeTimers();

    const ch1 = fakeChannel({ name: "ch-1" });
    const ch2 = fakeChannel({ name: "ch-2" });

    analytics = createAnalytics({
      channels: [ch1, ch2],
    });

    const track1Spy = vi.spyOn(ch1, "track");
    const track2Spy = vi.spyOn(ch2, "track");

    await analytics.boot();

    analytics.only("ch-1").track({ event: "test-event" });

    await vi.runAllTimersAsync();

    expect(track1Spy).toHaveBeenCalled();
    expect(track2Spy).not.toHaveBeenCalled();
  });

  it("should send event to except to specific channels", async () => {
    vi.useFakeTimers();

    const ch1 = fakeChannel({ name: "ch-1" });
    const ch2 = fakeChannel({ name: "ch-2" });

    analytics = createAnalytics({
      channels: [ch1, ch2],
    });

    const track1Spy = vi.spyOn(ch1, "track");
    const track2Spy = vi.spyOn(ch2, "track");

    await analytics.boot();

    analytics.except("ch-1").track({ event: "test-event" });

    await vi.runAllTimersAsync();

    expect(track1Spy).not.toHaveBeenCalled();
    expect(track2Spy).toHaveBeenCalled();
  });
});
