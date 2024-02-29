import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryTreeLeafNodeComponent } from './query-tree-leaf-node.component';

describe('QueryTreeLeafNodeComponent', () => {
  let component: QueryTreeLeafNodeComponent;
  let fixture: ComponentFixture<QueryTreeLeafNodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QueryTreeLeafNodeComponent]
    });
    fixture = TestBed.createComponent(QueryTreeLeafNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
