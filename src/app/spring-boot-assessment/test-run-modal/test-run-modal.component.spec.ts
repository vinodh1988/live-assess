import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestRunModalComponent } from './test-run-modal.component';

describe('TestRunModalComponent', () => {
  let component: TestRunModalComponent;
  let fixture: ComponentFixture<TestRunModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestRunModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestRunModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
