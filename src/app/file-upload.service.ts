
// import { Injectable } from '@angular/core';
// import {HttpClient} from '@angular/common/http';
// import {Observable} from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class FileUploadService {
//   // API url
//   // baseApiUrl = "https://file.io"
  
//   baseApiURL:string = "http://43.246.138.166/VelBooks/data/fileUpload.php";

//   constructor(private http:HttpClient) { }
  
//   // Returns an observable
//   upload(file: any, filename: string):Observable<any> {
  
//       // Create form data
//       const formData = new FormData(); 
        
//       // Store form name as "file" with file data
//       formData.append("file", file, filename);
        
//       // Make http post request over api
//       // with formData as req
//       return this.http.post(this.baseApiURL, formData)
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FileUploadService {
  
  private baseUrl = 'http://184.168.125.210/VelBooks/data';  
  
  constructor(private http: HttpClient) {}

  UploadFile(file: File, FolderName: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('fileToUpload', file);
    formData.append('Folder', "Uploads/" + FolderName +"/");

    const req = new HttpRequest('POST', `${this.baseUrl}/fileUpload.php`, formData, {
      reportProgress: true,
      responseType: 'text',
    });

    return this.http.request(req);
  }

  getFiles(FolderName: String): Observable<any> 
  {
    return this.http.get(`${this.baseUrl}/Uploads/`+FolderName);
  }
}