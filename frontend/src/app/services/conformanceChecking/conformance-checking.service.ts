import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ConformanceCheckingResult } from './model';
export const WS_ENDPOINT = 'ws://127.0.0.1:8000/conformancews';

@Injectable({
  providedIn: 'root',
})
export class ConformanceCheckingService {
  private socket: WebSocketSubject<any>;
  public results: Observable<ConformanceCheckingResult>;

  public connect(): void {
    if (!this.socket || this.socket.closed) {
      this.socket = webSocket(WS_ENDPOINT);
      this.results = this.socket.pipe(
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
    this.socket.next({ id: id, pt: pt, variant: variant, timeout: timeout });
  }
}
