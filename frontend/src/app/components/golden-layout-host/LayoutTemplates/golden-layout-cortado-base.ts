import {LayoutConfig, ItemType, ComponentItemConfig} from "golden-layout";
import {ProcessTreeEditorComponent} from "../../process-tree-editor/process-tree-editor.component";
import {VariantExplorerComponent} from "../../variant-explorer/variant-explorer.component";
import {ActivityOverviewComponent} from "../../activity-overview/activity-overview.component";

export const baseLayout: LayoutConfig = {
  dimensions : {
    borderWidth: 0.75,
    borderGrabWidth : 10,
    minItemHeight: 300,
    minItemWidth: 350,
  },
  root: {
      type: ItemType.column,
      content: [
          {
              type: "component",
              title: "Process Tree Visualizer",
              isClosable: true,
              height : 61.803,
              header: {
                show: false,
              },
              componentType: ProcessTreeEditorComponent.componentName,
          } as ComponentItemConfig,
          {
            type: ItemType.row,
            height : 38.197,
            content : [
              {
                type: "component",
                header: {
                    show: false,
                },
                width: 61.803,
                title: "Variant Explorer",
                isClosable: false,
                componentType: VariantExplorerComponent.componentName,
            } as ComponentItemConfig,
            {
              type: "component",
              header: {
                  show: false,
              },
              width: 38.197,
              isClosable: false,
              title: "Activity Explorer",
              componentType: ActivityOverviewComponent.componentName,
          } as ComponentItemConfig,


          ]},
      ],
  },
};
