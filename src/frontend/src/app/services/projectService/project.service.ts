import { Inject, Injectable } from '@angular/core';
import { ProcessTreeService } from '../processTreeService/process-tree.service';
import { ElectronServiceInterface } from '../electronService/electron.service';
import { ELECTRON_SERVICE } from 'src/app/tokens';
import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';
import { Type, instanceToPlain, plainToInstance } from 'class-transformer';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(
    private processTreeService: ProcessTreeService,
    @Inject(ELECTRON_SERVICE) private electronService: ElectronServiceInterface
  ) {}

  public loadProject(file: File) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const project = plainToInstance(
        Project,
        JSON.parse(fileReader.result.toString())
      );

      this.processTreeService.currentDisplayedProcessTree = project.processTree;
    };
    fileReader.readAsText(file);
  }

  public saveProject() {
    const project = new Project(
      this.processTreeService.currentDisplayedProcessTree
    );

    this.electronService.showSaveDialog(
      'cortado_project',
      'json',
      new Blob([
        JSON.stringify(instanceToPlain(project, { enableCircularCheck: true })),
      ]),
      'Save project',
      'Save Cortado Project'
    );
  }
}

export class Project {
  @Type(() => ProcessTree)
  public processTree: ProcessTree;
  constructor(processTree: ProcessTree) {
    this.processTree = processTree;
  }
}
