import { TypeBanks } from "./TypeBanks";

export interface TypeBankBranches {
    BranchSno: number;        
    Bank: {BankSno: number, Bank_Name: string};    
    Branch_Name: string;
    Branch_Address: string;
    Remarks: string;    
}
