declare module 'react-cytoscapejs' {
  import type { ComponentType, CSSProperties } from 'react';
  import type cytoscape from 'cytoscape';

  const CytoscapeComponent: ComponentType<{
    elements: cytoscape.ElementDefinition[];
    style?: CSSProperties;
    stylesheet?: cytoscape.StylesheetJson;
    layout?: cytoscape.LayoutOptions;
    wheelSensitivity?: number;
    cy?: (cy: cytoscape.Core) => void;
  }>;
  export default CytoscapeComponent;
}
