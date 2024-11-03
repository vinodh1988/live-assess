import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorHandlerService implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if the request URL contains the phrase 'testdetails'
    if (req.url.includes('testdetails')) {
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          // Apply error handling only if the status is 404
          if (error.status === 404) {
            this.router.navigate(['/no-assessment-found']);
          }
          return throwError(error);
        })
      );
    } else {
      // If the URL does not contain 'testdetails', simply forward the request
      return next.handle(req);
    }
  }
}
