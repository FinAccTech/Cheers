import { Component, OnInit } from '@angular/core';
import {} from '@angular/material/button'
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string = "";
  password: string = "";

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {  }

  login()
  {
    // this.auth.getLogin(this.username,this.password).subscribe((data:any ) =>  { 
      
    // });

    if (this.username == "admin" && this.password == "sysdba")
    {
      this.router.navigate (['dashboard']);
    }
    else
    {
      window.alert ("Invalid Username or password");
    }
  }

}
