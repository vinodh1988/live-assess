import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentService } from '../services/assessment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit, OnDestroy {
  personalDetailsForm: FormGroup;
  submitted = false;
  testStarted = false;
  testCompleted = false; // To handle the display when test is completed
  testAlreadyCompleted = false; // New state for already completed tests

  currentQuestionIndex = 0;
  totalQuestions = 0;
  assessmentDetails: any;
  timer: number = 0; // In seconds
  questions: any[] = [];
  answeredQuestions: boolean[] = []; // Track answered questions
  statusObject: any;
  intervalSubscription: Subscription; // For periodic save
  timerInterval: any; // For timer handling

  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService, 
    private route: ActivatedRoute, 
    private router: Router,
    public dialog: MatDialog // Injecting MatDialog
  ) {
    this.personalDetailsForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });
  }

  ngOnInit(): void {
    const assessmentCode = this.route.snapshot.paramMap.get('assessmentcode');
    this.loadAssessmentDetails(assessmentCode);
  }

  ngOnDestroy(): void {
    // Unsubscribe and clear intervals to prevent memory leaks
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
    clearInterval(this.timerInterval);
  }

  loadAssessmentDetails(assessmentCode: string): void {
    this.assessmentService.getTestDetails(assessmentCode).subscribe((details) => {
      this.assessmentDetails = details;
    });
  }

  startTest(): void {
    this.submitted = true;

    if (this.personalDetailsForm.valid) {
      this.testStarted = true;
      const { name, email, phone } = this.personalDetailsForm.value;
      const assessmentCode = this.route.snapshot.paramMap.get('assessmentcode');

      this.assessmentService.getStatus(assessmentCode, email).subscribe(
        (status) => {
          if (status.testStatus) {
            this.testAlreadyCompleted = true;
            return; // Stop further execution if the test is already completed
          }

          this.statusObject = status;
          this.questions = status.questionnos;
          this.totalQuestions = this.questions.length;

          // Initialize answeredQuestions and answers array for all questions
          this.answeredQuestions = this.questions.map((question, index) => {
            const hasAnswered = status.answers[index]?.length > 0 || false;
            if (!this.statusObject.answers[index]) {
              this.statusObject.answers[index] = [];
            }
            return hasAnswered;
          });

          this.timer = (this.statusObject.duration * 60) - (this.statusObject.currentDuration * 60);
          this.startTimer();
        },
        () => {
          // Handle 404 - Fresh session
          this.assessmentService.getOriginalQuestions(assessmentCode).subscribe((questions) => {
               this.assessmentService.getTestDetails(assessmentCode).subscribe((details)=>{
                this.questions = questions;
                this.totalQuestions = questions.length;
    
                // Initialize answers and answeredQuestions arrays
                this.answeredQuestions = questions.map(() => false);
                this.statusObject = {
                  name, email, phone, assessmentcode: assessmentCode,
                  questionnos: questions, answers: Array(questions.length).fill([]), // Initialize all answers as empty arrays
                  duration: details.duration, currentDuration: 0, testStatus: false
                };
                this.timer = this.statusObject.duration * 60;
                this.startTimer();
               })
          });
        }
      );

      // Periodically save the status every minute
      this.intervalSubscription = interval(60000).subscribe(() =>
        this.assessmentService.saveStatus(this.statusObject).subscribe({
          next: () => console.log("Status saved successfully"),
          error: (e) => console.log(e)
        })
      );
    }
  }

  saveAnswer(option: string) {
    const optionIndex = this.questions[this.currentQuestionIndex].options.indexOf(option);
    const answerLetter = String.fromCharCode(65 + optionIndex);

    if (!this.statusObject.answers[this.currentQuestionIndex]) {
      this.statusObject.answers[this.currentQuestionIndex] = [];
    }

    if (this.questions[this.currentQuestionIndex].type === 'single') {
      this.statusObject.answers[this.currentQuestionIndex] = [answerLetter];
    } else {
      const answerIndex = this.statusObject.answers[this.currentQuestionIndex].indexOf(answerLetter);
      if (answerIndex > -1) {
        this.statusObject.answers[this.currentQuestionIndex].splice(answerIndex, 1);
      } else {
        this.statusObject.answers[this.currentQuestionIndex].push(answerLetter);
      }
    }

    this.answeredQuestions[this.currentQuestionIndex] = true;

    // Save status immediately after answering a question
    this.assessmentService.saveStatus(this.statusObject).subscribe({
      next: () => console.log("Status saved successfully after answering"),
      error: (e) => console.log(e)
    });
  }

  isOptionSelected(option: string): boolean {
    const optionIndex = this.questions[this.currentQuestionIndex].options.indexOf(option);
    const answerLetter = String.fromCharCode(65 + optionIndex);
    const selectedAnswer = this.statusObject.answers[this.currentQuestionIndex];
    return selectedAnswer && selectedAnswer.includes(answerLetter);
  }

  navigateToQuestion(index: number) {
    this.currentQuestionIndex = index;
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.totalQuestions - 1) {
      this.currentQuestionIndex++;
    }
  }

  submitTest() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Are you sure you want to submit the test?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.statusObject.testStatus = true;
        this.testCompleted = true; // Set testCompleted to true

        // Stop the interval and timer when submitting
        if (this.intervalSubscription) {
          this.intervalSubscription.unsubscribe();
        }
        clearInterval(this.timerInterval);

        console.log('Submitting final status update...');
        
        // Save final status before evaluating
        this.assessmentService.saveStatus(this.statusObject).subscribe({
          next: () => {
            console.log('Status saved successfully. Calling evaluate endpoint...');

            // Now call the evaluate endpoint after successfully saving the status
            this.assessmentService.evaluateTest(this.statusObject.email, this.statusObject.assessmentcode)
              .subscribe({
                next: (response) => {
                  console.log("Evaluation completed successfully:", response);
                  this.router.navigate(['/confirmation']); // Redirect to a confirmation page after evaluation
                },
                error: (e) => {
                  console.error("Evaluation error:", e);
                  alert('An error occurred while evaluating your test. Please try again.'); 
                }
              });
          },
          error: (e) => {
            console.error("Error saving status:", e);
            alert('An error occurred while saving your status. Please try again.');
          }
        });
      }
    });
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
        this.statusObject.currentDuration = (this.statusObject.duration * 60 - this.timer) / 60;
      } else {
        clearInterval(this.timerInterval);
        this.submitTest(); // Auto-submit when time is up
      }

      if (this.timer === 120) {
        alert('Only 2 minutes remaining!');
      }
    }, 1000);
  }
}
