

import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppGlobalsService } from './app-globals.service';
import { TypeParties } from './types/TypeParties';

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
      "Scheme"              :   Pty.Scheme
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


}

