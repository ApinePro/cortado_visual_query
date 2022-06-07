
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { ProcessTree } from 'src/app/objects/ProcessTree';

@Injectable({
  providedIn: 'root',
})
export class ProcessTreeService {
  constructor() {}

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
    new Set()
  );

  public deleteActivityFromEventLog(activityName : string) : any {
    this.activitiesInCurrentTree.delete(activityName)
  }

  public renameActivityInProcessTree(activityName : string, newActivityName : string) : any {

    if(this.activitiesInCurrentTree && this.activitiesInCurrentTree.delete(activityName)) this.activitiesInCurrentTree.add(newActivityName);

    if (this.currentDisplayedProcessTree){
      this.currentDisplayedProcessTree = this.renameProcessTreeLeafs(this.currentDisplayedProcessTree, activityName, newActivityName)
    }

  }

  private renameProcessTreeLeafs(tree : ProcessTree,  activityName : string , newActivityName : string){


    if (tree.label && tree.label === activityName){
      tree.label = newActivityName
    } else {
      tree.children.forEach((c) => this.renameProcessTreeLeafs(c, activityName, newActivityName))
    }

    return tree
  }

  get activitiesInCurrentTree$(): Observable<Set<string>> {
    return this._activitiesInCurrentTree.asObservable();
  }

  set activitiesInCurrentTree(activities) {
    this._activitiesInCurrentTree.next(activities);
  }

  set currentDisplayedProcessTree(tree: any) {
    if (tree && !(tree instanceof ProcessTree)) {
      tree = ProcessTree.fromObj(tree);
    }
    this._currentDisplayedProcessTree.next(tree);
    this.activitiesInCurrentTree =
      this.getSetOfActivities(tree);
  }

  public set_currentDisplayedProcessTree_with_Cache(tree: any) {
    if (tree && !(tree instanceof ProcessTree)) {
      tree = ProcessTree.fromObj(tree);
    }
    this._currentDisplayedProcessTree.next(tree);
    this.activitiesInCurrentTree =
      this.getSetOfActivities(tree);
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
      this.previousTreeObjects.push(root.copy());
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
}

export enum NodeSeletionStrategy {
  NODE = 'Node',
  TREE = 'Tree',
}
