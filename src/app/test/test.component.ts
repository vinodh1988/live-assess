import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AssessmentService } from '../services/assessment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  testLocked = false;
  testExpired = false;
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
    public dialog: MatDialog,
    private sanitizer: DomSanitizer // Add sanitizer
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
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
    clearInterval(this.timerInterval);
  }

  loadAssessmentDetails(assessmentCode: string): void {
    this.assessmentService.getTestDetails(assessmentCode).subscribe((details) => {
      this.assessmentDetails = details;
      if(details.status==="expired")
          this.testExpired=true
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
          if (status.testStatus == true) {
            this.testAlreadyCompleted = true;
            return;
          }

          if (status.testStatus == "locked") {
            this.testLocked = true;
            return;
          }
          this.statusObject = status;
          this.questions = status.questionnos;
          this.totalQuestions = this.questions.length;

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
          this.assessmentService.getOriginalQuestions(assessmentCode).subscribe((questions) => {
            this.assessmentService.getTestDetails(assessmentCode).subscribe((details) => {
              this.questions = questions;
              this.totalQuestions = questions.length;

              this.answeredQuestions = questions.map(() => false);
              this.statusObject = {
                name, email, phone, assessmentcode: assessmentCode,
                questionnos: questions, answers: Array(questions.length).fill([]),
                duration: details.duration, currentDuration: 0, testStatus: false
              };
              this.timer = this.statusObject.duration * 60;
              this.startTimer();
            })
          });
        }
      );

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
        this.finishTest();
      }
    });
  }

  @HostListener('document:visibilitychange', ['$event'])
  handleVisibilityChange(event: Event) {
    if (this.testStarted && !this.testAlreadyCompleted && !this.testCompleted && !this.testLocked) {
      if (document.hidden) {
        this.statusObject.testStatus = "locked";
        this.assessmentService.saveStatus(this.statusObject).subscribe({
          next: () => console.log("Status saved successfully after answering"),
          error: (e) => console.log(e)
        });
        this.testLocked = true;
        alert("You tried to switch tab or minimize window, your test is going to be locked");
      }
    }
  }

  finishTest() {
    this.testCompleted = true;
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
    clearInterval(this.timerInterval);

    this.assessmentService.saveStatus(this.statusObject).subscribe({
      next: () => {
        this.assessmentService.evaluateTest(this.statusObject.email, this.statusObject.assessmentcode)
          .subscribe({
            next: (response) => {
              this.router.navigate(['/confirmation']);
            },
            error: (e) => {
              alert('An error occurred while evaluating your test. Please try again.');
            }
          });
      },
      error: (e) => {
        alert('An error occurred while saving your status. Please try again.');
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
        this.finishTest();
      }

      if (this.timer === 120) {
        alert('Only 2 minutes remaining!');
      }
      if (this.timer === 30) {
        alert('Last 30 seconds');
      }
    }, 990);
  }

  // Function to escape HTML tags and convert \n to <br>
  escapeHTMLTags(content: string): SafeHtml {
    const sanitizedContent = content
      .replace(/<\/?(?!br)([^>]+)>/gi, match => match.replace(/</g, '&lt;').replace(/>/g, '&gt;')) // Escape all HTML tags except <br>
      .replace(/\n/g, '<br>'); // Convert newlines to <br>

    return this.sanitizer.bypassSecurityTrustHtml(sanitizedContent); // Safely bind HTML
  }
}
