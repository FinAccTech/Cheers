import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';


import { DashboardComponent } from './dashboard/dashboard.component';
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
import { CustomeraccountslistComponent } from './dashboard/customers/customeraccountslist/customeraccountslist.component';
import { RecenttransComponent } from './dashboard/recenttrans/recenttrans.component';
import { CustomersComponent } from './dashboard/customers/customers.component';
import { BorrowersComponent } from './dashboard/borrowers/borrowers.component';
import { BanksComponent } from './dashboard/banks/banks.component';
import { AccountsmastersComponent } from './dashboard/customers/accountsmasters/accountsmasters.component';


const routes: Routes = [
  { path:'', component: LoginComponent},
  { path:'dashboard', component: DashboardComponent, children:[
    // { path:'', component: IndexpageComponent}, 
    { path:'', component: RecenttransComponent}, 
    { path:'summary', component: SummaryComponent},

    { path:'customers', component: CustomersComponent}, 
    { path:'customers/customeraccountslist/:cust/:cust_name', component: CustomeraccountslistComponent},

    { path:'borrowers', component: BorrowersComponent}, 
    { path:'borrowers/borrowerdetailed/:bwr/:bwr_name', component: BorrowerdetailsComponent},
    
    { path:'banks', component: BanksComponent}, 
    { path:'banks/bankdetailed/:bnk/:bank_name', component: BankdetailsComponent},
    // { path:'customerdetailed/:cust/:cust_name', component: CustomerdetailsComponent},

    { path:'accounts', component: AccountsmastersComponent}, 
    
    
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

