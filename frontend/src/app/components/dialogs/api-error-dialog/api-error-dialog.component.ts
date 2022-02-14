import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SwalPortalTargets } from '@sweetalert2/ngx-sweetalert2';
import { NextObserver, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiError } from 'src/app/objects/ApiError';
import { ErrorService } from 'src/app/services/errorService/error.service';

@Component({
  selector: 'app-api-error-dialog',
  templateUrl: './api-error-dialog.component.html',
  styleUrls: ['./api-error-dialog.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state(
        'void',
        style({
          height: '0px',
        })
      ),
      state(
        '*',
        style({
          height: '*',
        })
      ),
      transition('void => *', animate('150ms ease-out')),
      transition('* => void', animate('150ms ease-in')),
    ]),
  ],
})
export class ApiErrorDialogComponent implements OnInit, OnDestroy {
  public isVisible: boolean;
  public apiError: ApiError;
  public message: string;
  public isStackTraceExpanded: boolean = false;

  private unsubscribeAll: Subject<any> = new Subject();

  constructor(
    private errorService: ErrorService,
    public readonly swalTargets: SwalPortalTargets
  ) {}

  ngOnInit(): void {
    this.errorService
      .getErrors()
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(this.updatePropsObserver());
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
  }

  toggleStackTrace() {
    this.isStackTraceExpanded = !this.isStackTraceExpanded;
  }

  updatePropsObserver(): NextObserver<HttpErrorResponse> {
    return {
      next: (errorRes: HttpErrorResponse) => {
        // initial value if errorRes is {}
        this.isVisible = Object.keys(errorRes).length != 0;
        this.apiError = errorRes.error;
        this.message = errorRes.message;
      },
    };
  }

  onCopySuccess() {}

  onClose() {
    this.isVisible = false;
  }
}
