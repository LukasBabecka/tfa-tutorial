export interface User {
  firstName: String;
  lastName: String;
  email: String;
  tfAuthInfo?: TfAuthInfo;
  token?: String;
}

export interface TfAuthInfo {
  base32: String;
  qc: String;
  confirmed: Boolean;
}

export enum LoginResult {
  Success,
  Fail,
  TwoFactorRequired
}
