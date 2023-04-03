import { Inject, Injectable } from '@angular/core';
import { ProcessTreeService } from '../processTreeService/process-tree.service';
import { ElectronServiceInterface } from '../electronService/electron.service';
import { ELECTRON_SERVICE } from 'src/app/tokens';
import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';
import {
  Transform,
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
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(
    private logService: LogService,
    private processTreeService: ProcessTreeService,
    private variantService: VariantService,
    private variantFilterService: VariantFilterService,
    @Inject(ELECTRON_SERVICE) private electronService: ElectronServiceInterface
  ) {}

  public loadProject(file: File) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const project = plainToInstance(
        Project,
        JSON.parse(fileReader.result.toString())
      );

      console.log(project);

      this.processTreeService.currentDisplayedProcessTree = project.processTree;
      this.processTreeService.selectedRootNodeID = project.selectedRootNodeID;
      this.variantService.variants = project.variants;
      this.variantFilterService.variantFilters = project.variantFilters;

      console.log(this.variantFilterService.variantFilters);
    };
    fileReader.readAsText(file);
  }

  public saveProject() {
    const project = new Project(
      this.processTreeService.currentDisplayedProcessTree,
      this.processTreeService.selectedRootNodeID,
      this.variantService.variants,
      this.variantFilterService.variantFilters
    );

    console.log('Project to be serialized:', project);

    const now = new Date();
    const datepipe: DatePipe = new DatePipe('en-US');
    const formattedDate = datepipe.transform(now, 'YYYY_MM_dd_HH_mm');

    this.electronService.showSaveDialog(
      `cortado_project_${this.logService.loadedEventLog}_${formattedDate}`,
      'json',
      new Blob([
        JSON.stringify(instanceToPlain(project, { enableCircularCheck: true })),
      ]),
      'Save project',
      'Save Cortado Project'
    );
  }
}

class Project {
  @Type(() => ProcessTree)
  public processTree: ProcessTree;
  public selectedRootNodeID: number;
  @Type(() => Variant)
  public variants: Variant[];
  @Transform(
    ({ value, key, obj, type }) => {
      let map = new Map<string, VariantFilter>();
      for (let entry of Object.entries(value))
        map.set(entry[0], plainToInstance(VariantFilter, entry[1]));
      return map;
    },
    { toClassOnly: true }
  )
  public variantFilters: Map<string, VariantFilter>;
  constructor(
    processTree: ProcessTree,
    selectedRootNodeID: number,
    variants: Variant[],
    variantFilters: Map<string, VariantFilter>
  ) {
    this.processTree = processTree;
    this.selectedRootNodeID = selectedRootNodeID;
    this.variants = variants;
    this.variantFilters = variantFilters;
  }
}
