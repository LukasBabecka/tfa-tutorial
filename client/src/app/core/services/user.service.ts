import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, firstValueFrom, map, Observable, of, switchMap, tap, throwError} from "rxjs";
import {LoginResult, TfAuthInfo, User} from "../models/user.model";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private currentUser: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor(
    private httpClient: HttpClient,
    private router: Router) {
    const user = <User><unknown>JSON.parse(localStorage.getItem('user'));
    this.currentUser.next(user);
  }

  /**
   * Register
   * @param user
   */
  register(user: User): Observable<boolean> {
    return this.httpClient.post(`${environment.apiUrl}/user/register`, user).pipe(
      map(_ => true)
    );
  }


  /**
   * Login
   * @param email
   * @param password
   * @param token
   */
  login(email: String, password, token: String): Observable<LoginResult> {
    const request = {email, password, token};

    return this.httpClient.post(`${environment.apiUrl}/user/login`, request, {observe: 'response'}).pipe(
      switchMap(response => {
        if (response.status === 200) {
          const user = <User>response.body;

          localStorage.setItem('user', JSON.stringify(user));

          this.currentUser.next(user);
          return of(LoginResult.Success);
        }

        return of(LoginResult.Fail);
      }),
      catchError(response => {
        if (response.status === 206)
          return of(LoginResult.TwoFactorRequired);

        return throwError(response);
      })
    )
  }


  /**
   * Logout
   */
  async logout() {
    localStorage.removeItem('user');
    this.currentUser.next(null);
    await this.router.navigateByUrl('/login');
  }


  /**
   * Enable 2fa
   */
  enableTwoFactorAuth(): Observable<TfAuthInfo> {
    return this.httpClient.post<TfAuthInfo>(`${environment.apiUrl}/user/enableTwoFactorAuth`, {});
  }


  /**
   * Confirm 2fa
   */
  confirmTwoFactorAuth(base32: String, token: String): Observable<boolean> {
    return this.httpClient.post<TfAuthInfo>(`${environment.apiUrl}/user/confirmTwoFactorAuth`, {base32, token}).pipe(
      switchMap(tfAuthInfo => {
        const user = this.currentUser.value;

        user.tfAuthInfo = tfAuthInfo;

        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.next(user);

        return of(true);
      })
    );
  }


  /**
   * Remove 2fa
   */
  removeTwoFactorAuth(): Observable<boolean> {
    return this.httpClient.post<TfAuthInfo>(`${environment.apiUrl}/user/removeTwoFactorAuth`, {}).pipe(
      switchMap(_ => {
        const user = this.currentUser.value;

        user.tfAuthInfo = null;

        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.next(user);

        return of(true);
      })
    );
  }
}
