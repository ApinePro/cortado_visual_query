import {
  Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewEncapsulation, HostListener, isDevMode
} from '@angular/core';
import * as d3 from 'd3';
import * as constants from './constants_tree_d3';
import {SharedDataService} from '../../services/sharedDataService/shared-data.service';
import {ActivateTooltipsService} from '../../services/activateTooltipsService/activate-tooltips.service';
import {BackendService} from '../../services/backendService/backend.service';

declare var $;
import * as dummyBackendResponse from './dummy_backend_data.js';
import {ProcessTree, ProcessTreeSyntaxInfo, checkSyntax} from '../../objects/ProcessTree';

@Component({
  selector: 'app-process-tree-editor',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './process-tree-editor.component.html',
  styleUrls: ['./process-tree-editor.component.css']
})
export class ProcessTreeEditorComponent implements OnInit, AfterViewInit {

  constructor(private sharedDataService: SharedDataService,
              private activateTooltipsService: ActivateTooltipsService,
              private backendService: BackendService) {
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

  selectNodeActive = false;
  selectSubtreeActive = true;

  selectedRootNode;

  previousTreeObjects: d3.HierarchyNode<any>[] = [];
  currentIdxPreviousTreeObjects = 0;

  insertPositionLeftRightDisabled = false;

  root: d3.HierarchyNode<any>;
  activitiesOccurringInLog: string[] = [];

  // Inserting node functionality
  selectedMethod: Function = this.insertNewNodeRight;
  lastSelectedInsertMethod: Function = this.insertNewNodeRight;

  ngOnInit(): void {
    this.sharedDataService.currentDisplayedProcessTree$.subscribe(res => {
      console.log('new tree received in processTreeEditor');
      // console.log(res);
      // console.log(this.currentlyDisplayedTreeInEditor);
      // console.log(res != this.currentlyDisplayedTreeInEditor);
      if (res && this.root != res && this.currentlyDisplayedTreeInEditor != res) {
        this.root = d3.hierarchy(res, (d) => {
          // @ts-ignore
          return d.children;
        });
        // this.cacheCurrentTree();
        console.warn('update tree triggered by service');
        this.update(this.root, true);
      }
    });
    this.sharedDataService.activitiesInEventLog$.subscribe(activities => {
      this.activitiesOccurringInLog = Array.from(activities);
    });
  }

  ngAfterViewInit(): void {
    this.initializeSvg();
    if (isDevMode()) {
      //this.sharedDataService.currentDisplayedProcessTree = dummyBackendResponse.tree;
    }
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
    $(document).on('click', '#dropdownNewNode', function (e) {
      console.log(e);
      e.stopPropagation();
    });
  }

  saveTreeInSharedDataService(): void {
    this.sharedDataService.currentDisplayedProcessTree = this.currentlyDisplayedTreeInEditor;
  }

  getProcessTreeObject(d3Node: d3.HierarchyNode<any>): ProcessTree {
    if (d3Node && 'data' in d3Node) {
      const tree = {label: d3Node.data.label, operator: d3Node.data.operator, children: []};
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
    return !this.selectedRootNode || (this.selectSubtreeActive && !this.singleNodeSelected());
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
    return this.selectedRootNode && this.selectedRootNode.height === 0;
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

  shiftSubtreeToLeft(): void {
    if (this.selectedRootNode.parent) {
      const idxInParentChildList = this.selectedRootNode.parent.children.indexOf(this.selectedRootNode);
      if (idxInParentChildList > 0) {
        const childToRight = this.selectedRootNode.parent.children[idxInParentChildList - 1];
        const childToLeft = this.selectedRootNode.parent.children[idxInParentChildList];
        this.selectedRootNode.parent.children[idxInParentChildList] = childToRight;
        this.selectedRootNode.parent.children[idxInParentChildList - 1] = childToLeft;
        this.update(this.root, true);
        // this.cacheCurrentTree();
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
        // this.cacheCurrentTree();
      }
    }
  }


  cacheCurrentTree(): void {
    // console.log('cacheCurrentTree()');
    if (this.currentIdxPreviousTreeObjects < this.previousTreeObjects.length - 1) {
      // before change, undo was pressed --> remove newer versions since older version of process tree was changed
      this.previousTreeObjects = this.previousTreeObjects.slice(0, this.currentIdxPreviousTreeObjects + 1);
    }
    this.previousTreeObjects.push(this.root.copy());
    if (this.currentIdxPreviousTreeObjects) {
      this.currentIdxPreviousTreeObjects += 1;
    } else {
      this.currentIdxPreviousTreeObjects = this.previousTreeObjects.length - 1;
    }
    // console.log(this.previousTreeObjects);
    this.root.each(node => {
      node.data = JSON.parse(JSON.stringify(node.data));
    });
  }

  undo(): void {
    if (this.currentIdxPreviousTreeObjects && this.currentIdxPreviousTreeObjects > 0 && this.previousTreeObjects.length > 1) {
      this.currentIdxPreviousTreeObjects--;
      let treeToLoad = this.previousTreeObjects[this.currentIdxPreviousTreeObjects];
      // console.log(treeToLoad);
      treeToLoad = treeToLoad.copy();
      treeToLoad.each(node => {
        node.data = JSON.parse(JSON.stringify(node.data));
      });
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
      treeToLoad = treeToLoad.copy();
      treeToLoad.each(node => {
        node.data = JSON.parse(JSON.stringify(node.data));
      });
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
      // console.log(this.processTreeSyntaxInfo);
      this.saveTreeInSharedDataService();
      // console.log(root);
      // console.log(root.descendants());
      // console.log(root.links());

      this.calculateTreeLayout(root);
      // add node groups that contain a rectangle and text
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
        .attr('data-toggle', 'tooltip')
        .attr('data-placement', 'top')
        .attr('title', (d: any) => {
          return d.data.label;
        });
      // add nodes
      this.nodeEnter.append('rect')
        .classed('node', true)
        .attr('stroke', 'gray')
        .attr('stroke-width', '2')
        .merge(node.select('.node'))
        .classed('node-operator', function (d: any) {
          return d.data.operator !== null;
        })
        .classed('node-visible-activity', function (d: any) {
          return d.data.label !== null && d.data.label !== '\u03C4';
        })
        .classed('node-invisible-activity', (d: any) => {
          return d.data.label === '\u03C4';
        })
        .attr('width', constants.tree_node_height_width)
        .attr('height', constants.tree_node_height_width)
        .attr('x', function (d: any) {
          return d.x - constants.tree_node_height_width / 2;
        })
        .attr('y', function (d: any) {
          return d.y;
        });
      // add node text
      this.nodeEnter.append('text')
        .classed('user-select-none', true)
        .attr('fill', 'white')
        .classed('node-text', true)
        .merge(node.select('text'))
        .attr('font-size', (d: any) => {
          if (d.data.operator) {
            return '1.5em';
          }
          return '12px';
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
        .attr('stroke', 'gray');

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
    }
  }

  deleteSubtree(): void {
    // console.log(this.selectedRootNode);
    this.activateTooltipsService.close();
    this.deleteNodeAndChildren(this.root, this.selectedRootNode);
    // this.cacheCurrentTree();
    // console.log(this.root)
    this.update(this.root, true);
    this.selectedRootNode = undefined;
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
    this.clearSelection();
    this.searchText = undefined;
    // this.cacheCurrentTree();
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
      treeLayout.size([this.d3ContainerElem.nativeElement.offsetWidth,
        this.d3ContainerElem.nativeElement.offsetHeight - constants.tree_node_height_width]);
      // if nodeSize is used you cannot use fixed tree size and the root node is drawn at (0,0)
      treeLayout.nodeSize([130, 60]);
      // calculate layout
      treeLayout(root);
    }
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
        unselectAllNodes();
        setSelectedRootNode(d);
        selectSubtree(this, d);
      }
    );

    const setSelectedRootNode = function (d) {
      this.selectedRootNode = d;
    }.bind(this);

    const selectSubtree = function (svgGroup, d) {
      d3.select(svgGroup).select('.node').attr('stroke', () => {
        // add red stroke around activity nodes
        if (d3.select(svgGroup).select('.node').attr('stroke') == constants.selectedTreeNodeStrokeColor) {
          return constants.nonSelectedTreeNodeStrokeColor;
        } else {
          return constants.selectedTreeNodeStrokeColor;
        }
      });
      // add red stroke around sub-nodes if select subtree is selected
      if (d.children && this.selectSubtreeActive) {
        d.children.forEach(c => {
            // console.log(c)
            // console.log(this.mainSvgGroup.select('[id="' + c.data.id + '"]').node())
            selectSubtree(this.mainSvgGroup.select('[id="' + c.data.id + '"]').node(), c);
          }
        );
      }
      // console.log(this.selectedRootNode);
      // console.log(this.singleNodeSelected());
    }.bind(this);

    const unselectAllNodes = function () {
      this.clearSelection();
    }.bind(this);
  }

  clearSelection(): void {
    // console.log("clear selection")
    this.selectedRootNode = null;
    this.mainSvgGroup.selectAll('rect').attr('stroke', constants.nonSelectedTreeNodeStrokeColor);
  }

  initializeSvg(): void {
    // console.log("plot")
    // console.log(this.d3ContainerElem.nativeElement.offsetWidth)
    // console.log(this.d3ContainerElem.nativeElement.offsetHeight)
    // console.log(root)
    this.svg = d3.select('#d3-svg');
    // add svg group for zooming
    this.mainSvgGroup = this.svg.append('g').attr('id', 'zoomGroup');
    // this.cacheCurrentTree();
    // this.update(root);
    this.horizontallyCenterTree();
    this.addZoomFunctionality();
  }

}
