import { TypeAccounts } from "./TypeAccounts";
import { TypeParties } from "./TypeParties";

export interface TypeTransactions {
    TransSno: number;
    Trans_No: string;
    Trans_Date: Date;
    Ref_No: string;
    Series: {SeriesSno: number, Series_Name: string};
    // Party?:  {PartySno: number, Party_Name: string};
    Account: TypeAccounts;
    RParty: TypeParties;
    Borrower: {BorrowerSno: number, Borrower_Name: string};
    Bank:  {BankSno: number, Bank_Name: string};
    BankBranch:  {BranchSno: number, Branch_Name: string};
    Loan_Type: number;
    Roi: number;
    Tenure: number;
    DrAmount: number;
    CrAmount: number;
    PrincipalAmount: number;
    IntAmount: number;
    Other_Charges: number;
    Ref: {RefSno: number, Ref_No: string};
    Remarks: string;    
    GrossWt: number;
    NettWt: number;
    Purity: number;
    N916GrossWt: number;
    N916NettWt: number;
    N916Purity: number;
    fileSource: [];
    CloseAccount: number;
    CompSno?: number;    
}

