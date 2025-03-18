import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssessmentService } from '../services/assessment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-assignment-upload',
  templateUrl: './assignment-upload.component.html',
  styleUrls: ['./assignment-upload.component.css']
})
export class AssignmentUploadComponent {
  uploadForm: FormGroup;
  assignmentCode!: string;
  isLoading: boolean = false; // Controls spinner visibility
  uploadSuccess: boolean = false; // Controls success message visibility
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private route: ActivatedRoute
  ) {
    // Initialize the form
    this.uploadForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      src: [null, [Validators.required]],
      presentation: [null, [Validators.required]],
      screenshots: [null, [Validators.required]]
    });

    // Get assignmentCode from the route
    this.assignmentCode = this.route.snapshot.params['assignmentcode'];
  }

  validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  onFileChange(event: any, controlName: string, maxSize: number): void {
    const file = event.target.files[0];
    if (file && this.validateFileSize(file, maxSize)) {
      this.uploadForm.patchValue({ [controlName]: file });
      this.errorMessage = null;
    } else {
      this.uploadForm.patchValue({ [controlName]: null });
      this.errorMessage = `File exceeds the size limit of ${maxSize / (1024 * 1024)} MB`;
    }
  }

  onSubmit(): void {
    if (this.uploadForm.valid) {
      const formData = new FormData();
      formData.append('src', this.uploadForm.get('src')?.value);
      formData.append('presentation', this.uploadForm.get('presentation')?.value);
      formData.append('screenshots', this.uploadForm.get('screenshots')?.value);
      formData.append('name', this.uploadForm.get('name')?.value);
      formData.append('email', this.uploadForm.get('email')?.value);
      formData.append('assignmentcode', this.assignmentCode);

      // Show spinner and reset messages
      this.isLoading = true;
      this.errorMessage = null;

      // Call the API
      this.assessmentService.uploadAssignment(formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.uploadSuccess = true; // Show success message
        },
        error: (error) => {
          this.isLoading = false;
          this.uploadSuccess = false;

          // Handle errors
          if (error.status === 400) {
            this.errorMessage = 'Check the size of the files.';
          } else if (error.status === 404) {
            this.errorMessage = 'Check the URL.';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
          }
        }
      });
    }
  }
}
