import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as pdfjsLib from 'pdfjs-dist';
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
  showDetails = false;

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

  ngOnInit(): void {}

  startTest(): void {
    if (this.form.valid) {
      const assessmentcode = this.route.snapshot.paramMap.get('assessmentcode')!;
      const email = this.form.get('email')?.value;

      this.assessmentService.getAssessmentDetails(assessmentcode, email).subscribe((data) => {
        this.assessmentData = data;
        this.pdfUrl = `http://13.90.102.109:5000/spring-boot-files/${this.assessmentData.questioname}`;
        this.showDetails = true;
        this.renderPDF(this.pdfUrl);
      });
    }
  }

  toggleInstructions(): void {
    if (this.buttonText === 'Submission Instructions') {
      this.buttonText = 'View Question';
      this.pdfUrl = `http://13.90.102.109:5000/spring-boot-files/instructions`;
    } else {
      this.buttonText = 'Submission Instructions';
      this.pdfUrl = `http://13.90.102.109:5000/spring-boot-files/${this.assessmentData.questioname}`;
    }
    this.renderPDF(this.pdfUrl);
  }

  renderPDF(url: string): void {
    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then((pdf) => {
      const viewer = document.getElementById('pdfViewer')!;
      viewer.innerHTML = ''; // Clear previous PDF content
      pdf.getPage(1).then((page) => {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        viewer.appendChild(canvas);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        page.render(renderContext);
      });
    });
  }
}
