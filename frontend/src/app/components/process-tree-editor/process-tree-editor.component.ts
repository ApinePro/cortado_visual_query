

import {
  Component, OnInit, ViewChild, AfterViewInit, ElementRef, HostListener, isDevMode, Inject, Renderer2,
} from '@angular/core';

import {
  trigger, state, style, animate, transition
} from '@angular/animations';

import {ComponentContainer} from 'golden-layout';
import * as d3 from 'd3';

import * as constants from './constants_tree_d3';

import Swal from 'sweetalert2';
import {SharedDataService} from '../../services/sharedDataService/shared-data.service';
import {ActivateTooltipsService} from '../../services/activateTooltipsService/activate-tooltips.service';
import {LayoutChangeDirective} from '../../directives/layout-change.directive';
import {ColorMapService} from '../../services/colorMapService/color-map.service';
import {ImageExportService} from '../../services/imageExportService/image-export-service';
import {flextree} from 'd3-flextree';

declare var $;
import {ProcessTree, ProcessTreeSyntaxInfo, checkSyntax} from '../../objects/ProcessTree';
import {textColorForBackgroundColor} from '../variant-explorer/helper_functions';
import {DropzoneConfig} from '../drop-zone/drop-zone.component';


@Component({
  selector: 'app-process-tree-editor',
  templateUrl: './process-tree-editor.component.html',
  styleUrls: ['./process-tree-editor.component.scss'],
  animations : [
                trigger('collapseText', [
                  transition(':enter', [
                    style({ opacity : '0',  transform: 'translateX(-30px)'}),
                    animate('150ms 0ms ease-in', style({ opacity : '1', transform: 'translateX(0)'})),
                  ]),
                  transition(':leave', [
                    animate('150ms 00ms ease-in', style({ opacity : '0', transform: 'translateX(-30px)'}))
                  ])
                ])
              ],
})
export class ProcessTreeEditorComponent extends LayoutChangeDirective implements OnInit, AfterViewInit {

