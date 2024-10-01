import { NgModule }                       from '@angular/core';
import { BrowserModule }                  from '@angular/platform-browser';
import { HttpClientModule }               from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpErrorInterceptor } from './http-error.interceptor';


import { AppRoutingModule }         from './app-routing.module';
import { AppComponent }             from './app.component';
import { DashboardComponent }       from './dashboard/dashboard.component';
import { LoginComponent }           from './auth/login/login.component';


import { BrowserAnimationsModule }  from '@angular/platform-browser/animations';

import { MatToolbarModule }       from '@angular/material/toolbar';
import { MatSidenavModule }       from '@angular/material/sidenav';
import { MatButtonModule }        from '@angular/material/button';
import { MatIconModule }          from '@angular/material/icon';
import { MatDividerModule }       from '@angular/material/divider';
import { MatMenuModule }          from '@angular/material/menu';
import { MatCardModule}           from '@angular/material/card';
import { MatFormFieldModule,}     from '@angular/material/form-field';
import { MatInputModule}          from '@angular/material/input';
import { MatSelectModule}         from '@angular/material/select';
import { MatDatepickerModule}     from '@angular/material/datepicker';
import { MatRadioModule}          from '@angular/material/radio';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatListModule}           from '@angular/material/list';
import { MatSnackBarModule}       from '@angular/material/snack-bar';
import { MatTableModule}          from '@angular/material/table';
import { MatAutocompleteModule }  from '@angular/material/autocomplete';
import { MatTreeModule }          from '@angular/material/tree';
import { MatTabsModule}            from '@angular/material/tabs';
import { DataTablesModule }       from 'angular-datatables';
import { MatTooltipModule} from '@angular/material/tooltip';

import {ClipboardModule} from '@angular/cdk/clipboard';

import { SelListDirective } from './sel-list.directive';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';

import { IntToDatePipe } from './dashboard/pipes/int-to-date.pipe';

import { NgChartsModule, NgChartsConfiguration } from 'ng2-charts';

import {MatGridListModule } from '@angular/material/grid-list';
import { CustomersComponent } from './dashboard/customers/customers.component';
import { CustomermasterComponent } from './dashboard/customers/customermaster/customermaster.component';
import { CustomerdetailsComponent } from './dashboard/customers/customerdetails/customerdetails.component';
import { IndexpageComponent } from './dashboard/indexpage/indexpage.component';

import { ReceiptComponent } from './dashboard/customers/receipt/receipt.component';
import { ImagesComponent } from './dashboard/images/images.component';
import { BorrowersComponent } from './dashboard/borrowers/borrowers.component';
import { BorrowermasterComponent } from './dashboard/borrowers/borrowermaster/borrowermaster.component';
import { BorrowerdetailsComponent } from './dashboard/borrowers/borrowerdetails/borrowerdetails.component';
import { PaymentComponent } from './dashboard/customers/payment/payment.component';
import { BanksComponent } from './dashboard/banks/banks.component';
import { BankbranchesComponent } from './dashboard/banks/bankbranches/bankbranches.component';
import { BankmasterComponent } from './dashboard/banks/bankmaster/bankmaster.component';
import { MsgboxComponent } from './dashboard/msgbox/msgbox.component';
import { MatProgressBarModule} from '@angular/material/progress-bar';
import { RepledgeComponent } from './dashboard/borrowers/repledge/repledge.component';
import { RepledgehistoryComponent } from './dashboard/Reports/repledgehistory/repledgehistory.component';
import { GalleryComponent } from './dashboard/Reports/gallery/gallery.component';
import { ReleaseComponent } from './dashboard/borrowers/repledge/release/release.component';
import { RppaymentComponent } from './dashboard/borrowers/repledge/rppayment/rppayment.component';
import { MultirowComponent } from './dashboard/multirow/multirow.component';
import { TransferComponent } from './dashboard/borrowers/repledge/transfer/transfer.component';
import { VoucherComponent } from './dashboard/customers/voucher/voucher.component';
import { BankdetailsComponent } from './dashboard/banks/bankdetails/bankdetails.component';
import { ImagePreviewComponent } from './dashboard/image-preview/image-preview.component';
import { RiskManageComponent } from './dashboard/Reports/risk-manage/risk-manage.component';
import { GoldratesComponent } from './dashboard/goldrates/goldrates.component';
import { NumberDifferentiation } from './dashboard/pipes/numberDifferentiation';
import { NumberDifferentiationFull } from './dashboard/pipes/numberDifferentiationFull';
import { BorrowerAnalysisComponent } from './dashboard/Reports/borrower-analysis/borrower-analysis.component';
import { CustomerAnalysisComponent } from './dashboard/Reports/customer-analysis/customer-analysis.component';
import { StockreportComponent } from './dashboard/Reports/stockreport/stockreport.component';
import { RepledgehistorybanksComponent } from './dashboard/Reports/repledgehistorybanks/repledgehistorybanks.component';
import { SummaryComponent } from './dashboard/summary/summary.component';
import { ImageCarouselComponent } from './dashboard/image-carousel/image-carousel.component';
import { DateSelectionComponent } from './dashboard/date-selection/date-selection.component';
import { RecenttransComponent } from './dashboard/recenttrans/recenttrans.component';
import { ValidateinputsDirective } from './validateinputs.directive';
import { SharelinkComponent } from './dashboard/sharelink/sharelink.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    SelListDirective,  
    IntToDatePipe,CustomersComponent, CustomermasterComponent, CustomerdetailsComponent, BanksComponent, BankmasterComponent, BankbranchesComponent, PaymentComponent, 
    ReceiptComponent, IndexpageComponent, ImagesComponent, BorrowersComponent, BorrowermasterComponent, BorrowerdetailsComponent, MsgboxComponent, RepledgeComponent, 
    RepledgehistoryComponent, GalleryComponent, ReleaseComponent, RppaymentComponent, MultirowComponent, TransferComponent, VoucherComponent, BankdetailsComponent, 
    ImagePreviewComponent, RiskManageComponent, GoldratesComponent, NumberDifferentiation, NumberDifferentiationFull,  BorrowerAnalysisComponent, CustomerAnalysisComponent, StockreportComponent, RepledgehistorybanksComponent, SummaryComponent, ImageCarouselComponent, DateSelectionComponent, RecenttransComponent, ValidateinputsDirective, SharelinkComponent, 
  ],

  imports: [    
    BrowserModule,    
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,    
    MatSidenavModule,
    MatButtonModule, 
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatAutocompleteModule,    
    MatDatepickerModule,
    MatRadioModule,
    MatNativeDateModule,
    MatListModule,
    ClipboardModule,
    MatSnackBarModule,
    MatTreeModule,
    MatPaginatorModule,
    DataTablesModule,
    MatSortModule,
    MatDialogModule,
    NgChartsModule,    
    MatGridListModule,
    MatTabsModule,
    MatProgressBarModule,
    MatTooltipModule,    
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    { provide: NgChartsConfiguration, useValue: { generateColors: false }}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
