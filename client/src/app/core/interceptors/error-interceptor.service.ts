import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {ToastController} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private toastController: ToastController) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError( error => {
        if (error?.error?.message){
          this.toastController.create({
            message: error.error.message,
            position: 'top',
            duration: 3000
          }).then(toast => {
            toast.present().then(_ => {});
          });
        }

        return throwError(error);
      })
    );
  }
}
