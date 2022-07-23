import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../core/services/user.service";
import {firstValueFrom} from "rxjs";
import {LoginResult} from "../core/models/user.model";
import {Router} from "@angular/router";
import {LoadingController} from "@ionic/angular";

enum Mode {
  Login,
  Register
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  Mode = Mode;
  twoFactorRequired = false;
  lastEmail: String;

  loginForm: FormGroup = new FormGroup<any>({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    token: new FormControl('')
  });

  registerForm: FormGroup = new FormGroup<any>({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  selectedMode = Mode.Login;

  constructor(
    private userService: UserService,
    private router: Router,
    private loadingController: LoadingController) { }

  ngOnInit() {}

  async onLoginSubmit() {
    await this.showLoader();

    try {
      const loginResult = await firstValueFrom(this.userService.login(this.loginForm.value.email, this.loginForm.value.password, this.loginForm.value.token));

      if (loginResult === LoginResult.Success){
        await this.hideLoader();
        await this.router.navigateByUrl('/home');
      }

      if (loginResult == LoginResult.TwoFactorRequired)
        this.twoFactorRequired = true;
    }catch (e) {
    }

    await this.hideLoader();
  }

  onTwoFactorLoginCancelClick() {
    this.loginForm.get('token').setValue('');
    this.twoFactorRequired = false;
  }

  private async showLoader() {
    const loader = await this.loadingController.create({});
    await loader.present();
  }

  private async hideLoader() {
    while (await this.loadingController.getTop()){
      const loader = await this.loadingController.getTop();
      await loader.dismiss();
    }
  }

  async onRegisterSubmit() {
    await this.showLoader();

    try {
      const success = await firstValueFrom(this.userService.register(this.registerForm.value));

      if(success){
        this.loginForm.reset();
        this.selectedMode = Mode.Login;
      }
    }catch (e) {
    }

    await this.hideLoader();
  }

  onSegmentChange(value: string) {
    this.selectedMode = Number(value);
  }
}
