import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubvariantsComponent } from './subvariants.component';

describe('SubvariantsComponent', () => {
  let component: SubvariantsComponent;
  let fixture: ComponentFixture<SubvariantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubvariantsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubvariantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
