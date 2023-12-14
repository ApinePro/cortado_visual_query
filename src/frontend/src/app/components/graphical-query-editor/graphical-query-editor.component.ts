import { PolygonDrawingService } from 'src/app/services/polygon-drawing.service';
import { VariantFilterService } from './../../services/variantFilterService/variant-filter.service';
import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';

import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { BackendService } from './../../services/backendService/backend.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  ComponentContainer,
  ComponentItemConfig,
  LayoutManager,
  LogicalZIndex,
  Side,
} from 'golden-layout';

import * as d3 from 'd3';
import { select, Selection } from 'd3';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  AlignmentType,
  ConformanceCheckingService,
} from 'src/app/services/conformanceChecking/conformance-checking.service';
import { processTreesEqual } from 'src/app/objects/ProcessTree/utility-functions/process-tree-integrity-check';
import { LogService } from 'src/app/services/logService/log.service';
import { VariantService } from 'src/app/services/variantService/variant.service';
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
  deserialize,
  SequencePattern,
  LeafPattern,
} from 'src/app/objects/Variants/variant_element';
import { ImageExportService } from 'src/app/services/imageExportService/image-export-service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { GoldenLayoutComponentService } from 'src/app/services/goldenLayoutService/golden-layout-component.service';
import { LpmService } from 'src/app/services/lpmService/lpm.service';
import { findPathToSelectedNode } from 'src/app/objects/Variants/utility_functions';
import { ZoomFieldComponent } from 'src/app/components/zoom-field/zoom-field.component';
@Component({
  selector: 'app-graphical-query-editor',
  templateUrl: './graphical-query-editor.component.html',
  styleUrls: ['./graphical-query-editor.component.css'],
  animations: [
    trigger('collapse', [
      transition(':enter', [
        style({ opacity: '0', width: '0px', overflow: 'hidden' }),
        animate('250ms ease-in', style({ width: '*' })),
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: '0.4', width: '0px' })),
      ]),
    ]),
  ],
})
export class GraphicalQueryEditorComponent
  extends LayoutChangeDirective
  implements OnInit, AfterViewInit, OnDestroy
{
  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    private backendService: BackendService,
    private sharedDataService: SharedDataService,
    private colorMapService: ColorMapService,
    private conformanceCheckingService: ConformanceCheckingService,
    private processTreeService: ProcessTreeService,
    private lazyLoadingServiceService: LazyLoadingServiceService,
    private logService: LogService,
    private variantService: VariantService,
    private variantFilterService: VariantFilterService,
    private polygonDrawingService: PolygonDrawingService,
    private imageExportService: ImageExportService,
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    private lpmService: LpmService,
    elRef: ElementRef,
    renderer: Renderer2,
    private deciamlPipe: DecimalPipe
  ) {
    super(elRef.nativeElement, renderer);

    const activitites = this.logService.activitiesInEventLog;

    for (let activity in activitites) {
      this.activityNames.push(activity);
      this.activityNames.sort();
    }
    this.activityNames.unshift("S");
    this.activityNames.push("E");
  }

  @ViewChild('ToolBar')
  toolBar: ElementRef;

  @ViewChild('VariantMainGroup')
  variantElement: ElementRef;

  @ViewChild(ZoomFieldComponent)
  editor: ZoomFieldComponent;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  activityNames: Array<String> = [];
  public colorMap: Map<string, string>;

  currentVariant: VariantElement = null;
  cachedVariants: VariantElement[] = [null];
  cacheSize = 100;
  cacheIdx = 0;

  emptyVariant = true;

  selectedElement = false;
  multiSelect = false;
  multipleSelected = false;

  infixType = InfixType;
  curInfixType = InfixType.NOT_AN_INFIX;

  newLeaf;

  collapse: boolean = false;

  insertionStrategy = activityInsertionStrategy;
  selectedStrategy = this.insertionStrategy.behind;

  variantEnrichedSelection: Selection<any, any, any, any>;
  zoom: any;

  savedPatterns: VariantElement[] = [];

  private _destroy$ = new Subject();

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.logService.activitiesInEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((activities) => {
        this.activityNames = [];
        for (let activity in activities) {
          this.activityNames.push(activity);
          this.activityNames.sort();
        }
        this.activityNames.unshift("S");
        this.activityNames.push("E");
      });

    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((cMap) => {
        this.colorMap = cMap;
      });

      this.logService.loadedEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((newLog) => {
        if (newLog) {
          this.emptyVariant = true;
        }
      });
  }
  
  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
  ) => {
    let color;

    if (element instanceof LeafNode) {
      color = this.colorMap.get(element.asLeafNode().activity[0]);

      if (element.activity.length > 1) {
        color = '#d3d3d3'; // lightgray
      }
    } else {
      color = '#d3d3d3';
    }

    return color;
  };

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {
    this.collapse = width < 875;
  }

  handleVisibilityChange(visibility: boolean): void {
  }

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  ngOnDestroy(): void {
    this.sharedDataService.frequentMiningResults = null;
    this.lazyLoadingServiceService.destoryVariantMinerObserver();
    this._destroy$.next();
  }

  computeFocusOffset = (svg) => {
    const path = findPathToSelectedNode(
      this.currentVariant,
      svg.select('.selected-variant-g').data()[0]
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

  //there is no nested parallel group in tiebreaker. The parallel could only contain leaf, choice and fallthrough
  compareNode(node1, node2) {
    if (!(node1 instanceof LeafNode)) {
      return false;
    } else if (!(node2 instanceof LeafNode)) {
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

  reconstructVariant(variant: VariantElement) {
    const children = variant.getElements();
    if (!children) {
      return variant;
    } else {
      if (variant instanceof ParallelGroup) {
        return new ParallelGroup(children);
      } else if (variant instanceof ChoiceGroup) {
        return new ChoiceGroup(children);
      } else if (variant instanceof FallthroughGroup) {
        return new FallthroughGroup(children);
      } else {
        return new SequenceGroup(children);
      }
    }
  }

  handleActivityButtonClick(event) {
    if (this.selectedElement || this.emptyVariant) {
      const leaf = new LeafPattern([event.activityName]);
      this.newLeaf = leaf;

      if (this.emptyVariant) {
        const variantGroup = new SequencePattern([leaf]); //until
        variantGroup.setExpanded(true);
        this.currentVariant = variantGroup;
        this.emptyVariant = false;
        this.selectedElement = true;
        console.log(variantGroup);
        this.editor.centerContent(250);
        console.log(variantGroup);
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
                selectedElement
              );
              const grandParent = this.findParent(
                this.currentVariant,
                this.findParent(this.currentVariant, leaf)
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
                selectedElement
              );
              const grandParent = this.findParent(
                this.currentVariant,
                this.findParent(this.currentVariant, leaf)
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
                selectedElement
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
                selectedElement
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
    selectedElement
  ) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        variant.setElements([
          new ParallelGroup([leaf, this.reconstructVariant(variant)]),
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
              new ParallelGroup([leaf, selectedElement])
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
        selectedElements[i]
      );
      const secondParent = this.findParent(
        this.currentVariant,
        selectedElements[i + 1]
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
              new SequenceGroup([selectedElement, leaf])
            );
          } else {
            // Inserting behind a ParallelGroup inside a ParallelGroup
            if (selectedElement instanceof ParallelGroup) {
              children.splice(
                children.indexOf(selectedElement),
                1,
                new SequenceGroup([selectedElement, leaf])
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
    selectedElement
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
              new SequenceGroup([leaf, selectedElement])
            );
          } else {
            // Inserting infront a ParallelGroup inside a ParallelGroup
            if (selectedElement instanceof ParallelGroup) {
              children.splice(
                children.indexOf(selectedElement),
                1,
                new SequenceGroup([leaf, selectedElement])
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
              new FallthroughGroup([leaf, selectedElement])
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
        ElementsToDelete
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
    elementsToDelete
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

      //handle nested
      if (
        children.length === 1 &&
        variant instanceof SequenceGroup &&
        parent instanceof ParallelGroup &&
        (children[0] instanceof ParallelGroup ||
          children[0] instanceof LeafNode ||
          children[0] instanceof ChoiceGroup ||
          children[0] instanceof FallthroughGroup)
      ) {
        const childrenParent = parent.getElements();
        const aloneChild = children[0];
        if (aloneChild instanceof ParallelGroup) {
          const parallelChildren = children[0].getElements();
          const deleteIndex = childrenParent.indexOf(variant);
          childrenParent.splice(deleteIndex, 1);
          for (const newNode of parallelChildren.reverse()) {
            childrenParent.splice(deleteIndex, 0, newNode);
          }
        } else {
          childrenParent.splice(childrenParent.indexOf(variant), 1, aloneChild);
        }
        parent.setElements(childrenParent);
      } else if (
        children.length === 1 &&
        (variant instanceof ParallelGroup ||
          variant instanceof ChoiceGroup ||
          variant instanceof FallthroughGroup) &&
        parent instanceof SequenceGroup &&
        (children[0] instanceof SequenceGroup ||
          children[0] instanceof LeafNode ||
          children[0] instanceof ChoiceGroup ||
          children[0] instanceof FallthroughGroup)
      ) {
        const childrenParent = parent.getElements();
        const aloneChild = children[0];
        if (aloneChild instanceof SequenceGroup) {
          const sequenceChildren = children[0].getElements();
          const deleteIndex = childrenParent.indexOf(variant);
          childrenParent.splice(deleteIndex, 1);
          for (const newNode of sequenceChildren.reverse()) {
            childrenParent.splice(deleteIndex, 0, newNode);
          }
        } else {
          childrenParent.splice(childrenParent.indexOf(variant), 1, aloneChild);
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
        d3.selectAll('#QueryPattern')
          .selectAll('.selected-polygon')
          .classed('selected-polygon', false)
          .attr('stroke', false);

        d3.selectAll('#QueryPattern')
          .selectAll('.selected-variant-g')
          .classed('selected-variant-g', false);

        svgSelection.classed('selected-variant-g', true);

        const poly = svgSelection.select('polygon');
        poly.classed('selected-polygon', true);

        this.multipleSelected = false;
      } else {
        this.multipleSelected = true;

        svgSelection.classed(
          'selected-variant-g',
          !svgSelection.classed('selected-variant-g')
        );

        const poly = svgSelection.select('polygon');

        poly.classed('selected-polygon', !poly.classed('selected-polygon'));

        // If one is selected reactivate insert
        if (
          d3
            .selectAll('#QueryPattern')
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

    this.variantEnrichedSelection = selection;
  }

  savePattern(){
    this.savedPatterns.push(this.currentVariant.copy());
    console.log(this.currentVariant);
    console.log(this.savedPatterns);
  }

  openCardinality(){
    console.log("start!");
    this.variantService.showCardinalityDialog.next();
  }

  addCardinality(){
    this.currentVariant.asSequencePattern().cardinality += 1;
    this.triggerRedraw();
  }

  reduceCardinality(){
    if (this.currentVariant.asSequencePattern().cardinality > 0){
      this.currentVariant.asSequencePattern().cardinality -= 1;
      this.triggerRedraw();
    }
  }
}

export namespace GraphicalQueryEditorComponent {
  export const componentName = 'GraphicalQueryEditorComponent';
}

enum activityInsertionStrategy {
  infront = 'infront',
  behind = 'behind',
  parallel = 'parallel',
  replace = 'replace',
  choice = 'choice',
  fallthrough = 'fallthrough',
}