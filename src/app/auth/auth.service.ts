import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }
  // Http Options
  
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin' : '*'
    }),
  };
 
  authenticated: boolean = false;
  Loggeduser: string = "";
  ClientSno: number = 0;
  SelectedCompSno: number = 0;
  SelectedCompName: string = "";

  
 

  // listCompanies(): Observable<any>
  //   {
      
  //     let edata: string =JSON.stringify({"clientsno" :  this.ClientSno}); 
      
  //      let params = new HttpParams()
  //      .set('data', edata)
             
  //      let apiURL: string = "http://103.196.30.120/VelBooks/data/ClsRest.php/rep/getCompanies";
      
      
  //     return this.http.get<any>(apiURL, { params })
  //         .pipe(map(datarecd => {               
  //           console.log (datarecd);
  //           this.SelectedCompSno  = JSON.parse(datarecd.apiData)[0].CompSno;
  //           this.SelectedCompName  = JSON.parse(datarecd.apiData)[0].Comp_Name;            
  //           // sessionStorage.clear();            
  //           // sessionStorage.setItem("CompStr",this.CompServerConfig);
  //           return JSON.parse (datarecd.apiData)
  //         }));  
  //   }

  logout()
  {
    this.Loggeduser = "";    
    //this.selectedCompany = "";
    this.authenticated = false;
    this.router.navigate (['']);
  }

  getLoggeduser(){
    return this.Loggeduser;
  }

  
  getSelectedCompSno(){
    return this.SelectedCompSno;
  }

  getSelectedcompname(){
    return this.SelectedCompName;
  }
}
