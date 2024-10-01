import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TypeParties } from '../types/TypeParties';
import { TypeImages } from '../types/TypeImages';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Subscription, finalize, subscribeOn } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { FileHandle } from '../types/file-handle';

export interface ImageFile {
  ImageName: string,
  ImageFile: File
}

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css']
})


export class ImagesComponent implements OnInit {

  TransImages: FileHandle[] = [];
  imageObject: any [] = [] ;

  uploadProgress:number = 0;
  uploadSub: Subscription = new Subscription;
  TotalFileSize: number = 0;

  SelectedImage: any;
    
  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ImagesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,    
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

    
  selectFiles($event: any)
  { 
    if ($event.target.files)
    {
      for (var i=0; i < $event.target.files.length; i++)
      {
        const file = $event?.target.files[i];
        var reader = new FileReader();
        reader.readAsDataURL($event.target.files[i]);
        reader.onload = (event: any) => {
          const fileHandle: FileHandle ={
            Image_Name: file.name,
            Image_File: event.target.result, 
            Image_Url: this.sanitizer.bypassSecurityTrustUrl(
              window.URL.createObjectURL(file),              
            ),
            SrcType:0,
            DelStatus:0
          };          
          this.TransImages.push (fileHandle);
        }
      }

      // for (var i=0; i < $event.target.files.length; i++)
      // {        
      //   if ($event.target.files[i].type == "image/jpeg" ||  $event.target.files[i].type == "image/jpg" || $event.target.files[i].type == "image/png" || $event.target.files[i].type == "image/bmp")
      //   {
      //     this.TotalFileSize +=  $event.target.files[i].size;
      //     var reader = new FileReader();
      //     reader.readAsDataURL($event.target.files[i]);
      //     cImage.ImageName = $event.target.files[i].name;
      //     reader.onload = (event: any) => 
      //     {            
      //       console.log (event.target);
      //       if (event.target.result)
      //       {
      //         this.urls.push ({"ImageName":event.target.file,"ImageFile": event.target.result});      
      //         this.patchValues();
      //       }
      //     }
      //   }
      //   else
      //   {
      //     this._snackBar.open('Only Image Files are supported', 'Error',{horizontalPosition: 'center', verticalPosition: 'top', duration: 1000, panelClass: ['blue-snackbar'] });            
      //   }
      // }
    }
  }

  ClearallImages()
  {
    this.TransImages = [];    
  }

  RemoveImage(i: number){  
    if (this.TransImages[i].SrcType == 1)
    {
      this.TransImages[i].DelStatus = 1;
    }
    else
    {
      this.TransImages.splice(i,1);    
    }    
  }

  LoadImage(i: number){    
    if (this.TransImages[i].SrcType == 0)
    {
      this.SelectedImage = this.TransImages[i].Image_File;
    }
    else
    {
      this.SelectedImage = this.TransImages[i].Image_Url;
    }
   
  }

  ngOnInit(): void {
    this.ClearallImages();    
    this.TransImages = this.data.img;      
    
    this.TransImages.forEach((image) => {
      let tImg = [];
      let newData = {} as any;

      newData.image = image.Image_Name;
      newData.thumbImage = image.Image_Name;
      newData.title = image.Image_Name;      
      // this.imageObject.push (newData);

    });

    
  }

  CloseDialog(): void {
    this.dialogRef.close(this.TransImages);

    // this.http.post('http://184.168.125.210/CheersApp/data/upload.php', this.myForm.value)
    // .subscribe(res => {
    //   console.log(res);
    //   alert('Uploaded Successfully.');
    // })
    // console.log (this.TotalFileSize);

    // const upload$ = this.http.post("http://184.168.125.210/CheersApp/data/upload.php", this.myForm.value, {
    //   reportProgress: true,
    //   observe: 'events'
    //   })
    //   .pipe(
    //       finalize(() => this.reset())
    //   );

    //   this.uploadSub = upload$.subscribe(event => {
    //     if (event.type == HttpEventType.UploadProgress) {
    //       this.uploadProgress = Math.round(100 * (event.loaded / this.TotalFileSize ));
    //       console.log (event.loaded);
    //     }
    //   })
  }

  reset() {
    this.uploadProgress = 0;
    this.uploadSub = new Subscription;
  }  
}
