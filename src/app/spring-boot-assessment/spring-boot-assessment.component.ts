import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssessmentService } from '../services/assessment.service';
import { MatDialog } from '@angular/material/dialog';
import { TestRunModalComponent } from './test-run-modal/test-run-modal.component';
import { FinalSubmitDialogComponent } from './final-submit-dialog/final-submit-dialog.component';
import { PdfHorizontalScrollComponent } from 'ngx-extended-pdf-viewer';


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
  message = '';
  showMessage = false;
  testresults: any[] = [];
  score = '';
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
        if (this.assessmentData.status === 'yettostart') {
          this.message = 'Assessment yet to start';
          this.showMessage = true;
        } else if (this.assessmentData.status === 'expired') {
          this.message = 'This assessment is expired and not active anymore';
          this.showMessage = true;
        } else if (this.assessmentData.questionname === 'completed') {
          this.message = 'You have completed this assessment already';
          this.showMessage = true;
        }
  
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
        Phone: this.form.get('phone')?.value,
        batchname: this.assessmentData?.batchname,
        questionname: this.assessmentData?.questionname,
        assessmentcode: this.route.snapshot.paramMap.get('assessmentcode')
      },
      disableClose: true, // Prevent closing on outside click
      panelClass: 'custom-modal' // Apply custom styling for scrolling
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
   
        this.testresults = result.results; // Save Test Run results
        this.score = result.score;
        console.log('Results:', result.results);
        console.log('Score:', result.score);
      }
    });
  
  }

  finalSubmit(): void {
    const dialogRef = this.dialog.open(FinalSubmitDialogComponent, {
      width: '500px',
      data: {
        message: 'You are about to Final Submit your tested project. Remember your code will not be compiled and executed. Your last test run results will be uploaded. If you want to check the code correctness before submitting, click Test Run and check the results, then submit.'
      },
      disableClose: true // Prevent closing on outside click
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'ok') {
        // Prepare the API call payload
        const statusObject = {
          assessmentcode: this.assessmentData.assessmentcode,
          batchname: this.assessmentData.batchname, // Replace with dynamic batch name
          name: this.assessmentData.name,
          email: this.assessmentData.email,
          phone: this.assessmentData.phone,
          status: 'completed',
          testresults: this.assessmentData.testresults, // Use the stored test results
          score: this.assessmentData.score // Use the stored score
        };

        // Call the API to update status
        this.assessmentService.updateSpringAssessmentStatus(statusObject).subscribe({
          next: (response) => {
            this.showMessage = true;
            this.message = 'Assessment successfully submitted';
          },
          error: (err) => {
            alert('Failed to submit the assessment. Please try again later.');
          }
        });
      }
    });
  }

}
