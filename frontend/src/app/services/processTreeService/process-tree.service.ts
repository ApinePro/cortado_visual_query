import { PT_Constant } from './../../constants/process_tree_drawer_constants';
import { LogService } from 'src/app/services/logService/log.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import * as d3 from 'd3';
import Swal from 'sweetalert2';
import {
  ProcessTree,
  ProcessTreeOperator,
} from 'src/app/objects/ProcessTree/ProcessTree';
@Injectable({
  providedIn: 'root',
})
export class ProcessTreeService {
  constructor(private logService: LogService) {
    console.log('Init Process Tree Service');
    this.logService.activitiesInEventLog$.subscribe((activites) => {
      this.computeLeafNodeWidth(Object.keys(activites));
    });

    this.logService.loadedEventLog$.subscribe((log) => {
      console.log('Log Changed', log);
      if (log !== 'preload') {
        this.nodeWidthCache = new Map<string, number>();
      }
    });
  }

  private _selectedRootNodeID = new BehaviorSubject<number>(null);

  get selectedRootNodeID$(): Observable<number> {
    return this._selectedRootNodeID.asObservable();
  }

  set selectedRootNodeID(node: number) {
    this._selectedRootNodeID.next(node);
  }

  get selectedRootNodeID(): number {
    return this._selectedRootNodeID.getValue();
  }

  private _nodeWidthCache = new BehaviorSubject<Map<string, number>>(
    new Map<string, number>()
  );

  get nodeWidthCache$(): Observable<Map<string, number>> {
    return this._nodeWidthCache.asObservable();
  }

  get nodeWidthCache() {
    return this._nodeWidthCache.getValue();
  }

  set nodeWidthCache(map: Map<string, number>) {
    this._nodeWidthCache.next(map);
  }

  private _correctTreeSyntax = new BehaviorSubject<boolean>(false);

  get correctTreeSyntax$(): Observable<boolean> {
    return this._correctTreeSyntax.asObservable();
  }

  set correctTreeSyntax(flag: boolean) {
    this._correctTreeSyntax.next(flag);
  }

  get correctTreeSyntax(): boolean {
    return this._correctTreeSyntax.getValue();
  }

  private _currentTreeString = new BehaviorSubject<string>('');

  get currentTreeString$(): Observable<string> {
    return this._currentTreeString.asObservable();
  }

  set currentTreeString(syntaxObj: any) {
    this._currentTreeString.next(syntaxObj);
  }

  get currentTreeString() {
    return this._currentTreeString.getValue();
  }

  private _selectionMode = new BehaviorSubject<NodeSeletionStrategy>(
    NodeSeletionStrategy.TREE
  );

  get selectionMode$(): Observable<any> {
    return this._selectionMode.asObservable();
  }

  get selectionMode(): any {
    return this._selectionMode.getValue();
  }

  set selectionMode(strategy: NodeSeletionStrategy) {
    this._selectionMode.next(strategy);
  }

  private _currentDisplayedProcessTree = new BehaviorSubject<ProcessTree>(null);

  get currentDisplayedProcessTree$(): Observable<ProcessTree> {
    return this._currentDisplayedProcessTree.asObservable();
  }

  get currentDisplayedProcessTree(): ProcessTree {
    return this._currentDisplayedProcessTree.getValue();
  }

  private _activitiesInCurrentTree = new BehaviorSubject<Set<string>>(
    new Set<string>()
  );

  public deleteActivityFromProcessTreeActivities(activityName: string): any {
    if (this.activitiesInCurrentTree) {
      this.activitiesInCurrentTree.delete(activityName);
    }
  }

  public renameActivityInProcessTree(
    activityName: string,
    newActivityName: string
  ): any {
    if (
      this.activitiesInCurrentTree &&
      this.activitiesInCurrentTree.delete(activityName)
    )
      this.activitiesInCurrentTree.add(newActivityName);

    if (this.currentDisplayedProcessTree) {
      this.currentDisplayedProcessTree = this.renameProcessTreeLeafs(
        this.currentDisplayedProcessTree,
        activityName,
        newActivityName
      );
    }
  }

