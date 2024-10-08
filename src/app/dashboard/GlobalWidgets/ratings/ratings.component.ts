import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.scss']
})
export class RatingsComponent implements OnInit {

  @Input() rating!: number;
  @Output() retRating = new EventEmitter<number>(); 

  constructor() { }

  ngOnInit(): void {

  } 

  SetRating(){
    this.retRating.emit(this.rating);
  }

}
