import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalSubmitDialogComponent } from './final-submit-dialog.component';

describe('FinalSubmitDialogComponent', () => {
  let component: FinalSubmitDialogComponent;
  let fixture: ComponentFixture<FinalSubmitDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FinalSubmitDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinalSubmitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