  private renameProcessTreeLeafs(
    tree: ProcessTree,
    activityName: string,
    newActivityName: string
  ) {
    if (tree.label && tree.label === activityName) {
      tree.label = newActivityName;
    } else {
      tree.children.forEach((c) =>
        this.renameProcessTreeLeafs(c, activityName, newActivityName)
      );
    }

    return tree;
  }

  get activitiesInCurrentTree$(): Observable<Set<string>> {
    return this._activitiesInCurrentTree.asObservable();
  }

  get activitiesInCurrentTree(): Set<string> {
    return this._activitiesInCurrentTree.getValue();
  }

  set activitiesInCurrentTree(activities) {
    this._activitiesInCurrentTree.next(activities);
  }

  checkForLoadedTreeIntegrity(tree): Set<string> {
    let unknownActivities = new Set<string>();
    const activities = Object.keys(this.logService.activitiesInEventLog);

    for (let subtree of tree.children) {
      // If it is a operator, recurse on the children
      if (!subtree.label) {
        unknownActivities = new Set<string>([
          ...unknownActivities,
          ...this.checkForLoadedTreeIntegrity(subtree),
        ]);

        // If it is a leaf with unkown label add it to the set
      } else if (
        !(
          activities.indexOf(subtree.label) > -1 ||
          subtree.label === ProcessTreeOperator.tau
        )
      ) {
        unknownActivities.add(subtree.label);

        // Else continue
      }
    }

    return unknownActivities;
  }

  set currentDisplayedProcessTree(tree: any) {
    if (tree && !(tree instanceof ProcessTree)) {
      tree = ProcessTree.fromObj(tree);
    }

    this.activitiesInCurrentTree = this.getSetOfActivities(tree);
    this._currentDisplayedProcessTree.next(tree);

    if (this.checkForLoadedTreeIntegrity(tree).size > 0) {
      const unknownActivities = Array.from(
        this.checkForLoadedTreeIntegrity(tree)
      );
      this.computeLeafNodeWidth(unknownActivities);

      Swal.fire({
        title:
          '<tspan class = "text-warning">Current process tree contains unkown activites</tspan>',
        html:
          '<b>Error Message: </b><br>' +
          '<code> The loaded tree contains activities \
              that do not appear in the currently loaded log.\
              </code> <br> <br> Unknown Activites: ' +
          '<tspan class = "text-danger">' +
          unknownActivities.join(', ') +
          '</tspan>',
        icon: 'warning',
        showCloseButton: false,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'close',
      });
    }
  }

  public set_currentDisplayedProcessTree_with_Cache(tree: any) {
    if (tree && !(tree instanceof ProcessTree)) {
      tree = ProcessTree.fromObj(tree);
    }
    this._currentDisplayedProcessTree.next(tree);
    this.activitiesInCurrentTree = this.getSetOfActivities(tree);
    this.cacheCurrentTree(tree);
  }

  private getSetOfActivities(tree: any): Set<string> {
    if (tree) {
      let res: Set<string> = new Set();
      if (tree.children && tree.children.length > 0) {
        tree.children.forEach((c) => {
          res = new Set([...res, ...this.getSetOfActivities(c)]);
        });
      } else if (tree.label) {
        res.add(tree.label);
      }
      return res;
    } else {
      return new Set();
    }
  }

  previousTreeObjects: ProcessTree[] = [];

  private _treeCacheLength = new BehaviorSubject<number>(0);
  private _treeCacheIndex = new BehaviorSubject<number>(0);

  get treeCacheLength$(): Observable<number> {
    return this._treeCacheLength.asObservable();
  }

  set treeCacheLength(node: number) {
    this._treeCacheLength.next(node);
  }

  get treeCacheLength(): number {
    return this._treeCacheLength.getValue();
  }

  get treeCacheIndex$(): Observable<number> {
    return this._treeCacheIndex.asObservable();
  }

  set treeCacheIndex(node: number) {
    this._treeCacheIndex.next(node);
  }

  get treeCacheIndex(): number {
    return this._treeCacheIndex.getValue();
  }

