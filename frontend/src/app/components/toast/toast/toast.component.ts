import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Toast } from 'bootstrap';
import { fromEvent } from 'rxjs';
import { ToastEvent, ToastType } from 'src/app/objects/toast-event';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent implements OnInit {
  @Output() disposeEvent = new EventEmitter();

  @ViewChild('toastElement', { static: true })
  toastEl!: ElementRef;

  @Input()
  toastEvent: ToastEvent;

  toast: Toast;

  ToastType = ToastType;

  ngOnInit() {
    this.show();
  }

  show() {
    this.toast = new Toast(this.toastEl.nativeElement, {
      autohide: this.toastEvent.autoclose,
      delay: this.toastEvent.delay,
    });

    fromEvent(this.toastEl.nativeElement, 'hidden.bs.toast').subscribe(() =>
      this.hide()
    );

    this.toast.show();
  }

  hide() {
    this.toast.dispose();
    this.disposeEvent.emit();
  }
}
