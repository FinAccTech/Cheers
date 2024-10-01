import { Directive, ElementRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[SelListHost]',
  
})
export class SelListDirective {

  constructor(private el: ElementRef, public viewContainerRef: ViewContainerRef) { }

}
