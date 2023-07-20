import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingOverlayService {
  public loadingText = '';
  public loadingInProgress = false;

  public showLoader(text = '') {
    this.loadingText = text;
    this.loadingInProgress = true;
  }

  public hideLoader() {
    this.loadingInProgress = false;
    this.loadingText = '';
  }
}
