import {
  LayoutConfig,
  ItemType,
  ComponentItemConfig,
  StackItemConfig,
  RowOrColumnItemConfig,
} from 'golden-layout';
import { ProcessTreeEditorComponent } from '../../process-tree-editor/process-tree-editor.component';
import { VariantExplorerComponent } from '../../variant-explorer/variant-explorer.component';
import { InfoBoxComponent } from '../../info-box/info-box.component';

export const baseLayout: LayoutConfig = {
  dimensions: {
    borderWidth: 0.75,
    borderGrabWidth: 10,
    minItemHeight: 300,
    minItemWidth: 350,
  },
  settings: {
    showMaximiseIcon: false,
    showPopoutIcon: false,
    constrainDragToContainer: true,
  },
  root: {
    type: ItemType.column,
    content: [
      {
        type: 'component',
        title: 'Process Tree Visualizer',
        isClosable: true,
        height: 61.803,
        header: {
          show: false,
        },
        componentType: ProcessTreeEditorComponent.componentName,
      } as ComponentItemConfig,
      {
        type: ItemType.row,
        height: 38.197,
        content: [
          {
            type: ItemType.stack,
            height: 38.197,
            width: 61.803,
            content: [
              {
                id: VariantExplorerComponent.componentName,
                type: 'component',
                title: 'Variant Explorer',
                isClosable: false,
                reorderEnabled: false,
                componentType: VariantExplorerComponent.componentName,
              } as ComponentItemConfig,
            ],
          } as StackItemConfig,
          {
            type: 'component',
            header: {
              show: false,
            },
            width: 38.197,
            isClosable: false,
            title: 'Info Box',
            id: InfoBoxComponent.componentName,
            componentType: InfoBoxComponent.componentName,
          } as ComponentItemConfig,
        ],
      } as RowOrColumnItemConfig,
    ],
  } as RowOrColumnItemConfig,
};
