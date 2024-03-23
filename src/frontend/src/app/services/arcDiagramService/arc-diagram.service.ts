import { Injectable } from '@angular/core';
import { BackgroundTaskInfoService } from '../backgroundTaskInfoService/background-task-info.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { ArcDiagramComputationResult } from './model';
import { Observable } from 'rxjs';
import { FilterParams } from '../../components/variant-explorer/arc-diagram/filter/filter-params';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class ArcDiagramService {
  constructor(
    private infoService: BackgroundTaskInfoService,
    private websocketService: WebsocketService
  ) {}

  private socket: WebSocketSubject<any>;
  private runningRequests: number[] = [];

  public arcDiagramsResult: Observable<ArcDiagramComputationResult>;

  public filterParams: FilterParams;
  public filterAfterComputation: boolean;

  public connect(): boolean {
    const [returned, $satisfiedObservable, $nonSatisfiedObservable] =
      this.websocketService.connect(this.arcDiagramsResult, (result) => {
        return new ArcDiagramComputationResult(
          result['pairs'],
          result['maximal_values'],
          this.filterParams,
          this.filterAfterComputation
        );
      });
    if (returned) {
      this.arcDiagramsResult = $satisfiedObservable;
      return true;
    }
    return false;
  }

  public computeArcDiagrams(
    bids: string[] | number[],
    filterParams: FilterParams,
    filterAfterComputation: boolean
  ): boolean {
    this.filterParams = filterParams;
    this.filterAfterComputation = filterAfterComputation;
    const resubscribe = this.connect();
    const rid = this.infoService.setRequest('repetitions mining', () =>
      this.cancelArcDiagramComputationRequests()
    );
    this.runningRequests.push(rid);
    this.websocketService.socket.next({
      name: 'repetition_mining',
      bids,
      filters: {
        activitiesToInclude: Array.from(
          filterParams ? filterParams.activitiesSelection.selectedItems : []
        ),
      },
    });

    return resubscribe;
  }

  private cancelArcDiagramComputationRequests(): void {
    this.websocketService.socket.next({ isCancellationRequested: true });
    this.runningRequests.forEach((r: number) =>
      this.infoService.removeRequest(r)
    );
    this.runningRequests = [];
    this.websocketService.socket.unsubscribe();
  }
}
