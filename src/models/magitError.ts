
export class MagitError {

  gitErrorCode?: string;
  message: string;

  constructor(public friendlyMessage: string, public error?: any) {

    this.message = error.message;
    if (error.gitErrorCode) {
      this.gitErrorCode = error.gitErrorCode;
    }
  }
}
