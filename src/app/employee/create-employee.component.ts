import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormControl} from '@angular/forms';
import { CustomValidators } from '../Shared/custom.validators';
import { ActivatedRoute, Router } from '@angular/router';
import { IEmployee } from './IEmployee';
import { EmployeeService } from './employee.service';
import { ISkill } from './ISkill';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {

  employeeForm: FormGroup;
  employee: IEmployee;
  pageTitle: string;

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

  constructor(private router: Router, private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute,
              private employeeService: EmployeeService) { }

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

      this.activatedRoute.paramMap.subscribe((params) => {
        const empId = +params.get('id');
        if (empId) {
          this.pageTitle = 'Edit Employee';
          this.getEmployee(empId);
        } else {
          // this means that we are creating a new employee. o, we are initializing our employee object with a default values.
          this.pageTitle = 'Create Employee';
          this.employee = {
            id: null,
            fullName: '',
            contactPreference: '',
            email: '',
            phone: null,
            skills: []
          };
        }
      });
    }

    getEmployee(empId: number) {
      this.employeeService.getEmployee(empId).subscribe((employee: IEmployee) => {
        this.editEmployee(employee);
        this.employee = employee;
      }, (err) => console.log(err));
    }

    editEmployee(employee: IEmployee): void {
      this.employeeForm.patchValue({
        fullName: employee.fullName,
        contactPreference: employee.contactPreference,
        emailGroup: {
          email: employee.email,
          confirmEmail: employee.email
        },
        phone: employee.phone
      });
      this.employeeForm.setControl('skills', this.setExistingSkills(employee.skills));
    }

    setExistingSkills(skillSets: ISkill[]): FormArray {
      const formArray = new FormArray([]);
      skillSets.forEach(s => {
        formArray.push(this.formBuilder.group({
          skillName: s.skillName,
          experienceInYears: s.experienceInYears,
          proficiency: s.proficiency
        }));
      });
      return formArray;
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
      const skillFormArray = (this.employeeForm.get('skills') as FormArray);
      skillFormArray.removeAt(skillGroupIndex);
      skillFormArray.markAsDirty();
      skillFormArray.markAllAsTouched();
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
      this.mapFormValuesToEmployeesModel();
      if (this.employee.id) {
        this.employeeService.updateEmployee(this.employee).subscribe(
          () => this.router.navigate(['employees']),
          (error: any) => console.log(error)
          );
        } else {
          this.employeeService.addEmployee((this.employee)).subscribe(
            () => this.router.navigate(['employees']),
            (error) => console.log(error)
            );
          }
        }

        mapFormValuesToEmployeesModel() {
          this.employee.fullName = this.employeeForm.value.fullName;
          this.employee.email = this.employeeForm.value.emailGroup.email;
          this.employee.contactPreference = this.employeeForm.value.contactPreference;
          this.employee.phone = this.employeeForm.value.phone;
          this.employee.skills = this.employeeForm.value.skills;
        }

        logValidationErrors(group: FormGroup = this.employeeForm): void {
          Object.keys(group.controls).forEach((key: string) => {
            const abstractControl = group.get(key);
            this.formErrors[key] = '';
            // Check if there are validation errors.
            if (abstractControl && !abstractControl.valid &&
              (abstractControl.touched || abstractControl.dirty || abstractControl.value !== '' )) {
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
          if (emailControl.value === confirmEmailControl.value || (confirmEmailControl.pristine && confirmEmailControl.value === '')) {
            return null;
          } else {
            // tslint:disable-next-line: object-literal-key-quotes
            return {'emailMismatch': true };
          }

        }
