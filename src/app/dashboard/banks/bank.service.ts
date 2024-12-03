import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppGlobalsService } from '../app-globals.service';
import { TypeBanks } from '../types/TypeBanks';
import { TypeBankBranches } from '../types/TypeBankBranches';

@Injectable({
  providedIn: 'root'
})

export class BankService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin' : '*'
    }),
  };  
  
 constructor(private auth: AuthService, private globals: AppGlobalsService, private http: HttpClient,) {     }
 
 getBanks(BankSno: number, Acc_Cat: number):Observable<TypeBanks>
 {    
   let edata: string =JSON.stringify({"BankSno" :  BankSno, "Acc_Cat" :  0}); 
   
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/getBanks";
   
   return this.http.get<any>(apiURL, { params })
     .pipe(map(datarecd => {            
       
       if (datarecd.queryStatus == 0)
         {              
           return (0);                
         }         
         else
         {            
           return ( JSON.parse (datarecd.apiData));            
         }                      
     }));
 } 

 saveBank(Bnk: TypeBanks):Observable<TypeBanks>
  { 
    let edata: string =JSON.stringify
    ({      
      "BankSno"             :   Bnk.BankSno,
      "Bank_Name"           :   Bnk.Bank_Name,
      "Acc_Cat"             :   Bnk.Acc_Cat,
      "Acc_Name"            :   Bnk.Acc_Name,
      "Acc_No"              :   Bnk.Acc_No,      
      "Acc_Type"            :   Bnk.Acc_Type,                  
   }); 
   
     let params = new HttpParams()
     .set('data', edata)
     
     let apiURL: string = this.globals.baseApiURL + "/InsertBank";
     let header = new HttpHeaders();
     header.set('Access-Control-Allow-Origin', '*');
    
     return this.http.post<TypeBanks>(apiURL, params )          
  }

  
deleteBank(Bnk: TypeBanks)
{    
  let edata: string =JSON.stringify
  ({    
    "BankSno"    :  Bnk.BankSno
  }); 
  
   let params = new HttpParams()
   .set('data', edata)
      
   let apiURL: string = this.globals.baseApiURL + "/DeleteBank";
   let header = new HttpHeaders();
   header.set('Access-Control-Allow-Origin', '*');
  
   return this.http.delete<TypeBanks>(apiURL, {params} )   
}

getBankBranches(BranchSno: number, BankSno: number):Observable<TypeBankBranches>
{    
  let edata: string =JSON.stringify({"BranchSno" :  BranchSno, "BankSno" :  BankSno}); 
  
   let params = new HttpParams()
   .set('data', edata)
       
   let apiURL: string = this.globals.baseApiURL + "/getBank_Branches";
  
  return this.http.get<any>(apiURL, { params })
    .pipe(map(datarecd => {            
      
      if (datarecd.queryStatus == 0)
        {              
          return (0);                
        }         
        else
        {            
          return ( JSON.parse (datarecd.apiData));            
        }                      
    }));
}

saveBankBranch(Brch: TypeBankBranches):Observable<TypeBankBranches>
 { 
    
   let edata: string =JSON.stringify
   ({
     "BranchSno"          :   Brch.BranchSno,      
     "BankSno"            :   Brch.Bank.BankSno,
     "Branch_Name"        :   Brch.Branch_Name,
     "Branch_Address"     :   Brch.Branch_Address,
     "Remarks"            :   Brch.Remarks,                   
  }); 
  
    let params = new HttpParams()
    .set('data', edata)
    
    let apiURL: string = this.globals.baseApiURL + "/InsertBank_Branches";
    let header = new HttpHeaders();
    header.set('Access-Control-Allow-Origin', '*');
   
    return this.http.post<TypeBankBranches>(apiURL, params )          
 }

 
deleteBankBranch(Brch: TypeBankBranches)
{    
 let edata: string =JSON.stringify
 ({    
   "BranchSno"    :  Brch.BranchSno
 }); 
 
  let params = new HttpParams()
  .set('data', edata)
     
  let apiURL: string = this.globals.baseApiURL + "/DeleteBank_Branches";
  let header = new HttpHeaders();
  header.set('Access-Control-Allow-Origin', '*');
 
  return this.http.delete<TypeBankBranches>(apiURL, {params} )   
}
}

