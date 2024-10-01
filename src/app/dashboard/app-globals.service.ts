import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Injectable({
  providedIn: 'root'
})


export class AppGlobalsService 
{
  constructor(private dialog: MatDialog){ }

  baseApiURL:string = "https://www.finaccsaas.com/CheersApp/data/ClsRest.php";
  baseImageURL: string = "https://www.finaccsaas.com/CheersApp/data/Images/";

  
      PartyTypeCustomers:   number = 1;
      PartyTypeBorrower:    number = 2;
    
      VtypPayment:          number = 1;     
      VTypReceipt:          number = 2;
      VtypRepledge:         number = 3;
      VtypTransfer:         number = 4;
      VtypVoucher:          number = 5;
      VtypRelease:          number = 6;
      VtypInterestPosting:  number = 7;
      VTypRpPayment:        number = 8;

      objItemGroups:        number = 1;
      objParty:             number = 2;
      objTransactions:      number = 3;
      objAccVoucherSeries:  number = 4;

  DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }
  
  IntToDate(inputDate: any)
  {
    let argDate = inputDate.toString();
    let year = argDate.substring(0,4);
    let month = argDate.substring(4,6);
    let day = argDate.substring(6,9);
    let newDate = year + "/" + month + "/" + day;
    return new Date(newDate);
  }

  MonthFirstDate(inputDate: Date)
  {    
    let newDate = inputDate;
    newDate.setDate(1);
    return newDate;
  }
  

  date_To_String(date_Object: Date): string {
    // get the year, month, date, hours, and minutes seprately and append to the string.
    let date_String: string =
      date_Object.getDate() +
      "/" +
      (date_Object.getMonth() + 1) +
      "/" 
      +date_Object.getFullYear(); 
      // " " +
      // +date_Object.getHours() +
      // ":" +
      // +date_Object.getMinutes();
    return date_String;
  }

  async getBase64ImageFromUrl(imageUrl: string) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();
  
    return new Promise((resolve, reject) => {
      var reader  = new FileReader();
      reader.addEventListener("load", function () {
          resolve(reader.result);
      }, false);
  
      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }


  /* ------------------------------------------For Opening Dialog with Animation----------------------------------------------------
    OpenDialog(enterAnimationDuration: string, exitAnimationDuration: string, DialogType: number, DialogText: string): void {
    this.globals.OpenDialog('500ms', '500ms',3,""); 
  ----------------------------------------------------------------------------------------------------------------------------------*/
 
  getVouTypeName(VouTypeSno: number)
  {
    switch (VouTypeSno) {
      case 1:
        return "Purchase"                                    
        break;

      case 2:
        return "Damage Entry"                  
        break;

      case 3:
        return "Payment"                  
        break;

      case 4:
        return "Kacha Payment"                  
        break;
    }
    return "";
  }



}
