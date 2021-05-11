import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SharedDataService} from '../sharedDataService/shared-data.service';
import * as FileSaver from 'file-saver';
import {take} from 'rxjs/operators';
import {ActivateTooltipsService} from '../activateTooltipsService/activate-tooltips.service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private httpClient: HttpClient,
              private sharedDataService: SharedDataService,
              private activateTooltipsService: ActivateTooltipsService) {
  }

  backendUrl = 'http://127.0.0.1:8000/';


  loadEventLogFromFilePath(filePath: string): Observable<any> {
    return this.httpClient.post(this.backendUrl + 'loadEventLog',
      {file_path: filePath});
  }

  loadProcessTreeFromFilePath(filePath: string): void {
    this.httpClient.post(this.backendUrl + 'loadProcessTreeFromPtmlFile', {file_path: filePath})
      .subscribe(tree => {
        this.sharedDataService.currentDisplayedProcessTree = tree;
      });
  }

  getVariantsFromEventLog(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'variants');
  }

  getActivitiesFromEventLog(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'activities');
  }

  getStartActivitiesFromEventLog(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'startActivities');
  }

  getEndActivitiesFromEventLog(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'endActivities');
  }

  discoverProcessModelFromVariants(variants: any[]): void {
    this.httpClient.post(this.backendUrl + 'discoverProcessModelFromVariants', {variants: variants})
      .subscribe(tree => {
        this.sharedDataService.currentDisplayedProcessTree = tree;
      });
  }

  downloadCurrentTreeAsPTML(): void {
    this.sharedDataService.currentDisplayedProcessTree$.pipe(take(1)).subscribe(tree => {
      this.httpClient.post(this.backendUrl + 'convertPtToPTML', {pt: tree}, {responseType: 'blob'})
        .subscribe(blob => {
          FileSaver.saveAs(blob, 'process_tree.ptml');
        });
    });
  }

  downloadCurrentTreeAsPNML(): void {
    this.sharedDataService.currentDisplayedProcessTree$.pipe(take(1)).subscribe(tree => {
      this.httpClient.post(this.backendUrl + 'convertPtToPNML', {pt: tree}, {responseType: 'blob'})
        .subscribe(blob => {
          FileSaver.saveAs(blob, 'petri_net.pnml');
        });
    });
  }

  calculateAlignment(variant): Observable<any> {
    const body = {pt: this.sharedDataService.currentDisplayedProcessTree, variant};
    return this.httpClient.post(this.backendUrl + 'calculateAlignment', body);
  }

  addVariantsToModel(variantsToAdd: any[], explicitlyAddedVariants: any[]): void {
    const body = {
      pt: this.sharedDataService.currentDisplayedProcessTree,
      variants_to_add: variantsToAdd,
      explicitly_added_variants: explicitlyAddedVariants
    };
    this.httpClient.post(this.backendUrl + 'addVariantsToProcessModel', body).subscribe(res => {
      this.sharedDataService.currentDisplayedProcessTree = res;
      this.activateTooltipsService.initialize();
    });
  }

}

