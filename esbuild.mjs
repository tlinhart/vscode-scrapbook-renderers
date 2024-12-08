import * as esbuild from "esbuild";

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

/** @type {import("esbuild").Plugin} */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",

  setup(build) {
    build.onStart(() => {
      console.log("[watch] build started");
    });

    build.onEnd((result) => {
      for (const { text, location } of result.errors) {
        console.error(`✘ [ERROR] ${text}`);
        if (location) {
          console.error(
            `    ${location.file}:${location.line}:${location.column}:`
          );
        }
      }
      console.log("[watch] build finished");
    });
  },
};

async function main() {
  const context = await esbuild.context({
    entryPoints: ["src/index.tsx"],
    bundle: true,
    format: "esm",
    minify: production,
    sourcemap: !production && "inline",
    sourcesContent: !production,
    platform: "browser",
    outdir: "dist",
    logLevel: "info",
    plugins: [esbuildProblemMatcherPlugin],
  });

  if (watch) {
    await context.watch();
  } else {
    await context.rebuild();
    await context.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
