import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubvariantInfoExplorerComponent } from './subvariant-info-explorer.component';

describe('SubvariantInfoExplorerComponent', () => {
  let component: SubvariantInfoExplorerComponent;
  let fixture: ComponentFixture<SubvariantInfoExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubvariantInfoExplorerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubvariantInfoExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
