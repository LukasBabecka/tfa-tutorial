import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {User} from "../core/models/user.model";
import {UserService} from "../core/services/user.service";
import {firstValueFrom, Subscription} from "rxjs";
import {IonModal, LoadingController} from "@ionic/angular";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('settingsModal') settingsModal: IonModal;

  user: User;
  userSubscription: Subscription;

  constructor(
    private userService: UserService,
    private loadingController: LoadingController) { }

  ngOnInit() {
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  async onLogOutClick() {
    await this.userService.logout();
  }

  async onSettingsCancelClick() {
    await this.settingsModal.dismiss();
  }

  async onEnableTwoFactorAuthClick() {
    await this.showLoader();

    try {
      this.user.tfAuthInfo = await firstValueFrom(this.userService.enableTwoFactorAuth());
    }catch (e) {
    }

    await this.hideLoader();
  }

  async onConfirmTwoFactorAuthClick(token: string) {
    await this.showLoader();

    try {
      await firstValueFrom(this.userService.confirmTwoFactorAuth(this.user.tfAuthInfo.base32,token));
    }catch (e) {
    }

    await this.hideLoader();
  }


  async onRemoveTwoFactorAuthClick() {
    await this.showLoader();

    try {
      await firstValueFrom(this.userService.removeTwoFactorAuth());
    } catch (e) {
    }

    await this.hideLoader();
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
}