  cacheCurrentTree(root: ProcessTree): void {
    if (this.treeCacheIndex < this.previousTreeObjects.length - 1) {
      // before change, undo was pressed --> remove newer versions since older version of process tree was changed
      this.previousTreeObjects = this.previousTreeObjects.slice(
        0,
        this.treeCacheIndex + 1
      );
    }

    if (root) {
      this.previousTreeObjects.push(root.copy(true));
    } else {
      this.previousTreeObjects.push(null);
    }
    if (this.treeCacheIndex) {
      this.treeCacheIndex += 1;
    } else {
      this.treeCacheIndex = this.previousTreeObjects.length - 1;
    }

    this.treeCacheLength = this.previousTreeObjects.length;
  }

  undo() {
    if (
      this.treeCacheIndex &&
      this.treeCacheIndex > 0 &&
      this.previousTreeObjects.length > 1
    ) {
      this.treeCacheIndex--;

      let treeToLoad = this.previousTreeObjects[this.treeCacheIndex];

      this.selectedRootNodeID = null;
      this.currentDisplayedProcessTree = treeToLoad;
    }
  }

  redo() {
    if (this.treeCacheIndex < this.previousTreeObjects.length - 1) {
      this.treeCacheIndex++;
      let treeToLoad = this.previousTreeObjects[this.treeCacheIndex];

      this.selectedRootNodeID = null;

      this.currentDisplayedProcessTree = treeToLoad;
    }
  }

  // TODO move somewhere else
  processTreesEqual(pt1, pt2): boolean {
    if (!pt1 || !pt2) {
      return false;
    }
    if (
      pt1['operator'] === pt2['operator'] &&
      pt1['label'] === pt2['label'] &&
      pt1['children'].length === pt2['children'].length
    ) {
      if (pt1['children'].length === 0) {
        return true;
      } else {
        let res = true;
        for (let i = 0; i < pt1['children'].length; i++) {
          res =
            res &&
            this.processTreesEqual(pt1['children'][i], pt2['children'][i]);
        }
        return res;
      }
    } else {
      return false;
    }
  }

  computeLeafNodeWidth(nodeActivityLabels: string[]): void {
    const nodeWidthCache = this.nodeWidthCache;

    const dummy_container = d3
      .select('body')
      .append('svg')
      .style('top', '0px')
      .style('left', '0px')
      .style('position', 'absolute');

    const dummy_select = dummy_container
      .append('text')
      .attr('font-size', '12px');

    for (let nodeActivityLabel of nodeActivityLabels) {
      // Compute the width by rendering a dummy node
      dummy_select.text(function (d: any) {
        if (nodeActivityLabel.length <= 20) {
          return nodeActivityLabel;
        } else {
          return nodeActivityLabel.substring(0, 20) + '...';
        }
      });

      // Retrieve the computed width
      let rendered_width = dummy_select.node().getComputedTextLength();

      // Compute the true node width as specified above
      rendered_width = Math.max(
        rendered_width + 10,
        PT_Constant.BASE_HEIGHT_WIDTH
      );

      // Add to Cache
      nodeWidthCache[nodeActivityLabel] = rendered_width;
    }

    // Delete the Dummy
    dummy_select.remove();
    dummy_container.remove();

    this.nodeWidthCache = nodeWidthCache;
  }

  freezeSubtree(node: ProcessTree) {
    const markNodeAsFrozen = (node) => {
      node.frozen = true;
      if (node.children) {
        node.children.forEach((child) => {
          markNodeAsFrozen(child);
        });
      }
    };

    const markNodeAsNonFrozen = (node) => {
      node.frozen = false;

      if (node.parent && node.parent.frozen) {
        markNodeAsNonFrozen(node.parent);
        return;
      }
      if (node.children) {
        node.children.forEach((child) => {
          markNodeAsNonFrozen(child);
        });
      }
    };

    if (!node.frozen) {
      markNodeAsFrozen(node);
    } else {
      markNodeAsNonFrozen(node);
    }

    this.currentDisplayedProcessTree = this.currentDisplayedProcessTree;
    this.selectedRootNodeID = null;
  }

  shiftSubtreeToLeft(tree: ProcessTree): void {
    this.cacheCurrentTree(this.currentDisplayedProcessTree);

    if (tree.parent) {
      const siblings = tree.parent.children;
      const idxInParentChildList = siblings.indexOf(tree);
      if (idxInParentChildList > 0) {
        const childToRight = siblings[idxInParentChildList - 1];
        const childToLeft = siblings[idxInParentChildList];
        siblings[idxInParentChildList] = childToRight;
        siblings[idxInParentChildList - 1] = childToLeft;

        this.currentDisplayedProcessTree = this.currentDisplayedProcessTree;
      }
    }
  }

