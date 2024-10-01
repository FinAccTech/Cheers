import { SafeUrl } from "@angular/platform-browser";

export interface FileHandle{
    Image_Name: string,
    Image_File: File,
    Image_Url: SafeUrl,
    SrcType: number,
    DelStatus: number
}