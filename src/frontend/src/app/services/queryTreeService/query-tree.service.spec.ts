import { TestBed } from '@angular/core/testing';

import { QueryTreeService } from './query-tree.service';

describe('QueryTreeService', () => {
  let service: QueryTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
