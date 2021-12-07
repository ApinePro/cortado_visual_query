import { element } from 'protractor';
import {Component, OnInit, ElementRef} from '@angular/core';
import {BackgroundTaskInfoService} from '../../services/backgroundTaskInfoService/background-task-info.service';
import packageInfo from '../../../../package.json';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(private backgroundTaskInfoService: BackgroundTaskInfoService,
              private _elRef: ElementRef<HTMLElement>
    ) {
  }

  currentTask = undefined;
  numberTasks = 0;
  version = packageInfo.version;

  ngOnInit(): void {
    this.backgroundTaskInfoService.currentBackgroundTask$().subscribe(taskDescription => {
      this.currentTask = taskDescription;
    });

    this.backgroundTaskInfoService.numberBackgroundTasks$().subscribe(res => {
      this.numberTasks = res;
    });
  }

  get element(){

    return this._elRef.nativeElement

  }


}
