import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { AppGlobalsService } from './app-globals.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { TypeParties } from './types/TypeParties';
import { TypeTransactions } from './types/TypeTransactions';
import { TypePartyStatement } from './types/TypePartyStatement';
import { FileHandle } from './types/file-handle';
import { TypeRepledges } from './types/TypeRepledges';
import { TypeCompanies } from './types/TypeCompanies';
import { TypeHttpResponse } from './types/TypeHttpResponse';

@Injectable({
  providedIn: 'root'
})

export class TransactionService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin' : '*'
    }),
  };  
  
 constructor(private auth: AuthService, private globals: AppGlobalsService, private http: HttpClient,private dataService: DataService) {     }
 

 getCompanies(CompSno: number):Observable<any>
 {    
   let edata: string =JSON.stringify({"CompSno" :  CompSno}); 
   
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/getCompanies";
   
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
 
 saveCompany(Comp: TypeCompanies):Observable<TypeCompanies>
  {    
    
    let edata: string =JSON.stringify
    ({      
      "CompSno"            :   Comp.CompSno,
      "Comp_Code"          :   Comp.Comp_Code,
      "Comp_Name"          :   Comp.Comp_Name,
      "Remarks"            :   Comp.Remarks,
   }); 

     let params = new HttpParams()
     .set('data', edata,)

     let apiURL: string = this.globals.baseApiURL + "/saveCompany";
     let header = new HttpHeaders();
     header.set('Access-Control-Allow-Origin', '*');
    
     return this.http.post<TypeCompanies>(apiURL, params )          
  }

 getTransactions(TransSno: number, SeriesSno: number):Observable<TypeTransactions>
 {    
   let edata: string =JSON.stringify({"TransSno" :  TransSno, "SeriesSno" :  SeriesSno }); 
   
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/getTransactions";
   
   return this.http.get<any>(apiURL, { params })
     .pipe(map(datarecd => {                    
      console.log(datarecd);
      
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

 getTransaction_Images(TransSno: number):Observable<FileHandle>
 {    
   let edata: string =JSON.stringify({"TransSno" :  TransSno }); 
   
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/getTransaction_Images";
   
    // this.http.get<any>(apiURL, { params }).subscribe({
    //   next: data => {
    //     return JSON.parse (data);
    //     },
    //   error: error => {
    //         return "error";
    //     }
    // })

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
     }),

     catchError((error: any, caught: Observable<any>): Observable<any> => {       
      alert( error.message);

      // after handling error, return a new observable 
      // that doesn't emit any values and completes
      return of();
  })
     )
 }
 
 getReleaseforRp(TransSno: number):Observable<TypeTransactions>
 {    
   let edata: string =JSON.stringify({"TransSno" :  TransSno}); 
   
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/getReleaseforRp";
   
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

 saveTransaction(Trans: TypeTransactions, ItemDetails: string, ImageDetails: string):Observable<TypeTransactions>
  {    
    console.log(Trans);
    
    if (Trans.IntAmount === null) {
      Trans.IntAmount = 0;
    }
    
    let edata: string =JSON.stringify
    ({      
      "TransSno"            :   Trans.TransSno,
      "Trans_No"            :   Trans.Trans_No,
      "Trans_Date"          :   this.globals.DateToInt (Trans.Trans_Date),
      "Ref_No"              :   Trans.Ref_No,
      "SeriesSno"           :   Trans.Series.SeriesSno, 
      "AccountSno"          :   Trans.Account.AccountSno,  
      "PartySno"            :   Trans.RParty.PartySno,  
      "BorrowerSno"         :   Trans.Borrower.BorrowerSno, 
      "BankSno"             :   Trans.Bank.BankSno, 
      "BankBranchSno"       :   Trans.BankBranch.BranchSno,
      "Loan_Type"           :   Trans.Loan_Type,
      "Roi"                 :   Trans.Roi,
      "Tenure"              :   Trans.Tenure,
      "DrAmount"            :   Trans.DrAmount,
      "CrAmount"            :   Trans.CrAmount,      
      "PrincipalAmount"     :   Trans.PrincipalAmount,      
      "IntAmount"           :   Trans.IntAmount,      
      "Other_Charges"       :   Trans.Other_Charges,
      "RefSno"              :   Trans.Ref.RefSno,
      "Remarks"             :   Trans.Remarks,
      "ItemDetails"         :   ItemDetails, 
      "ImageDetails"        :   ImageDetails, 
      "fileSource"          :   Trans.fileSource,
      "CloseAccount"        :   Trans.CloseAccount,
      "CompSno"             :   1
   }); 

     let params = new HttpParams()
     .set('data', edata,)

     let apiURL: string = this.globals.baseApiURL + "/InsertTransaction";
     let header = new HttpHeaders();
     header.set('Access-Control-Allow-Origin', '*');
    
     return this.http.post<TypeTransactions>(apiURL, params )          
  }

saveGoldRates(GoldRate: number, PureRate: number):Observable<any>
  {    
    let edata: string =JSON.stringify
    ({      
      "GoldRate"            :   GoldRate,
      "PureRate"            :   PureRate,      
   }); 

     let params = new HttpParams()
     .set('data', edata,)

     let apiURL: string = this.globals.baseApiURL + "/saveGoldRates";
     let header = new HttpHeaders();
     header.set('Access-Control-Allow-Origin', '*');
    
     return this.http.post<TypeTransactions>(apiURL, params )          
  }
  
  // saveGoldRates(GoldRate: number, PureRate: number):Observable<any>
  // {    
  //   let edata: string =JSON.stringify
  //   ({      
  //     "userName"            :   "SCRMWS",
  //     "password"            :   "abc123",      
  //  }); 

  //    let params = new HttpParams()
  //    .set('request', edata,)

  //    let apiURL: string = "https://scrmuat.icicibank.com/restapi/oauth2/token";
  //   //  let header = new HttpHeaders();
  //   // //  header.set('Access-Control-Allow-Origin', '*');
  //   // header.set('Content-Type', 'application/json');
  //   let headers = new HttpHeaders({
  //     'Access-Control-Allow-Origin': '*',
  //     'Content-Type': 'application/json'
      
  //     });

  //    return this.http.post<any>(apiURL, edata, {headers:headers} )          
  // }

deleteTransaction(Trans: TypeTransactions)
{    
  let edata: string =JSON.stringify
  ({    
    "TransSno"    :  Trans.TransSno,
    "Trans_No"    :  Trans.Trans_No,
  }); 
  
   let params = new HttpParams()
   .set('data', edata)
      
   let apiURL: string = this.globals.baseApiURL + "/DeleteTransaction";
   let header = new HttpHeaders();
   header.set('Access-Control-Allow-Origin', '*');
  
   return this.http.delete<TypeTransactions>(apiURL, {params} )   
}


getPartyStatement(PartySno: number, FromDate: Date, ToDate: Date):Observable<TypePartyStatement>
{ 
  let edata: string =JSON.stringify({"PartySno" :  PartySno, "FromDate" :  this.globals.DateToInt(FromDate) , "ToDate" :  this.globals.DateToInt(ToDate) }); 
  
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/getPartyStatement";
  
  return this.http.get<any>(apiURL, { params })
    .pipe(map(datarecd => {                    
      if (datarecd.queryStatus == 0)
        {              
          return (0);                
        }         
        else
        {            
          return ( datarecd);            
        }                      
    }));
}

getAccountStatement(AccountSno: number, FromDate: Date, ToDate: Date):Observable<TypePartyStatement>
{ 
  let edata: string =JSON.stringify({"AccountSno" :  AccountSno, "FromDate" :  this.globals.DateToInt(FromDate) , "ToDate" :  this.globals.DateToInt(ToDate) }); 
  
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/getAccountStatement";
  
  return this.http.get<any>(apiURL, { params })
    .pipe(map(datarecd => {                    
      if (datarecd.queryStatus == 0)
        {              
          return (0);                
        }         
        else
        {            
          return ( datarecd);            
        }                      
    }));
}


sharePartyStatement(AccountSno: number, Party_Name: string, FromDate: Date, ToDate: Date, ShowImages: string):Observable<any>
{ 
  let edata: string =JSON.stringify({"AccountSno" :  AccountSno, "Party_Name" :  Party_Name, "FromDate" :  this.globals.DateToInt(FromDate) , "ToDate" :  this.globals.DateToInt(ToDate), "ShowImages": ShowImages }); 
  
    let params = new HttpParams()
    .set('data', edata)
        
    //let apiURL: string = "http://cheers.finacc.in/getStatement.php";
  let apiURL: string = "https://www.finaccsaas.com/Cheers2/data/getStatement.php";
  
  return this.http.get<any>(apiURL, { params })
    .pipe(map(datarecd => {                    
      if (datarecd.queryStatus == 0)
        {              
          return (0);                
        }         
        else
        {            
          return ( datarecd);            
        }                      
    }));
}
 
  getBankStatement(BankSno: number):Observable<TypePartyStatement>
  { 
    let edata: string =JSON.stringify({"BankSno" :  BankSno }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/getBankStatement";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      }));
  }

  getWeightBalanceforParty(PartySno: number):Observable<any>
  { 
    let edata: string =JSON.stringify({"PartySno" :  PartySno }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/getWeightBalanceforParty";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      }));
  }

  getBorrowerTransactions(BorrowerSno: number, FromDate: Date, ToDate: Date):Observable<TypeRepledges>
  { 
    let edata: string =JSON.stringify({"BorrowerSno" :  BorrowerSno, "FromDate": this.globals.DateToInt (FromDate), "ToDate": this.globals.DateToInt(ToDate) }); 
     
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/getBorrowerTransactions";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      }));
  }
 
  getRepledgeHistory(PartySno: number):Observable<TypeRepledges>
  { 
    let edata: string =JSON.stringify({"PartySno" :  PartySno }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/getRepledgeHistory";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      })); 
  }

  getRepledgeHistoryBank(BankSno: number):Observable<TypeRepledges>
  { 
    let edata: string =JSON.stringify({"BankSno" :  BankSno }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/getRepledgeHistoryBank";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      })); 
  }


  LoadRiskAnalysis():Observable<TypeRepledges>
  { 
    let edata: string =JSON.stringify({"PartySno" :  0 }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/LoadRiskAnalysis";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      }));
  }

  LoadStockSummary():Observable<any>
  { 
    let edata: string =JSON.stringify({"PartySno" :  0 }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/LoadStockSummary";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      }));
  }

  LoadBwrAnalysis():Observable<TypeRepledges>
  { 
    let edata: string =JSON.stringify({"PartySno" :  0 }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/LoadBorrowerAnalysis";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      }));
  }

  getImagesList(PartySno: number, PartyType: number):Observable<TypeRepledges>
  { 
    let edata: string =JSON.stringify({"PartySno" :  PartySno, "PartyType" :  PartyType }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/getImagesList";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      }));
  }

  getGoldRates():Observable<any>
  { 
    let edata: string =JSON.stringify({"PartySno" :  0 }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/getGoldRates";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      }));
  }
  
  getCustomerAnalysisConsolidated():Observable<any>
  { 
    let edata: string =JSON.stringify({"PartySno" :  0 }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/getCustomerAnalysisConsolidated";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      }));
  }

  getBorrowerAnalysisConsolidated():Observable<any>
  { 
    let edata: string =JSON.stringify({"PartySno" :  0 }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/getBorrowerAnalysisConsolidated";
    
    return this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                    
        if (datarecd.queryStatus == 0)
          {              
            return (0);                
          }         
          else
          {            
            return ( datarecd);            
          }                      
      }));
  }

  getRecentTransactions():Observable<any>
  { 
    let edata: string =JSON.stringify({"PartySno" :  0 }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = this.globals.baseApiURL + "/getRecentTransactions";
    
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

  InterestPosting(AccountSno: number, PostMethod: number, AsonType: number)
  {    
    let edata: string =JSON.stringify  ({ "AccountSno"    :  AccountSno, "PostMethod"    :  PostMethod, "AsonType"    :  AsonType   }); 
    
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/InterestPosting";
    let header = new HttpHeaders();
    header.set('Access-Control-Allow-Origin', '*');
    
    return this.http.delete<TypeParties>(apiURL, {params} )   
  }

  InterestPostingForAll()
  {    
    let edata: string =JSON.stringify  ({ "PartySno"    :  0 }); 
    
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/InterestPostingForAll";
    let header = new HttpHeaders();
    header.set('Access-Control-Allow-Origin', '*');
    
    return this.http.delete<TypeParties>(apiURL, {params} )   
  }

  ClearPosting(AccountSno: number)
  {    
    let edata: string =JSON.stringify  ({ "AccountSno"    :  AccountSno}); 
    
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/ClearPosting";
    let header = new HttpHeaders();
    header.set('Access-Control-Allow-Origin', '*');
    
    return this.http.delete<TypeParties>(apiURL, {params} )   
  }

saveTransfer(Trans: TypeTransactions, ToBankSno: number):Observable<TypeTransactions>
  {        
    console.log (Trans);
    let edata: string =JSON.stringify
    ({      
      "TransSno"            :   Trans.TransSno,
      "Trans_No"            :   Trans.Trans_No,
      "Trans_Date"          :   this.globals.DateToInt (Trans.Trans_Date),      
      "SeriesSno"           :   Trans.Series.SeriesSno,      
      "BorrowerSno"         :   Trans.Borrower.BorrowerSno, 
      "FromBankSno"         :   Trans.Bank.BankSno, 
      "ToBankSno"           :   ToBankSno,
      "Amount"              :   Trans.CrAmount,      
      "Remarks"             :   Trans.Remarks,      
   }); 

     let params = new HttpParams()
     .set('data', edata,)

     let apiURL: string = this.globals.baseApiURL + "/InsertTransfer";
     let header = new HttpHeaders();
     header.set('Access-Control-Allow-Origin', '*');
    
     return this.http.post<TypeTransactions>(apiURL, params )          
  }

}

