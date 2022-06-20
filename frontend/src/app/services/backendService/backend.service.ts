import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { Configuration } from 'src/app/components/settings/model';
import {
  deserialize,
  InfixType,
  injectWaitingTimeNodes,
  setParent,
  Variant,
  VariantElement,
} from 'src/app/components/variant-explorer/model';
import { ProcessTree } from 'src/app/objects/ProcessTree';
import { TimeUnit } from 'src/app/objects/TimeUnit';
import { mapVariants } from 'src/app/utils/util';
import { LogService } from '../logService/log.service';
import { VariantService } from '../variantService/variant.service';
import { ProcessTreeService } from './../processTreeService/process-tree.service';
import * as objectHash from 'object-hash';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(
    private httpClient: HttpClient,
    private logService : LogService,
    private variantService : VariantService,
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

  // Refractor too Log Service
  private processEventLog(res, filePath = null) {

    console.warn('Processing Event Log', res)

    this.logService.activitiesInEventLog = res['activities'];
    this.logService.startActivitiesInEventLog = new Set(
      res['startActivities']
    );
    this.logService.endActivitiesInEventLog = new Set(
     res['endActivities']
    );

    const variants = this.addVariantInformation(res['variants'])
    this.computeLogStats(variants)
    this.variantService.variants = variants;

    this.logService.loadedEventLog = filePath;

    this.logService.performanceInfoAvailable = true;
    this.logService.timeGranularity = res['timeGranularity'];
    this.logService.logGranularity = res['timeGranularity'];
  }

  loadProcessTreeFromFilePath(filePath: string): void {
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

  getTreePerformance(variants: number[], remove?: number[]): Observable<any> {
    const body = {
      pt: this.processTreeService.currentDisplayedProcessTree.copy(false),
      variants: variants,
      delete: remove,
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

  public getEventLog(): Observable<any> {
    return this.httpClient.get(this.backendUrl + 'log');
  }

  /**
   * Fetches the properties of the log that is currently cached in the backend.
   * If no time granularity is provided the granularity of the log is computed in
   * the backend.
   * @param timeGranularity
   * @param logName
   */
     public getLogPropsAndUpdateState(
      timeGranularity?: TimeUnit,
      logName?: string
    ): Observable<any> {
      return this.getProperties(timeGranularity).pipe(
        tap((properties) => {
          this.updateState(properties, logName);
        })
      );
    }

    /**
     * Updates the properties in sharedDataService (variants, activities, logName)
     * @param properties
     * @param logName
     */
    private updateState(properties: any, logName: string) {
      this.logService.activitiesInEventLog = properties['activities'];
      this.logService.startActivitiesInEventLog = new Set(
        properties['startActivities']
      );
      this.logService.endActivitiesInEventLog = new Set(
       properties['endActivities']
      );


      const variants = this.addVariantInformation(properties['variants'])
      this.computeLogStats(variants)
      this.variantService.variants = variants;

      this.logService.loadedEventLog = logName;

      console.warn('Variants in Update State', properties['variants'])
    }


    public getProperties(timeGranularity?: TimeUnit): Observable<any> {
      return this.httpClient
        .post(this.backendUrl + 'log/properties', {
          timeGranularity: timeGranularity,
        })
        .pipe(mapVariants());
    }

    public getLogGranularity(): Observable<TimeUnit> {
      return this.httpClient.get<TimeUnit>(this.backendUrl + 'log/granularity');
    }

    public resetLogCache(): Observable<any> {
      return this.httpClient.get(this.backendUrl + 'log/resetLogCache');
    }


    private addVariantInformation(variants : Variant[]) : Variant[] {

      injectWaitingTimeNodes(
        variants.map((v) => v.variant)
      );

      variants.forEach((v, i) => {
        v.isConformanceOutdated = true;
        v.userDefined = false;
        v.isTimeouted = false;
        v.isSelected = false;
        v.isAddedFittingVariant = false;
        v.infixType = InfixType.NOT_AN_INFIX;
        setParent(v.variant);
      });

      return variants

    }

    private computeLogStats(variants : Variant[]) : void {

      const totalNumberTraces = variants
        .map((v) => v.count)
        .reduce((a, b) => a + b);

      variants.forEach((v) => {
        v.percentage = Number.parseFloat(
          ((v.count / totalNumberTraces) * 100).toFixed(2)
        );});

      const numberFittingVariants = 0;
      const numberFittingTraces = 0;
      const totalNumberVariants = variants.length;

      this.logService.update_log_stats(numberFittingTraces, numberFittingVariants, totalNumberTraces, totalNumberVariants)

    }
  }


