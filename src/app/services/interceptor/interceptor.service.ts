import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
    HttpErrorResponse,
    HttpResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/do';
import { GenericCallService } from '../generic-call/generic-call.service';
import { RequestCacheService } from "../request-cache/requestCache.service";

const TTL = 0;

@Injectable({
    providedIn: 'root',
})
export class Interceptor implements HttpInterceptor {
    
    

    constructor(
        private readonly genericCall: GenericCallService,
        private cache: RequestCacheService,
        private readonly router: Router,
    ) {
        console.log("Log interceptor");
    }

    /**
     * @param HttpRequest<any> request - The intercepted request
     * @param HttpHandler next - The next interceptor in the pipeline
     * @return Observable<HttpEvent<any>>
     */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        /*(const cachedResponse = this.cache.get(request.url);
        if (cachedResponse) {
            return Observable.of(cachedResponse);
        } else {*/

        request = this.addToken(request);
        return next.handle(request)

            .do(event => {
            if (event instanceof HttpResponse) {
              this.cache.set(request.url, event, TTL);
            }
          })
            // add error handling
            .pipe(
                catchError(
                    (error: any, caught: Observable<HttpEvent<any>>) => {
                        if (error.status === 401) {
                            this.handleAuthError();
                            // if you've caught / handled the error, you don't
                            // want to rethrow it unless you also want
                            // downstream consumers to have to handle it as
                            // well.
                            return of(error);
                        }
                        throw error;
                    }
                ),
            );
       // }
    }

    /**
     * Handle API authentication errors.
     */
    private handleAuthError() {
        // clear stored credentials; they're invalid
        this.genericCall.afterLogout();
        // navigate back to the login page
        this.router.navigate(['/login']);
    }

    /**
     * Add stored auth token to request headers.
     * @param HttpRequest<any> request - the intercepted request
     * @return HttpRequest<any> - the modified request
     */
    private addToken(request: HttpRequest<any>): HttpRequest<any> {

      
        if (this.genericCall.token && !request.url.includes('googleapis') && !request.url.includes('tecsial-upload-file-bucket')) {
        //xsconst token: string = this.genericCall.token.accessToken;

        const token: string = this.genericCall.token.idToken;
        if (token) {
            return request.clone({
                setHeaders: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
            });
        }}
      
        return request;
    }
  }    