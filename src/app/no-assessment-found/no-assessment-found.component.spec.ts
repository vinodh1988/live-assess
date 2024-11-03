import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoAssessmentFoundComponent } from './no-assessment-found.component';

describe('NoAssessmentFoundComponent', () => {
  let component: NoAssessmentFoundComponent;
  let fixture: ComponentFixture<NoAssessmentFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoAssessmentFoundComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NoAssessmentFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
