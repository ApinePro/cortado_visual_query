import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardinalityModalComponent } from './cardinality-modal.component';

describe('CardinalityModalComponent', () => {
  let component: CardinalityModalComponent;
  let fixture: ComponentFixture<CardinalityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardinalityModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardinalityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
