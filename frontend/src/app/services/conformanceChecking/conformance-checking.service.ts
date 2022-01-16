import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ConformanceCheckingResult } from './model';
export const WS_ENDPOINT = 'ws://127.0.0.1:8000/ws';

@Injectable({
  providedIn: 'root',
})
export class ConformanceCheckingService {
  private socket: WebSocketSubject<any>;
  public results: Observable<ConformanceCheckingResult>;

  // TODO catch case where connection is closed from server (catchError)
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

  sendMessage(msg: any) {
    this.socket.next(msg);
  }

  close(): void {
    this.socket.complete();
  }
}
