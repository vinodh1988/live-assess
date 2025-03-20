import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssessmentService } from '../services/assessment.service';


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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  ngOnInit(): void {
    const assessmentcode = this.route.snapshot.paramMap.get('assessmentcode')!;
    this.fetchAssessmentDetails(assessmentcode);
  }

  fetchAssessmentDetails(assessmentcode: string): void {
    const email = this.form.get('email')?.value || 'default-email@example.com'; // Replace with actual logic if needed
    this.assessmentService.getAssessmentDetails(assessmentcode, email).subscribe((data) => {
      this.assessmentData = data;
      this.pdfUrl = `http://13.90.102.109:5000/spring-boot-files/${this.assessmentData.questioname}`;
    });
  }

  toggleInstructions(): void {
    if (this.buttonText === 'Submission Instructions') {
      this.buttonText = 'View Question';
      this.pdfUrl = `http://13.90.102.109:5000/spring-boot-files/instructions`;
    } else {
      this.buttonText = 'Submission Instructions';
      this.pdfUrl = `http://13.90.102.109:5000/spring-boot-files/${this.assessmentData.questioname}`;
    }
  }

  startTest(): void {
    if (this.form.valid) {
      console.log('Form Data:', this.form.value);
    }
  }
}
