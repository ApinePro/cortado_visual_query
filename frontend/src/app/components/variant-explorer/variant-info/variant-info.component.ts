import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-variant-info',
  templateUrl: './variant-info.component.html',
  styleUrls: ['./variant-info.component.css']
})
export class VariantInfoComponent implements OnInit {

  @Input()
  outdatedConformanceStatistics: boolean;

  @Input()
  variant;

  @Input()
  isExplicitlyAdded: boolean;

  @Output()
  public addExplicitlyAddedVariant = new EventEmitter<void>();

  @Output()
  public removeExplicitlyAdded = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

}
