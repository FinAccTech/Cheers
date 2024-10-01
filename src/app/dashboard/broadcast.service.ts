// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class BroadcastserviceService {

//   constructor() { }
// }

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
    
    @Injectable({ providedIn: 'root' })
    export class BroadcastserviceService {
        private subjectName = new Subject<any>(); //need to create a subject
    
        sendUpdate(Changed: boolean) { //the component that wants to update something, calls this fn
            this.subjectName.next({ changed: Changed }); //next() will feed the value in Subject            
            console.log (Changed);
        }
    
        getUpdate(): Observable<any> { //the receiver component calls this function 
            return this.subjectName.asObservable(); //it returns as an observable to which the receiver funtion will subscribe
        }
    }