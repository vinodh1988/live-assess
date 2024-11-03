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

@NgModule({
  declarations: [
    AppComponent,
    PersonalDetailsComponent,
    TestComponent,
    MinutesSecondsPipe,
    ConfirmDialogComponent,
    NoAssessmentFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule

  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlerService, multi: true },
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
