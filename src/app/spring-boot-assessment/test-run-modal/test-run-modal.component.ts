import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssessmentService } from '../../services/assessment.service';


@Component({
  selector: 'app-test-run-modal',
  templateUrl: './test-run-modal.component.html',
  styleUrls: ['./test-run-modal.component.css']
})
export class TestRunModalComponent {
  form: FormGroup;
  file: File | null = null;
  fileError = false;
  isProcessing = false;
  processingTimeout: any;
  results: any[] = [];
  score = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private dialogRef: MatDialogRef<TestRunModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name: [data.name, Validators.required],
      email: [data.email, [Validators.required, Validators.email]],
      questionname: [data.questionname, Validators.required],
      assessmentcode: [data.assessmentcode, Validators.required],
      status: ['ongoing', Validators.required]
    });
  }

  onFileSelected(event: any): void {
    const selectedFile = event.target.files[0];
    this.fileError = selectedFile?.name !== 'src.zip';
    this.file = this.fileError ? null : selectedFile;
  }

  onSubmit(): void {
    if (this.form.valid && this.file) {
      this.isProcessing = true;
  
      const formData = new FormData();
      Object.keys(this.form.value).forEach((key) =>
        formData.append(key, this.form.value[key])
      );
      formData.append('file', this.file);
  
      this.assessmentService.uploadAssessmentData(formData).subscribe({
        next: (response) => {
          clearTimeout(this.processingTimeout);
          this.isProcessing = false;
          this.results = response.results;
          this.score = `${this.results.filter((r: any) => r.status === 'PASSED').length}/${this.results.length}`;
        },
        error: (err) => {
          clearTimeout(this.processingTimeout);
          this.isProcessing = false;
          this.errorMessage = 'Submission failed. Please try again later.';
        }
      });
  
      this.processingTimeout = setTimeout(() => {
        this.isProcessing = false;
        this.errorMessage = 'The process is taking too long. Please try again later.';
      }, 300000);
    }
  
  }

  onClose(): void {
    this.dialogRef.close({ results: this.results, score: this.score });
  }
}