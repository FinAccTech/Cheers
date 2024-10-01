import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intToDate'
})
export class IntToDatePipe implements PipeTransform {

  transform(value: number): string {
    let argDate = value.toString();
    let year = argDate.substring(0,4);
    let month = argDate.substring(4,6);
    let day = argDate.substring(6,9);
    let newDate = year + "/" + month + "/" + day;    
    return new Date(newDate).toDateString();
  }

}
