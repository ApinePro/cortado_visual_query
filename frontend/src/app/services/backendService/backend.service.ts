import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SharedDataService} from '../sharedDataService/shared-data.service';
import * as FileSaver from 'file-saver';
import {take, tap} from 'rxjs/operators';
import {ActivateTooltipsService} from '../activateTooltipsService/activate-tooltips.service';
import {deserialize, VariantElement} from 'src/app/components/variant-explorer/model';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private httpClient: HttpClient,
              private sharedDataService: SharedDataService,
              private activateTooltipsService: ActivateTooltipsService) {
  }

  backendUrl = 'http://127.0.0.1:8000/';


  loadEventLogFromFilePath(filePath: string): void {
    this.httpClient.post(this.backendUrl + 'loadEventLog', {file_path: filePath})
      .subscribe(res => {
        this.processEventLog(res, filePath);
      });
  }

  uploadEventLog(file: File) {
    let formData = new FormData();
    formData.append("file", file);

    this.httpClient.post(this.backendUrl + 'uploadfile', formData)
      .subscribe(res => {
        console.log('Event log ' + file.name + ' loaded');
        this.processEventLog(res, file.name);
      });
  }

  private processEventLog(res, filePath) {
    this.sharedDataService.activitiesInEventLog = res['activities'];
    this.sharedDataService.startActivitiesInEventLog = new Set(Object.keys(res['startActivities']));
    this.sharedDataService.endActivitiesInEventLog = new Set(Object.keys(res['endActivities']));
    this.sharedDataService.variants = res['variants'];
    this.sharedDataService.variants.forEach(variant => {
      variant['variant'] = deserialize(variant.variant);
    });
    this.sharedDataService.loadedEventLog = filePath;
  }

  loadProcessTreeFromFilePath(filePath: string): void {
    this.httpClient.post(this.backendUrl + 'loadProcessTreeFromPtmlFile', {file_path: filePath})
      .subscribe(tree => {
        this.sharedDataService.currentDisplayedProcessTree = tree;
      });
  }

  discoverProcessModelFromVariants(variants: any[]): void {
    this.httpClient.post(this.backendUrl + 'discoverProcessModelFromVariants', {variants: variants})
      .subscribe(tree => {
        this.sharedDataService.currentDisplayedProcessTree = tree;
      });
  }

  discoverProcessModelFromConcurrencyVariants(variants: VariantElement[]): void {
    let variantsSerialized = variants.map(v => v.serialize());
    this.httpClient.post(this.backendUrl + 'discoverProcessModelFromConcurrencyVariants', {variants: variantsSerialized})
      .subscribe(tree => {
        this.sharedDataService.currentDisplayedProcessTree = tree;
      });
  }

  computeTreeString(tree) : void{
    this.httpClient.post(this.backendUrl + 'computeTreeStringFromTree', {tree: tree})
      .subscribe(tree => {
        this.sharedDataService.currentTreeString = tree;
      });
  }

  checkTreeStringSyntax(tree_string : string) : void{
    this.httpClient.post(this.backendUrl + 'checkTreeStringSyntax', {tree_string: tree_string})
      .subscribe(syntaxCheck => {
        this.sharedDataService.currentTreeStringSyntaxCheck = syntaxCheck;
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

  calculateAlignmentsCVariant(variant: VariantElement): Observable<any> {
    const body = {
      pt: this.sharedDataService.currentDisplayedProcessTree,
      variant: variant.serialize()
    };
    return this.httpClient.post(this.backendUrl + 'calculateAlignmentsCVariant', body);
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

  addConcurrencyVariantsToProcessModel(variantsToAdd: VariantElement[], explicitlyAddedVariants: VariantElement[]): Observable<any> {
    const body = {
      pt: this.sharedDataService.currentDisplayedProcessTree,
      variants_to_add: variantsToAdd.map(v => v.serialize()),
      explicitly_added_variants: explicitlyAddedVariants.map(v => v.serialize())
    };
    return this.httpClient.post(this.backendUrl + 'addConcurrencyVariantsToProcessModel', body).pipe(tap(res => {
      this.sharedDataService.currentDisplayedProcessTree = res;
      this.activateTooltipsService.initialize();
    }));
  }
}

