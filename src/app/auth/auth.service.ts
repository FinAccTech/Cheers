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

  
  getLogin(username: string,password: string): Observable<any> 
  {          
    let edata: string =JSON.stringify({"username" :  username , "password" : password  }); 
    
     let params = new HttpParams()
     .set('data', edata)
         
     let apiURL: string = "http://103.196.30.120/VelBooks/data/ClsRest.php/rep/getUser";
    
    // return this.http.get<Users>(apiURL,{params}) 
    
    return this.http.get<any>(apiURL, { params })
        .pipe(map(datarecd => {            
            
            if (datarecd.queryStatus == 0)
            {
              this.Loggeduser = "";
              this.authenticated = false;
              alert (datarecd.apiData);                
            }
            else if (datarecd.queryStatus == 1)
            {              
              if (JSON.parse(datarecd.apiData).length > 0)
              { 
                this.ClientSno  = JSON.parse(datarecd.apiData)[0].ClientSno;
                this.Loggeduser = JSON.parse(datarecd.apiData)[0].Client_Name;                

                let Cnnstr: string[] = ["103.196.30.120INVelBooks2019", "sa", "Velbooks2022", "VelBooks"];	
                Cnnstr[0] = JSON.parse(datarecd.apiData)[0].Client_Servername;
                Cnnstr[1] = JSON.parse(datarecd.apiData)[0].Client_Serverusername;
                Cnnstr[2] = JSON.parse(datarecd.apiData)[0].Client_Serverpassword;
                Cnnstr[3] = JSON.parse(datarecd.apiData)[0].Client_VelBooksDb;
            
                this.authenticated = true;
                this.router.navigate (['dashboard']);
              }
              else
              {
                this.Loggeduser = "";
                this.authenticated = false;
                window.alert("Invalid User Credentials");                    
              }
            }
            else{
              window.alert("Login Error\n" + datarecd.error);
              this.Loggeduser = "";
              this.authenticated = false;                
            }            
            
        }));
  }   

  listCompanies(): Observable<any>
    {
      
      let edata: string =JSON.stringify({"clientsno" :  this.ClientSno}); 
      
       let params = new HttpParams()
       .set('data', edata)
             
       let apiURL: string = "http://103.196.30.120/VelBooks/data/ClsRest.php/rep/getCompanies";
      
      
      return this.http.get<any>(apiURL, { params })
          .pipe(map(datarecd => {               
            console.log (datarecd);
            this.SelectedCompSno  = JSON.parse(datarecd.apiData)[0].CompSno;
            this.SelectedCompName  = JSON.parse(datarecd.apiData)[0].Comp_Name;            
            // sessionStorage.clear();            
            // sessionStorage.setItem("CompStr",this.CompServerConfig);
            return JSON.parse (datarecd.apiData)
          }));  
    }

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
