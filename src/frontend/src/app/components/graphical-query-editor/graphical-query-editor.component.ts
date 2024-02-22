import { PolygonDrawingService } from 'src/app/services/polygon-drawing.service';
import { VariantFilterService } from './../../services/variantFilterService/variant-filter.service';
import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';
import { PerformanceService } from 'src/app/services/performance.service';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { ModelViewModeService } from 'src/app/services/viewModeServices/model-view-mode.service';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { BackendService } from './../../services/backendService/backend.service';
import { ProcessTreeDrawerDirective } from 'src/app/directives/process-tree-drawer/process-tree-drawer.directive';
import { GoldenLayoutHostComponent } from 'src/app/components/golden-layout-host/golden-layout-host.component';
import { NodeInsertionStrategy } from 'src/app/objects/ProcessTree/utility-functions/process-tree-edit-tree';
import { GoldenLayout} from 'golden-layout';
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
import {
  ProcessTree,
  ProcessTreeSyntaxInfo,
  checkSyntax,
  ProcessTreeOperator,
} from '../../objects/ProcessTree/ProcessTree';
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
  selectedPerformanceIndicator: string;
  selectedStatistic: string;
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
    private performanceService: PerformanceService,
    private performanceColorScaleService: ModelPerformanceColorScaleService,
    private modelViewModeService: ModelViewModeService,
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
    this.queryTreeOperators = [
      QueryTreeOperator.or,
      QueryTreeOperator.and,
    ]
  }

  @ViewChild('d3svg') svgElem: ElementRef;
  @ViewChild('d3container') d3ContainerElem: ElementRef;

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

  queryTreeOperators: QueryTreeOperator[];
  @ViewChild(ProcessTreeDrawerDirective)
  processTreeDrawer: ProcessTreeDrawerDirective;

  currentlyDisplayedTreeInEditor;
  root: d3.HierarchyNode<any>;

  nodeWidthCache = new Map<string, number>();

  activityColorMap: Map<string, string>;
  performanceColorMap: Map<number, any>;

  processEditorOutOfFocus: boolean = false;

  editorOpen: boolean = false;
  _goldenLayoutHostComponent: GoldenLayoutHostComponent;
  _goldenLayout: GoldenLayout;

  tree_syntax_string: string;
  tree_syntax_result: any;

  treeCacheLength: number = 0;
  treeCacheIndex: number = 0;

  activitiesOccurringInLog: string[];

  searchText: string;

  processTreeSyntaxInfo: ProcessTreeSyntaxInfo = undefined;

  currentEditorHeight;

  svg;
  mainSvgGroup;
  nodeEnter;

  readonly NodeInsertionStrategy = NodeInsertionStrategy;
  nodeInsertionStrategy: NodeInsertionStrategy = NodeInsertionStrategy.ABOVE;
  lastNodeInsertionStrategy: NodeInsertionStrategy;

  selectedRootNodeId: number;
  selectedRootNode: d3.HierarchyNode<ProcessTree>;

  readonly disabledInsertPositions = {
    above: false,
    leftRight: false,
    below: false,
  };

  get disabledActivityInsertion() {
    if (
      this.nodeInsertionStrategy === NodeInsertionStrategy.ABOVE &&
      this.selectedRootNode?.data
    )
      return true;
    // Disable insertion when no node is selected but pt is present
    if (!this.selectedRootNode && this.currentlyDisplayedTreeInEditor)
      return true;
    return false;
  }

  get disabledOperatorInsertion() {
    // Disable insertion when no node is selected but pt is present
    if (!this.selectedRootNode && this.currentlyDisplayedTreeInEditor)
      return true;
    return false;
  }

  get processTreeOriginX() {
    return this.d3ContainerElem.nativeElement.offsetWidth / 2;
  }

  readonly processTreeOriginY = 30;

  private _destroy$ = new Subject();

  ngOnInit(): void {
    this.processTreeService.treeCacheIndex$
    .pipe(takeUntil(this._destroy$))
    .subscribe((idx) => {
      this.treeCacheIndex = idx;
    });

  this.processTreeService.treeCacheLength$
    .pipe(takeUntil(this._destroy$))
    .subscribe((len) => {
      this.treeCacheLength = len;
    });

  this.modelViewModeService.viewMode$
    .pipe(takeUntil(this._destroy$))
    .subscribe((viewMode) => {
      if (this.currentlyDisplayedTreeInEditor) {
        this.redraw(this.currentlyDisplayedTreeInEditor);
      }
    });

  this.conformanceCheckingService.isConformanceWeighted$
    .pipe(takeUntil(this._destroy$))
    .subscribe((_) => {
      if (this.currentlyDisplayedTreeInEditor) {
        this.redraw(this.currentlyDisplayedTreeInEditor);
      }
    });

  this.colorMapService.colorMap$
    .pipe(takeUntil(this._destroy$))
    .subscribe((colorMap) => {
      this.activityColorMap = colorMap;

      if (this.currentlyDisplayedTreeInEditor) {
        this.redraw(this.currentlyDisplayedTreeInEditor);
      }
    });

  this.performanceColorScaleService.currentColorScale
    .pipe(takeUntil(this._destroy$))
    .subscribe((colorMap) => {
      if (colorMap && colorMap != this.performanceColorMap) {
        this.performanceColorMap = colorMap;
        this.redraw(this.currentlyDisplayedTreeInEditor);
      }
    });

  this.logService.activitiesInEventLog$
    .pipe(takeUntil(this._destroy$))
    .subscribe((activties) => {
      this.activitiesOccurringInLog = Object.keys(activties);
    });

  this.processTreeService.currentDisplayedProcessTree$
    .pipe(takeUntil(this._destroy$))
    .subscribe((res) => {
      // If the tree was loaded via the process tree import or Drag&Drop that does not contain the current activities
      this.currentlyDisplayedTreeInEditor = res;

      if (res) {
        console.warn('update tree triggered by service');

        this.processTreeSyntaxInfo = checkSyntax(res);
        this.processTreeService.correctTreeSyntax =
          this.processTreeSyntaxInfo.correctSyntax;
        this.redraw(res);
      } else if (res === null && this.mainSvgGroup) {
        this.processTreeDrawer.redraw(null);
        this.selectedRootNode = null;
      }
    });
  }

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
      
    this.initializeSvg();

    this._goldenLayoutHostComponent =
      this.goldenLayoutComponentService.goldenLayoutHostComponent;
    this._goldenLayout = this.goldenLayoutComponentService.goldenLayout;

    this.processTreeService.selectedRootNodeID$
      .pipe(takeUntil(this._destroy$))
      .subscribe((id) => {
        // Change the Selection
        if (id) {
          this.selectRootNodeFromID(id); //the last one failed
          // Unselect all
        } else {
          this.clearDisplayedSelection();
        }

        this.selectedRootNodeId = id;
      });

      this._goldenLayoutHostComponent =
      this.goldenLayoutComponentService.goldenLayoutHostComponent;
    this._goldenLayout = this.goldenLayoutComponentService.goldenLayout;

    this.initializeSvg();

    this._goldenLayoutHostComponent =
      this.goldenLayoutComponentService.goldenLayoutHostComponent;
    this._goldenLayout = this.goldenLayoutComponentService.goldenLayout;

    this.processTreeService.selectedRootNodeID$
      .pipe(takeUntil(this._destroy$))
      .subscribe((id) => {
        // Change the Selection
        if (id) {
          this.selectRootNodeFromID(id); //the last one failed
          // Unselect all
        } else {
          this.clearDisplayedSelection();
        }

        this.selectedRootNodeId = id;
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

  // Tree Editor part
  redraw(tree) {
    this.selectedStatistic =
      this.performanceColorScaleService.selectedColorScale.statistic;
    this.selectedPerformanceIndicator =
      this.performanceColorScaleService.selectedColorScale.performanceIndicator;
    this.performanceColorMap =
      this.performanceColorScaleService.getColorScale();

    this.processTreeDrawer.redraw(tree);
    setTimeout(() => this.selectRootNodeFromID(this.selectedRootNodeId), 0);
  }


  private selectRootNodeFromID(id) {
    const selectedRoot = this.mainSvgGroup.select('[id="' + id + '"]');
    //const node = selectedRoot.data()[0];
    const node = selectedRoot.data()[0];
    if (id && node) {
      this.setSelectedRootNode(node);
      this.selectSubtreeFromRoot(selectedRoot.node(), node);

      this.checkNodeInsertionStrategy(this.selectedRootNode.data);
    }
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {
    this.collapse = width < 970;

    this.currentEditorHeight = height;
  }

  handleVisibilityChange(visibile: boolean): void {
    if (visibile) {
      if (this.currentlyDisplayedTreeInEditor) {
        this.redraw(this.currentlyDisplayedTreeInEditor);
      }
    }
  }

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  insertNewNodeButtonDisabled(): boolean {
    return (
      !this.selectedRootNode &&
      this.currentlyDisplayedTreeInEditor !== null &&
      this.currentlyDisplayedTreeInEditor !== undefined
    );
  }

  leafNodeSelected(): boolean {
    return this.selectedRootNode && !this.selectedRootNode.children;
  }

  rootNodeSelected(): boolean {
    return this.selectedRootNode && this.selectedRootNode.depth === 0;
  }

  get shiftSubtreeLeftDisabled(): boolean {
    if (this.buttonManipulatingMultipleNodesDisabled()) return true;
    const selectedNode = this.selectedRootNode.data;
    // Disabled when selected subtree already at leftmost position
    if (selectedNode.parent.children.indexOf(selectedNode) == 0) return true;
    return false;
  }

  get shiftSubtreeRightDisabled(): boolean {
    if (this.buttonManipulatingMultipleNodesDisabled()) return true;
    const selectedNode = this.selectedRootNode.data;
    // Disabled when selected subtree already at rightmost position
    if (
      selectedNode.parent.children.indexOf(selectedNode) ==
      selectedNode.parent.children.length - 1
    )
      return true;
    return false;
  }

  buttonManipulatingMultipleNodesDisabled(): boolean {
    return !this.selectedRootNode || this.rootNodeSelected();
  }

  buttonFreezeSubtreeDisabled(): boolean {
    return !this.selectedRootNode || this.leafNodeSelected();
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  shiftSubtreeToLeft(): void {
    this.processTreeService.shiftSubtreeToLeft(this.selectedRootNode.data);
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  shiftSubtreeToRight(): void {
    this.processTreeService.shiftSubtreeToRight(this.selectedRootNode.data);
  }

  tree_undo(): void {
    this.processTreeService.undo();
  }

  tree_redo(): void {
    this.processTreeService.redo();
  }

  centerTree(): void {
    this.mainSvgGroup.attr(
      'transform',
      `translate(${this.processTreeOriginX}, ${this.processTreeOriginY})`
    );
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  deleteSubtree(): void {
    this.processTreeService.deleteSelected(this.selectedRootNode.data);
  }

  insertNewNode(operator, label) {
    this.processTreeService.insertNewNode(
      this.selectedRootNode?.data,
      this.nodeInsertionStrategy,
      operator,
      label
    );
    this.afterInsertNode();
  }

  afterInsertNode(): void {
    this.searchText = undefined;
  }

  // @REFRACTOR INTO PROCESSTREE SERVICE
  createNode(operator, label): d3.HierarchyNode<any> {
    // TODO make sure that IDs are unique!!!
    const nodeData = {
      operator,
      label,
      id: Math.floor(1000000000 + Math.random() * 900000000),
      children: [],
    };
    return d3.hierarchy(nodeData);
  }

  computeNodeColor = (d: d3.HierarchyNode<ProcessTree>) => {
    switch (this.modelViewModeService.viewMode) {
      case ViewMode.CONFORMANCE:
        if (d.data.conformance === null) return '#404041';
        const conformanceValue =
          this.conformanceCheckingService.isConformanceWeighted &&
          d.data.conformance?.weighted_by_counts != undefined
            ? d.data.conformance?.weighted_by_counts.value
            : d.data.conformance?.weighted_equally.value;
        if (conformanceValue === 0) return 'url(#modelConformanceStriped)';
        return this.conformanceCheckingService.modelConformanceColorMap.getColor(
          conformanceValue
        );
      case ViewMode.PERFORMANCE:
        if (d.data.label !== ProcessTreeOperator.tau) {
          if (
            this.performanceColorMap.has(d.data.id) &&
            d.data.performance?.[this.selectedPerformanceIndicator]?.[
              this.selectedStatistic
            ] !== undefined
          ) {
            if (
              d.data.performance[this.selectedPerformanceIndicator][
                this.selectedStatistic
              ] === 0
            )
              return 'url(#whiteStriped)';
            else
              return this.performanceColorMap
                .get(d.data.id)
                .getColor(
                  d.data.performance[this.selectedPerformanceIndicator][
                    this.selectedStatistic
                  ]
                );
          } else {
            return '#404040';
          }
        }
      default:
        if (d.data.operator !== null) return PT_Constant.OPERATOR_COLOR;
        if (d.data.label !== null && d.data.label === ProcessTreeOperator.tau)
          return PT_Constant.INVISIBLE_ACTIVTIY_COLOR;
        const isVisibleActivity =
          d.data.label !== null && d.data.label !== ProcessTreeOperator.tau;
        return isVisibleActivity
          ? this.activityColorMap.get(d.data.label)
          : null;
    }
  };

  tooltipContent = (d: d3.HierarchyNode<ProcessTree>) => {
    let returnTempValue = d.data.label || d.data.operator;

    const tableHead =
      `<div style="display: flex; justify-content: space-between; border-radius: 5px 5px 0px 0px;" class="bg-dark">
        <h6 style="flex: 1; margin-top: 8px;">` +
      (d.data.label || d.data.operator) +
      `</h6>
      </div>`;

    if (
      this.modelViewModeService.viewMode === ViewMode.PERFORMANCE &&
      d.data.hasPerformance() &&
      d.data.label !== ProcessTreeOperator.tau
    ) {
      returnTempValue =
        tableHead +
        getPerformanceTable(
          d.data.performance,
          this.selectedPerformanceIndicator,
          this.selectedStatistic
        );
    } else if (
      this.modelViewModeService.viewMode === ViewMode.CONFORMANCE &&
      d.data.conformance !== null
    ) {
      returnTempValue =
        tableHead +
        `<table class="table table-dark table-striped table-bordered">
          <tr>
            <td>Weighted</td>
            <td>Conformance</td>
            <td>Weight</td>
          </tr>` +
        `<tr>
            <td>Equally</td>
            <td>${(d.data.conformance?.weighted_equally.value * 100).toFixed(
              2
            )}%</td>
            <td>${d.data.conformance?.weighted_equally.weight}</td>
        </tr>` +
        (d.data.conformance?.weighted_by_counts !== null
          ? `<tr>
            <td>By Log Frequency</td>
            <td>${(d.data.conformance?.weighted_by_counts?.value * 100).toFixed(
              2
            )}%</td>
            <td>${d.data.conformance?.weighted_by_counts?.weight}</td>
        </tr>`
          : '') +
        '</table>';
    }

    return returnTempValue;
  };

  computeFillColor = (d: d3.HierarchyNode<ProcessTree>) => {
    if (d.data.operator !== null) return PT_Constant.OPERATOR_COLOR;
    if (d.data.label !== null && d.data.label === ProcessTreeOperator.tau)
      return PT_Constant.INVISIBLE_ACTIVTIY_COLOR;
    const isVisibleActivity =
      d.data.label !== null && d.data.label !== ProcessTreeOperator.tau;
    return isVisibleActivity
      ? this.activityColorMap.get(d.data.label) ||
          PT_Constant.VISIBILE_ACTIVITY_DEFAULT_COLOR
      : null;
  };

  computeTextColor = (d: d3.HierarchyNode<ProcessTree>) => {
    if (d.data.frozen || d.data.label === ProcessTreeOperator.tau) {
      return 'white';
    }
    const nodeColor = this.computeNodeColor(d);

    const isVisibleActivity =
      (d.data.label !== null && d.data.label !== ProcessTreeOperator.tau) ||
      (this.modelViewModeService.viewMode === ViewMode.PERFORMANCE &&
        nodeColor !== undefined) ||
      this.modelViewModeService.viewMode === ViewMode.CONFORMANCE;
    return isVisibleActivity ? textColorForBackgroundColor(nodeColor) : 'white';
  };

  // END - Inserting node functionality

  // Refactor to Directive with Variant Editor / BPMN Viewer
  addZoomFunctionality(): void {
    const zooming = function (event) {
      this.mainSvgGroup.attr(
        'transform',
        event.transform.translate(
          this.processTreeOriginX,
          this.processTreeOriginY
        )
      );
    }.bind(this);

    const zoom: any = d3.zoom().scaleExtent([0.1, 3]).on('zoom', zooming);
    this.svg.call(zoom).on('dblclick.zoom', null);

    // reset zoom
    d3.select('#btn-reset-zoom').on(
      'click',
      function () {
        this.svg
          .transition()
          .duration(250)
          .ease(d3.easeExpInOut)
          .call(zoom.transform, d3.zoomIdentity.translate(0, 0));
      }.bind(this)
    );
  }

  selectNodeCallBack = (self, event, d: d3.HierarchyNode<ProcessTree>) => {
    // hide the tooltip
    if (self.variantService.activityTooltipReference) {
      self.variantService.activityTooltipReference.tooltip('hide');
    }
    // correct the selected node after undo
    if (d && d.data && d.parent) {
      d.data.parent = d.parent.data;
    }
    this.pushIDtoService(self, d);
    this.processTreeService.selectedTree = ProcessTree.fromObj(d.data);
  };

  private pushIDtoService = (svg, d) => {
    // Activate Toogle by pushing Null to service
    if (d.data.id !== this.selectedRootNodeId) {
      this.processTreeService.selectedRootNodeID = d.data.id;
    } else {
      this.processTreeService.selectedRootNodeID = null;
    }
  };

  private setSelectedRootNode(d) {
    this.selectedRootNode = d;
  }

  private selectSubtreeFromRoot = function (svgGroup, d) {
    // Unselect All Edges and Rect
    this.mainSvgGroup.selectAll('rect').each((d) => {
      d.data.selected = false;
    });

    this.mainSvgGroup.selectAll('rect').classed('selected-node', false);
    this.mainSvgGroup.selectAll('line').classed('selected-edge', false);

    // Select the node, if it isn't selected yet
    d.data.selected = true;

    d3.select(svgGroup).select('.node').classed('selected-node', true);
  };

  private selectAllChildren = function (svgGroup, d) {
    d.data.selected = true;
    d3.select(svgGroup).select('.node').classed('selected-node', true);

    if (!d.children) return;

    // add red stroke around sub-nodes if select subtree is selected
    d.children.forEach((c) => {
      this.selectAllChildren(
        this.mainSvgGroup.select('[id="' + c.data.id + '"]').node(),
        c
      );
    });
  };

  private selectEdges = function () {
    this.mainSvgGroup
      .selectAll('line')
      .classed('frozen-edge', (e) => {
        return e.source.data.frozen;
      })
      .classed('selected-edge', (e) => {
        return e.source.data.selected;
      });
  };

  freezeSubtree(): void {
    this.processTreeService.freezeSubtree(this.selectedRootNode.data);
  }

  clearSelection(): void {
    this.processTreeService.selectedRootNodeID = null;
  }

  clearDisplayedSelection(): void {
    this.selectedRootNode = null;
    this.processTreeService.selectedTree = undefined;

    this.mainSvgGroup.selectAll('rect').each((d) => {
      d.data.selected = false;
    });

    this.mainSvgGroup.selectAll('rect').classed('selected-node', false);
    this.mainSvgGroup.selectAll('line').classed('selected-edge', false);
  }

  applyReductionRules(): void {
    this.backendService.applyTreeReductionRules();
  }

  initializeSvg(): void {
    this.svg = d3.select('#d3-svg');
    // add svg group for zooming
    this.mainSvgGroup = this.svg.select('#zoomGroup');

    this.centerTree();
    this.addZoomFunctionality();
  }

  toggleBPMNEditor() {
    this.goldenLayoutComponentService.createBPMNSplitViewWindow(
      ProcessTreeEditorComponent.componentName,
      BpmnEditorComponent.componentName
    );
  }

  exportCurrentTree(svg: SVGGraphicsElement): void {
    // Copy the current tree
    const tree_copy = svg.cloneNode(true) as SVGGraphicsElement;
    const svgBBox = (
      d3.select('#zoomGroup').node() as SVGGraphicsElement
    ).getBBox();

    // Strip all the classed information
    const tree = d3.select(tree_copy);
    tree
      .selectAll('rect')
      .classed('.selected-node', false)
      .classed('.frozen-node', false);
    tree
      .selectAll('line')
      .classed('.selected-edge', false)
      .classed('.frozen-edge', false);

    tree
      .selectAll('g')
      .attr('data-bs-toggle', 'none')
      .attr('data-bs-placement', 'none')
      .attr('data-bs-title', 'none')
      .attr('data-bs-html', 'none')
      .attr('data-bs-template', 'none');

    const shiftbyXOffset = (node, offset, attrKey) => {
      return parseFloat(node.getAttribute(attrKey)) + offset;
    };

    // Recenter the tree and reset scaling
    let xCords: number[] = [];
    tree.selectAll('rect').each(function (this: SVGGraphicsElement) {
      xCords.push(parseFloat(this.getAttribute('x')));
    });

    const xLower = Math.min(...xCords);
    const xOffset = Math.abs(xLower) + PT_Constant.EXPORT_OFFSET;

    tree.selectAll('rect').attr('x', function (this: SVGGraphicsElement) {
      return shiftbyXOffset(this, xOffset, 'x');
    });
    tree.selectAll('text').attr('x', function (this: SVGGraphicsElement) {
      return shiftbyXOffset(this, xOffset, 'x');
    });
    tree
      .selectAll('line')
      .attr('x1', function (this: SVGGraphicsElement) {
        return shiftbyXOffset(this, xOffset, 'x1');
      })
      .attr('x2', function (this: SVGGraphicsElement) {
        return shiftbyXOffset(this, xOffset, 'x2');
      });

    tree
      .selectChild()
      .attr('transform', `translate(0, ${PT_Constant.EXPORT_OFFSET})`);

    // Export the tree
    this.imageExportService.export(
      'process_tree',
      svgBBox.width + 2 * PT_Constant.EXPORT_OFFSET,
      svgBBox.height + PT_Constant.EXPORT_OFFSET,
      tree_copy
    );
  }

  toggleBlur(event) {
    this.processEditorOutOfFocus = event;
  }

  checkNodeInsertionStrategy(rootNode: ProcessTree) {
    this.disabledInsertPositions.leftRight = false;

    // Disable insertions above on non-root nodes
    this.disabledInsertPositions.above = rootNode.parent != null;
    // Disable insertions below non-operator nodes, i.e. activities
    this.disabledInsertPositions.below = rootNode.operator == null;
    // Disable insertions left/right of root node
    if (rootNode.parent == null) this.disabledInsertPositions.leftRight = true;
    // Disable insertions left/right of child from loop node that already has 2 childs
    if (
      rootNode.parent?.operator === ProcessTreeOperator.loop &&
      rootNode.parent?.children.length === 2
    )
      this.disabledInsertPositions.leftRight = true;
    // Disable insertions below redo node that has 2 childs
    if (
      rootNode.operator === ProcessTreeOperator.loop &&
      rootNode.children.length === 2
    )
      this.disabledInsertPositions.below = true;

    switch (this.nodeInsertionStrategy) {
      case NodeInsertionStrategy.ABOVE:
        if (this.disabledInsertPositions.above)
          this.nodeInsertionStrategy =
            this.getFirstAvailableNodeInsertionStrategy();
        break;
      case NodeInsertionStrategy.BELOW:
        if (this.disabledInsertPositions.below)
          this.nodeInsertionStrategy =
            this.getFirstAvailableNodeInsertionStrategy();
        break;
      case NodeInsertionStrategy.LEFT:
      case NodeInsertionStrategy.RIGHT:
        if (this.disabledInsertPositions.leftRight)
          this.nodeInsertionStrategy =
            this.getFirstAvailableNodeInsertionStrategy();
        break;
      case NodeInsertionStrategy.CHANGE:
        break;
      default:
        this.nodeInsertionStrategy =
          this.getFirstAvailableNodeInsertionStrategy();
    }
  }

  getFirstAvailableNodeInsertionStrategy(): NodeInsertionStrategy {
    if (!this.disabledInsertPositions.above) return NodeInsertionStrategy.ABOVE;
    if (!this.disabledInsertPositions.leftRight)
      return NodeInsertionStrategy.LEFT;
    if (!this.disabledInsertPositions.below) return NodeInsertionStrategy.BELOW;
    return NodeInsertionStrategy.CHANGE;
  }

  hideAllTooltips() {}
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

export enum QueryTreeOperator {
  and = 'AND',
  or = 'OR',
}