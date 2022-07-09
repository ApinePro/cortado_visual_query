import { Injectable } from '@angular/core';
import { Observable, partition } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BackgroundTaskInfoService } from '../backgroundTaskInfoService/background-task-info.service';
import { ConformanceCheckingResult } from './model';
import Swal from 'sweetalert2';
import { SharedDataService } from '../sharedDataService/shared-data.service';
import { ProcessTree } from 'src/app/objects/ProcessTree';
import { InfixType } from 'src/app/components/variant-explorer/model';
export const WS_ENDPOINT = 'ws://127.0.0.1:41211/conformancews';

@Injectable({
  providedIn: 'root',
})
export class ConformanceCheckingService {
  constructor(
    private infoService: BackgroundTaskInfoService,
    private sharedDataService: SharedDataService
  ) {}

  private socket: WebSocketSubject<any>;
  private runningRequests: number[] = [];
  public varResults: Observable<ConformanceCheckingResult>;
  public patternResults: Observable<ConformanceCheckingResult>;

  public connect(): boolean {
    if (!this.socket || this.socket.closed) {
      this.socket = webSocket(WS_ENDPOINT);
    const results = this.socket.pipe(
        catchError((error) => {
          this.runningRequests.forEach((r: number) =>
            this.infoService.removeRequest(r)
          );
          this.runningRequests = [];
          this.socket = null;
          if (error instanceof CloseEvent) {
            Swal.fire({
              title: 'Error occurred',
              html:
                '<b>Error message: </b><br>' +
                '<code>' +
                'websocket connection for conformance checking was closed' +
                '</code>',
              icon: 'error',
              showCloseButton: false,
              showConfirmButton: false,
              showCancelButton: true,
              cancelButtonText: 'close',
            });
          }
          throw error;
        }),
        tap((_) => {
          this.infoService.removeRequest(this.runningRequests.pop());
        }),
        map((result) => {
          return new ConformanceCheckingResult(
            result['id'],
            result['type'],
            result['isTimeout'],
            result['cost'],
            result['deviation']
          );
        }),
      );
      [this.varResults, this.patternResults] =  partition(results, (ccr : ConformanceCheckingResult) => (ccr.type === 1))

      return true;
    }

    return false;
  }

  public calculateConformance(
    id: string,
    infixType: InfixType,
    pt: ProcessTree,
    variant: any,
    timeout: number,
    alignType : AlignmentType,
  ): boolean {
    const resubscribe = this.connect();
    const rid = this.infoService.setRequest('conformance checking', () =>
      this.cancelConformanceCheckingRequests()
    );
    this.runningRequests.push(rid);
    this.socket.next({
      id: id,
      infixType: infixType,
      alignType : alignType,
      pt: pt.copy(false),
      variant: variant,
      timeout: timeout,
    });

    return resubscribe;
  }

  private cancelConformanceCheckingRequests(): void {
    this.socket.next({ isCancellationRequested: true });
    this.runningRequests.forEach((r: number) =>
      this.infoService.removeRequest(r)
    );
    this.runningRequests = [];
    this.sharedDataService.variants.forEach((v) => {
      v.calculationInProgress = false;
    });
    this.socket.unsubscribe();
  }
}


export enum AlignmentType{
  VariantAlignment = 1,
  PatternAlignment = 2
}

