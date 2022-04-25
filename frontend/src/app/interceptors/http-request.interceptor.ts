import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, finalize, tap } from 'rxjs/operators';
import { BackgroundTaskInfoService } from '../services/backgroundTaskInfoService/background-task-info.service';
import { BackendService } from '../services/backendService/backend.service';
import { ErrorService } from '../services/errorService/error.service';
import { BackendInfoService } from '../services/backendInfoService/backend-info.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(
    private backgroundTaskInfoService: BackgroundTaskInfoService,
    private backendService: BackendService,
    private errorService: ErrorService,
    private backendInfoService: BackendInfoService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const calledEndpoint = request.url
      .slice(this.backendService.backendUrl.length)
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    const id = this.backgroundTaskInfoService.setRequest(
      String(calledEndpoint)
    );

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.setBackendRunningState(error);
        if (this.shouldIgnoreError(error)) {
          return next.handle(request);
        }

        this.errorService.addApiError(error);
        return throwError(error);
      }),
      finalize(() => {
        this.backgroundTaskInfoService.removeRequest(id);
      })
    );
  }

  shouldIgnoreError(error: HttpErrorResponse): boolean {
    return (
      // ignore timeouts for alignment computations because they are handled in the variant explorer
      (error.status == 504 &&
        error.url.endsWith('calculateAlignmentsCVariant')) ||
      // info requests are made to show the backend state in the footer; therefore, we do not want to show the error dialog
      error.url.endsWith('/info')
    );
  }

  setBackendRunningState(error: HttpErrorResponse): void {
    let isRunning = true;
    if (error.status === 0) {
      isRunning = false;
    }

    this.backendInfoService.setRunning(isRunning);
  }
}
