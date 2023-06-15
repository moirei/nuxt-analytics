import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { setup, $fetch } from "@nuxt/test-utils";

describe.skip("ssr", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("./fixtures/basic", import.meta.url)),
  });

  it("renders the index page", async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch("/");
    expect(html).toContain("<div>basic</div>");
  });

  it.todo(
    "should auto track page event with options.trackGlobalPages",
    async () => {
      //
    }
  );

  it.todo("should apply inline channel", async () => {
    //
  });

  it.todo("should apply inline adapter", async () => {
    //
  });

  it.todo("should apply super properties from nuxt config", async () => {
    //
  });

  it.todo("should apply super properties from vue instance", async () => {
    //
  });

  it.todo("should apply super properties from composition api", async () => {
    //
  });

  it.todo("should disable analytics with options.disabled", async () => {
    //
  });

  it.todo("should disable analytics with navigator.doNotTrack", async () => {
    //
  });
});
