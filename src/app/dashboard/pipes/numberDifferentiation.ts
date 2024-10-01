import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberDifferentiation'
})
export class NumberDifferentiation implements PipeTransform {

  transform(value: number): string {
    const val = Math.abs(value)
    var retVal: string ="";
    // if (val >= 10000000) 
    //   {
    //     retVal =  `${(value / 10000000).toFixed(2)} Cr`;
    //     return retVal;
    //   } 
    
    if (val >= 100000) {
      //retVal =  `${(value / 100000).toFixed(2)} Lac`;
      retVal =  (value / 100000).toFixed(2);
      return retVal;
    }
    
    if (val < 100000) {
      retVal =  value.toLocaleString('en-IN');
      return retVal;
    }
  return "";    
  }
}
