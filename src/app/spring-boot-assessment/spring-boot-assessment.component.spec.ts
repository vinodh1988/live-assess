import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpringBootAssessmentComponent } from './spring-boot-assessment.component';

describe('SpringBootAssessmentComponent', () => {
  let component: SpringBootAssessmentComponent;
  let fixture: ComponentFixture<SpringBootAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpringBootAssessmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpringBootAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
