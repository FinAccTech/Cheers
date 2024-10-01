import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  
  constructor(private auth: AuthService) { }

  //---------------- DEVELOPMENT MODE.. THIS NEED TO BE CHANGED AFTER DEVELOPMENT COMPLETES.. NEED TO GET CONNECTION INFOMATION FROM AUTH SERVICE -------------------
  
  CompSno: number = 1;
  //CompStr: string = JSON.stringify({"serverName" : "103.196.30.120INVelBooks2019", "serverUsername" : "sa", "serverPassword" : "Velbooks2022", "Database" : "Vb_9865880356" });	
    // this.CompSno = this.auth.getSelectedCompSno();
    // this.CompStr = this.auth.getClientserverconfig();

//---------------- DEVELOPMENT MODE.. THIS NEED TO BE CHANGED AFTER DEVELOPMENT COMPLETES.. NEED TO GET CONNECTION INFOMATION FROM AUTH SERVICE -------------------

  getCompSno()
  {
    return this.CompSno;
  }

  getCompStr()
  {
    //return this.CompStr;
  }

}
