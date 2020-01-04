import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormControl} from '@angular/forms';
import { CustomValidators } from '../Shared/custom.validators';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {

  employeeForm: FormGroup;
  validationMessages = {
    // tslint:disable-next-line: object-literal-key-quotes
    'fullName': {
      // tslint:disable-next-line: object-literal-key-quotes
      'required': 'Full Name is required.',
      // tslint:disable-next-line: object-literal-key-quotes
      'minlength': 'Full name must be greater than 2 characters and less than 10 characters.',
      // tslint:disable-next-line: object-literal-key-quotes
      'maxlength': 'Full name must be greater than 2 characters and less than 10 characters.',
    },
    // tslint:disable-next-line: object-literal-key-quotes
    'email': {
      // tslint:disable-next-line: object-literal-key-quotes
      'required': 'Email is required.',
      // tslint:disable-next-line: object-literal-key-quotes
      'emailDomain': 'Email domain should be saxobank.com',
    },
    // tslint:disable-next-line: object-literal-key-quotes
    'confirmEmail': {
      // tslint:disable-next-line: object-literal-key-quotes
      'required': 'Confirm Email is required.',
    },
    // tslint:disable-next-line: object-literal-key-quotes
    'emailGroup': {
      // tslint:disable-next-line: object-literal-key-quotes
      'emailMismatch': 'Email and Confirm Email do not match.'
    },
    // tslint:disable-next-line: object-literal-key-quotes
    'phone': {
      // tslint:disable-next-line: object-literal-key-quotes
      'required': 'Phone is required.',
    },
  };
  formErrors = {
  };

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.employeeForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      contactPreference: ['email'],
      phone: [''],
      skills: this.formBuilder.array([
        this.addSkillFormGroup()
      ]),
      emailGroup: this.formBuilder.group({
        email: ['', [Validators.required, CustomValidators.emailDomain('saxobank.com')]],
        confirmEmail: ['', [Validators.required]],
      }, {validator: matchEmail}),
    });

    this.employeeForm.valueChanges.subscribe((data: any) => {
      // console.log(JSON.stringify(data).length);
      this.logValidationErrors(this.employeeForm);
    });

    this.employeeForm.controls.contactPreference.valueChanges.subscribe((data: string) => {
      this.onContactPreferenceChange(data);
    });

  }

  addSkillButtonClick(): void {
    (this.employeeForm.get('skills') as FormArray).push(this.addSkillFormGroup());
  }

  addSkillFormGroup(): FormGroup {
    return this.formBuilder.group({
      skillName: ['', [Validators.required]],
      experienceInYears: ['', [Validators.required]],
      proficiency: ['', [Validators.required]]
    });
  }

  removeSkillButtonClick(skillGroupIndex: number): void {
    (this.employeeForm.get('skills') as FormArray).removeAt(skillGroupIndex);
  }
  onContactPreferenceChange(selectedValue: string): void {
    const phoneControl = this.employeeForm.get('phone');
    if (selectedValue === 'phone') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

  onSubmit(): void {
    console.log(this.employeeForm.value);
  }

  logValidationErrors(group: FormGroup = this.employeeForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      this.formErrors[key] = '';
      // console.log('Key = ' + key + ' Value = ' + abstractControl.value);
      // Check if there are validation errors.
      if (abstractControl && !abstractControl.valid && (abstractControl.touched || abstractControl.dirty )) {
        // this means the form control has failed validation.
        const messages = this.validationMessages[key];
        for (const errorKey in abstractControl.errors) {
          if (errorKey) {
            this.formErrors[key] += messages[errorKey] + ',';
          }
        }
      }

      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      }

      // This code is commented as the validation for the form array is in the view template itself. 
      // if (abstractControl instanceof FormArray) {
      //   for (const control of abstractControl.controls) {
      //     if (control instanceof FormGroup) {
      //       this.logValidationErrors(control);
      //     }
      //   }
      // }
    });
  }

  onLoadDataClick(): void {
    // this.logValidationErrors(this.employeeForm);
    // console.log(this.formErrors);
    // const formArray = new FormArray([
    //   new FormControl('John', Validators.required),
    //   new FormControl(''),
    //   new FormGroup({
    //     country: new FormControl('', Validators.required),
    //     state: new FormControl('')
    //   }),
    //   new FormArray([]),
    // ]);
    // to programmatically find the number of elements in the form array, we use the length property
    // console.log(formArray.length);

    // to iterate over the elements of the form array, use the for loop.
    // for (const control of formArray.controls) {
    //   if (control instanceof FormControl) { console.log('This is a form control.'); }
    //   if (control instanceof FormGroup) { console.log('This is a form group.'); }
    //   if (control instanceof FormArray) { console.log('This is a form array.'); }
    // }
  }
}

function matchEmail(group: AbstractControl): {[key: string]: any} | null {
  const emailControl = group.get('email');
  const confirmEmailControl = group.get('confirmEmail');
  if (emailControl.value === confirmEmailControl.value || confirmEmailControl.pristine) {
    return null;
  } else {
    // tslint:disable-next-line: object-literal-key-quotes
    return {'emailMismatch': true };
  }

}
