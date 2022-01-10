import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { BackgroundTaskInfoService } from '../services/backgroundTaskInfoService/background-task-info.service';
import { BackendService } from '../services/backendService/backend.service';
import Swal from 'sweetalert2';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(
    private backgroundTaskInfoService: BackgroundTaskInfoService,
    private backendService: BackendService
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
        if (this.shouldIgnoreError(error)) {
          return next.handle(request);
        }

        this.showErrorDialog(error);
        return throwError(error);
      }),
      finalize(() => {
        this.backgroundTaskInfoService.removeRequest(id);
      })
    );
  }

  shouldIgnoreError(error: HttpErrorResponse): boolean {
    // ignore timeouts for alignment computations because they are handled in the variant explorer
    return (
      error.status == 504 && error.url.endsWith('calculateAlignmentsCVariant')
    );
  }

  showErrorDialog(error: HttpErrorResponse): void {
    let data = {};
    data = {
      reason:
        error && error.error && error.error.reason ? error.error.reason : '',
      status: error.status,
    };
    Swal.fire({
      title: 'Error occurred',
      html: '<b>Error message: </b><br>' + '<code>' + error.message + '</code>',
      icon: 'error',
      showCloseButton: false,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'close',
    });
  }
}
