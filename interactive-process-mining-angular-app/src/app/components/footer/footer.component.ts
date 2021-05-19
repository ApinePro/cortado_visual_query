import {Component, OnInit} from '@angular/core';
import {BackgroundTaskInfoService} from '../../services/backgroundTaskInfoService/background-task-info.service';
import {version} from '../../../../package.json';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(private backgroundTaskInfoService: BackgroundTaskInfoService) {
  }

  currentTask = undefined;
  numberTasks = 0;
  version = version;

  ngOnInit(): void {
    this.backgroundTaskInfoService.currentBackgroundTask$().subscribe(taskDescription => {
      this.currentTask = taskDescription;
    });

    this.backgroundTaskInfoService.numberBackgroundTasks$().subscribe(res => {
      this.numberTasks = res;
    });
  }


}
