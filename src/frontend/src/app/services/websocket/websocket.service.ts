import { Injectable } from '@angular/core';
import { BackgroundTaskInfoService } from '../backgroundTaskInfoService/background-task-info.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, partition } from 'rxjs';
import { ArcDiagramComputationResult } from '../arcDiagramService/model';
import { ROUTES } from '../../constants/backend_route_constants';
import { catchError, map, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ConformanceCheckingResult } from '../conformanceChecking/model';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  constructor(private infoService: BackgroundTaskInfoService) {}

  public socket: WebSocketSubject<any>;
  private runningRequests: number[] = [];

  public connect(
    $satisfiedObservable: Observable<any>,
    callback: (args) => {},
    $nonSatisfiedObservable?: Observable<any>
  ): [
    returned: boolean,
    $satisfiedObservable: Observable<any>,
    $nonSatisfiedObservable: Observable<any>
  ] {
    if (!this.socket || this.socket.closed) {
      this.socket = webSocket(ROUTES.WS_HTTP_BASE_URL + 'ws/');
    }

    const results = this.socket.pipe(
      catchError((error) => {
        this.runningRequests.forEach((r: number) =>
          this.infoService.removeRequest(r)
        );
        this.runningRequests = [];
        this.socket = null;

        throw error;
      }),
      tap((_) => {
        this.infoService.removeRequest(this.runningRequests.pop());
      }),
      map((result) => {
        if ('error' in result) {
          Swal.fire({
            title: 'Error occurred',
            html:
              '<b>Error message: </b><br>' +
              '<code>' +
              'Computing arc diagrams failed' +
              '</code>',
            icon: 'error',
            showCloseButton: false,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'close',
          });
          return result;
        }
        return callback(result);
      })
    );

    [$satisfiedObservable, $nonSatisfiedObservable] = partition(
      results,
      (ccr: ArcDiagramComputationResult | ConformanceCheckingResult) =>
        !('error' in ccr)
    );

    return [true, $satisfiedObservable, $nonSatisfiedObservable];
  }
}
