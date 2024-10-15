

import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppGlobalsService } from './app-globals.service';
import { TypeParties } from './types/TypeParties';
import { TypeAccounts } from './types/TypeAccounts';

@Injectable({
  providedIn: 'root'
})

export class PartyService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin' : '*'
    }),
  };  
  
 constructor(private auth: AuthService, private globals: AppGlobalsService, private http: HttpClient,) {     }
 
 getParties(PartySno: number, PartyType:number):Observable<TypeParties>
 {    
   let edata: string =JSON.stringify({"PartySno" :  PartySno, "Party_Type" :  PartyType }); 
   
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/getParties";
   
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

 saveParty(Pty: TypeParties):Observable<TypeParties>
  { 
    let edata: string =JSON.stringify
    ({      
      "PartySno"            :   Pty.PartySno,
      "Party_Type"          :   Pty.Party_Type,
      "Party_Name"          :   Pty.Party_Name,
      "Address"             :   Pty.Address,
      "City"                :   Pty.City,      
      "Mobile"              :   Pty.Mobile,            
      "Email"               :   Pty.Email,
      "Remarks"             :   Pty.Remarks,    
      "Roi"                 :   Pty.Roi,    
      "Scheme"              :   Pty.Scheme,
      "Salutation"          :   Pty.Salutation,
      "Sex"                 :   Pty.Sex,
      "Aadhar_No"           :   Pty.Aadhar_No,
      "Pan_No"              :   Pty.Pan_No,
      "Ratings"             :   Pty.Ratings,
      "Customer_Type"       :   Pty.Customer_Type,
      "fileSource"          :   Pty.fileSource,
      "Party_Image"          :   Pty.Party_Image,

   });    
   
     let params = new HttpParams()
     .set('data', edata)
     
     let apiURL: string = this.globals.baseApiURL + "/InsertParty";
     let header = new HttpHeaders();
     header.set('Access-Control-Allow-Origin', '*');
    
     return this.http.post<TypeParties>(apiURL, params )          
  }

  
deleteParty(Pty: TypeParties)
{    
  let edata: string =JSON.stringify
  ({    
    "PartySno"    :  Pty.PartySno
  }); 
  
   let params = new HttpParams()
   .set('data', edata)
      
   let apiURL: string = this.globals.baseApiURL + "/DeleteParty";
   let header = new HttpHeaders();
   header.set('Access-Control-Allow-Origin', '*');
  
   return this.http.delete<TypeParties>(apiURL, {params} )   
}

getAccounts(AccountSno: number, PartySno: number):Observable<any>
 {    
   let edata: string =JSON.stringify({"AccountSno" :  AccountSno, "PartySno" :  PartySno, }); 
   
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/getAccounts";
   
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

 getPartySummary(PartySno: number):Observable<any>
 {    
   let edata: string =JSON.stringify({"PartySno" :  PartySno, }); 
   
    let params = new HttpParams()
    .set('data', edata)
        
    let apiURL: string = this.globals.baseApiURL + "/getPartySummary";
   
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


saveAccount(Acc: TypeAccounts):Observable<TypeAccounts>
  { 
    let edata: string =JSON.stringify
    ({      
      "AccountSno"         :   Acc.AccountSno,
      "Account_No"         :   Acc.Account_No,
      "Account_Date"       :   Acc.Account_Date,
      "PartySno"           :   Acc.Party!.PartySno,
      "Roi"                :   Acc.Roi,            
      "CompSno"            :    Acc.Company!.CompSno,
      "Scheme"             :   Acc.Scheme,          
      "Remarks"            :   Acc.Remarks,
   });    
   
     let params = new HttpParams()
     .set('data', edata)
     
     let apiURL: string = this.globals.baseApiURL + "/InsertAccount";
     let header = new HttpHeaders();
     header.set('Access-Control-Allow-Origin', '*');
    
     return this.http.post<TypeAccounts>(apiURL, params )          
  }

  
deleteAccount(Acc: TypeAccounts)
{    
  let edata: string =JSON.stringify
  ({    
    "AccountSno"    :  Acc.AccountSno
  }); 
  
   let params = new HttpParams()
   .set('data', edata)
      
   let apiURL: string = this.globals.baseApiURL + "/DeleteAccount";
   let header = new HttpHeaders();
   header.set('Access-Control-Allow-Origin', '*');
  
   return this.http.delete<TypeAccounts>(apiURL, {params} )   
}


}

