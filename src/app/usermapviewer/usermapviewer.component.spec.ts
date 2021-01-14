import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsermapviewerComponent } from './usermapviewer.component';

describe('UsermapviewerComponent', () => {
  let component: UsermapviewerComponent;
  let fixture: ComponentFixture<UsermapviewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsermapviewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsermapviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
