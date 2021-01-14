import { TestBed, inject } from '@angular/core/testing';

import { GenericCallService } from './generic-call.service';

describe('GenericCallService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenericCallService]
    });
  });

  it('should be created', inject([GenericCallService], (service: GenericCallService) => {
    expect(service).toBeTruthy();
  }));
});
