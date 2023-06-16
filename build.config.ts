import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  entries: ["src/module"],
  externals: ["serialize-javascript", "randombytes"],
  failOnWarn: false,
});
