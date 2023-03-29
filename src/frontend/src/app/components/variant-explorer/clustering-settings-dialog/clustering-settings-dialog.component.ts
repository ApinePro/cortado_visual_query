import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClusteringAlgorithm } from 'src/app/objects/ClusteringAlgorithm';

export class ClusteringConfig {
  clusteringAlgorithm: ClusteringAlgorithm;
  params: any;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-clustering-settings-dialog',
  templateUrl: './clustering-settings-dialog.component.html',
  styleUrls: ['./clustering-settings-dialog.component.scss'],
})
export class ClusteringSettingsDialogComponent implements OnInit {
  @Input()
  numberOfVariants: number;

  @Input()
  clusteringConfig: ClusteringConfig;
  selectedClusteringAlgorithm: ClusteringAlgorithm;

  options: ClusteringAlgorithm[] = Object.values(ClusteringAlgorithm);

  maxDistance: number = 1;
  nClusters: number = 1;

  constructor(public modal: NgbActiveModal) {}

  ngOnInit(): void {
    this.selectedClusteringAlgorithm =
      ClusteringAlgorithm.AGGLOMERATIVE_EDIT_DISTANCE_CLUSTERING;

    if (this.clusteringConfig) {
      this.selectedClusteringAlgorithm =
        this.clusteringConfig.clusteringAlgorithm;

      if (
        this.selectedClusteringAlgorithm ===
        ClusteringAlgorithm.AGGLOMERATIVE_EDIT_DISTANCE_CLUSTERING
      ) {
        this.maxDistance = this.clusteringConfig.params.maxDistance;
      } else if (
        this.selectedClusteringAlgorithm ===
        ClusteringAlgorithm.LABEL_VECTOR_CLUSTERING
      ) {
        this.nClusters = this.clusteringConfig.params.nClusters;
      }
    }
  }

  setSelectedClusteringAlgorithm(value) {
    this.selectedClusteringAlgorithm = value;
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

    this.modal.close({
      clusteringAlgorithm: this.selectedClusteringAlgorithm,
      params: params,
    });
  }
}
