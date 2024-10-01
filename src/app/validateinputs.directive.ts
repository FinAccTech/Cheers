import { Directive, HostListener, Input, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({ selector: '[Validateinputs]' })

export class ValidateinputsDirective {
  
  @Input() InputType!: string;

  constructor(@Self() private ngControl: NgControl) {}

  @HostListener('focus', ['$event']) onKeyDowns(event: KeyboardEvent) {
    
    if (this.ngControl.value === null) 
      {
        if (this.InputType == 'number')
        {
          this.ngControl.reset(0);
        }
        else
        {
          this.ngControl.reset('');
        }      
      }

    // if (this.ngControl.value?.trim() === '') {
    //     this.ngControl.reset(null);
    // }
  }
}