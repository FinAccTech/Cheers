
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TypeParties } from '../../types/TypeParties';
import { PartyService } from '../../party.service';
import { MatTableDataSource } from '@angular/material/table';
import { TypeTransactions } from '../../types/TypeTransactions';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TypeRepledges } from '../../types/TypeRepledges';
import { MsgboxComponent } from '../../msgbox/msgbox.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionService } from '../../transaction.service';
import { AppGlobalsService } from '../../app-globals.service';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-risk-manage',
  templateUrl: './risk-manage.component.html',
  styleUrls: ['./risk-manage.component.css']  
})
export class RiskManageComponent implements OnInit {

  constructor(private router: Router, private globals: AppGlobalsService, private PartyService: PartyService, private dialog: MatDialog, private TransService: TransactionService) { }

  @ViewChild('TABLE')  table!: ElementRef;
  
  StatementList: TypeRepledges[] = [];

  dataError: boolean = false;
  errDetails: string = "";  
  loadingData: boolean = false;

  dataSource!: MatTableDataSource<any>;
  //columnsToDisplay = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: string[] = ['Party_Name','PureWt','Sale_Value','Release_Value','Difference','Ratio'];  
  //columnsToDisplayWithExpand = ['expand', ...this.columnsToDisplay];
  expandedElement!: TypeRepledges | null;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  
  ngOnInit(): void {
  
   this.LoadRiskAnalysis();
  
  }

  LoadRiskAnalysis() 
  {    
   const dialogRef = this.dialog.open(MsgboxComponent, 
     {
       data: { "DialogType": 0}}
     );
     dialogRef.disableClose = true;

    this.TransService.LoadRiskAnalysis().subscribe((data:any ) =>  {          
      this.loadingData = false;       
      if (data === 0)
      {
        this.dataError  = true;
        this.errDetails = data;
        dialogRef.close();
      }
      else{                 
       this.StatementList = JSON.parse (data.apiData);     
       this.dataSource = new MatTableDataSource<TypeTransactions> (JSON.parse(data.apiData));            
       setTimeout(() => this.dataSource.paginator = this.paginator);
       setTimeout(() => this.dataSource.sort = this.sort);   
       dialogRef.close();           
      }      
    },    
    error => {
      // console.log  (error);
      this.loadingData = false;
      dialogRef.close();
    });    
    this.loadingData = false;
  }

  rowdetails(data: any)
  {
    // [routerLink]="['customerdetailed/', element.PartySno, element.Party_Name]" routerLinkActive="active"
    this.router.navigate(['dashboard/customers/customeraccountslist',data.PartySno,data.Party_Name]);
    //console.log (data.PartySno);
    //console.log (data.Party_Name);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportAsExcel()
{
  const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);//converts a DOM TABLE element to a worksheet
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  /* save to file */
  XLSX.writeFile(wb, 'RiskAnalysis.xlsx');
}


PureWtTotal()
{
  try {
    return this.dataSource.filteredData.map(t =>  t.PureWt).reduce((acc, value) => acc + value, 0);        
  } catch (error) {
    return 0;  
  }
}

Sale_ValueTotal()
{
  try {
    return this.dataSource.filteredData.map(t =>  t.Sale_Value).reduce((acc, value) => acc + value, 0);        
  } catch (error) {
    return 0;  
  }
}

Release_ValueTotal()
{
  try {
    return this.dataSource.filteredData.map(t =>  t.Release_Value).reduce((acc, value) => acc + value, 0);        
  } catch (error) {
    return 0;  
  }
}

DifferenceTotal()
{
  try {
    return this.dataSource.filteredData.map(t =>  t.Difference).reduce((acc, value) => acc + value, 0);        
  } catch (error) {
    return 0;  
  }
}

}
