import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';

// User Modules
import { AppRoutingModule } from './app-routing.module';
import { EmployeeModule } from './employee/employee.module';

// Services
import { EmployeeService } from './employee/employee.service';

// Components
import { AppComponent } from './app.component';

import { HomeComponent } from './home.component';
import { PageNotFoundComponent } from './page-not-found.component';



@NgModule({
  declarations: [
    AppComponent, HomeComponent, PageNotFoundComponent
  ],
  imports: [
    BrowserModule, EmployeeModule, AppRoutingModule, HttpClientModule
  ],
  providers: [EmployeeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
