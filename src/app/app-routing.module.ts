import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';


import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomerdetailsComponent } from './dashboard/customers/customerdetails/customerdetails.component';
import { IndexpageComponent } from './dashboard/indexpage/indexpage.component';
import { BorrowerdetailsComponent } from './dashboard/borrowers/borrowerdetails/borrowerdetails.component';
import { RepledgehistoryComponent } from './dashboard/Reports/repledgehistory/repledgehistory.component';
import { GalleryComponent } from './dashboard/Reports/gallery/gallery.component';
import { BankdetailsComponent } from './dashboard/banks/bankdetails/bankdetails.component';
import { RiskManageComponent } from './dashboard/Reports/risk-manage/risk-manage.component';
import { BorrowerAnalysisComponent } from './dashboard/Reports/borrower-analysis/borrower-analysis.component';
import { CustomerAnalysisComponent } from './dashboard/Reports/customer-analysis/customer-analysis.component';
import { StockreportComponent } from './dashboard/Reports/stockreport/stockreport.component';
import { RepledgehistorybanksComponent } from './dashboard/Reports/repledgehistorybanks/repledgehistorybanks.component';
import { SummaryComponent } from './dashboard/summary/summary.component';


const routes: Routes = [
  { path:'', component: LoginComponent},
  { path:'dashboard', component: DashboardComponent, children:[
    { path:'', component: IndexpageComponent},
    { path:'summary', component: SummaryComponent},
    { path:'customerdetailed/:cust/:cust_name', component: CustomerdetailsComponent},
    { path:'borrowerdetailed/:bwr/:bwr_name', component: BorrowerdetailsComponent},
    { path:'bankdetailed/:bnk/:bank_name', component: BankdetailsComponent},
    { path:'repledgehistory', component: RepledgehistoryComponent},
    { path:'repledgehistorybanks', component: RepledgehistorybanksComponent},
    { path:'gallery', component: GalleryComponent},
    { path:'riskanalysis', component: RiskManageComponent},
    { path:'customeranalysis', component: CustomerAnalysisComponent},
    { path:'summary/customeranalysis', component: CustomerAnalysisComponent},
    { path:'bwranalysis', component: BorrowerAnalysisComponent},
    { path:'summary/bwranalysis', component: BorrowerAnalysisComponent},
    { path:'stockreport', component: StockreportComponent},    
    { path:'summary/stockreport', component: StockreportComponent},    
],},  
];
 

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

