import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  entries: ["src/module"],
  externals: ["serialize-javascript", "jiti", "randombytes"],
  failOnWarn: false,
});
