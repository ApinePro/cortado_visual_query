import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicalQueryEditorComponent } from './graphical-query-editor.component';

describe('GraphicalQueryEditorComponent', () => {
  let component: GraphicalQueryEditorComponent;
  let fixture: ComponentFixture<GraphicalQueryEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GraphicalQueryEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GraphicalQueryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
