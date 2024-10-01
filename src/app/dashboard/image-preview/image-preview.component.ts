import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.css']
})
export class ImagePreviewComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ImagePreviewComponent>, @Inject(MAT_DIALOG_DATA) public data: any, ) {
    this.dialogRef.updateSize('300vw','300vw');
   }

  Image_Details: string = "";
  Image_Path: string = "";

  ngOnInit(): void {    
    this.Image_Details = this.data.Image_Details;
    this.Image_Path = this.data.Image_Url;
  } 

}
