import { Component, OnInit, ElementRef, Inject } from '@angular/core';
import { BackgroundTaskInfoService } from '../../services/backgroundTaskInfoService/background-task-info.service';
import packageInfo from '../../../../package.json';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  constructor(
    private backgroundTaskInfoService: BackgroundTaskInfoService,
    private _elRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private document: Document
  ) {}

  currentTask = undefined;
  numberTasks = 0;
  version = packageInfo.version;

  ngOnInit(): void {
    this.backgroundTaskInfoService
      .currentBackgroundTask$()
      .subscribe((backgroundTask) => {
        this.currentTask = backgroundTask;
      });

    this.backgroundTaskInfoService.numberBackgroundTasks$().subscribe((res) => {
      this.numberTasks = res;
      if (res > 0) {
        this.document.getElementById('body').style.cursor = 'progress';
      } else if (res == 0) {
        this.document.getElementById('body').style.cursor = '';
      }
    });
  }

  isCancelableTask(): boolean {
    return (
      this.currentTask !== undefined &&
      this.currentTask.CancellationFunc !== null
    );
  }

  cancelCurrentRequest(): void {
    if (this.isCancelableTask()) {
      this.currentTask.CancellationFunc();
    }
  }

  get element() {
    return this._elRef.nativeElement;
  }
}
