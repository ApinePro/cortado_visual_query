import { Variant } from './../../variant-explorer/model';
import {LayoutConfig, ItemType, ComponentItemConfig} from "golden-layout";
import {ProcessTreeEditorComponent} from "../../process-tree-editor/process-tree-editor.component";
import {VariantExplorerComponent} from "../../variant-explorer/variant-explorer.component";
import {ActivityOverviewComponent} from "../../activity-overview/activity-overview.component";
import {SubvariantExplorerComponent} from "../../variant-explorer/subvariant-explorer/subvariant-explorer.component";

export const baseLayout: LayoutConfig = {
  dimensions : {
    borderWidth: 0.75,
    minItemHeight: 300,
    minItemWidth: 350,
  },
  root: {
      type: ItemType.column,
      content: [
          {
              id : ProcessTreeEditorComponent.componentName,
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
              type : ItemType.stack,
              height : 38.197,
              width: 61.803,
              content : [
                {
                  id : VariantExplorerComponent.componentName,
                  type: "component",
                  title: "Variant Explorer",
                  isClosable: false,
                  componentType: VariantExplorerComponent.componentName,
                } as ComponentItemConfig
              ]
            },



            {
              id : ActivityOverviewComponent.componentName,
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
