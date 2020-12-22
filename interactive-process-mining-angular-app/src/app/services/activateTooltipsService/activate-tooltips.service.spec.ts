import { TestBed } from '@angular/core/testing';

import { ActivateTooltipsService } from './activate-tooltips.service';

describe('ActivateTooltipsService', () => {
  let service: ActivateTooltipsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivateTooltipsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
