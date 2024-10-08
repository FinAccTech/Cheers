import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TypeParties } from '../../types/TypeParties';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-borrowercard',
  templateUrl: './borrowercard.component.html',
  styleUrls: ['./borrowercard.component.css']
})
export class BorrowercardComponent implements OnInit {

  @Input() Party!: TypeParties;
  @Output() retAlter = new EventEmitter<boolean>(); 
  
  constructor() { }

  ngOnInit(): void {
  }

  AlterAlert(){
    this.retAlter.emit(true);
  }

}
