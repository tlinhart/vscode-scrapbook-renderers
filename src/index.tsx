import ReactJsonView from "@microlink/react-json-view";
import { createRoot } from "react-dom/client";
import errorOverlay from "vscode-notebook-error-overlay";
import type {
  ActivationFunction,
  OutputItem,
  RendererContext,
} from "vscode-notebook-renderer";

type SimpleScrapProps = {
  name: string;
  data: null | boolean | number | string;
};

type ComplexScrapProps = {
  name: string;
  data: object;
};

const SimpleScrap = ({ name, data }: SimpleScrapProps) => (
  <code>
    "{name}" : {data}
  </code>
);

const ComplexScrap = ({ name, data }: ComplexScrapProps) => (
  <ReactJsonView
    name={name}
    src={data}
    theme="monokai"
    style={{ background: "var(--vscode-editor-background)" }}
    iconStyle="triangle"
    displayDataTypes={false}
    displayObjectSize={false}
    shouldCollapse={(field) =>
      field.namespace.length === 1 && field.namespace[0] === name
    }
  />
);

export const activate: ActivationFunction = (
  _context: RendererContext<unknown>
) => {
  return {
    renderOutputItem(outputItem: OutputItem, element: HTMLElement) {
      let shadow = element.shadowRoot;
      if (!shadow) {
        shadow = element.attachShadow({ mode: "open" });
        const container = document.createElement("div");
        container.id = "root";
        shadow.append(container);
      }
      const container = shadow.getElementById("root");
      if (!container) {
        throw new Error("Could not find root element");
      }
      errorOverlay.wrap(container, () => {
        const output = outputItem.json();
        const root = createRoot(container);
        if (typeof output.data === "object" && output.data !== null) {
          root.render(<ComplexScrap name={output.name} data={output.data} />);
        } else {
          root.render(<SimpleScrap name={output.name} data={output.data} />);
        }
      });
    },
  };
};
