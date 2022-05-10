import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { ProcessTree } from 'src/app/objects/ProcessTree';
import { HierarchyNode } from 'd3';
import { PerformanceService } from '../performance.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessTreeService {
 

  constructor(private sharedDataService : SharedDataService) { }

  private _selectedRootNodeID = new BehaviorSubject<number>(null);

  get selectedRootNodeID$(): Observable<number> {
    return this._selectedRootNodeID.asObservable();
  }

  set selectedRootNodeID(node: number) {
    console.log('Set Root Node ID', node)
    this._selectedRootNodeID.next(node);
  }

  get selectedRootNodeID(): number {
    return this._selectedRootNodeID.getValue();
  }

  private _nodeWidthCache = new BehaviorSubject<Map<string, number>>(null);

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



  private _selectionMode = new BehaviorSubject<NodeSeletionStrategy>(NodeSeletionStrategy.TREE); 
  
  get selectionMode$(): Observable<any> {
    return this._selectionMode.asObservable();
  }

  get selectionMode(): any {
    return this._selectionMode.getValue();
  }

  set selectionMode(strategy: NodeSeletionStrategy) {
    this._selectionMode.next(strategy);
  }


  private _currentDisplayedProcessTree = new BehaviorSubject<any>(null);

  get currentDisplayedProcessTree$(): Observable<any> {
    return this._currentDisplayedProcessTree.asObservable();
  }

  get currentDisplayedProcessTree(): any {
    return this._currentDisplayedProcessTree.getValue();
  }

  set currentDisplayedProcessTree(tree: any) {
    console.log(
      'currentDisplayedProcessTree in SHARED_DATA_SERVICE has changed'
    );
    if (tree && !(tree instanceof ProcessTree)) {
      tree = ProcessTree.fromObj(tree);
    }
    this._currentDisplayedProcessTree.next(tree);
    this.sharedDataService.activitiesInCurrentTree = this.getSetOfActivities(tree);
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


  
  previousTreeObjects: d3.HierarchyNode<any>[] = [];

  private _treeCacheLength = new BehaviorSubject<number>(0);
  private _treeCacheIndex = new BehaviorSubject<number>(0);

  get treeCacheLength$(): Observable<number> {
    return this._treeCacheLength.asObservable();
  }

  set treeCacheLength(node: number) {
    console.log('Set Root Node ID', node)
    this._treeCacheLength.next(node);
  }

  get treeCacheLength(): number {
    return this._treeCacheLength.getValue();
  }

  get treeCacheIndex$(): Observable<number> {
    return this._treeCacheIndex.asObservable();
  }

  set treeCacheIndex(node: number) {
    console.log('Set Root Node ID', node)
    this._treeCacheIndex.next(node);
  }

  get treeCacheIndex(): number {
    return this._treeCacheIndex.getValue();
  }

  cacheCurrentTree(root): void {
    // console.log('cacheCurrentTree()');

    if (
      this.treeCacheIndex <
      this.previousTreeObjects.length - 1
    ) {
      // before change, undo was pressed --> remove newer versions since older version of process tree was changed
      this.previousTreeObjects = this.previousTreeObjects.slice(
        0,
        this.treeCacheIndex + 1
      );

    }

    if (root) {
      this.previousTreeObjects.push(root.copy());

    } else {
      this.previousTreeObjects.push(null);
    }
    if (this.treeCacheIndex) {
      this.treeCacheIndex += 1;
    } else {
      this.treeCacheIndex = this.previousTreeObjects.length - 1;
    }



    if (root) {
      root.each((node) => {
        node.data = JSON.parse(JSON.stringify(node.data));
      });
    }

    console.log('Caching Current Tree')
    this.treeCacheLength = this.previousTreeObjects.length;
  }


  undo(): HierarchyNode<any> {
    if (
      this.treeCacheIndex &&
      this.treeCacheIndex > 0 &&
      this.previousTreeObjects.length > 1
    ) {
      this.treeCacheIndex--;

      let treeToLoad =
        this.previousTreeObjects[this.treeCacheIndex];

      if (treeToLoad) {
        treeToLoad = treeToLoad.copy();
        treeToLoad.each((node) => {
          node.data = JSON.parse(JSON.stringify(node.data));
        });
      }
      
      this.selectedRootNodeID = null;
      return treeToLoad 
     
    }
  }

  redo(): HierarchyNode<any> {
    if (
      this.treeCacheIndex <
      this.previousTreeObjects.length - 1
    ) {
      this.treeCacheIndex++;
      let treeToLoad =
        this.previousTreeObjects[this.treeCacheIndex];

      if (treeToLoad) {
        treeToLoad = treeToLoad.copy();
        treeToLoad.each((node) => {
          node.data = JSON.parse(JSON.stringify(node.data));
        });
      }
      this.selectedRootNodeID = null;
      return treeToLoad 

    }
  }








}


export enum NodeSeletionStrategy {
  NODE = 'Node', 
  TREE = 'Tree'
}