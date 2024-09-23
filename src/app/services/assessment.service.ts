import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private apiUrl = 'http://15.207.18.117:5000'; // Update this with your actual backend URL

  constructor(private http: HttpClient) {}

  // Fetch test details including assessment name, duration, etc.
  getTestDetails(assessmentCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/testdetails/${assessmentCode}`);
  }

  // Fetch the status of the ongoing test for the user (returns 404 if no status exists)
  getStatus(assessmentCode: string, email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/assessments/status?assessmentcode=${assessmentCode}&email=${email}`);
  }

  // Fetch original questions if there is no ongoing test (fresh start)
  getOriginalQuestions(assessmentCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/assessments/${assessmentCode}`);
  }

 

  // Save the current status of the test periodically or when questions are answered
  saveStatus(statusObject: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/assessments/status`, statusObject);
  }

  // Submit the test when the user finishes or the time runs out
  submitTest(statusObject: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/assessments/submit`, statusObject);
  }

  evaluateTest(email: string, assessmentCode: string): Observable<any> {
    const payload = { email, assessmentcode: assessmentCode };
    return this.http.post(`${this.apiUrl}/assessments/evaluate`, payload);
  }
}
