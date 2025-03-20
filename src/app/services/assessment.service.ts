import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private apiUrl = 'http://13.90.102.109:5000'; // Update this with your actual backend URL

  private apiKey = (window as any).appConfig.api_key;
  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'x-api-key': this.apiKey
      })
    };
  }
  constructor(private http: HttpClient) {}

  // Fetch test details including assessment name, duration, etc.
  getTestDetails(assessmentCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/testdetails/${assessmentCode}`,this.getHeaders());
  }

  // Fetch the status of the ongoing test for the user (returns 404 if no status exists)
  getStatus(assessmentCode: string, email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/assessments/status?assessmentcode=${assessmentCode}&email=${email}`,this.getHeaders());
  }

  // Fetch original questions if there is no ongoing test (fresh start)
  getOriginalQuestions(assessmentCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/assessments/${assessmentCode}`,this.getHeaders());
  }

 

  // Save the current status of the test periodically or when questions are answered
  saveStatus(statusObject: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/assessments/status`, statusObject,this.getHeaders());
  }

  // Submit the test when the user finishes or the time runs out
  submitTest(statusObject: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/assessments/submit`, statusObject,this.getHeaders());
  }

  evaluateTest(email: string, assessmentCode: string): Observable<any> {
    const payload = { email, assessmentcode: assessmentCode };
    return this.http.post(`${this.apiUrl}/assessments/evaluate`, payload,this.getHeaders());
  }


  uploadAssignment(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/project-uploads`, formData,this.getHeaders());
  }

  getAssessmentDetails(assessmentcode: string, email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/spring-assessment-details/${assessmentcode}?email=${email}`,this.getHeaders());
  }
}
