import { TypeParties } from "./TypeParties";

export interface TypeAccounts{
    AccountSno          : number;
    Account_No?         : string;
    Account_Date?       : string;
    Account_DateStr?    : string;
    Party?              : TypeParties;
    Remarks?            : string;
    NewPrincipal?       : number;
    IntLastUpdate?      : Date;
    Roi?                : number;
    Scheme?             :  number;
    Account_Status?     : number;
}