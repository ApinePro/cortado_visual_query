import {Component, OnInit} from '@angular/core';
import {BackgroundTaskInfoService} from "../services/backgroundTaskInfoService/background-task-info.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(private backgroundTaskInfoService: BackgroundTaskInfoService) {
  }

  currentTask = undefined;

  ngOnInit(): void {
    this.backgroundTaskInfoService.currentBackgroundTask$().subscribe(taskDescription => {
      this.currentTask = taskDescription;
    })
  }



}
