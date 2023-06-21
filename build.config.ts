import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  entries: ["src/module"],
  externals: [
    "@moirei/nuxt-analytics",
    "#analytics",
    "serialize-javascript",
    "randombytes",
  ],
  failOnWarn: false,
});
