import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityGroupInputModalComponent } from './activity-group-input-modal.component';

describe('ActivityGroupInputModalComponent', () => {
  let component: ActivityGroupInputModalComponent;
  let fixture: ComponentFixture<ActivityGroupInputModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityGroupInputModalComponent]
    });
    fixture = TestBed.createComponent(ActivityGroupInputModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