  constructor(private sharedDataService: SharedDataService,
              private activateTooltipsService: ActivateTooltipsService,
              private colorMapService: ColorMapService,
              private imageExportService: ImageExportService,
              @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken) private container: ComponentContainer,
              elRef: ElementRef,
              private renderer: Renderer2) {

    super(elRef.nativeElement, renderer);
    const state = this.container.initialState;
  }

  @ViewChild('d3svg') svgElem: ElementRef;
  @ViewChild('d3container') d3ContainerElem: ElementRef;

  currentlyDisplayedTreeInEditor;

  // used in dropdown search form
  searchText: string;

  processTreeSyntaxInfo: ProcessTreeSyntaxInfo = undefined;

  resizeTimer;

  svg;
  mainSvgGroup;
  nodeEnter;

  collapse : boolean = false;

  selectNodeActive = false;
  selectSubtreeActive = true;

  selectedRootNode;
  // indicates if the entire subtree below the selectedRootNode is selected or only the single node
  selectedRootNodeOnly: boolean;

  previousTreeObjects: d3.HierarchyNode<any>[] = [];
  currentIdxPreviousTreeObjects = 0;

  insertPositionLeftRightDisabled = false;
  insertPositionAboveDisabled = false;

  root: d3.HierarchyNode<any>;
  activitiesOccurringInLog: string[];

  nodeWidthCache = new Map<string, number>();

  // Inserting node functionality
  selectedMethod: Function = this.insertNewNodeBelow;
  lastSelectedInsertMethod: Function = this.insertNewNodeBelow;

  activityColorMap: Map<string, string>;
  processEditorOutOfFocus  : boolean = false;

  dropZoneConfig : DropzoneConfig;

  ngOnInit(): void {

    this.dropZoneConfig = new DropzoneConfig(
      ".ptml",
      "false",
      "false",
      "<large> Import <strong>Process Tree</strong> .ptml file</large>"
    )

    this.colorMapService.colorMap$.subscribe(colorMap => {
      this.activityColorMap = colorMap;
    });

    this.sharedDataService.currentDisplayedProcessTree$.subscribe(res => {
      console.log('new tree received in processTreeEditor');

      // If the tree was loaded via the process tree import or Drag&Drop that does not contain the current activites



      if (res && this.root !== res && this.currentlyDisplayedTreeInEditor !== res) {

        if(this.checkForLoadedTreeIntegrity(res).size > 0){

          const unknownActivities = Array.from(this.checkForLoadedTreeIntegrity(res));
          this.computeLeafNodeWidth(unknownActivities)

          Swal.fire({
            title:'<tspan class = "text-warning">Imported process tree contains unkown activites</tspan>',
            html: '<b>Error Message: </b><br>' +
                  '<code> The newly loaded tree contains activities \
                  that do not appear in the currently loaded log.\
                  This prevents Cortado from properly working with this tree\
                  </code> <br> <br> Unknown Activites: ' +
                  '<tspan class = "text-danger">' +
                  unknownActivities.join(", ") +
                  '</tspan>',
            icon: 'warning',
            showCloseButton: false,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'close'
          });
        }

        this.root = d3.hierarchy(res, (d) => {
          // @ts-ignore
          return d.children;
        });
        console.warn('update tree triggered by service');
        this.selectedRootNode = null;
        this.selectedRootNodeOnly = false;
        this.update(this.root, true);
      }
    });

    this.sharedDataService.activitiesInEventLog$.subscribe(activities => {
      this.activitiesOccurringInLog = Array.from(Object.keys(activities));
    });

  }

  // Checks if a newly loaded tree contains an unknown activity
  checkForLoadedTreeIntegrity(tree) : Set<string>{
    let unknownActivities = new Set<string>();
      for (let subtree of tree.children){

        // If it is a operator, recurse on the children
        if(!subtree.label){
          unknownActivities = new Set<string>([...unknownActivities, ...this.checkForLoadedTreeIntegrity(subtree)]);

        // If it is a leaf with unkown label add it to the set
        } else if (!(this.activitiesOccurringInLog.indexOf(subtree.label) > -1 || subtree.label === '\u03C4')){
          unknownActivities.add(subtree.label);

        // Else continue
        } else {
          continue;
        }
      }

    return unknownActivities;

  }

  ngAfterViewInit(): void {
    this.activateTooltipsService.enable();
    this.initializeSvg();

    // Calculate the initial Node width
    this.computeLeafNodeWidth(this.activitiesOccurringInLog);

    // Update the cached values if the activities change
    this.sharedDataService.activitiesInEventLog$.subscribe(activities => {
      this.computeLeafNodeWidth(Array.from(Object.keys(activities)));
    });

    // TODO find a global solution to this problem - close/disable tooltips when a dropdown is open
    // enable/disable+close all tooltips on closing/opening a dropdown
    $('.dropDownParent').on('show.bs.dropdown', function () {
      this.activateTooltipsService.close();
      this.activateTooltipsService.disable();
    }.bind(this));
    $('.dropDownParent').on('hide.bs.dropdown', function () {
      this.activateTooltipsService.enable();
    }.bind(this));

    // do not close the insert new node dropdown menu
    $(document).on('click', '#positionMethodSelection', function (e) {
      // console.log(e);
      e.stopPropagation();
    });

  }


  saveTreeInSharedDataService(): void {
    console.warn(this.currentlyDisplayedTreeInEditor);
    this.sharedDataService.currentDisplayedProcessTree = this.currentlyDisplayedTreeInEditor;
  }

  getProcessTreeObject(d3Node: d3.HierarchyNode<any>): ProcessTree {
    if (d3Node && 'data' in d3Node) {
      let currentNodeFrozen = false;
      if (d3Node.data.frozen && d3Node.data.frozen === true) {
        currentNodeFrozen = true;
      }
      const tree = {label: d3Node.data.label, operator: d3Node.data.operator, children: [], frozen: currentNodeFrozen};
      if (d3Node.children) {
        d3Node.children.forEach(c => {
          tree.children.push(this.getProcessTreeObject(c));
        });
      }
      return tree;
    } else {
      return null;
    }
  }

  addNewNodePreCheck(): void {
    this.selectedMethod = this.lastSelectedInsertMethod;
    if (this.selectedRootNode) {
      if (!this.selectedRootNode.parent) {
        this.insertPositionLeftRightDisabled = true;
      } else {
        this.insertPositionLeftRightDisabled = false;
      }
    }
    if (this.selectedRootNode === this.root) {
      this.insertPositionAboveDisabled = false;
    } else {
      this.insertPositionAboveDisabled = true;
    }
  }


  handleResponsiveChange(left: number, top: number, width: number, height: number) : void{
    if (width < 970){
      this.collapse = true;
    } else {
      this.collapse = false;
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(): void {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(function () {
      console.log('replot svg');
      // resizing has potentially "stopped", i.e., user has not resized window since last 250ms
      this.update(this.root);
    }.bind(this), 250);
  }

  insertNewNodeButtonDisabled(): boolean {
    return (!this.singleNodeSelected() || !this.selectedRootNode) && this.root !== null && this.root !== undefined;
  }


  selectNode(): void {
    this.clearSelection();
    this.selectNodeActive = true;
    this.selectSubtreeActive = false;
  }

  selectSubtree(): void {
    this.clearSelection();
    this.selectNodeActive = false;
    this.selectSubtreeActive = true;
  }


  singleNodeSelected(): boolean {
    return this.selectedRootNode && this.selectedRootNodeOnly;
  }

  leafNodeSelected(): boolean {
    return this.selectedRootNode && !this.selectedRootNode.children;
  }

  rootNodeSelected(): boolean {
    return this.selectedRootNode && this.selectedRootNode.depth === 0;
  }

  buttonManipulatingMultipleNodesDisabled(): boolean {
    return !this.selectedRootNode || this.rootNodeSelected() || this.selectNodeActive && !this.leafNodeSelected();
  }

  buttonDeleteSubtreeDisabled(): boolean {
    return !this.selectedRootNode || this.selectNodeActive && !this.leafNodeSelected();
  }

  buttonFreezeSubtreeDisabled(): boolean {
    return !this.selectedRootNode || this.leafNodeSelected();
  }

  shiftSubtreeToLeft(): void {
    if (this.selectedRootNode.parent) {
      const idxInParentChildList = this.selectedRootNode.parent.children.indexOf(this.selectedRootNode);
      if (idxInParentChildList > 0) {
        const childToRight = this.selectedRootNode.parent.children[idxInParentChildList - 1];
        const childToLeft = this.selectedRootNode.parent.children[idxInParentChildList];
        this.selectedRootNode.parent.children[idxInParentChildList] = childToRight;
        this.selectedRootNode.parent.children[idxInParentChildList - 1] = childToLeft;
        this.update(this.root, true);
      }
    }
  }

  shiftSubtreeToRight(): void {
    if (this.selectedRootNode.parent) {
      const idxInParentChildList = this.selectedRootNode.parent.children.indexOf(this.selectedRootNode);
      if (idxInParentChildList < this.selectedRootNode.parent.children.length - 1) {
        const childToRight = this.selectedRootNode.parent.children[idxInParentChildList];
        const childToLeft = this.selectedRootNode.parent.children[idxInParentChildList + 1];
        this.selectedRootNode.parent.children[idxInParentChildList + 1] = childToRight;
        this.selectedRootNode.parent.children[idxInParentChildList] = childToLeft;
        this.update(this.root, true);
      }
    }
  }


  cacheCurrentTree(): void {
    // console.log('cacheCurrentTree()');
    if (this.currentIdxPreviousTreeObjects < this.previousTreeObjects.length - 1) {
      // before change, undo was pressed --> remove newer versions since older version of process tree was changed
      this.previousTreeObjects = this.previousTreeObjects.slice(0, this.currentIdxPreviousTreeObjects + 1);
    }
    if (this.root) {
      this.previousTreeObjects.push(this.root.copy());
    } else {
      this.previousTreeObjects.push(null);
    }
    if (this.currentIdxPreviousTreeObjects) {
      this.currentIdxPreviousTreeObjects += 1;
    } else {
      this.currentIdxPreviousTreeObjects = this.previousTreeObjects.length - 1;
    }
    // console.log(this.previousTreeObjects);
    if (this.root) {
      this.root.each(node => {
        node.data = JSON.parse(JSON.stringify(node.data));
      });
    }
  }

  undo(): void {
    if (this.currentIdxPreviousTreeObjects && this.currentIdxPreviousTreeObjects > 0 && this.previousTreeObjects.length > 1) {
      this.currentIdxPreviousTreeObjects--;
      let treeToLoad = this.previousTreeObjects[this.currentIdxPreviousTreeObjects];
      // console.log(treeToLoad);
      if (treeToLoad) {
        treeToLoad = treeToLoad.copy();
        treeToLoad.each(node => {
          node.data = JSON.parse(JSON.stringify(node.data));
        });
      }
      this.root = treeToLoad;
      this.update(this.root);
    }
  }

  redo(): void {
    // console.warn(this.previousTreeObjects);
    // console.warn(this.currentIdxPreviousTreeObjects);
    if (this.currentIdxPreviousTreeObjects < this.previousTreeObjects.length - 1) {
      this.currentIdxPreviousTreeObjects++;
      let treeToLoad = this.previousTreeObjects[this.currentIdxPreviousTreeObjects];
      console.log(treeToLoad);
      if (treeToLoad) {
        treeToLoad = treeToLoad.copy();
        treeToLoad.each(node => {
          node.data = JSON.parse(JSON.stringify(node.data));
        });
      }
      this.root = treeToLoad;
      this.update(this.root);
    }
  }


  horizontallyCenterTree(): void {
    this.mainSvgGroup.attr('transform', 'translate(' + (this.d3ContainerElem.nativeElement.offsetWidth / 2) + ',0)');
  }

  update(root, cacheTree: boolean = false): void {
    // console.log('update()');
    if (cacheTree) {
      this.cacheCurrentTree();
    }
    if (root) {
      this.currentlyDisplayedTreeInEditor = this.getProcessTreeObject(root);
      this.processTreeSyntaxInfo = checkSyntax(this.getProcessTreeObject(root));
      this.sharedDataService.correctTreeSyntax = this.processTreeSyntaxInfo.correctSyntax;
      // console.log(this.processTreeSyntaxInfo);
      this.saveTreeInSharedDataService();
      // console.log(root.descendants());
      // console.log(root.links());

      this.calculateTreeLayout(root);
      // add node groups that contain a rectangle and text
      const activityColorMap = this.activityColorMap;
      const node = this.mainSvgGroup.selectAll('g').data(root.descendants(), function (d) {
        return d.data.id;
      });
      // remove nodes
      node.exit().transition().duration(50).remove();
      // add node groups
      this.nodeEnter = node.enter().append('g')
        .attr('id', function (d) {
          // @ts-ignore
          return d.data.id;
        })
        .attr('data-bs-toggle', d => d.data.performance ? 'popover' : 'tooltip')
        .attr('data-bs-placement', 'top')
        .attr('data-bs-title', d => d.data.label)
        .attr('data-bs-html', true)
        .attr('data-bs-template', '<div class="tooltip"role="tooltip"><div class="tooltip-arrow"> </div><div class="tooltip-inner"></div></div>');


      // add nodes
      this.nodeEnter.append('rect')
        .classed('node', true)
        .attr('rx', constants.tree_corner_radius)
        .attr("ry", constants.tree_corner_radius)
        .attr('stroke', constants.tree_stroke_color)
        .attr('stroke-width', constants.tree_stroke_width)
        .merge(node.select('.node'))
        .classed('node-operator', function (d: any) {
          return d.data.operator !== null;
        })
        .classed('frozen-node-operator', function (d: any) {
          return d.data.operator !== null && d.data.frozen === true;
        })
        .classed('node-visible-activity', function (d: any) {
          return d.data.label !== null && d.data.label !== '\u03C4';
        })
        .classed('frozen-node-visible-activity', function (d: any) {
          return d.data.label !== null && d.data.label !== '\u03C4' && d.data.frozen === true;
        })
        .attr('fill', function (d: any) {
          if(d.data.operator !== null) return constants.node_operator_color;
          if(d.data.label !== null && d.data.label === '\u03C4') return constants.node_non_visible_activity_color;
          const isVisibleActivity = d.data.label !== null && d.data.label !== '\u03C4';
          return isVisibleActivity ? activityColorMap.get(d.data.label) || constants.node_visible_activity_color : null;
        })
        .classed('node-invisible-activity', (d: any) => {
          return d.data.label === '\u03C4';
        })
        .classed('frozen-node-invisible-activity', (d: any) => {
          return d.data.label === '\u03C4' && d.data.frozen === true;
        })
        .attr('width', constants.tree_node_height_width)
        .attr('height', constants.tree_node_height_width)
        .attr('font-size', (d: any) => {
          if(d.data.label === '\u03C4') return constants.node_invisible_font_size;
          return "";
        })
        .attr('x', function (d: any) {
          return d.x - constants.tree_node_height_width / 2;
        })
        .attr('y', function (d: any) {
          return d.y;
        });
      // add node text
      this.nodeEnter.append('text')
        .classed('user-select-none', true)
        .classed('node-text', true)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .merge(node.select('text'))
        .attr('fill', (d) => {
          if (d.data.frozen) {
            return 'white';
          }
          const isVisibleActivity = d.data.label !== null && d.data.label !== '\u03C4';
          return isVisibleActivity ? textColorForBackgroundColor(activityColorMap.get(d.data.label) || constants.node_visible_activity_color) : 'white';
        })
        .attr('font-size', (d: any) => {
          if (d.data.operator) {
            return constants.node_operator_font_size;
          }
          return constants.node_visible_font_size;
        })
        .text(function (d: any) {
          if (d.data.operator) {
            return d.data.operator;
          }
          if (d.data.label) {
            // shorten text if it is too long
            if (d.data.label.length <= 20) {
              return d.data.label;
            } else {
              return d.data.label.substring(0, 20) + '...';
            }
          }
        })
        .attr('x', function (d: any) {
          return d.x;
        })
        .attr('y', function (d: any) {
          return d.y + constants.tree_node_height_width / 2 + 3;
        });

      const edges = this.mainSvgGroup.selectAll('line')
        .data(root.links());
      // remove old edges
      edges.exit().remove();
      // add edges
      edges.enter()
        .append('line').attr('class', 'link')
        .merge(edges)
        // .transition()
        .attr('x1', function (d: any) {
          return d.source.x;
        })
        .attr('y1', function (d: any) {
          return d.source.y + constants.tree_node_height_width;
        })
        .attr('x2', function (d: any) {
          return d.target.x;
        })
        .attr('y2', function (d: any) {
          return d.target.y;
        })
        .attr('stroke', constants.tree_stroke_color)
        .classed("selected-edge", (d) => {d.source.data.selected})
        .classed("frozen-edge", (d) => {d.source.data.frozen});

      // resize leaf nodes if text is too long
      this.nodeEnter
        .merge(node)
        .select('.node-visible-activity')
        .attr('x', function (d) {
          return d.x - Math.max(constants.tree_node_height_width, this.nextSibling.getComputedTextLength() + 10) / 2;
        }).attr('width', function () {
        // console.log(Math.max(constants.tree_node_height_width, this.nextSibling.getComputedTextLength() + 10));
        return Math.max(constants.tree_node_height_width, this.nextSibling.getComputedTextLength() + 10);
      });
      this.addSelectionFunctionality();
      this.activateTooltipsService.initialize();
    } else {
      this.selectedRootNode = null;
      this.currentlyDisplayedTreeInEditor = null;
      this.processTreeSyntaxInfo = null;
      this.saveTreeInSharedDataService();
      this.mainSvgGroup.selectAll('*').remove();
    }
  }

  deleteSubtree(): void {
    this.activateTooltipsService.close();
    if (this.root === this.selectedRootNode) {
      this.root = null;
      this.update(null, true);
    } else {
      // console.log(this.selectedRootNode);
      this.deleteNodeAndChildren(this.root, this.selectedRootNode);
      // console.log(this.root)
      this.update(this.root, true);
      this.selectedRootNode = null;
    }
    this.selectedRootNode = null;
  }

  deleteNodeAndChildren(tree, nodeToDelete): void {
    if (tree.children) {
      tree.children = tree.children.filter(c => c !== nodeToDelete);
      if (tree.children.length === 0) {
        delete tree.children;
      }
      if (tree.children) {
        tree.children.forEach(c => {
          this.deleteNodeAndChildren(c, nodeToDelete);
        });
      }
    }
  }

  changeSelectedNode(operator, label): void {
    // console.log(this.selectedRootNode);
    // console.log(operator, label);
    if (operator) {
      // console.log('change operator');
      this.selectedRootNode.data.operator = operator;
      this.selectedRootNode.data.label = null;
    } else if (label) {
      console.log('change label');
      this.selectedRootNode.data.label = label;
      this.selectedRootNode.data.operator = null;
    }
    this.afterInsertNode();
  }

  insertNewNode(operator, label): void {
    if (this.root) {
      this.selectedMethod(operator, label);
    } else {
      // empty tree - just add a single node
      const newNode = this.createNode(operator, label);
      newNode.parent = null;
      // @ts-ignore
      newNode.height = 0;
      newNode.children = null;
      this.root = newNode;
      this.afterInsertNode();
    }
  }

  insertNewNodeLeft(operator, label): void {
    const newNode = this.createNode(operator, label);
    // @ts-ignore
    newNode.depth = this.selectedRootNode.depth;
    newNode.parent = this.selectedRootNode.parent;
    // @ts-ignore
    newNode.height = this.selectedRootNode.height;
    newNode.children = null;
    // console.log(newNode);

    if (this.selectedRootNode.parent) {
      const idx: number = this.selectedRootNode.parent.children.indexOf(this.selectedRootNode);
      this.selectedRootNode.parent.children.splice(idx, 0, newNode);
    }
    this.afterInsertNode();
  }

  insertNewNodeAbove(operator, label): void {
    console.log(this.selectedRootNode);
    const newNode = this.createNode(operator, label);
    // @ts-ignore
    newNode.depth = 0;
    newNode.parent = null;
    // @ts-ignore
    newNode.height = this.selectedRootNode.height + 1;
    newNode.children = [this.selectedRootNode];
    // console.log(newNode);
    this.selectedRootNode.parent = newNode;
    this.root = newNode;
    this.updateDepthAttributeOfNode(this.selectedRootNode);
    this.afterInsertNode();
  }


  insertNewNodeBelow(operator, label): void {

    const newNode = this.createNode(operator, label);
    // @ts-ignore
    newNode.depth = this.selectedRootNode.depth + 1;
    newNode.children = null;
    newNode.parent = this.selectedRootNode;
    // @ts-ignore
    newNode.height = 0;
    // console.log(newNode);

    if (this.selectedRootNode.children) {
      this.selectedRootNode.children.push(newNode);
    } else {
      this.selectedRootNode.children = [newNode];
    }
    this.updateHeightAttributeOfNode(this.selectedRootNode);
    this.afterInsertNode();
  }

  updateHeightAttributeOfNode(node): void {
    node.height += 1;
    if (node.parent) {
      this.updateHeightAttributeOfNode(node.parent);
    }
  }

  updateDepthAttributeOfNode(node): void {
    console.log(node);
    node.depth += 1;
    if (node.children) {
      node.children.forEach(n => {
        this.updateDepthAttributeOfNode(n);
      });
    }
  }

  insertNewNodeRight(operator, label): void {
    const newNode = this.createNode(operator, label);
    // @ts-ignore
    newNode.depth = this.selectedRootNode.depth;
    newNode.parent = this.selectedRootNode.parent;
    // @ts-ignore
    newNode.height = this.selectedRootNode.height;
    newNode.children = null;
    console.log(newNode);

    if (this.selectedRootNode.parent) {
      const idx: number = this.selectedRootNode.parent.children.indexOf(this.selectedRootNode);
      this.selectedRootNode.parent.children.splice(idx + 1, 0, newNode);
    }
    this.afterInsertNode();
  }

  afterInsertNode(): void {
    this.update(this.root, true);
    this.selectedRootNode = null;
    this.selectedRootNodeOnly = false;
    this.clearSelection();
    this.searchText = undefined;
  }

  createNode(operator, label): d3.HierarchyNode<any> {
    // TODO make sure that IDs are unique!!!
    const nodeData = {
      operator,
      label,
      id: Math.floor(1000000000 + Math.random() * 900000000),
      children: []
    };
    return d3.hierarchy(nodeData);
  }

  // END - Inserting node functionality


  calculateTreeLayout(root): void {
    if (root) {
      const treeLayout = d3.tree();
      const flextreeLayout = flextree();

      flextreeLayout.nodeSize(node => {

        if (node.data.operator || node.data.label === '\u03C4') {
          return [constants.tree_node_height_width, 2 * constants.tree_node_height_width];
        }

        return [this.nodeWidthCache[node.data.label], 2 * constants.tree_node_height_width];

      })

      // Specifies the spacing between two nodes
      flextreeLayout.spacing((nodeA, nodeB) => {
        return (nodeA.parent === nodeB.parent ? constants.nodeSpacing : 2 * constants.nodeSpacing)
      });

      // calculate layout
      flextreeLayout(root);

    }
  }


  computeLeafNodeWidth(nodeActivityLabels: string[]): void {
    const dummy_select = d3.select(this.svgElem.nativeElement)
                           .append('text')
                           .attr('font-size', '12px')

    for(let nodeActivityLabel of nodeActivityLabels){

      // Compute the width by rendering a dummy node
      dummy_select.text(function (d: any) {
        if (nodeActivityLabel.length <= 20) {
          return nodeActivityLabel;
        } else {
          return nodeActivityLabel.substring(0, 20) + '...';
        }
      })

      // Retrieve the computed width
      let rendered_width = dummy_select.node().getComputedTextLength();

      // Compute the true node width as specified above
      rendered_width = Math.max(rendered_width + 10, constants.tree_node_height_width);

      // Add to Cache
      this.nodeWidthCache[nodeActivityLabel] = rendered_width
    }

    // Delete the Dummy
    dummy_select.remove();

  }

  addZoomFunctionality(): void {
    this.mainSvgGroup.attr('transform', 'translate(' + (this.d3ContainerElem.nativeElement.offsetWidth / 2) + ',0)');
    const zooming = function (event) {
      // .translate((this.d3ContainerElem.nativeElement.offsetWidth / 2), 0) is needed to center the tree
      // otherwise center is at (0,0)
      // console.log(event)
      this.mainSvgGroup.attr('transform',
        event.transform.translate((this.d3ContainerElem.nativeElement.offsetWidth / 2), 0));
    }.bind(this);

    const zoom: any = d3.zoom().scaleExtent([0.1, 3]).on('zoom', zooming);
    this.svg.call(zoom).on('dblclick.zoom', null);

    // reset zoom
    d3.select('#btn-reset-zoom').on('click', function () {
      this.svg.transition()
        .duration(250)
        .ease(d3.easeExpInOut)
        .call(zoom.transform, d3.zoomIdentity);
    }.bind(this));
  }

  addSelectionFunctionality(): void {
    this.nodeEnter.on('click',
      function (event, d) {
        // console.log(this)
        // console.log(event);
        // console.log(d);
        unselectAll();
        setSelectedRootNode(d);
        selectSubtree(this, d);
        selectEdges();
      }
    );

    const setSelectedRootNode = function (d) {
      this.selectedRootNode = d;
      this.selectedRootNodeOnly = this.selectNodeActive || this.leafNodeSelected();
    }.bind(this);

    const selectSubtree = function (svgGroup, d) {
      d3.select(svgGroup).select('.node')
        .classed("selected-node", () => {return !(d3.select(svgGroup).select('.node').classed("selected-node"))});

      d.data.selected = true;
      if (!this.selectSubtreeActive || !d.children) {
        return;
      }

      // add red stroke around sub-nodes if select subtree is selected
      d.children.forEach(c => {
          // console.log(c)
          // console.log(this.mainSvgGroup.select('[id="' + c.data.id + '"]').node())
          selectSubtree(this.mainSvgGroup.select('[id="' + c.data.id + '"]').node(), c);
        }
      );
      // console.log(this.selectedRootNode);
      // console.log(this.singleNodeSelected());
    }.bind(this);

    const selectEdges = function () {
      if (!this.selectSubtreeActive) {
        return;
      }
      this.mainSvgGroup.selectAll('line')
                       .classed("frozen-edge", (e) => {return e.source.data.frozen})
                       .classed("selected-edge", (e) => {return e.source.data.selected});
    }.bind(this);

    const unselectAll = function () {
      this.clearSelection();
    }.bind(this);
  }

  freezeSubtree(): void {
    const markNodeAsFrozen = (node) => {
      node.data.frozen = true;
      if (node.children) {
        node.children.forEach(child => {
          markNodeAsFrozen(child);
        });
      }
    };
    const markNodeAsNonFrozen = (node) => {
      node.data.frozen = false;
      if (node.parent && node.parent.data.frozen) {
        markNodeAsNonFrozen(node.parent);
        return;
      }
      if (node.children) {
        node.children.forEach(child => {
          markNodeAsNonFrozen(child);
        });
      }
    };
    if (!this.selectedRootNode.data.frozen) {
      markNodeAsFrozen(this.selectedRootNode);
    } else {
      markNodeAsNonFrozen(this.selectedRootNode);
    }

    this.clearSelection();
    this.activateTooltipsService.close();
    this.update(this.root, false);
  }

  clearSelection(): void {
    // console.log("clear selection")
    this.selectedRootNode = null;
    this.mainSvgGroup.selectAll('rect').attr('stroke', constants.nonSelectedTreeNodeStrokeColor);
    this.mainSvgGroup.selectAll('rect').each((d) => {
      d.data.selected = false;
    });
    this.mainSvgGroup.selectAll('rect').classed('selected-node', false);
    this.mainSvgGroup.selectAll('line').classed('selected-edge', false);
    this.mainSvgGroup.selectAll('line').classed('frozen-edge', (d) => {return d.source.data.frozen && d.source.data.frozen})
    }

  initializeSvg(): void {
    // console.log("plot")
    // console.log(this.d3ContainerElem.nativeElement.offsetWidth)
    // console.log(this.d3ContainerElem.nativeElement.offsetHeight)
    // console.log(root)
    this.svg = d3.select('#d3-svg');
    // add svg group for zooming
    this.mainSvgGroup = this.svg.append('g').attr('id', 'zoomGroup');
    // this.update(root);
    this.horizontallyCenterTree();
    this.addZoomFunctionality();
  }

  exportCurrentTree(svg : SVGGraphicsElement): void{
    // Copy the current tree
    const tree_copy = svg.cloneNode(true) as SVGGraphicsElement;
    const svgBBox = (d3.select("#zoomGroup").node() as SVGGraphicsElement).getBBox();

    // Strip all the classed information
    const tree = d3.select(tree_copy);
    tree.selectAll("rect").classed(".selected-node", false)
                          .classed(".frozen-node", false);
    tree.selectAll("line").classed(".selected-edge", false)
                          .classed(".frozen-edge", false);

    tree.selectAll("g").attr('data-bs-toggle', 'none')
                       .attr('data-bs-placement', 'none')
                       .attr('data-bs-title', 'none')
                       .attr('data-bs-html', 'none')
                       .attr('data-bs-template', 'none');

    const shiftbyXOffset = (node , offset, attrKey)=>{
      return parseFloat(node.getAttribute(attrKey)) + offset
    }

    // Recenter the tree and reset scaling
    let xCords : number[] = [];
    tree.selectAll("rect").each( function(this : SVGGraphicsElement) {xCords.push(parseFloat(this.getAttribute("x")))});

    const xLower = Math.min(...xCords);
    const xOffset = Math.abs(xLower) + constants.export_offset;

    tree.selectAll("rect").attr("x", function(this : SVGGraphicsElement) {return shiftbyXOffset(this, xOffset, "x")});
    tree.selectAll("text").attr("x", function(this : SVGGraphicsElement) {return shiftbyXOffset(this, xOffset, "x")});
    tree.selectAll("line").attr("x1", function(this : SVGGraphicsElement) {return shiftbyXOffset(this, xOffset, "x1")})
                          .attr("x2", function(this : SVGGraphicsElement) {return shiftbyXOffset(this, xOffset, "x2")});

    tree.selectChild().attr("transform", `translate(0, ${constants.export_offset})`)

    // Export the tree
    this.imageExportService.export("process_tree",  svgBBox.width + 2*constants.export_offset, svgBBox.height + constants.export_offset, tree_copy);

  }

  toggleBlur(event){
    this.processEditorOutOfFocus = event;
  }

}

// TODO should be solved differently
// tslint:disable-next-line:no-namespace
export namespace ProcessTreeEditorComponent {
  export const componentName = "ProcessTreeEditorComponent";
}
