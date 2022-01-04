import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedDataService } from '../sharedDataService/shared-data.service';
import * as FileSaver from 'file-saver';
import {take, tap} from 'rxjs/operators';
import {deserialize, VariantElement} from 'src/app/components/variant-explorer/model';
import { Configuration } from 'src/app/components/settings/model';
import * as objectHash from 'object-hash'

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private httpClient: HttpClient,
              private sharedDataService: SharedDataService) {
  }

  backendUrl = 'http://127.0.0.1:8000/';


  loadEventLogFromFilePath(filePath: string): void {
    this.httpClient.post(this.backendUrl + 'loadEventLog', { file_path: filePath })
      .subscribe(res => {
        this.processEventLog(res, filePath);
      });
  }

  uploadEventLog(file: File) {
    console.log(file);
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
      variant['id'] = objectHash(variant['variant']);
      variant['variant'] = deserialize(variant.variant);
    });
    this.sharedDataService.loadedEventLog = filePath;
  }

  loadProcessTreeFromFilePath(filePath: string): void {
    console.log(filePath);
    this.httpClient.post(this.backendUrl + 'loadProcessTreeFromPtmlFile', {file_path: filePath})
      .subscribe(tree => {
        this.sharedDataService.currentDisplayedProcessTree = tree;
      });
  }

  discoverProcessModelFromVariants(variants: any[]): void {
    this.httpClient.post(this.backendUrl + 'discoverProcessModelFromVariants', { variants: variants })
      .subscribe(tree => {
        this.sharedDataService.currentDisplayedProcessTree = tree;
      });
  }

  discoverProcessModelFromConcurrencyVariants(variants: VariantElement[]): Observable<any> {
    const variantsSerialized = variants.map(v => v.serialize());
    return this.httpClient.post(this.backendUrl + 'discoverProcessModelFromConcurrencyVariants', {variants: variantsSerialized})
      .pipe(tap(tree => {
        this.sharedDataService.currentDisplayedProcessTree = tree;
      }));
  }

  computeTreeString(tree) : void{
    this.httpClient.post(this.backendUrl + 'computeTreeStringFromTree', {pt: tree})
      .subscribe(tree => {
        this.sharedDataService.currentTreeString = tree;
      });
  }

  renderStringToPT(treeString: string) {
    return this.httpClient.post(this.backendUrl + 'parseStringToPT', {pt_string: treeString});
  }

  downloadCurrentTreeAsPTML(): void {
    this.sharedDataService.currentDisplayedProcessTree$.pipe(take(1)).subscribe(tree => {
      this.httpClient.post(this.backendUrl + 'convertPtToPTML', { pt: tree }, { responseType: 'blob' })
        .subscribe(blob => {
          FileSaver.saveAs(blob, 'process_tree.ptml');
        });
    });
  }

  downloadCurrentTreeAsPNML(): void {
    this.sharedDataService.currentDisplayedProcessTree$.pipe(take(1)).subscribe(tree => {
      this.httpClient.post(this.backendUrl + 'convertPtToPNML', { pt: tree }, { responseType: 'blob' })
        .subscribe(blob => {
          FileSaver.saveAs(blob, 'petri_net.pnml');
        });
    });
  }

  calculateAlignment(variant): Observable<any> {
    const body = { pt: this.sharedDataService.currentDisplayedProcessTree, variant };
    return this.httpClient.post(this.backendUrl + 'calculateAlignment', body);
  }

  calculateAlignmentsCVariant(variant: VariantElement, timeout: number): Observable<any> {
    const body = {
      pt: this.sharedDataService.currentDisplayedProcessTree,
      variant: variant.serialize(),
      timeout: timeout
    };
    return this.httpClient.post(this.backendUrl + 'calculateAlignmentsCVariant', body);
  }

  // TODO this function is currently unused
  addVariantsToModel(variantsToAdd: any[], explicitlyAddedVariants: any[]): void {
    const body = {
      pt: this.sharedDataService.currentDisplayedProcessTree,
      variants_to_add: variantsToAdd,
      fitting_variants: explicitlyAddedVariants
    };
    this.httpClient.post(this.backendUrl + 'addVariantsToProcessModel', body).subscribe(res => {
      this.sharedDataService.currentDisplayedProcessTree = res;
    });
  }

  addConcurrencyVariantsToProcessModel(variantsToAdd: VariantElement[], variantsInModelLanguage: VariantElement[]): Observable<any> {
    const body = {
      pt: this.sharedDataService.currentDisplayedProcessTree,
      variants_to_add: variantsToAdd.map(v => v.serialize()),
      fitting_variants: variantsInModelLanguage.map(v => v.serialize())
    };
    return this.httpClient.post(this.backendUrl + 'addConcurrencyVariantsToProcessModel', body).pipe(tap(res => {
      this.sharedDataService.currentDisplayedProcessTree = res;
    }));
  }

  addConcurrencyVariantsToProcessModelForUnknownConformance(selectedVariants: VariantElement[]): Observable<any> {
    const body = {
      pt: this.sharedDataService.currentDisplayedProcessTree,
      selected_variants: selectedVariants.map(v => v.serialize()),
    };
    return this.httpClient.post(this.backendUrl + 'addConcurrencyVariantsToProcessModelUnknownConformance', body)
      .pipe(tap(res => {
        this.sharedDataService.currentDisplayedProcessTree = res;
      }));
  }

  saveConfiguration(configuration: Configuration): Observable<any> {
    return this.httpClient.post(this.backendUrl + 'saveConfiguration', configuration);
  }

  getConfiguration(): Observable<any> {
    return this.httpClient.get<Configuration>(this.backendUrl + 'getConfiguration');
  }
}

