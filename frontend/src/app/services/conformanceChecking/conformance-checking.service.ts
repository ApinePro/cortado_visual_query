import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BackgroundTaskInfoService } from '../backgroundTaskInfoService/background-task-info.service';
import { ConformanceCheckingResult } from './model';
import Swal from 'sweetalert2';
export const WS_ENDPOINT = 'ws://127.0.0.1:41211/conformancews';

@Injectable({
  providedIn: 'root',
})
export class ConformanceCheckingService {
  constructor(private infoService: BackgroundTaskInfoService) {}

  private socket: WebSocketSubject<any>;
  private runningRequests: number[] = [];
  public results: Observable<ConformanceCheckingResult>;

  public connect(): boolean {
    if (!this.socket || this.socket.closed) {
      this.socket = webSocket(WS_ENDPOINT);
      this.results = this.socket.pipe(
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
            result['isTimeout'],
            result['cost'],
            result['deviation']
          );
        })
      );

      return true;
    }

    return false;
  }

  public calculateConformance(
    id: string,
    pt: any,
    variant: any,
    timeout: number
  ): boolean {
    const resubscribe = this.connect();
    const rid = this.infoService.setRequest('conformance checking');
    this.runningRequests.push(rid);
    this.socket.next({ id: id, pt: pt, variant: variant, timeout: timeout });

    return resubscribe;
  }
}
