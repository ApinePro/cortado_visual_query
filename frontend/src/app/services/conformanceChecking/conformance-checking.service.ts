import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BackgroundTaskInfoService } from '../backgroundTaskInfoService/background-task-info.service';
import { ConformanceCheckingResult } from './model';
export const WS_ENDPOINT = 'ws://127.0.0.1:8000/conformancews';

@Injectable({
  providedIn: 'root',
})
export class ConformanceCheckingService {
  constructor(private infoService: BackgroundTaskInfoService) {}

  private socket: WebSocketSubject<any>;
  private runningRequests: number[] = [];
  public results: Observable<ConformanceCheckingResult>;

  public connect(): void {
    if (!this.socket || this.socket.closed) {
      this.socket = webSocket(WS_ENDPOINT);
      this.results = this.socket.pipe(
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
    }
  }

  public calculateConformance(
    id: string,
    pt: any,
    variant: any,
    timeout: number
  ): void {
    this.connect();
    const rid = this.infoService.setRequest('conformance checking');
    this.runningRequests.push(rid);
    this.socket.next({ id: id, pt: pt, variant: variant, timeout: timeout });
  }
}
