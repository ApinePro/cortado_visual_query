import { Input } from '@angular/core';
import { ZoomFieldComponent } from 'src/app/components/zoom-field/zoom-field.component';
import { VariantService } from 'src/app/services/variantService/variant.service';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { VariantExplorerComponent } from 'src/app/components/variant-explorer/variant-explorer.component';
import { GoldenLayoutComponentService } from 'src/app/services/goldenLayoutService/golden-layout-component.service';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
  HostListener,
  OnDestroy,
} from '@angular/core';

import { cloneDeep } from 'lodash';
import { select, Selection } from 'd3';
import * as objectHash from 'object-hash';
import * as d3 from 'd3';
import { LogService } from 'src/app/services/logService/log.service';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { InfixType, setParent } from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import {
  VariantElement,
  LeafNode,
  SequenceGroup,
  ParallelGroup,
  ChoiceGroup,
  FallthroughGroup,
} from 'src/app/objects/Variants/variant_element';
import { collapsingText, fadeInText } from 'src/app/animations/text-animations';
import { findPathToSelectedNode } from 'src/app/objects/Variants/utility_functions';
import { applyInverseStrokeToPoly } from 'src/app/utils/render-utils';
import { Observable, of, Subject } from 'rxjs';
import { first, takeUntil, tap } from 'rxjs/operators';
import { VariantEditorComponent } from 'src/app/components/variant-editor/variant-editor.component';
import { parallel } from '@angular/cdk/testing';
import { PreloadAllModules } from '@angular/router';
import { element } from 'protractor';
declare var $;

@Component({
  selector: 'app-pattern-editor',
  templateUrl: './pattern-editor.component.html',
  styleUrls: ['./pattern-editor.component.css'],
})
export class PatternEditorComponent implements OnInit, OnDestroy {
  activityNames: Array<String> = [];

  public colorMap: Map<string, string>;

  @ViewChild('VariantMainGroup')
  variantElement: ElementRef;

  @ViewChild(ZoomFieldComponent)
  editor: ZoomFieldComponent;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  @Input() ifSource: boolean;
  currentVariant: VariantElement = null;
  cachedVariants: VariantElement[] = [null]; // edited
  cacheSize = 100;
  cacheIdx = 0;

  emptyVariant = true;

  selectedElement = false;
  multiSelect = false;
  multipleSelected = false;

  infixType = InfixType;
  curInfixType = InfixType.NOT_AN_INFIX;

  newLeaf;

  collapse = false;

  insertionStrategy = activityInsertionStrategy;
  selectedStrategy = this.insertionStrategy.behind;

  variantEnrichedSelection: Selection<any, any, any, any>;
  zoom: any;

  redundancyWarning = false;
  private _destroy$ = new Subject();
  constructor(
    private variantService: VariantService,
    private backendService: BackendService,
    private logService: LogService,
    private colorMapService: ColorMapService,
  ) {
    const a = 1;
  }

