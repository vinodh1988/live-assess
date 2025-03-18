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
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false; // Spinner visibility state

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

      // Show the spinner and clear messages
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      // Call the API
      this.assessmentService.uploadAssignment(formData).subscribe({
        next: (response) => {
          console.log('Upload successful:', response);
          this.successMessage = 'Upload successful!';
          this.isLoading = false; // Hide the spinner
        },
        error: (error) => {
          console.error('Upload failed:', error);

          // Display error messages based on API response status
          if (error.status === 400) {
            this.errorMessage = 'Check the size of the files.';
          } else if (error.status === 404) {
            this.errorMessage = 'Check the URL.';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
          }

          this.isLoading = false; // Hide the spinner
        }
      });
    }
  }
}
