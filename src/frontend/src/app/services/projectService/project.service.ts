import { Inject, Injectable } from '@angular/core';
import { ProcessTreeService } from '../processTreeService/process-tree.service';
import { ElectronServiceInterface } from '../electronService/electron.service';
import { ELECTRON_SERVICE } from 'src/app/tokens';
import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';
import {
  Transform,
  TransformationType,
  Type,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { Variant } from 'src/app/objects/Variants/variant';
import { VariantService } from '../variantService/variant.service';
import { LogService } from '../logService/log.service';
import { DatePipe } from '@angular/common';
import {
  VariantFilterService,
  VariantFilter,
} from '../variantFilterService/variant-filter.service';
import { VariantQueryService } from '../variantQueryService/variant-query.service';
import { environment } from 'src/environments/environment';
import { isEqualWith } from 'lodash';
import { take } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(
    private logService: LogService,
    private processTreeService: ProcessTreeService,
    private variantService: VariantService,
    private variantFilterService: VariantFilterService,
    private variantQueryService: VariantQueryService,
    @Inject(ELECTRON_SERVICE) private electronService: ElectronServiceInterface
  ) {
    this.variantService.variants$.pipe(take(2)).subscribe((variants) => {
      this.latestSavedProject = instanceToPlain(
        new Project(
          this.processTreeService.currentDisplayedProcessTree,
          this.processTreeService.selectedRootNodeID,
          variants,
          this.variantFilterService.variantFilters,
          this.variantQueryService.variantQuery
        ),
        { enableCircularCheck: true }
      );
    });

    this.electronService.checkUnsavedChanges$.subscribe((sender) =>
      sender.send('unsaved-changes', this.unsavedChanges)
    );

    this.electronService.saveProject$.subscribe((sender) =>
      this.saveProject().then((filePath) => {
        if (filePath) sender.send('quit');
      })
    );
  }

  private latestSavedProject: Record<string, any>;

  get unsavedChanges(): boolean {
    return !isEqualWith(
      this.latestSavedProject,
      JSON.parse(
        JSON.stringify(
          instanceToPlain(this.currentProject, { enableCircularCheck: true })
        )
      ),
      (a, b, key) => {
        // ignore parent property
        if (key === 'parent') return true;
        return undefined;
      }
    );
  }

  get currentProject(): Project {
    return new Project(
      this.processTreeService.currentDisplayedProcessTree,
      this.processTreeService.selectedRootNodeID,
      this.variantService.variants,
      this.variantFilterService.variantFilters,
      this.variantQueryService.variantQuery
    );
  }

  public loadProject(file: File) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.latestSavedProject = JSON.parse(fileReader.result.toString());
      const project = plainToInstance(Project, this.latestSavedProject);

      this.processTreeService.currentDisplayedProcessTree = project.processTree;
      this.processTreeService.selectedRootNodeID = project.selectedRootNodeID;
      this.variantService.variants = project.variants;
      this.variantFilterService.variantFilters = project.variantFilters;
      this.variantQueryService.variantQuery = project.variantQuery;
    };
    fileReader.readAsText(file);
  }

  public async saveProject() {
    const now = new Date();
    const datepipe: DatePipe = new DatePipe('en-US');
    const formattedDate = datepipe.transform(now, 'YYYY_MM_dd_HH_mm');

    const project = JSON.stringify(
      instanceToPlain(this.currentProject, {
        enableCircularCheck: true,
      })
    );
    const filePath = await this.electronService.showSaveDialog(
      `cortado_${
        this.logService.loadedEventLog.split('.')[0]
      }_${formattedDate}`,
      'json',
      new Blob([project]),
      'Save project',
      'Save Cortado Project'
    );
    if (filePath) this.latestSavedProject = JSON.parse(project);
    return filePath;
  }
}

class Project {
  public cortadoVersion: string;
  @Type(() => ProcessTree)
  public processTree: ProcessTree;
  public selectedRootNodeID: number;
  @Type(() => Variant)
  public variants: Variant[];
  @Transform(({ value, key, obj, type }) => {
    if (type === TransformationType.PLAIN_TO_CLASS) {
      let map = new Map<string, VariantFilter>();
      for (let entry of Object.entries(value))
        map.set(entry[0], plainToInstance(VariantFilter, entry[1]));
      return map;
    }
    return value;
  })
  public variantFilters: Map<string, VariantFilter>;
  public variantQuery: string;
  constructor(
    processTree: ProcessTree,
    selectedRootNodeID: number,
    variants: Variant[],
    variantFilters: Map<string, VariantFilter>,
    variantQuery: string,
    cortadoVersion: string = environment.VERSION
  ) {
    this.processTree = processTree;
    this.selectedRootNodeID = selectedRootNodeID;
    this.variants = variants;
    this.variantFilters = variantFilters;
    this.variantQuery = variantQuery;
    this.cortadoVersion = cortadoVersion;
  }
}
