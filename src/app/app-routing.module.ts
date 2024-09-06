import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FinancialAnalysisComponent } from './financial-analysis/financial-analysis.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'financial-analysis', component: FinancialAnalysisComponent },
  // other routes...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }