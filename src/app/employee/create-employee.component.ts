import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl} from '@angular/forms';
import { CustomValidators } from '../Shared/custom.validators';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {

  employeeForm: FormGroup;
  validationMessages = {
    'fullName':{
      'required': 'Full Name is required.',
      'minlength': 'Full name must be greater than 2 characters and less than 10 characters.',
      'maxlength': 'Full name must be greater than 2 characters and less than 10 characters.',
    },
    'email': {
      'required': 'Email is required.',
      'emailDomain': 'Email domain should be saxobank.com',
    },
    'phone': {
      'required': 'Phone is required.',
    },
    'skillName': {
      'required': 'Skill Name is required',
    },
    'experienceInYears': {
      'required': 'Experience is required',
    },
    'proficiency': {
      'required': 'Proficiency is required',
    },
  };
  formErrors = {
    'fullName': '',
    'email': '',
    'phone': '',
    'skillName': '',
    'experienceInYears': '',
    'proficiency': ''
  };

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.employeeForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      contactPreference: ['email'],
      email: ['', [Validators.required, CustomValidators.emailDomain('saxobank.com')]],
      phone: [''],
      skills: this.formBuilder.group({
        skillName: ['',[Validators.required]],
        experienceInYears: ['',[Validators.required]],
        proficiency: ['',[Validators.required]]
      })
    });

    this.employeeForm.valueChanges.subscribe((data: any) => {
      // console.log(JSON.stringify(data).length);
      this.logValidationErrors(this.employeeForm);
    });

    this.employeeForm.controls.contactPreference.valueChanges.subscribe((data: string) => {
      this.onContactPreferenceChange(data);
    });

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
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
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
      }
    });
  }

  onLoadDataClick(): void {
    this.logValidationErrors(this.employeeForm);
    console.log(this.formErrors);
  }
}