  ngOnInit(): void {
    this.logService.activitiesInEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((activities) => {
        this.activityNames = [];
        for (const activity in activities) {
          this.activityNames.push(activity);
          this.activityNames.sort();
        }
        this.activityNames.push('...');
        this.activityNames.sort();
      });

    this.logService.loadedEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((newLog) => {
        if (newLog) {
          this.emptyVariant = true;
        }
      });

    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((map) => {
        this.colorMap = map;
        if (this.variantDrawer) {
          this.variantDrawer.redraw();
        }
      });

    this.variantService.showTiebreakerDialog
      .pipe(takeUntil(this._destroy$))
      .subscribe((_) => {
        this.showModal();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  showModal(): void {
    $('#tiebreakerModalDialog').modal('show');
  }

  hideModal(): void {
    $('#tiebreakerModalDialog').modal('hide');
  }

  apply(sourcePattern, targetPattern): void {
    this.hideModal();
    this.backendService.applyTiebreaker(sourcePattern, targetPattern);
  }

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant,
  ) => {
    let color;
    color = this.colorMap.get(element.asLeafNode().activity[0]);

    if (
      !color ||
      this.findParent(this.currentVariant, element) instanceof FallthroughGroup
    ) {
      color = '#d3d3d3'; // lightgrey
    }

    return color;
  };

  computeFocusOffset = (svg) => {
    const path = findPathToSelectedNode(
      this.currentVariant,
      svg.select('.selected-variant-g').data()[0],
    ).slice(1);
    let translateX = 0;

    for (const element of svg
      .selectAll('g')
      .filter((d: VariantElement) => {
        return path.indexOf(d) > -1;
      })
      .nodes()) {
      const transform = d3
        .select(element)
        .attr('transform')
        .match(/[\d.]+/g);
      translateX += parseFloat(transform[0]);
    }

    return [-translateX, 0];
  };

  triggerRedraw() {
    setTimeout(() => this.variantDrawer.redraw(), 1);
  }

  compareNode(node1, node2) {
    if (node1 instanceof SequenceGroup) {
      return false;
    } else if (node2 instanceof SequenceGroup) {
      return true;
    } else {
      return node1.asLeafNode().activity[0] > node2.asLeafNode().activity[0];
    }
  }
  sortParallel(variant) {
    const children = variant.getElements();
    for (let i = 1; i < children.length; i++) {
      const temp = children[i];
      let j = i - 1;
      while (j >= 0 && this.compareNode(children[j], temp)) {
        children[j + 1] = children[j];
        j--;
      }
      children[j + 1] = temp;
    }
    return children;
  }
  findParent(parent, node) {
    const children = parent.getElements();
    if (!children) {
      return null;
    } else {
      const index = children.indexOf(node);
      if (index > -1) {
        return parent;
      } else {
        for (const child of children) {
          if (this.findParent(child, node) != null) {
            return this.findParent(child, node);
          }
        }
        return null;
      }
    }
  } // check is node is a child of parent
  handleActivityButtonClick(event) {
    if (this.selectedElement || this.emptyVariant) {
      const leaf = new LeafNode([event.activityName]);
      this.newLeaf = leaf;

      if (this.emptyVariant) {
        const variantGroup = new SequenceGroup([leaf]);
        variantGroup.setExpanded(true);
        this.currentVariant = variantGroup;
        this.emptyVariant = false;
        this.selectedElement = true;
        this.editor.centerContent(250);
      } else {
        leaf.setExpanded(true);
        const selectedElement = this.variantEnrichedSelection
          .selectAll('.selected-variant-g')
          .data()[0];

        switch (this.selectedStrategy) {
          case this.insertionStrategy.infront:
            if (!this.multipleSelected) {
              this.handleInfrontInsert(
                this.currentVariant,
                leaf,
                selectedElement,
              );
              const grandParent = this.findParent(
                this.currentVariant,
                this.findParent(this.currentVariant, leaf),
              );
              if (grandParent instanceof ParallelGroup) {
                this.sortParallel(grandParent);
              }
            }
            break;
          case this.insertionStrategy.behind:
            if (!this.multipleSelected) {
              this.handleBehindInsert(
                this.currentVariant,
                leaf,
                selectedElement,
              );
              const grandParent = this.findParent(
                this.currentVariant,
                this.findParent(this.currentVariant, leaf),
              );
              if (grandParent instanceof ParallelGroup) {
                this.sortParallel(grandParent);
              }
            }
            break;
          case this.insertionStrategy.parallel:
            if (!this.multipleSelected) {
              this.handleParallelInsert(
                this.currentVariant,
                leaf,
                selectedElement,
              );
            }
            this.sortParallel(this.findParent(this.currentVariant, leaf));
            break;
          case this.insertionStrategy.choice:
            if (!this.multipleSelected) {
              this.handleChoice(this.currentVariant, leaf, selectedElement);
            }
            break;
          case this.insertionStrategy.fallthrough:
            if (!this.multipleSelected) {
              this.handleFallthrough(
                this.currentVariant,
                leaf,
                selectedElement,
              );
            }
            break;
          case this.insertionStrategy.replace:
            if (!this.multipleSelected) {
              this.handleReplace(this.currentVariant, leaf, selectedElement);
            }
            break;
        }
        this.triggerRedraw();
      }

      this.cacheCurrentVariant();
    }
  }

  handleParallelInsert(
    variant: VariantElement,
    leaf: LeafNode,
    selectedElement,
  ) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        variant.setElements([
          new ParallelGroup([leaf, new SequenceGroup(children)]),
        ]);
      } else if (index > -1) {
        // Handle parent ParallelGroup
        if (variant instanceof ParallelGroup) {
          children.splice(index, 0, leaf);
        } else {
          // If the selected element is a parallel group, insert into its children
          if (selectedElement instanceof ParallelGroup) {
            selectedElement.getElements().push(leaf);

            // Else create a new parallel group for leaf and selected
          } else {
            children.splice(
              index,
              1,
              new ParallelGroup([leaf, selectedElement]),
            );
          }
        }

        // variant.setElements(children);
      } else {
        for (const child of children) {
          this.handleParallelInsert(child, leaf, selectedElement);
        }
      }
    }
  }

  checkOverlapInsert() {
    if (this.emptyVariant || !this.variantEnrichedSelection) {
      return false;
    } else {
      const selectedElement = this.variantEnrichedSelection
        .selectAll('.selected-variant-g')
        .data()[0];
      const parent = this.findParent(this.currentVariant, selectedElement);
      if (parent && !(parent instanceof ParallelGroup)) {
        return false;
      } else {
        if (!parent) {
          return false;
        } else {
          const siblings = parent.getElements();
          for (const s of siblings) {
            if (s instanceof SequenceGroup && s.getElements().length > 1) {
              return true;
            }
          }
          return false;
        }
      }
    }
  }

  checkNeighborSelection() {
    const selectedElements = this.variantEnrichedSelection
      .selectAll('.selected-variant-g')
      .data();

    if (
      !(
        this.findParent(this.currentVariant, selectedElements[0]) instanceof
        SequenceGroup
      )
    ) {
      return false;
    }

    for (let i = 0; i < selectedElements.length - 1; i++) {
      const firstParent = this.findParent(
        this.currentVariant,
        selectedElements[i],
      );
      const secondParent = this.findParent(
        this.currentVariant,
        selectedElements[i + 1],
      );
      if (
        firstParent != secondParent ||
        firstParent.getElements().indexOf(selectedElements[i + 1]) !=
          firstParent.getElements().indexOf(selectedElements[i]) + 1
      ) {
        return false;
      }
    }
    return true;
  }

  checkChoiceDisable() {
    if (this.emptyVariant || !this.variantEnrichedSelection) {
      return false;
    } else {
      const selectedElements = this.variantEnrichedSelection
        .selectAll('.selected-variant-g')
        .data()[0] as any;
      if (selectedElements instanceof LeafNode) {
        return false;
      } else {
        return true;
      }
    }
  }

  checkSingleParallel() {
    if (!this.selectedElement || this.multipleSelected) {
      return false;
    } else if (this.emptyVariant || !this.variantEnrichedSelection) {
      return false;
    } else {
      const selectedElements = this.variantEnrichedSelection
        .selectAll('.selected-variant-g')
        .data()[0] as any;
      if (
        this.currentVariant.getElements().indexOf(selectedElements) >= 0 &&
        (this.selectedStrategy === this.insertionStrategy.infront ||
          this.selectedStrategy === this.insertionStrategy.behind)
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  checkInsideFallthrough() {
    if (this.emptyVariant || !this.variantEnrichedSelection) {
      return false;
    } else {
      const selectedElements = this.variantEnrichedSelection
        .selectAll('.selected-variant-g')
        .data() as any;
      for (const ele of selectedElements) {
        if (
          this.findParent(this.currentVariant, ele) instanceof FallthroughGroup
        ) {
          return true;
        }
      }
      return false;
    }
  }

  checkNotSelectedLeaf() {
    if (this.emptyVariant || !this.variantEnrichedSelection) {
      return false;
    } else {
      const selectedElements = this.variantEnrichedSelection
        .selectAll('.selected-variant-g')
        .data()[0] as any;
      if (selectedElements instanceof LeafNode) {
        return false;
      } else {
        return true;
      }
    }
  }

  checkActivityDisable() {
    const result =
      (this.selectedStrategy === this.insertionStrategy.choice &&
        (this.multipleSelected ||
          (this.selectedElement && this.checkChoiceDisable()))) ||
      (this.selectedElement &&
        !this.multipleSelected &&
        (this.selectedStrategy === this.insertionStrategy.infront ||
          this.selectedStrategy === this.insertionStrategy.behind) &&
        this.checkOverlapInsert()) ||
      (this.multipleSelected &&
        !(
          this.checkNeighborSelection() &&
          this.selectedStrategy === this.insertionStrategy.parallel
        )) ||
      (!this.selectedElement && !this.emptyVariant) ||
      (this.selectedStrategy !== this.insertionStrategy.fallthrough &&
        this.checkInsideFallthrough()) ||
      (this.selectedStrategy === this.insertionStrategy.fallthrough &&
        (this.multipleSelected || this.checkNotSelectedLeaf()));
    return result;
  }

  handleBehindInsert(variant: VariantElement, leaf: LeafNode, selectedElement) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        children.splice(children.length, 0, leaf);
      } else if (index > -1) {
        // Handling Parent Parallel Group Cases
        if (variant instanceof ParallelGroup) {
          // Inserting behind a leafNode inside a ParallelGroup
          if (selectedElement instanceof LeafNode) {
            children.splice(
              index,
              1,
              new SequenceGroup([selectedElement, leaf]),
            );
          } else {
            // Inserting behind a ParallelGroup inside a ParallelGroup
            if (selectedElement instanceof ParallelGroup) {
              children.splice(
                children.indexOf(selectedElement),
                1,
                new SequenceGroup([selectedElement, leaf]),
              );

              // Inserting behind a SequeneGroup inside a ParallelGroup
            } else {
              const selectedChildren = selectedElement.getElements();
              selectedChildren.push(leaf);
            }
          }

          // Else the variant is a SequenceGroup and we can simply insert after the selected Element
        } else {
          children.splice(index + 1, 0, leaf);
        }

        // Recursing into the Children
      } else {
        for (const child of children) {
          this.handleBehindInsert(child, leaf, selectedElement);
        }
      }
    }
  }

  handleInfrontInsert(
    variant: VariantElement,
    leaf: LeafNode,
    selectedElement,
  ) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        children.splice(0, 0, leaf);
      } else if (index > -1) {
        if (variant instanceof ParallelGroup) {
          // Inserting infront a leafNode inside a ParallelGroup
          if (selectedElement instanceof LeafNode) {
            children.splice(
              index,
              1,
              new SequenceGroup([leaf, selectedElement]),
            );
          } else {
            // Inserting infront a ParallelGroup inside a ParallelGroup
            if (selectedElement instanceof ParallelGroup) {
              children.splice(
                children.indexOf(selectedElement),
                1,
                new SequenceGroup([leaf, selectedElement]),
              );

              // Inserting infront a SequeneGroup inside a ParallelGroup
            } else {
              const selectedChildren = selectedElement.getElements();
              selectedChildren.unshift(leaf);
            }
          }
        } else {
          children.splice(index, 0, leaf);
        }
      } else {
        for (const child of children) {
          this.handleInfrontInsert(child, leaf, selectedElement);
        }
      }
    }
  }

  handleChoice(variant: VariantElement, leaf: LeafNode, selectedElement) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        // Only SequenceGroup and Leaf could be selected here?
        variant.setElements([
          new ChoiceGroup([leaf, new SequenceGroup(children)]),
        ]);
      } else if (index > -1) {
        // Handle parent ChoiceGroup
        if (variant instanceof ChoiceGroup) {
          children.splice(index, 0, leaf);
        } else {
          // If the selected element is a parallel group, insert into its children
          if (selectedElement instanceof ChoiceGroup) {
            selectedElement.getElements().push(leaf);

            // Else create a new choice group for leaf and selected
          } else {
            children.splice(index, 1, new ChoiceGroup([leaf, selectedElement]));
          }
        }

        // variant.setElements(children);
      } else {
        for (const child of children) {
          this.handleChoice(child, leaf, selectedElement);
        }
      }
    }
  }

  handleFallthrough(variant: VariantElement, leaf: LeafNode, selectedElement) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        // Only SequenceGroup and Leaf could be selected here?
        variant.setElements([
          new FallthroughGroup([leaf, new SequenceGroup(children)]),
        ]);
      } else if (index > -1) {
        // Handle parent FallthroughGroup
        if (variant instanceof FallthroughGroup) {
          children.splice(index, 0, leaf);
        } else {
          // If the selected element is a parallel group, insert into its children
          if (selectedElement instanceof FallthroughGroup) {
            selectedElement.getElements().push(leaf);

            // Else create a new fallthrough group for leaf and selected
          } else {
            children.splice(
              index,
              1,
              new FallthroughGroup([leaf, selectedElement]),
            );
          }
        }

        // variant.setElements(children);
      } else {
        for (const child of children) {
          this.handleFallthrough(child, leaf, selectedElement);
        }
      }
    }
  }

  /*
  handleFallthrough(variant: VariantElement, leaf: LeafNode, selectedElement) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        const newLeaf = new LeafNode(selectedElement.asLeafNode().activity.concat(leaf.asLeafNode().activity).sort());
        this.newLeaf = newLeaf;
        variant.setElements([newLeaf]);
      }
      if (index > -1) {
        const newLeaf = new LeafNode(selectedElement.asLeafNode().activity.concat(leaf.asLeafNode().activity).sort());
        this.newLeaf = newLeaf;
        children.splice(index, 1, newLeaf);
      } else {
        for (const child of children) {
          this.handleFallthrough(child, leaf, selectedElement);
        }
      }
    }
  }*/

  handleReplace(variant: VariantElement, leaf: LeafNode, selectedElement) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        variant.setElements([leaf]);
      }
      if (index > -1) {
        children.splice(index, 1, leaf);
      } else {
        for (const child of children) {
          this.handleReplace(child, leaf, selectedElement);
        }
      }
    }
  }

  cacheCurrentVariant() {
    if (this.cacheIdx < this.cachedVariants.length - 1) {
      this.cachedVariants = this.cachedVariants.slice(0, this.cacheIdx + 1);
    }
    // Weiran edited
    if (this.currentVariant) {
      this.cachedVariants.push(this.currentVariant.copy());
    } else {
      this.cachedVariants.push(null);
    }
    if (this.cachedVariants.length > this.cacheSize) {
      this.cachedVariants.shift();
    } else {
      if (!(this.cacheIdx == null)) {
        this.cacheIdx += 1;
      } else {
        this.cacheIdx = this.cachedVariants.length - 1;
      }
    }
  }
  redo() {
    this.selectedElement = false;
    this.emptyVariant = false;

    this.cacheIdx++;
    if (this.cachedVariants[this.cacheIdx] === null) {
      this.currentVariant = null;
      this.emptyVariant = true;
    } else {
      this.currentVariant = this.cachedVariants[this.cacheIdx].copy();
    }
    this.newLeaf = null;
  }

  undo() {
    this.selectedElement = false;
    this.emptyVariant = false;

    this.cacheIdx--;
    if (this.cachedVariants[this.cacheIdx] === null) {
      this.currentVariant = null;
      this.emptyVariant = true;
    } // edited
    else {
      this.currentVariant = this.cachedVariants[this.cacheIdx].copy();
    }
    this.newLeaf = null;
  }

  onDeleteSelected() {
    const ElementsToDelete = this.variantEnrichedSelection
      .selectAll('.selected-variant-g')
      .data();

    if (
      ElementsToDelete.length === 1 &&
      ElementsToDelete[0] instanceof SequenceGroup &&
      this.currentVariant === ElementsToDelete[0]
    ) {
      this.onDeleteVariant();
    } // need further check. Is this nested function allowed?
    else {
      this.deleteElementFromVariant(
        this.currentVariant,
        this.currentVariant,
        ElementsToDelete,
      );

      this.multiSelect = false;
      this.multipleSelected = false;

      this.cacheCurrentVariant();

      this.triggerRedraw();
    }
  }

  deleteElementFromVariant(
    variant: VariantElement,
    parent: VariantElement,
    elementsToDelete,
  ) {
    const children = variant.getElements();

    if (children) {
      for (const elementToDelete of elementsToDelete) {
        const index = children.indexOf(elementToDelete);
        if (index > -1) {
          this.newLeaf = children[index - 1];

          children.splice(index, 1);
        }
      }

      // weiran.yang added
      if (
        children.length === 1 &&
        variant instanceof SequenceGroup &&
        parent instanceof ParallelGroup &&
        (children[0] instanceof ParallelGroup ||
          children[0] instanceof LeafNode)
      ) {
        const childrenParent = parent.getElements();
        const aloneChild = children[0];
        if (aloneChild instanceof LeafNode) {
          childrenParent.splice(childrenParent.indexOf(variant), 1, aloneChild);
        } else {
          const parallelChildren = children[0].getElements();
          const deleteIndex = childrenParent.indexOf(variant);
          childrenParent.splice(deleteIndex, 1);
          for (const newNode of parallelChildren.reverse()) {
            childrenParent.splice(deleteIndex, 0, newNode);
          }
        }
        parent.setElements(childrenParent);
      } else if (
        children.length === 1 &&
        variant instanceof ParallelGroup &&
        parent instanceof SequenceGroup &&
        (children[0] instanceof SequenceGroup ||
          children[0] instanceof LeafNode)
      ) {
        const childrenParent = parent.getElements();
        const aloneChild = children[0];
        if (aloneChild instanceof LeafNode) {
          childrenParent.splice(childrenParent.indexOf(variant), 1, aloneChild);
        } else {
          const sequenceChildren = children[0].getElements();
          const deleteIndex = childrenParent.indexOf(variant);
          childrenParent.splice(deleteIndex, 1);
          for (const newNode of sequenceChildren.reverse()) {
            childrenParent.splice(deleteIndex, 0, newNode);
          }
        }
        parent.setElements(childrenParent);
      }

      // edited
      if (children.length === 0) {
        const childrenParent = parent.getElements();
        if (!(variant === this.currentVariant)) {
          childrenParent.splice(childrenParent.indexOf(variant), 1);
          parent.setElements(childrenParent);
        } else {
          this.currentVariant = null;
          this.emptyVariant = true;
        }
      } else {
        variant.setElements(children);
        for (const child of children) {
          this.deleteElementFromVariant(child, variant, elementsToDelete);
        }
      }
    }
  }

  onDeleteVariant() {
    this.currentVariant = null;
    this.emptyVariant = true;

    this.multiSelect = false;
    this.multipleSelected = false;

    this.cacheCurrentVariant();

    this.triggerRedraw();
  }
  removeSelection() {
    this.selectedElement = false;
    this.multiSelect = false;
    this.multipleSelected = false;

    this.triggerRedraw();
    this.newLeaf = null;
  }
  handleRedraw(selection: Selection<any, any, any, any>) {
    selection.selectAll('g').on('click', function (event, d) {
      event.stopPropagation();
      const select = d3.select(this as SVGElement);
      toogleSelect(select);
    });

    const toogleSelect = function (svgSelection) {
      if (!this.multiSelect) {
        d3.selectAll('.pattern-variant')
          .selectAll('.selected-polygon')
          .classed('selected-polygon', false)
          .attr('stroke', false);

        d3.selectAll('.pattern-variant')
          .selectAll('.chevron-group')
          .style('fill-opacity', 0.5);

        d3.selectAll('.pattern-variant')
          .selectAll('.selected-variant-g')
          .classed('selected-variant-g', false);

        svgSelection.classed('selected-variant-g', true);

        const poly = svgSelection.select('polygon');
        poly.classed('selected-polygon', true);

        applyInverseStrokeToPoly(poly);

        this.multipleSelected = false;
      } else {
        this.multipleSelected = true;

        svgSelection.classed(
          'selected-variant-g',
          !svgSelection.classed('selected-variant-g'),
        );

        const poly = svgSelection.select('polygon');

        poly.classed('selected-polygon', !poly.classed('selected-polygon'));

        if (!poly.attr('stroke')) {
          applyInverseStrokeToPoly(poly);
        } else {
          poly.attr('stroke', null);
        }

        // If one is selected reactivate insert
        if (
          d3
            .selectAll('.pattern-variant')
            .selectAll('.selected-variant-g')
            .nodes().length == 1
        ) {
          this.multipleSelected = false;
        }
      }
      this.selectedElement = true;
    }.bind(this);

    selection.selectAll('g').classed('selected-variant-g', (d) => {
      return d === this.newLeaf;
    });

    if (!(selection.selectAll('.selected-variant-g').nodes().length > 0)) {
      this.selectedElement = false;
    }

    const poly = selection
      .selectAll('.selected-variant-g')
      .select('polygon')
      .classed('selected-polygon', true);

    applyInverseStrokeToPoly(poly);

    this.variantEnrichedSelection = selection;
  }
}

enum activityInsertionStrategy {
  infront = 'infront',
  behind = 'behind',
  parallel = 'parallel',
  replace = 'replace',
  choice = 'choice',
  fallthrough = 'fallthrough',
}
