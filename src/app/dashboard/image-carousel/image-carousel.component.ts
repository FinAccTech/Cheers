import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TransactionService } from '../transaction.service';
import { FileHandle } from '../types/file-handle';
import { AppGlobalsService } from '../app-globals.service';

@Component({
  selector: 'app-image-carousel', 
  templateUrl: './image-carousel.component.html',
  styleUrls: ['./image-carousel.component.css']
})
export class ImageCarouselComponent implements OnInit {

  TransImages: FileHandle[] = [];
  selectedIndex = 0;
  ImageDetails = "";
  ImageName = "";

  constructor(
    public dialogRef: MatDialogRef<ImageCarouselComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private TransService: TransactionService,
    private globals: AppGlobalsService
    ) { 
    
  }

  ngOnInit(): void {            
    this.ImageName = this.data.Heading;
    this.ImageDetails =  this.data.ImgDetails;  
    this.TransService.getTransaction_Images(this.data.TransSno, ).subscribe((data:any ) =>  {               
      this.TransImages = data;      
    });
  }

  onNoClick()
  {
    console.log ("ADfda");
    this.dialogRef.close();
  }


  selectImage(index: number): void{
    this.selectedIndex = index;
  }

  onPrevClick() : void {
    if (this.selectedIndex === 0) {
      this.selectedIndex  = this.TransImages.length - 1;
    }
    else{
      this.selectedIndex--;
    }
  }

  onNextClick() : void {
    if (this.selectedIndex === this.TransImages.length -1) {
      this.selectedIndex  = 0;
    }
    else{
      this.selectedIndex++;
    }
  }

}

