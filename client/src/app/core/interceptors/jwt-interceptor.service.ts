import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {first, Observable, switchMap} from "rxjs";
import {UserService} from "../services/user.service";

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.userService.currentUser$.pipe(
      first(),
      switchMap(user => {
        if (user?.token)
          req = req.clone({setHeaders: {Authorization: `Bearer ${user.token}`}});

        return next.handle(req);
      })
    );
  }
}
