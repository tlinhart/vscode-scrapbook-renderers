import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const messaging =
    vscode.notebooks.createRendererMessaging("scrapbook-renderer");
  context.subscriptions.push(
    messaging.onDidReceiveMessage(({ message }) => {
      if (message.type === "activeThemeRequest") {
        messaging.postMessage({
          type: "activeThemeResponse",
          payload: { kind: vscode.window.activeColorTheme.kind },
        });
      }
    }),
    vscode.window.onDidChangeActiveColorTheme(({ kind }) =>
      messaging.postMessage({
        type: "activeThemeResponse",
        payload: { kind },
      })
    )
  );
}