  shiftSubtreeToRight(tree: ProcessTree): void {
    this.cacheCurrentTree(this.currentDisplayedProcessTree);

    if (tree.parent) {
      const siblings = tree.parent.children;
      const idxInParentChildList = siblings.indexOf(tree);
      if (idxInParentChildList < siblings.length - 1) {
        const childToRight = siblings[idxInParentChildList];
        const childToLeft = siblings[idxInParentChildList + 1];
        siblings[idxInParentChildList + 1] = childToRight;
        siblings[idxInParentChildList] = childToLeft;

        this.currentDisplayedProcessTree = this.currentDisplayedProcessTree;
      }
    }
  }

  deleteSelected(tree_to_delete: ProcessTree) {
    this.cacheCurrentTree(this.currentDisplayedProcessTree);
    const newTree = this.currentDisplayedProcessTree;

    const delete_subtree = (tree: ProcessTree, tree_to_delete: ProcessTree) => {
      if (tree === tree_to_delete) {
        console.log('Found Tree to Delete!');
        return;
      } else {
        if (tree.children) {
          let child_list: Array<ProcessTree> = [];

          for (let child of tree.children) {
            let res = delete_subtree(child, tree_to_delete);

            if (res) {
              child_list.push(res);
            }
          }

          tree.children = child_list;
        }
      }

      return tree;
    };

    if (this.currentDisplayedProcessTree === tree_to_delete) {
      this.set_currentDisplayedProcessTree_with_Cache(null);
    } else {
      this.set_currentDisplayedProcessTree_with_Cache(
        delete_subtree(newTree, tree_to_delete)
      );
    }

    console.log('After Delete', this.currentDisplayedProcessTree);
    this.selectedRootNodeID = null;
  }

  insertNewNode(
    selectedNode: ProcessTree,
    strat: NodeInsertionStrategy,
    operator: ProcessTreeOperator,
    label: string
  ) {
    let newNode: ProcessTree;
    newNode = new ProcessTree(
      label,
      operator,
      [],
      Math.floor(1000000000 + Math.random() * 900000000),
      false,
      null,
      null
    );

    if (this.currentDisplayedProcessTree) {
      this.cacheCurrentTree(this.currentDisplayedProcessTree);

      switch (strat) {
        case NodeInsertionStrategy.BELOW: {
          selectedNode.children.push(newNode);
          newNode.parent = selectedNode;
          break;
        }

        case NodeInsertionStrategy.ABOVE: {
          newNode.children = [selectedNode];
          selectedNode.parent = newNode;
          break;
        }

        case NodeInsertionStrategy.LEFT: {
          const idx: number =
            selectedNode.parent.children.indexOf(selectedNode);
          selectedNode.parent.children.splice(idx, 0, newNode);
          newNode.parent = selectedNode.parent;
          break;
        }

        case NodeInsertionStrategy.RIGHT: {
          const idx: number =
            selectedNode.parent.children.indexOf(selectedNode);
          selectedNode.parent.children.splice(idx + 1, 0, newNode);
          newNode.parent = selectedNode.parent;
          break;
        }

        case NodeInsertionStrategy.CHANGE: {
          if (operator) {
            // console.log('change operator');
            selectedNode.operator = operator;
            selectedNode.label = null;
          } else if (label) {
            selectedNode.label = label;
            selectedNode.operator = null;
          }
          break;
        }
      }

      this.currentDisplayedProcessTree = this.currentDisplayedProcessTree;
      this.selectedRootNodeID = selectedNode.id;
    } else {
      // empty tree - just add a single node
      this.currentDisplayedProcessTree = newNode;
      this.selectedRootNodeID = newNode.id;
    }
  }
}

export enum NodeSeletionStrategy {
  NODE = 'Node',
  TREE = 'Tree',
}

export enum NodeInsertionStrategy {
  LEFT = 'Left',
  RIGHT = 'Right',
  ABOVE = 'Above',
  BELOW = 'Below',
  CHANGE = 'Change',
}
