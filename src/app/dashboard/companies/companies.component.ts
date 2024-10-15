import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TransactionService } from '../transaction.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TypeCompanies } from '../types/TypeCompanies';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CompaniesComponent>, @Inject(MAT_DIALOG_DATA) public data: any,private TransService: TransactionService,
  private _snackBar: MatSnackBar ) {}

  CompaniesList: TypeCompanies[] = [];
  Company!: TypeCompanies;

  ngOnInit(): void {    
    this.TransService.getCompanies(0).subscribe(data=>{
      this.CompaniesList = data;
      this.AddCompany();
    })
  }

  AddCompany(){
    this.Company = {"CompSno":0, "Comp_Code":"", "Comp_Name":"", "Remarks": ""}
  }

  SaveCompany(){
    if (this.Company.Comp_Code.trim().length == 0) {
      this._snackBar.open("Code cannot be empty");
      return;
    }

    if (this.Company.Comp_Name.trim().length == 0) {
      this._snackBar.open("Name cannot be empty");
      return;
    }

    this.TransService.saveCompany(this.Company).subscribe(data=>{
      this._snackBar.open("Company saved successfully");
      this.TransService.getCompanies(0).subscribe(data=>{
        this.CompaniesList = data;
      })
    })
  }

  LoadCompany(comp: TypeCompanies){
    this.Company.CompSno    = comp.CompSno;
    this.Company.Comp_Code  = comp.Comp_Code;
    this.Company.Comp_Name  = comp.Comp_Name;
    this.Company.Remarks    = comp.Remarks;
  }

  DeleteCompany(){

  }


}
