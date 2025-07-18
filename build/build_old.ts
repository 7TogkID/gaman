import arg from "arg";
import { glob } from "glob";
import { $, build } from "bun";

const args = arg({
  "--watch": Boolean,
});

const isWatch = args["--watch"] || false;

// const entryPoints = glob.sync("./src/**/*.ts", {
//   ignore: ["./src/**/*.test.ts"],
// });

const esmBuild = () =>
  build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    root: "./src",
    target: "node",
    format: "esm",
  });

const cjsBuild = () =>
  build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist/cjs",
    root: "./src",
    target: "node",
    format: "cjs",
  });

Promise.all([esmBuild(), cjsBuild()]);

await $`tsc ${
  isWatch ? "-w" : ""
} --emitDeclarationOnly --declaration --project tsconfig.build.json`.nothrow();
await $`tsc-alias`.nothrow();
