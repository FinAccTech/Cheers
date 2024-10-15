import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { TypeBanks } from '../../types/TypeBanks';

@AutoUnsubscribe
@Component({
  selector: 'app-bankcard',
  templateUrl: './bankcard.component.html',
  styleUrls: ['./bankcard.component.css']
})
export class BankcardComponent implements OnInit {

  @Input() Bank!: TypeBanks;
  @Output() retAlter = new EventEmitter<boolean>(); 
  
  constructor() { }

  ngOnInit(): void {
  }

  AlterAlert(){
    this.retAlter.emit(true);
  }

}
