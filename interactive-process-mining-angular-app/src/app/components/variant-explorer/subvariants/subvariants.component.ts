import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-subvariants',
  templateUrl: './subvariants.component.html',
  styleUrls: ['./subvariants.component.css']
})
export class SubvariantsComponent implements OnInit {

  // constructor(@MAT_DIALOG_DATA data) { }

  @Input()
  public variant;

  ngOnInit(): void {
  }

  
}
