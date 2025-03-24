import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PersonalDetailsComponent } from './personal-details/personal-details.component';
import { TestComponent } from './test/test.component';
import { MinutesSecondsPipe } from './minutes-seconds.pipe';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ErrorHandlerService } from './interceptors/error-handler.service';
import { NoAssessmentFoundComponent } from './no-assessment-found/no-assessment-found.component';
import { AssignmentUploadComponent } from './assignment-upload/assignment-upload.component';
import { SpringBootAssessmentComponent } from './spring-boot-assessment/spring-boot-assessment.component';
import { SafeurlPipe } from './pipes/safeurl.pipe';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { TestRunModalComponent } from './spring-boot-assessment/test-run-modal/test-run-modal.component';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { FinalSubmitDialogComponent } from './spring-boot-assessment/final-submit-dialog/final-submit-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    PersonalDetailsComponent,
    TestComponent,
    MinutesSecondsPipe,
    ConfirmDialogComponent,
    NoAssessmentFoundComponent,
    AssignmentUploadComponent,
    SpringBootAssessmentComponent,
    SafeurlPipe,
    TestRunModalComponent,
    FinalSubmitDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    AngularMaterialModule,
     NgxExtendedPdfViewerModule

  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlerService, multi: true },
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
