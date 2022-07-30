import { Component, OnInit } from '@angular/core';
import { ToastEvent } from 'src/app/objects/toast-event';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.css'],
})
export class ToasterComponent implements OnInit {
  currentToasts: ToastEvent[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscribeToToasts();
  }

  subscribeToToasts() {
    this.toastService.toastEvents.subscribe((toast) => {
      this.currentToasts.push(toast);
    });
  }

  dispose(index: number) {
    this.currentToasts.splice(index, 1);
  }
}
