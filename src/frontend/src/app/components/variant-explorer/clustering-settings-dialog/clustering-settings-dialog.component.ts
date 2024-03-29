import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClusteringAlgorithm } from 'src/app/objects/ClusteringAlgorithm';
import { VariantService } from 'src/app/services/variantService/variant.service';
import { DocumentationService } from '../../documentation/documentation.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-clustering-settings-dialog',
  templateUrl: './clustering-settings-dialog.component.html',
  styleUrls: ['./clustering-settings-dialog.component.scss'],
})
export class ClusteringSettingsDialogComponent implements OnInit {
  @Input()
  numberOfVariants: number;

  selectedClusteringAlgorithm: ClusteringAlgorithm =
    ClusteringAlgorithm.AGGLOMERATIVE_EDIT_DISTANCE_CLUSTERING;

  options: ClusteringAlgorithm[] = Object.values(ClusteringAlgorithm);

  maxDistance: number = 1;
  nClusters: number = 1;

  constructor(
    public modal: NgbActiveModal,
    private variantService: VariantService,
    private documentationService: DocumentationService
  ) {}

  ngOnInit(): void {
    const clusteringConfig = this.variantService.clusteringConfig;
    if (clusteringConfig) {
      this.selectedClusteringAlgorithm = clusteringConfig.algorithm;

      if (
        this.selectedClusteringAlgorithm ===
        ClusteringAlgorithm.AGGLOMERATIVE_EDIT_DISTANCE_CLUSTERING
      ) {
        this.maxDistance = clusteringConfig.params.maxDistance;
      } else if (
        this.selectedClusteringAlgorithm ===
        ClusteringAlgorithm.LABEL_VECTOR_CLUSTERING
      ) {
        this.nClusters = clusteringConfig.params.nClusters;
      }
    }
  }

  getDisplayName(algo: ClusteringAlgorithm) {
    switch (algo) {
      case ClusteringAlgorithm.AGGLOMERATIVE_EDIT_DISTANCE_CLUSTERING:
        return 'Agglomerative edit distance clustering';
      case ClusteringAlgorithm.LABEL_VECTOR_CLUSTERING:
        return 'Label vector clustering';
    }
  }

  onApply() {
    let params = {};

    if (
      this.selectedClusteringAlgorithm ==
      ClusteringAlgorithm.AGGLOMERATIVE_EDIT_DISTANCE_CLUSTERING
    ) {
      params['maxDistance'] = this.maxDistance;
    } else if (
      this.selectedClusteringAlgorithm ==
      ClusteringAlgorithm.LABEL_VECTOR_CLUSTERING
    ) {
      params['nClusters'] = this.nClusters;
    }

    this.variantService.clusteringConfig = {
      algorithm: this.selectedClusteringAlgorithm,
      params: params,
    };

    this.modal.close();
  }

  onReset() {
    this.variantService.clusteringConfig = null;
    this.modal.dismiss('reset');
  }

  openDocumentation(heading: string) {
    this.documentationService.showDocumentationDialog(heading);
    this.modal.dismiss('cancel click');
  }
}
