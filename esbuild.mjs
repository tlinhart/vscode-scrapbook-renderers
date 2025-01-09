import * as esbuild from "esbuild";

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

/** @type {esbuild.Plugin} */
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
  /** @type {esbuild.BuildOptions} */
  const commonOptions = {
    bundle: true,
    minify: production,
    sourcemap: !production && "inline",
    sourcesContent: !production,
    logLevel: "info",
    plugins: [esbuildProblemMatcherPlugin],
  };

  const extensionContext = await esbuild.context({
    ...commonOptions,
    entryPoints: ["src/extension/index.ts"],
    format: "cjs",
    platform: "node",
    external: ["vscode"],
    outfile: "dist/extension.js",
  });

  const rendererContext = await esbuild.context({
    ...commonOptions,
    entryPoints: ["src/renderer/index.tsx"],
    format: "esm",
    platform: "browser",
    outfile: "dist/renderer.js",
  });

  if (watch) {
    await Promise.all([extensionContext.watch(), rendererContext.watch()]);
  } else {
    await Promise.all([extensionContext.rebuild(), rendererContext.rebuild()]);
    await Promise.all([extensionContext.dispose(), rendererContext.dispose()]);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
