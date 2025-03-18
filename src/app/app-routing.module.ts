import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestComponent } from './test/test.component';
import { NoAssessmentFoundComponent } from './no-assessment-found/no-assessment-found.component';
import { AssignmentUploadComponent } from './assignment-upload/assignment-upload.component';

const routes: Routes = [
  // The route where both personal details and the test are handled
  { path: 'assessments/:assessmentcode', component: TestComponent },
  { path: 'assignment-upload/:assignmentcode', component: AssignmentUploadComponent },
  { path: 'no-assessment-found', component: NoAssessmentFoundComponent },
  { path: '**', redirectTo: 'no-assessment-found' },
  { path: '**', redirectTo: 'assessments/testcode', pathMatch: 'full' },

  // Fallback route
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
