import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import {
  getLowestSelectionActionableElement,
  SelectableState,
} from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import {
  VariantElement,
  LeafNode,
} from 'src/app/objects/Variants/variant_element';
import { ViewMode } from 'src/app/objects/ViewMode';

export function computePerformanceButtonColor(variant: Variant) {
  let tree;
  tree = this.performanceService.variantsPerformance.get(variant);

  if (!tree) {
    return null;
  }

  let selectedScale = this.performanceColorService.selectedColorScale;
  const colorScale = this.performanceColorService
    .getVariantComparisonColorScale()
    .get(tree.id);
  if (
    colorScale &&
    tree.performance?.[selectedScale.performanceIndicator]?.[
      selectedScale.statistic
    ] !== undefined
  ) {
    return colorScale(
      tree.performance[selectedScale.performanceIndicator][
        selectedScale.statistic
      ]
    );
  }
  return '#d3d3d3';
}

export function clickCallback(
  drawer: VariantDrawerDirective,
  element: VariantElement,
  variant: VariantElement
) {
  if (this.variantViewModeService.viewMode === ViewMode.PERFORMANCE) {
    drawer.changeSelected(element);
    if (element.serviceTime) {
      this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
        element.serviceTime,
        true
      );
    }
    if (element.waitingTime) {
      this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
        element.waitingTime,
        false
      );
    }
  } else if (this.traceInfixSelectionMode) {
    let lowestSelectableNode = getLowestSelectionActionableElement(element);

    if (lowestSelectableNode != variant) {
      if (
        lowestSelectableNode.infixSelectableState ===
        SelectableState.Unselectable
      )
        lowestSelectableNode.setAllChildrenUnselected();
      else lowestSelectableNode.setAllChildrenSelected();

      variant.updateSelectionAttributes();
      drawer.redraw();
    }
  } else {
    variant.setExpanded(!variant.getExpanded());
    drawer.redraw();
  }
}

export function contextMenuCallback(
  self: VariantDrawerDirective,
  element: VariantElement,
  variant: VariantElement,
  event: PointerEvent
) {
  this.contextMenu_xPos = event.clientX;
  this.contextMenu_yPos = event.clientY;
  this.contextMenu_variant = variant;
  this.contextMenu_element = element;
  this.contextMenu_directive = self;
}

export function activityColor(
  self: VariantDrawerDirective,
  element: VariantElement,
  variant: Variant
) {
  let color;

  if (element instanceof LeafNode) {
    switch (this.variantViewModeService.viewMode) {
      default:
        color = this.colorMap.get(element.asLeafNode().activity[0]);

        // in this case cuts were not applicable anymore.
        // The resulting chevron is displayed in gray
        if (element.activity.length > 1) {
          color = '#d3d3d3'; // lightgray
        }
        break;

      case ViewMode.PERFORMANCE:
        if (element.serviceTime?.mean !== undefined) {
          let stat = this.variantPerformanceService.serviceTimeStatistic;
          color = this.serviceTimeColorMap(element.serviceTime[stat]);
          if (color == undefined) {
            color = '#d3d3d3'; // lightgrey
          }
        } else if (variant.variant?.serviceTime) {
          color = '#d3d3d3';
        }
        break;
    }
  } else if (
    this.variantViewModeService.viewMode === ViewMode.PERFORMANCE &&
    element.waitingTime?.mean !== undefined
  ) {
    let stat = this.variantPerformanceService.waitingTimeStatistic;
    color = this.waitingColorMap(element.waitingTime[stat]);
  }

  if (!color) {
    color = '#d3d3d3'; // lightgrey
  }

  return color;
}
