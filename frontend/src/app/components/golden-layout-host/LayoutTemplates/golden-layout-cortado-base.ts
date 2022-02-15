import {
  LayoutConfig,
  ItemType,
  ComponentItemConfig,
  StackItemConfig,
  RowOrColumnItemConfig,
  Side,
} from 'golden-layout';

import { BpmnEditorComponent } from './../../bpmn-editor/bpmn-editor.component';
import { GoldenLayoutDummyComponent } from '../golden-layout-dummy/golden-layout-dummy.component';
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
        type: ItemType.row,
        height: 61.803,
        isClosable: false,
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
                title: 'Process Tree Editor',
                isClosable: false,
                id: ProcessTreeEditorComponent.componentName,
                componentType: ProcessTreeEditorComponent.componentName,
                componentState: { cssParentClass: 'process-tree-editor-stack' },
              } as ComponentItemConfig,
            ],
          },
        ],
      } as RowOrColumnItemConfig,
      {
        type: ItemType.row,
        height: 38.197,
        isClosable: false,
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
                cssClass: 'highlight',
                reorderEnabled: false,
                componentType: VariantExplorerComponent.componentName,
                componentState: { cssParentClass: 'variant-explorer-stack' },
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
