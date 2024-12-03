import { FileHandle } from "./file-handle";

export interface TypeParties {
    PartySno: number;
    Party_Type: number;
    Party_Name: string;
    Address?: string;
    City?: string;
    Mobile?: string;
    Email?: string;    
    Remarks?: string;
    Roi?: number;
    Scheme?: number;
    Aadhar_No?: string;
    Pan_No?: string;
    Salutation?: number;
    Sex?: number;
    Ratings?: number;
    Customer_Type?: number;
    fileSource?: FileHandle;
    Party_Image?: string;
    Image_Name?: string;
    Enable_App?: number;
    App_Code?: string;
    Enable_Accounts?: number;
    Enable_TopUp?: number;
    Enable_Shop?: number;
}
