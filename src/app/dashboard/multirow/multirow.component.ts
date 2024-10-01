import {Component} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';


/**
 * @title Table with expandable rows
 */
@Component({
  selector: 'app-multirow',
  styleUrls: ['multirow.component.css'],
  templateUrl: 'multirow.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],  
})

export class MultirowComponent {
  dataSource = ELEMENT_DATA;
  columnsToDisplay = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement!: PeriodicElement | null;
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: Payments[];
}

export interface Payments{
  TransSno: number;
  Trans_No: string;
  DrAmount: number;
  CrAmount: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    symbol: 'H',
    description: [{TransSno: 0, Trans_No: "TN2500", DrAmount: 2000, CrAmount: 0}, {TransSno: 0, Trans_No: "TN2501", DrAmount: 0, CrAmount: 30000}, {TransSno: 0, Trans_No: "TN2503", DrAmount: 20000, CrAmount: 0}] 
  },
  {
    position: 2,
    name: 'Helium',
    weight: 4.0026,
    symbol: 'He',
    description: []
  },
  {
    position: 3,
    name: 'Lithium',
    weight: 6.941,
    symbol: 'Li',
    description:  []
  },
  {
    position: 4,
    name: 'Beryllium',
    weight: 9.0122,
    symbol: 'Be',
    description:  []
    },
  {
    position: 5,
    name: 'Boron',
    weight: 10.811,
    symbol: 'B',
    description:  []
  },
  {
    position: 6,
    name: 'Carbon',
    weight: 12.0107,
    symbol: 'C',
    description:  []
  },
  {
    position: 7,
    name: 'Nitrogen',
    weight: 14.0067,
    symbol: 'N',
    description:  []
  },
  {
    position: 8,
    name: 'Oxygen',
    weight: 15.9994,
    symbol: 'O',
    description:  []
  },
  {
    position: 9,
    name: 'Fluorine',
    weight: 18.9984,
    symbol: 'F',
    description:  []
  },
  {
    position: 10,
    name: 'Neon',
    weight: 20.1797,
    symbol: 'Ne',
    description: []
  },
];
