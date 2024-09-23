import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestComponent } from './test/test.component';

const routes: Routes = [
  // The route where both personal details and the test are handled
  { path: 'assessments/:assessmentcode', component: TestComponent },
  { path: '**', redirectTo: 'assessments/testcode', pathMatch: 'full' } // Fallback route
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
