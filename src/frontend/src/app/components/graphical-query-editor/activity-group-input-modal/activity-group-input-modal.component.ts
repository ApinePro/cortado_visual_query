import { Component, Input, OnDestroy, OnInit, EventEmitter, Output} from '@angular/core';
import { VariantService } from 'src/app/services/variantService/variant.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
declare var $;

@Component({
  selector: 'app-activity-group-input-modal',
  templateUrl: './activity-group-input-modal.component.html',
  styleUrls: ['./activity-group-input-modal.component.css']
})
export class ActivityGroupInputModalComponent {
  
  @Output() nameConfirmed = new EventEmitter();

  redundancyWarning = false;
  public groupName: string = 'Group X';
  private _destroy$ = new Subject();

  constructor(private variantService: VariantService) {
    const a = 1;
  }

  ngOnInit(): void {
    this.variantService.showGroupNameDialog
      .pipe(takeUntil(this._destroy$))
      .subscribe((_) => {
        console.log('group name!!!!');
        this.showModal();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  showModal(): void {
    $('#groupNameModalDialog').modal('show');
  }

  hideModal(): void {
    $('#groupNameModalDialog').modal('hide');
  }

  applyGroupName() {
    this.nameConfirmed.emit({
      groupName: this.groupName
    });
    this.hideModal();
  }
}
