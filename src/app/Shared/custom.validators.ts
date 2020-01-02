import { AbstractControl } from '@angular/forms';

export class CustomValidators {

  static emailDomain(domainName: string) {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const email: string = control.value;
      const domain: string = email.substring(email.lastIndexOf('@') + 1);
      if (email === '' || domain.toLowerCase() === domainName.toLowerCase()) {
        return null;
      } else {
        // true is set as the value to indicate we have emailDomain error.
        // tslint:disable-next-line: object-literal-key-quotes
        return { 'emailDomain': true };
      }
    };
  }
}
