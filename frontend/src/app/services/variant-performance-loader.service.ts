import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from './backendService/backend.service';
import { VariantPerformanceService } from './variant-performance.service';

@Injectable({
  providedIn: 'root',
})
export class VariantPerformanceLoaderService {
  constructor(
    private httpClient: HttpClient,
    private backendService: BackendService,
    private variantPerformanceService: VariantPerformanceService
  ) {
    this.variantPerformanceService.variantPerformanceMode.subscribe(
      (isPerformanceMode) => {
        if (isPerformanceMode) {
          console.log('get performance');
          this.getLogBasedPerformance().subscribe();
        }
      }
    );
  }

  backendUrl = this.backendService.backendUrl;

  getLogBasedPerformance(): Observable<any> {
    return this.httpClient.get(
      this.backendUrl + 'logBasedPerformanceForVariants'
    );
  }
}
