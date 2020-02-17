
export class MagitError {

  gitErrorCode?: string;

  constructor(public message: string, public error?: any) {

    if (error.gitErrorCode) {
      this.gitErrorCode = error.gitErrorCode;
    }
  }
}
