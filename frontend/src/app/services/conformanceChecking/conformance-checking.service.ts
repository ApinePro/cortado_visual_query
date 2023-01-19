import { Injectable } from '@angular/core';
import { Observable, partition, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BackgroundTaskInfoService } from '../backgroundTaskInfoService/background-task-info.service';
import { ConformanceCheckingResult } from './model';
import Swal from 'sweetalert2';
import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';
import { VariantService } from '../variantService/variant.service';
import { InfixType } from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import { ColorMap } from 'src/app/objects/ColorMap';
import * as d3 from 'd3';
import { COLORS_RED_GREEN } from 'src/app/objects/Colors';
import { ROUTES } from 'src/app/constants/backend_route_constants';

@Injectable({
  providedIn: 'root',
})
export class ConformanceCheckingService {
  constructor(
    private infoService: BackgroundTaskInfoService,
    private variantService: VariantService
  ) {}

  private socket: WebSocketSubject<any>;
  private runningRequests: number[] = [];
  public varResults: Observable<ConformanceCheckingResult>;
  public patternResults: Observable<ConformanceCheckingResult>;
  public showConformanceCheckingTimeoutDialog: Subject<any> =
    new Subject<any>();

  public connect(): boolean {
    if (!this.socket || this.socket.closed) {
      this.socket = webSocket(
        ROUTES.WS_HTTP_BASE_URL + ROUTES.VARIANT_CONFORMANCE + 'conformancews'
      );
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
            result['deviations'],
            result['alignment'],
            result['pt']
          );
        })
      );
      [this.varResults, this.patternResults] = partition(
        results,
        (ccr: ConformanceCheckingResult) => ccr.type === 1
      );

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
    alignType: AlignmentType
  ): boolean {
    const resubscribe = this.connect();
    const rid = this.infoService.setRequest('conformance checking', () =>
      this.cancelConformanceCheckingRequests()
    );
    this.runningRequests.push(rid);
    this.socket.next({
      id: id,
      infixType: infixType,
      alignType: alignType,
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
    this.variantService.variants.forEach((v) => {
      v.calculationInProgress = false;
    });
    this.socket.unsubscribe();
  }

  public showConformanceTimeoutDialog(variant: Variant, callbackFunc) {
    this.showConformanceCheckingTimeoutDialog.next([variant, callbackFunc]);
  }

  get conformanceColorMap() {
    return new ColorMap(
      d3.scaleQuantize<any, any>().domain([0, 1]).range(COLORS_RED_GREEN)
    );
  }
}

export enum AlignmentType {
  VariantAlignment = 1,
  PatternAlignment = 2,
}
