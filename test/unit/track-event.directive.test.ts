import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TrackEventDirective,
  // createTrackEventDirective,
} from "../../src/runtime/directives/TrackEvent";

describe.todo("v-track-event [directive]", () => {
  let TrackEvent: TrackEventDirective;

  beforeEach(() => {
    // TrackEvent = createTrackEventDirective();
  });

  it("should bind event on mounted", () => {
    // const callback = vi.fn();
    // const el = document.createElement("div");
    // document.body.appendChild(el);
    // TrackEvent.mounted(el, {
    //   value: callback,
    //   modifiers: {},
    //   instance: {
    //     $: { uid: 1 },
    //   },
    // } as any);
    // expect((el as any)._observe).toBeTruthy();
    // // expect(callback).not.toHaveBeenCalled()
    // document.body.removeChild(el);
    // TrackEvent.unmounted(el, {
    //   instance: {
    //     $: { uid: 1 },
    //   },
    // } as any);
    // expect((el as any)._observe[1]).toBeUndefined();
  });

  it("should send click event", () => {
    //
  });

  it("should send seen event", () => {
    //
  });

  it("should send events to single channel", () => {
    //
  });

  it("should send events to multiple channels", () => {
    //
  });

  it("should send value as data props", () => {
    //
  });

  it("should send value.data as data props when other options are included", () => {
    //
  });

  it("should rename click event", () => {
    //
  });

  it("should rename seen event", () => {
    //
  });

  it("should call onClick callback", () => {
    //
  });

  it("should call onSeen callback", () => {
    //
  });

  it("should apply observerInit options", () => {
    //
  });

  it("should send click and seen events once", () => {
    //
  });

  it("should send click event once", () => {
    //
  });

  it("should send seen event once", () => {
    //
  });

  it("should send only click event", () => {
    //
  });

  it("should send only seen event", () => {
    //
  });

  it("should invoke callback once and unmount", () => {
    // const el = document.createElement('div')
    //   document.body.appendChild(el)
    //   const callback = jest.fn()
    //   Intersect.mounted(el, {
    //     value: callback,
    //     modifiers: { once: true },
    //     instance: {
    //       $: { uid: 1 },
    //     },
    //   } as any)
    //   expect(callback).toHaveBeenCalledTimes(0)
    //   expect((el as any)._observe[1]).toBeTruthy()
    //   ;(el as any)._observe[1].observer.callback([{ isIntersecting: false }])
    //   expect(callback).toHaveBeenCalledTimes(1)
    //   expect((el as any)._observe[1]).toBeTruthy()
    //   ;(el as any)._observe[1].observer.callback([{ isIntersecting: true }])
    //   expect(callback).toHaveBeenCalledTimes(2)
    //   expect((el as any)._observe[1]).toBeUndefined()
  });
});
