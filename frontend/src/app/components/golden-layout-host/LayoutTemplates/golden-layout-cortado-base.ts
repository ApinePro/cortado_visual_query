import {LayoutConfig, ItemType, ComponentItemConfig} from "golden-layout";
import {ProcessTreeEditorComponent} from "../../process-tree-editor/process-tree-editor.component";
import {VariantExplorerComponent} from "../../variant-explorer/variant-explorer.component";
import { ActivityOverviewComponent } from "../../activity-overview/activity-overview.component";

export const baseLayout: LayoutConfig = {
  dimensions : {
    borderWidth: 1.5,
  },
  root: {
      type: ItemType.column,
      content: [
          {
              type: "component",
              header: {
                show: false,
              },
              title: "Process Tree Visualizer",
              isClosable: true,
              componentType: "ProcessTreeEditorComponent",
          } as ComponentItemConfig,
          {
            type: ItemType.row,
            content : [
              {
                type: "component",
                header: {
                    show: false,
                },
                width: 61.803,
                title: "Variant Explorer",
                isClosable: false,
                componentType: "VariantExplorerComponent",
            } as ComponentItemConfig,
            {
              type: "component",
              header: {
                  show: false,
              },
              width: 38.197,
              isClosable: false,
              title: "Activity Explorer",
              componentType: "ActivityOverviewComponent",
          } as ComponentItemConfig,


          ]},
      ],
  },
};
