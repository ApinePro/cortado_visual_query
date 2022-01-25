import {
  LayoutConfig,
  ItemType,
  ComponentItemConfig,
  Side,
} from 'golden-layout';
import { ProcessTreeEditorComponent } from '../../process-tree-editor/process-tree-editor.component';
import { VariantExplorerComponent } from '../../variant-explorer/variant-explorer.component';
import { ActivityOverviewComponent } from '../../activity-overview/activity-overview.component';
import { InfoBoxComponent } from '../../info-box/info-box.component';

export const baseLayout: LayoutConfig = {
  dimensions: {
    borderWidth: 0.75,
    borderGrabWidth: 10,
    minItemHeight: 300,
    minItemWidth: 350,
  },
  root: {
    type: ItemType.column,
    content: [
      {
        type: ItemType.stack,
        header: {
          show: Side.left,
          maximise: false,
          popout: false,
        },
        content: [
          {
            type: 'component',
            title: 'Process Tree Visualizer',
            isClosable: false,
            height: 61.803,

            componentType: ProcessTreeEditorComponent.componentName,
          } as ComponentItemConfig,
        ],
      },
      {
        type: ItemType.row,
        height: 38.197,
        content: [
          {type: ItemType.stack,
            width: 61.803,
            header: {
              show: Side.left,
              maximise: false,
              popout: false,
            },
            content : [
              {
                type: 'component',
                title: 'Variant Explorer',
                isClosable: false,
                id : VariantExplorerComponent.componentName,
                componentType: VariantExplorerComponent.componentName,
              } as ComponentItemConfig,
            ]
          },
          {
            type: 'component',
            header: {
              show: false,
            },
            width: 38.197,
            isClosable: false,
            title: 'Info Box',
            componentType: InfoBoxComponent.componentName,
            id : InfoBoxComponent.componentName,
          } as ComponentItemConfig,
        ],
      },
    ],
  },
};
