import { Component, OnInit, ElementRef, Inject } from '@angular/core';
import { BackgroundTaskInfoService } from '../../services/backgroundTaskInfoService/background-task-info.service';
import packageInfo from '../../../../package.json';
import { DOCUMENT } from '@angular/common';
import { BackendInfoService } from 'src/app/services/backendInfoService/backend-info.service';
declare var electron: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  constructor(
    private backgroundTaskInfoService: BackgroundTaskInfoService,
    private backendInfoService: BackendInfoService,
    private _elRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private document: Document
  ) {}

  currentTask = undefined;
  numberTasks = 0;
  version = packageInfo.version;
  public isRunning: boolean = false;

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

    this.backendInfoService
      .getIsRunningSubscription()
      .subscribe((isRunning) => (this.isRunning = isRunning));
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

  restartBackend(): void {
    this.backendInfoService.setRunning(false);
    electron.ipcRenderer.send('restartBackend');
  }

  get element() {
    return this._elRef.nativeElement;
  }
}
