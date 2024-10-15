import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { GoldratesComponent } from './goldrates/goldrates.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionService } from './transaction.service';
import { CompaniesComponent } from './companies/companies.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent  implements OnInit, OnDestroy 
 {
  
  ShowSideNav: boolean = false;
  loggeduser: string ="";
  selectedcompname: string = "";
  GoldRate: number = 0;

  constructor(private auth: AuthService, private router: Router, private dialog: MatDialog,private TransService: TransactionService ) { }

   ngOnInit(): void {            
    this.loggeduser = this.getLoggeduser();          
    this.GetGoldRate();
   }

   ngOnDestroy(): void {
     
   }

   ngAfterViewInit() {      
      
  }
  
   getLoggeduser()
   {
    return this.auth.getLoggeduser();
   }
 
   OpenRepledgeHistory()
   {
    
    this.router.navigate(['dashboard']);      
  }


  
  logout()
  {
    this.auth.logout();
  }

  // OpenPartyCreation(PtyType: number){
  //   var SelectedParty: TypeParties = {
  //     PartySno: 0,
  //     Party_Type: PtyType,
  //     Party_Name: "",
  //     Address: "",
  //     City: "",
  //     Mobile: "",
  //     Email: "",    
  //     Remarks: "",
  // }
    
    
  //   const dialogRef = this.dialog.open(PartiesComponent, 
  //     {
  //     data: {"Party_Type": PtyType, "Response": SelectedParty},
  //     });
      
  //     dialogRef.disableClose = true;

  //     dialogRef.afterClosed().subscribe(result => {        
  //       if (result)
  //       {
  //         this.PartiesList.unshift(result);            
  //         this.LoadPartiesListintoMatGrid();        
  //       }
        
  //     });  
  // }
  OpenCompanies(){
    const dialogRef = this.dialog.open(CompaniesComponent, 
      {
         panelClass: 'comp-dialog-container' 
      //  data: Img,
      //  width: this.getScreenWidth+'px',   // Set width to 600px
      //  height: this.getScreenHeight+'px',  // Set height to 530px

      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {     
        // this.GetGoldRate();      
      }); 
  }
  
  OpenGoldRate()
  {
    const dialogRef = this.dialog.open(GoldratesComponent, 
      {
         panelClass: 'custom-dialog-container' 
      //  data: Img,
      //  width: this.getScreenWidth+'px',   // Set width to 600px
      //  height: this.getScreenHeight+'px',  // Set height to 530px

      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {     
        this.GetGoldRate();      
      }); 
  }

  GetGoldRate(){
    this.TransService.getGoldRates().subscribe(data => {
      this.GoldRate = data.PureRate;    
    });
  }

  OpenCustomers(){
    this.router.navigate(['dashboard/customers']);
    this.ShowSideNav = false;
  }

  OpenBorrowers(){
    this.router.navigate(['dashboard/borrowers']);
    this.ShowSideNav = false;
  }

  OpenBanks(){
    this.router.navigate(['dashboard/banks']);
    this.ShowSideNav = false;
  }

  OpenAccounts(){
    this.router.navigate(['dashboard/accounts']);
    this.ShowSideNav = false;
  }
}
