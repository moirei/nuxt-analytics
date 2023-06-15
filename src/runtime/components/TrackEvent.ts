import { PropType, defineComponent, h, ref, withDirectives } from "vue";
import { Enumerable, EventProperties } from "../types";
import {
  TrackEventDirectiveModifiers,
  TrackEventDirectiveValue,
  createTrackEventDirective,
} from "../directives/TrackEvent";

export default defineComponent({
  name: "TrackEvent",
  props: {
    tag: { type: String, default: "div" },
    data: { type: Object as PropType<EventProperties> },
    once: { type: Boolean, default: false },
    clickOnce: { type: Boolean, default: false },
    clickOnly: { type: Boolean, default: false },
    seenOnce: { type: Boolean, default: false },
    seenOnly: { type: Boolean, default: false },
    channel: { type: [String, Array] as PropType<Enumerable<string>> },
    clickAs: { type: String },
    seenAs: { type: String },
    observerInit: { type: Object as PropType<IntersectionObserverInit> },
  },
  setup() {
    const clicks = ref(0);
    const seens = ref(0);

    const onClick = () => clicks.value++;
    const onSeen = () => seens.value++;

    return {
      clicks,
      seens,
      onClick,
      onSeen,
    };
  },
  render() {
    const node = h(
      this.tag,
      {},
      {
        default: () =>
          this.$slots.default
            ? this.$slots.default({
                clicks: this.clicks,
                seen: this.seens,
              })
            : undefined,
      }
    );

    const value: TrackEventDirectiveValue = {
      data: this.data || {},
      clickAs: this.clickAs,
      seenAs: this.seenAs,
      observerInit: this.observerInit,
      channel: this.channel,
      onClick: this.onClick,
      onSeen: this.onSeen,
    };

    const modifiers: TrackEventDirectiveModifiers = {
      once: this.once,
      clickOnce: this.clickOnce,
      clickOnly: this.clickOnly,
      seenOnce: this.seenOnce,
      seenOnly: this.seenOnly,
      // observeQuiet: false
    };

    const Directive = createTrackEventDirective();

    return withDirectives(node, [
      [Directive, value, "", modifiers],
      //
    ]);
  },
});
