import { Component } from '@angular/core';
import { LoadingOverlayService } from 'src/app/services/loadingOverlayService/loading-overlay.service';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.css'],
})
export class LoadingOverlayComponent {
  constructor(public loadingOverlayService: LoadingOverlayService) {}
}
