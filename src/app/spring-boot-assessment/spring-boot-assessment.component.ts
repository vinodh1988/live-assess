import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssessmentService } from '../services/assessment.service';
import { MatDialog } from '@angular/material/dialog';
import { TestRunModalComponent } from './test-run-modal/test-run-modal.component';


@Component({
  selector: 'app-spring-boot-assessment',
  templateUrl: './spring-boot-assessment.component.html',
  styleUrls: ['./spring-boot-assessment.component.css'],
})
export class SpringBootAssessmentComponent implements OnInit {
  form: FormGroup;
  assessmentData: any;
  pdfUrl: string = '';
  buttonText = 'Submission Instructions';
  showDetails = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  ngOnInit(): void {}

  startTest(): void {
    if (this.form.valid) {
      const assessmentcode = this.route.snapshot.paramMap.get('assessmentcode')!;
      const email = this.form.get('email')?.value;

      this.assessmentService.getAssessmentDetails(assessmentcode, email).subscribe((data) => {
        this.assessmentData = data;
        console.log(this.assessmentData)
        this.pdfUrl = `http://13.90.102.109:5000/spring-boot-files/${this.assessmentData.questionname}`;
        this.showDetails = true; // Toggle to show details
      });
    }
  }

  toggleInstructions(): void {
    if (this.buttonText === 'Submission Instructions') {
      this.buttonText = 'View Question';
      this.pdfUrl = `http://13.90.102.109:5000/spring-boot-files/instructions`;
    } else {
      this.buttonText = 'Submission Instructions';
      this.pdfUrl = `http://13.90.102.109:5000/spring-boot-files/${this.assessmentData.questionname}`;
    }
  }

  testRun(){
    const dialogRef = this.dialog.open(TestRunModalComponent, {
      width: '500px',
      maxHeight: '90vh', // Limit the height to 90% of the viewport
      data: {
        name: this.form.get('name')?.value,
        email: this.form.get('email')?.value,
        questionname: this.assessmentData?.questionname,
        assessmentcode: this.route.snapshot.paramMap.get('assessmentcode')
      },
      disableClose: true, // Prevent closing on outside click
      panelClass: 'custom-modal' // Apply custom styling for scrolling
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Results:', result.results);
        console.log('Score:', result.score);
      }
    });
  
  }
}
