import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AssessmentService } from '../services/assessment.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
})
export class TestComponent implements OnInit, OnDestroy {
  personalDetailsForm: FormGroup;
  testStarted = false;
  testCompleted = false;
  testLocked = false;
  testExpired = false;
  testAlreadyCompleted = false;

  assessmentDetails: any;
  questions: any[] = [];
  currentQuestionIndex = 0;
  answeredQuestions: boolean[] = [];
  totalQuestions = 0;

  timer = 0;
  timerInterval: any;
  intervalSubscription: Subscription;

  statusObject: any;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this.personalDetailsForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
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
      if (details.status === 'expired') {
        this.testExpired = true;
      }
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
          if (status.testStatus === true) {
            this.testAlreadyCompleted = true;
            return;
          }
          if (status.testStatus === 'locked') {
            this.testLocked = true;
            return;
          }

          this.initializeTest(status, name, email, phone, assessmentCode);
        },
        () => {
          this.fetchOriginalQuestions(name, email, phone, assessmentCode);
        }
      );

      this.intervalSubscription = interval(60000).subscribe(() =>
        this.assessmentService.saveStatus(this.statusObject).subscribe({
          next: () => console.log('Status saved successfully'),
          error: (err) => console.error('Error saving status:', err),
        })
      );
    }
  }

  initializeTest(status, name, email, phone, assessmentCode): void {
    this.statusObject = status;
    this.questions = status.questionnos;
    this.totalQuestions = this.questions.length;

    this.answeredQuestions = this.questions.map((_, index) => {
      if (!this.statusObject.answers[index]) {
        this.statusObject.answers[index] = [];
      }
      return this.statusObject.answers[index].length > 0;
    });

    this.timer = this.statusObject.duration * 60 - this.statusObject.currentDuration * 60;
    this.startTimer();
  }

  fetchOriginalQuestions(name, email, phone, assessmentCode): void {
    this.assessmentService.getOriginalQuestions(assessmentCode).subscribe((questions) => {
      this.assessmentService.getTestDetails(assessmentCode).subscribe((details) => {
        this.questions = questions;
        this.totalQuestions = questions.length;

        this.answeredQuestions = Array(questions.length).fill(false);
        this.statusObject = {
          name,
          email,
          phone,
          assessmentcode: assessmentCode,
          questionnos: questions,
          answers: Array(questions.length).fill([]),
          duration: details.duration,
          currentDuration: 0,
        };
        this.timer = details.duration * 60;
        this.startTimer();
      });
    });
  }

  saveAnswer(option: string): void {
    const question = this.questions[this.currentQuestionIndex];
    const optionIndex = question.options.indexOf(option);
    const answerLetter = String.fromCharCode(65 + optionIndex);

    if (!this.statusObject.answers[this.currentQuestionIndex]) {
      this.statusObject.answers[this.currentQuestionIndex] = [];
    }

    if (question.type === 'single') {
      this.statusObject.answers[this.currentQuestionIndex] = [answerLetter];
    } else if (question.type === 'multiple') {
      const currentAnswers = this.statusObject.answers[this.currentQuestionIndex];
      const answerIndex = currentAnswers.indexOf(answerLetter);

      if (answerIndex > -1) {
        currentAnswers.splice(answerIndex, 1);
      } else {
        currentAnswers.push(answerLetter);
      }
    }

    this.answeredQuestions[this.currentQuestionIndex] = true;

    this.assessmentService.saveStatus(this.statusObject).subscribe({
      next: () => console.log('Answer saved successfully'),
      error: (err) => console.error('Error saving answer:', err),
    });
  }

  isOptionSelected(option: string): boolean {
    const question = this.questions[this.currentQuestionIndex];
    const optionIndex = question.options.indexOf(option);
    const answerLetter = String.fromCharCode(65 + optionIndex);

    const selectedAnswers = this.statusObject.answers[this.currentQuestionIndex] || [];

    if (question.type === 'single') {
      return selectedAnswers.length > 0 && selectedAnswers[0] === answerLetter;
    } else if (question.type === 'multiple') {
      return selectedAnswers.includes(answerLetter);
    }

    return false;
  }

  navigateToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.totalQuestions - 1) {
      this.currentQuestionIndex++;
    }
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
        this.statusObject.currentDuration = (this.statusObject.duration * 60 - this.timer) / 60;
      } else {
        clearInterval(this.timerInterval);
        this.finishTest();
      }
    }, 1000);
  }

  submitTest(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Are you sure you want to submit the test?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.finishTest();
      }
    });
  }

  finishTest(): void {
    this.testCompleted = true;
    this.assessmentService.submitTest(this.statusObject).subscribe(() => {
      this.router.navigate(['/confirmation']);
    });
  }

  @HostListener('document:visibilitychange', ['$event'])
  handleVisibilityChange(): void {
    if (this.testStarted && !this.testAlreadyCompleted && !this.testCompleted && !this.testLocked) {
      if (document.hidden) {
        this.statusObject.testStatus = 'locked';
        this.assessmentService.saveStatus(this.statusObject).subscribe({
          next: () => console.log('Test locked successfully'),
          error: (err) => console.error('Error locking test:', err),
        });
        this.testLocked = true;
        alert('You switched tabs or minimized the window. Your test is now locked.');
      }
    }
  }

  escapeHTMLTags(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      content.replace(/<\/?(?!br)([^>]+)>/gi, '').replace(/\n/g, '<br>')
    );
  }
}
