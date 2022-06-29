import { VariantExplorerComponent } from './../variant-explorer/variant-explorer.component';
import { GoldenLayoutComponentService } from './../../services/goldenLayoutService/golden-layout-component.service';
import { ColorMapService } from './../../services/colorMapService/color-map.service';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { VariantDrawerDirective } from './../../directives/variant-drawer.directive';
import {
  SequenceGroup,
  LeafNode,
  VariantElement,
  Variant,
  ParallelGroup,
  setParent,
  InfixType,
} from './../variant-explorer/model';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { LayoutChangeDirective } from 'src/app/directives/layout-change.directive';

import { cloneDeep } from 'lodash';
import { Selection } from 'd3';
import * as objectHash from 'object-hash';
import { animate, transition, trigger, style } from '@angular/animations';
import * as d3 from 'd3';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';

@Component({
  selector: 'app-variant-editor',
  templateUrl: './variant-editor.component.html',
  styleUrls: ['./variant-editor.component.css'],
  animations: [
    trigger('collapseText', [
      transition(':enter', [
        style({ opacity: '0', transform: 'translateX(-40px)' }),
        animate(
          '100ms 50ms ease-in',
          style({ opacity: '1', transform: 'translateX(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '100ms 50ms ease-in',
          style({ opacity: '0', transform: 'translateX(-50px)' })
        ),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('100ms 50ms ease-in', style({ opacity: '1' })),
      ]),
      transition(':leave', [
        animate('550ms 50ms ease-in', style({ opacity: '0' })),
      ]),
    ]),
  ],
})
export class VariantEditorComponent
  extends LayoutChangeDirective
  implements OnInit, AfterViewInit
{
  activityNames: Array<String> = [];

  public colorMap: Map<string, string>;

  variantEditorComponent = VariantEditorComponent;

  @ViewChild('VariantMainGroup')
  variantElement: ElementRef;

  @ViewChild('EditorWindow')
  editorWindow: ElementRef;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  currentVariant: VariantElement = null;

  cachedVariants: VariantElement[] = [];
  cacheSize: number = 100;
  cacheIdx: number = 0;

  emptyVariant: boolean = true;

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

  redundancyWarning: boolean = false;
  performanceMode: boolean;

  constructor(
    private sharedDataService: SharedDataService,
    private colorMapService: ColorMapService,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    private variantPerformanceService: VariantPerformanceService,
    elRef: ElementRef,
    renderer: Renderer2
  ) {
    super(elRef.nativeElement, renderer);
    const activitites = this.sharedDataService.activitiesInEventLog;

    for (let activity in activitites) {
      this.activityNames.push(activity);
      this.activityNames.sort();
    }
  }

  ngOnInit(): void {
    this.sharedDataService.activitiesInEventLog$.subscribe((activities) => {
      this.activityNames = [];
      for (let activity in activities) {
        this.activityNames.push(activity);
        this.activityNames.sort();
      }
    });

    this.sharedDataService.loadedEventLog$.subscribe((newLog) => {
      if (newLog) {
        this.emptyVariant = true;
      }
    });

    this.colorMapService.colorMap$.subscribe((map) => {
      this.colorMap = map;
      if (this.variantDrawer) {
        this.variantDrawer.redraw();
      }
    });

    this.variantPerformanceService.variantPerformanceMode.subscribe(
      (performanceMode) => {
        this.performanceMode = performanceMode;
      }
    );
  }

  ngAfterViewInit() {
    this.centerVariant();
    this.addZoomFunctionality();
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {
    if (width < 1150) this.collapse = true;
    else {
      this.collapse = false;
    }
  }

  handleVisibilityChange(visibility: boolean): void {}
  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  handleRedraw(selection: Selection<any, any, any, any>) {
    selection.selectAll('g').on('click', function (event, d) {
      event.stopPropagation();
      const select = d3.select(this as SVGElement);
      toogleSelect(select);
    });

    const toogleSelect = function (svgSelection) {
      if (!this.multiSelect) {
        d3.select('#VariantMainGroup')
          .selectAll('.selected-variant-poly')
          .classed('selected-variant-poly', null)
          .attr('stroke', null);

        d3.select('#VariantMainGroup')
          .selectAll('.selected-variant-g')
          .classed('selected-variant-g', false);

        svgSelection.classed('selected-variant-g', true);

        const poly = svgSelection.select('polygon');
        poly.classed('selected-variant-poly', true);
        applyInverseStrokeToPoly(poly);

        this.multipleSelected = false;
      } else {
        this.multipleSelected = true;

        svgSelection.classed(
          'selected-variant-g',
          !svgSelection.classed('selected-variant-g')
        );

        const poly = svgSelection.select('polygon');

        poly.classed(
          'selected-variant-poly',
          !poly.classed('selected-variant-poly')
        );

        if (!poly.attr('stroke')) {
          applyInverseStrokeToPoly(poly);
        } else {
          poly.attr('stroke', null);
        }

        // If one is selected reactivate insert
        if (
          d3
            .select('#VariantMainGroup')
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
      .classed('selected-variant-poly', true);

    applyInverseStrokeToPoly(poly);

    this.variantEnrichedSelection = selection;
  }

  handleActivityButtonClick(event) {
    if (!this.multipleSelected && (this.selectedElement || this.emptyVariant)) {
      const leaf = new LeafNode([event.activityName]);
      this.newLeaf = leaf;

      if (this.emptyVariant) {
        const variantGroup = new SequenceGroup([leaf]);
        variantGroup.setExpanded(true);
        this.currentVariant = variantGroup;
        this.emptyVariant = false;
        this.selectedElement = true;
      } else {
        leaf.setExpanded(true);
        const selectedElement = this.variantEnrichedSelection
          .selectAll('.selected-variant-g')
          .data()[0];

        switch (this.selectedStrategy) {
          case this.insertionStrategy.infront:
            this.handleInfrontInsert(
              this.currentVariant,
              leaf,
              selectedElement
            );
            break;
          case this.insertionStrategy.behind:
            this.handleBehindInsert(this.currentVariant, leaf, selectedElement);
            break;
          case this.insertionStrategy.parallel:
            this.handleParallelInsert(
              this.currentVariant,
              leaf,
              selectedElement
            );
            break;
          case this.insertionStrategy.replace:
            this.handleReplace(this.currentVariant, leaf, selectedElement);
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

      if (index > -1) {
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

        //variant.setElements(children);
      } else {
        for (let child of children) {
          this.handleParallelInsert(child, leaf, selectedElement);
        }
      }
    }
  }

  handleInfixButtonClick(infixtype : InfixType){
    this.curInfixType = infixtype; 
  }

  handleBehindInsert(variant: VariantElement, leaf: LeafNode, selectedElement) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);

      if (index > -1) {
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
        for (let child of children) {
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
      if (index > -1) {
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
        for (let child of children) {
          this.handleInfrontInsert(child, leaf, selectedElement);
        }
      }
    }
  }

  handleReplace(variant: VariantElement, leaf: LeafNode, selectedElement) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);

      if (index > -1) {
        children.splice(index, 1, leaf);
      } else {
        for (let child of children) {
          this.handleReplace(child, leaf, selectedElement);
        }
      }
    }
  }

  @HostListener('window:keydown.control', ['$event'])
  onMultiSelectStart(e) {
    this.multiSelect = true;
  }

  @HostListener('window:keyup.control', ['$event'])
  onMultiSelectStop(e) {
    this.multiSelect = false;
  }

  onDeleteSelected() {
    const ElementsToDelete = this.variantEnrichedSelection
      .selectAll('.selected-variant-g')
      .data();

    this.deleteElementFromVariant(
      this.currentVariant,
      this.currentVariant,
      ElementsToDelete
    );

    this.multiSelect = false;
    this.multipleSelected = false;

    if (this.currentVariant) {
      this.cacheCurrentVariant();
    }
    this.triggerRedraw();
  }

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
  ) => {
    let color;
    color = this.colorMap.get(element.asLeafNode().activity[0]);

    if (!color) {
      color = '#d3d3d3'; // lightgrey
    }

    return color;
  };

  deleteElementFromVariant(
    variant: VariantElement,
    parent: VariantElement,
    elementsToDelete
  ) {
    const children = variant.getElements();

    if (children) {
      for (let elementToDelete of elementsToDelete) {
        const index = children.indexOf(elementToDelete);
        if (index > -1) {
          this.newLeaf = children[index - 1];

          children.splice(index, 1);
        }
      }

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
        for (let child of children) {
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

    this.triggerRedraw();
  }

  cacheCurrentVariant() {
    if (this.cacheIdx < this.cachedVariants.length - 1) {
      this.cachedVariants = this.cachedVariants.slice(0, this.cacheIdx + 1);
    }

    this.cachedVariants.push(this.currentVariant.copy());
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
    this.currentVariant = this.cachedVariants[this.cacheIdx].copy();
    this.newLeaf = null;
  }

  undo() {
    this.selectedElement = false;
    this.emptyVariant = false;

    this.cacheIdx--;
    this.currentVariant = this.cachedVariants[this.cacheIdx].copy();
    this.newLeaf = null;
  }

  // This is a work-around that we should address in a more unified manner
  // The underlying challenge is causing a redraw by triggering change detection,
  // something that in its current state due to only a shallow check of the VariantElement
  triggerRedraw() {
    setTimeout(() => this.variantDrawer.redraw(), 1);
  }

  centerVariant() {
    const boundingRect = (
      this.editorWindow.nativeElement as HTMLElement
    ).getBoundingClientRect();
    d3.select(this.variantElement.nativeElement)
      .selectChild()
      .attr(
        'transform',
        `translate(${boundingRect.width / 2}, ${boundingRect.height / 2})`
      );
  }

  addZoomFunctionality(): void {
    const zoomGroupVariantSelection = d3.select(
      this.variantElement.nativeElement
    );

    const zooming = function (event) {
      d3.select(this.variantElement.nativeElement)
        .selectChild()
        .attr(
          'transform',
          event.transform.translate(
            this.editorWindow.nativeElement.offsetWidth / 2,
            this.editorWindow.nativeElement.offsetHeight / 2
          )
        );
    }.bind(this);

    this.zoom = d3.zoom().scaleExtent([0.1, 3]).on('zoom', zooming);

    zoomGroupVariantSelection.call(this.zoom).on('dblclick.zoom', null);

    // center variant
    d3.select('#btn-center-variant').on(
      'click',
      function () {
        d3.select(this.variantElement.nativeElement)
          .transition()
          .duration(250)
          .ease(d3.easeExpInOut)
          .call(this.zoom.transform, d3.zoomIdentity);
      }.bind(this)
    );

    // focus selected
    d3.select('#btn-focus-selected').on(
      'click',
      function () {
        const svg = d3.select(this.variantElement.nativeElement);

        const path = this.findPathToSelectedNode().slice(1);
        let translateX = 0;

        for (let element of svg
          .selectAll('g')
          .filter((d) => {
            return path.indexOf(d) > -1;
          })
          .nodes()) {
          const transform = d3
            .select(element)
            .attr('transform')
            .match(/[\d.]+/g);
          translateX += parseFloat(transform[0]);
        }

        svg
          .transition()
          .duration(250)
          .ease(d3.easeExpInOut)
          .call(
            this.zoom.transform,
            translateX
              ? d3.zoomIdentity.translate(-translateX, 0)
              : d3.zoomIdentity
          );
      }.bind(this)
    );
  }

  findPathToSelectedNode(): Array<VariantElement> {
    const svg = d3.select(this.variantElement.nativeElement);
    const path = searchPath(
      this.currentVariant,
      svg.select('.selected-variant-g').data()[0]
    );

    function searchPath(
      parent: VariantElement,
      element
    ): Array<VariantElement> {
      if (parent.getElements().indexOf(element) > -1) {
        return [parent, element];
      } else if (!(parent instanceof LeafNode)) {
        for (let child of parent.getElements()) {
          if (!(child instanceof LeafNode)) {
            const res = searchPath(child, element);

            if (res.length > 0) {
              return [parent].concat(res);
            }
          }
        }
      }

      return [];
    }

    return path;
  }

  addCurrentVariantToVariantList() {
    let currentVariants = this.sharedDataService.variants;
    const copyCurrent = cloneDeep(this.currentVariant);
    setParent(copyCurrent);
    copyCurrent.setExpanded(false);

    const newVariant = new Variant(
      1,
      copyCurrent,
      false,
      false,
      0,
      undefined,
      true,
      false,
      true,
      [],
      this.curInfixType
    );

    newVariant.alignment = undefined;
    newVariant.deviation = undefined;
    newVariant.id = objectHash(newVariant);

    const duplicate = currentVariants.map((v) => v.id === newVariant.id);

    if (!duplicate.includes(true)) {
      currentVariants.push(newVariant);
      this.sharedDataService.variants = currentVariants;
    } else {
      this.redundancyWarning = true;
      setTimeout(() => (this.redundancyWarning = false), 500);
    }

    this.applySortOnVariantEditor();
  }

  applySortOnVariantEditor() {
    const variantExplorerRef =
      this.goldenLayoutComponentService.goldenLayout.findFirstComponentItemById(
        VariantExplorerComponent.componentName
      );
    const variantExplorer =
      variantExplorerRef.component as VariantExplorerComponent;
    variantExplorer.sortingFeature = 'userDefined';
    variantExplorer.onSortOrderChanged(false);
  }
}

export namespace VariantEditorComponent {
  export const componentName = 'VariantEditorComponent';
}

export enum activityInsertionStrategy {
  infront = 'infront',
  behind = 'behind',
  parallel = 'parallel',
  replace = 'replace',
}

export function applyInverseStrokeToPoly(poly: Selection<any, any, any, any>) {
  const datum = poly.data()[0];
  if (datum) {
    if (datum instanceof LeafNode) {
      const rgb_code = poly.attr('style').match(/[\d.]+/g);
      const inversed = rgb_code.map((d) => 255 - parseInt(d));

      poly.attr('style', poly.attr('style').split(';')[0]);
      poly.attr('stroke-width', 2);
      poly.attr(
        'stroke',
        `rgb(${inversed[0]}, ${inversed[1]}, ${inversed[2]})`
      );
    } else {
      poly
        .attr('stroke', '#dc3545')
        .attr('style', poly.attr('style').split(';')[0])
        .attr('stroke-width', 2);
    }
  }
}
