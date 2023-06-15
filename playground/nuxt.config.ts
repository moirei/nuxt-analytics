import { ElementEvent } from "../src/runtime/events/ElementEvent";
import { defineAdapter, defineChannel } from "../src/runtime/lib";

export default defineNuxtConfig({
  modules: ["../src/module"],
  analytics: {
    superProperties: {
      playground: true,
    },
    adapters: [
      "ga",
      "facebook",
      defineAdapter({
        channels: ["debug"],
        events: [ElementEvent.Clicked, ElementEvent.Seen],
        // eventNameAs(payload) {
        //   return "Debugged: " + payload.event;
        // },
        mapEventNames: {
          [ElementEvent.Clicked]: "Debugged: Item Clicked",
          [ElementEvent.Seen](payload) {
            return "Debugged: " + payload.event;
          },
        },
        // mapEventProperties: {
        //   [ElementEvent.Seen]() {
        //     //
        //   },
        // },
      }),
    ],
    channels: {
      debug: { driver: "debug" },
      // fb: {
      //   driver: "facebook",
      //   id: "",
      // },
      // mixpanel: {
      //   driver: "mixpanel",
      //   token: "",
      // },
      // posthog: {
      //   driver: "posthog",
      //   token: "",
      // },
      custom: defineChannel({
        track(payload) {
          console.log("[custom-channel] " + payload.event);
        },
      }),
    },
  },
});
