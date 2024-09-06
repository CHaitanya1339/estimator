import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IconsModule } from './icons/icons.module';
import { BootstrapIconsModule } from 'ng-bootstrap-icons';
import { RouterModule } from '@angular/router';
import { FinancialAnalysisComponent } from './financial-analysis/financial-analysis.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
@NgModule({
  declarations: [
    AppComponent,
    FinancialAnalysisComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IconsModule,
    NgbModule,
    BootstrapIconsModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBgBzxUb1STGGRI4gMGooODJYRVG_yUK9o',
      libraries: ['places', 'drawing', 'visualization']
    }),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }