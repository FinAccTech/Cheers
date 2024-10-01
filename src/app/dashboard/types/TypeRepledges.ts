import { TypePayments } from "./TypePayments";

export interface TypeRepledges {    
    TransSno: number;
    Trans_No: string;
    Trans_Date: Date;    
    Duration: string;
    Ref_No: string;        
    SeriesSno: number;
    Series_Name: string;
    PartySno: number;
    Party_Name: string;
    BorrowerSno: number;
    Borrower_Name: string;
    BankSno: number;
    Bank_Name: string;
    BankBranchSno: number;
    Branch_Name: string;
    Roi: number;    
    Tenure: number;
    CrAmount: number;
    DrAmount: number;
    IntAmount: number;
    Other_Charges: number;
    RefSno: number;
    RefTrans_No: string;
    CrWeight: number;
    DrWeight: number;    
    Remarks: string;    
    Loan_Type: number;    
    RpStatus: number;
}
