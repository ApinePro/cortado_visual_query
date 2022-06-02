import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { Configuration } from 'src/app/components/settings/model';
import {
  Variant,
  VariantElement,
} from 'src/app/components/variant-explorer/model';
import { ProcessTree } from 'src/app/objects/ProcessTree';
import { mapVariants } from 'src/app/utils/util';
import { SharedDataService } from '../sharedDataService/shared-data.service';
import { ProcessTreeService } from './../processTreeService/process-tree.service';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(
    private httpClient: HttpClient,
    private sharedDataService: SharedDataService,
    private processTreeService: ProcessTreeService
  ) {}

  backendUrl = 'http://127.0.0.1:41211/';

  loadEventLogFromFilePath(filePath: string): void {
    this.httpClient
      .post(this.backendUrl + 'loadEventLog', { file_path: filePath })
      .pipe(mapVariants())
      .subscribe((res) => {
        this.processEventLog(res, filePath);
      });
  }

  uploadEventLog(file: File) {
    console.log(file);
    let formData = new FormData();
    formData.append('file', file);

    this.httpClient
      .post(this.backendUrl + 'uploadfile', formData)
      .pipe(mapVariants())
      .subscribe((res) => {
        console.log('Event log ' + file.name + ' loaded');
        this.processEventLog(res, file.name);
      });
  }

  private processEventLog(res, filePath) {
    this.sharedDataService.activitiesInEventLog = res['activities'];
    this.sharedDataService.startActivitiesInEventLog = new Set(
      Object.keys(res['startActivities'])
    );
    this.sharedDataService.endActivitiesInEventLog = new Set(
      Object.keys(res['endActivities'])
    );

    this.sharedDataService.variants = res['variants'];
    this.sharedDataService.loadedEventLog = filePath;
    this.sharedDataService.performanceInfoAvailable = true;
    this.sharedDataService.timeGranularity = res['timeGranularity'];
    this.sharedDataService.logGranularity = res['timeGranularity'];
  }

  loadProcessTreeFromFilePath(filePath: string): void {
    console.log(filePath);
    this.httpClient
      .post(this.backendUrl + 'loadProcessTreeFromPtmlFile', {
        file_path: filePath,
      })
      .subscribe((tree) => {
        this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
          tree
        );
      });
  }

  discoverProcessModelFromVariants(variants: any[]): void {
    this.httpClient
      .post(this.backendUrl + 'discoverProcessModelFromVariants', {
        variants: variants,
      })
      .subscribe((tree) => {
        this.processTreeService.currentDisplayedProcessTree = tree;
      });
  }

  discoverProcessModelFromConcurrencyVariants(
    variants: VariantElement[]
  ): Observable<any> {
    const variantsSerialized = variants.map((v) => v.serialize());
    return this.httpClient
      .post(this.backendUrl + 'discoverProcessModelFromConcurrencyVariants', {
        variants: variantsSerialized,
      })
      .pipe(
        tap((tree) => {
          console.log('Parsing Tree after Request');
          this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
            tree
          );
        })
      );
  }

  computeTreeString(tree: ProcessTree): void {
    this.httpClient
      .post(this.backendUrl + 'computeTreeStringFromTree', {
        pt: tree.copy(false),
      })
      .subscribe((tree) => {
        this.processTreeService.currentTreeString = tree;
      });
  }

  renderStringToPT(treeString: string) {
    return this.httpClient.post(this.backendUrl + 'parseStringToPT', {
      pt_string: treeString,
    });
  }

  downloadCurrentTreeAsBPMN(): void {
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(take(1))
      .subscribe((tree) => {
        this.httpClient
          .post(
            this.backendUrl + 'convertPtToBPMN',
            { pt: tree.copy(false) },
            { responseType: 'blob' }
          )
          .subscribe((blob) => {
            FileSaver.saveAs(blob, 'bpmn_model.bpmn');
          });
      });
  }

  downloadCurrentTreeAsPTML(): void {
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(take(1))
      .subscribe((tree) => {
        this.httpClient
          .post(
            this.backendUrl + 'convertPtToPTML',
            { pt: tree.copy(false) },
            { responseType: 'blob' }
          )
          .subscribe((blob) => {
            FileSaver.saveAs(blob, 'process_tree.ptml');
          });
      });
  }

  downloadCurrentTreeAsPNML(): void {
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(take(1))
      .subscribe((tree) => {
        this.httpClient
          .post(
            this.backendUrl + 'convertPtToPNML',
            { pt: tree.copy(false) },
            { responseType: 'blob' }
          )
          .subscribe((blob) => {
            FileSaver.saveAs(blob, 'petri_net.pnml');
          });
      });
  }

  applyTreeReductionRules(): void {
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(take(1))
      .subscribe((tree) => {
        this.httpClient
          .post(this.backendUrl + 'applyReductionRulesToTree', {
            pt: tree.copy(false),
          })
          .subscribe((tree) =>
            this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
              tree
            )
          );
      });
  }

  // TODO this function is currently unused
  addVariantsToModel(
    variantsToAdd: any[],
    explicitlyAddedVariants: any[]
  ): void {
    const body = {
      pt: this.processTreeService.currentDisplayedProcessTree.copy(false),
      variants_to_add: variantsToAdd,
      fitting_variants: explicitlyAddedVariants,
    };
    this.httpClient
      .post(this.backendUrl + 'addVariantsToProcessModel', body)
      .subscribe((res) => {
        this.processTreeService.set_currentDisplayedProcessTree_with_Cache(res);
      });
  }

  getTreePerformance(
    variants: VariantElement[],
    remove?: Variant[]
  ): Observable<any> {
    const body = {
      pt: this.processTreeService.currentDisplayedProcessTree.copy(false),
      variants: variants.map((v) => v.serialize()),
      delete: remove?.map((v) => v.variant.serialize()),
    };

    return this.httpClient.post(
      this.backendUrl + 'calculateVariantsPerformance',
      body
    );
  }

  addConcurrencyVariantsToProcessModel(
    variantsToAdd: VariantElement[],
    variantsInModelLanguage: VariantElement[]
  ): Observable<any> {
    const body = {
      pt: this.processTreeService.currentDisplayedProcessTree.copy(false),
      variants_to_add: variantsToAdd.map((v) => v.serialize()),
      fitting_variants: variantsInModelLanguage.map((v) => v.serialize()),
    };
    return this.httpClient
      .post(this.backendUrl + 'addConcurrencyVariantsToProcessModel', body)
      .pipe(
        tap((res) => {
          console.log('Tree Received from BackEnd Service', res);
          this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
            res
          );
        })
      );
  }

  addConcurrencyVariantsToProcessModelForUnknownConformance(
    selectedVariants: VariantElement[]
  ): Observable<any> {
    const body = {
      pt: this.processTreeService.currentDisplayedProcessTree.copy(false),
      selected_variants: selectedVariants.map((v) => v.serialize()),
    };
    return this.httpClient
      .post(
        this.backendUrl +
          'addConcurrencyVariantsToProcessModelUnknownConformance',
        body
      )
      .pipe(
        tap((res) => {
          console.log('Tree Received from BackEnd Service', res);
          this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
            res
          );
        })
      );
  }

  saveConfiguration(configuration: Configuration): Observable<any> {
    return this.httpClient.post(
      this.backendUrl + 'saveConfiguration',
      configuration
    );
  }

  getConfiguration(): Observable<any> {
    return this.httpClient.get<Configuration>(
      this.backendUrl + 'getConfiguration'
    );
  }

  variantQuery(query: string): Observable<any> {
    const queryBody = { queryString: query };
    return this.httpClient.post(this.backendUrl + 'variant-query', queryBody);
  }

  getInfo(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'info');
  }
}
