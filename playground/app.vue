<template>
  <div>
    Nuxt module playground!
    <div>
      <h2>Track with component</h2>
      <track-event v-slot="{ clicks, seen }">
        <p>clicks: {{ clicks }}</p>
        <p>seen: {{ seen }}</p>
        <button>Click me</button>
      </track-event>
    </div>

    <div style="margin-top: 20px">
      <h2>Track with directive</h2>
      <div v-track-event>
        <button>Click me</button>
      </div>
    </div>

    <div style="margin-top: 20px">
      <h2>Track Custom</h2>
      <div>
        <button @click="trackCustom">Click me</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { EcommerceEvent } from "../src/runtime/events/EcommerceEvent";
import { useAnalytics } from "./.nuxt/imports";

export default defineComponent({
  setup() {
    const { track, on } = useAnalytics();

    const trackCustom = () => {
      track(EcommerceEvent.ClickContent);
    };

    on("track:after", (payload) => {
      // console.log("tracked hook", payload);
    });

    return {
      trackCustom,
      //
    };
  },
});
</script>
