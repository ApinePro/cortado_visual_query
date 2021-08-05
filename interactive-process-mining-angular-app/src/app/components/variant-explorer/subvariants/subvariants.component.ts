import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-subvariants',
  templateUrl: './subvariants.component.html',
  styleUrls: ['./subvariants.component.css']
})
export class SubvariantsComponent implements OnInit {

  @Input()
  public subvariants;

  @Input()
  public outdatedConformanceStatistics: boolean;

  @Input()
  public isExplicitlyAdded: (i: number, ii: number) => boolean;

  @Input()
  public isSelected: (i: number, ii: number) => boolean;

  @Input()
  public colorMap: Map<string, string>;

  @Output()
  public addExplicitlyAddedVariant = new EventEmitter<[number, number]>();

  @Output()
  public setExplicitlyAdded = new EventEmitter<[number, number, boolean]>();

  @Output()
  public toggleSelectSubVariant = new EventEmitter<[number, number]>();


  ngOnInit(): void {
    console.log("")
  }

}
