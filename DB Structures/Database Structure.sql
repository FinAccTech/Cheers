CREATE TABLE Companies
(
  CompSno INT PRIMARY KEY IDENTITY(1,1),
  Comp_Code VARCHAR(10),
  Comp_Name VARCHAR(100),
  Remarks VARCHAR(200)
)
GO


CREATE TABLE Voucher_Series
(
  SeriesSno INT PRIMARY KEY IDENTITY(1,1),
  Series_Name VARCHAR(20),
  Numbering_Method TINYINT,
  Prefix CHAR(4),
  Current_No INT,
  Length TINYINT
)
GO

INSERT INTO Voucher_Series(Series_Name,Numbering_Method,Prefix,Current_No,Length) VALUES ('Payment',1,'PMT',0,4)
INSERT INTO Voucher_Series(Series_Name,Numbering_Method,Prefix,Current_No,Length) VALUES ('Receipt',1,'REC',0,4)
INSERT INTO Voucher_Series(Series_Name,Numbering_Method,Prefix,Current_No,Length) VALUES ('Repledge',1,'RP',0,4)
INSERT INTO Voucher_Series(Series_Name,Numbering_Method,Prefix,Current_No,Length) VALUES ('Transfer',1,'TR',0,4)
INSERT INTO Voucher_Series(Series_Name,Numbering_Method,Prefix,Current_No,Length) VALUES ('Voucher',1,'VOU',0,4)
INSERT INTO Voucher_Series(Series_Name,Numbering_Method,Prefix,Current_No,Length) VALUES ('Release',1,'REL',0,4)
INSERT INTO Voucher_Series(Series_Name,Numbering_Method,Prefix,Current_No,Length) VALUES ('Interest Posting',1,'IP',0,4)
INSERT INTO Voucher_Series(Series_Name,Numbering_Method,Prefix,Current_No,Length) VALUES ('RP Payment',1,'RPP',0,4)
INSERT INTO Voucher_Series(Series_Name,Numbering_Method,Prefix,Current_No,Length) VALUES ('Acc Closure',1,'ACL',0,4)
GO

CREATE TABLE Gold_Rates
(
  RateSno INT PRIMARY KEY IDENTITY(1,1),
  Update_Date DATE,
  Gold_Rate MONEY,
  Pure_Rate MONEY
)
GO

INSERT INTO Gold_Rates VALUES (GETDATE(), 5536, 6039)
GO

CREATE FUNCTION [dbo].[GenerateVoucherNo](@SeriesSno INT)
RETURNS VARCHAR(20)
WITH ENCRYPTION AS 
BEGIN
    DECLARE @Prefix CHAR(5)
	DECLARE @Length TINYINT
	DECLARE @Current_No INT = 0
	DECLARE @NewValue VARCHAR(20)
    SELECT  @Prefix=Prefix,@Length=Length,@Current_No=Current_No
    FROM    [dbo].Voucher_Series 
    WHERE   SeriesSno=@SeriesSno

        
        SET @Current_No=@Current_No+1
        
        SET @NewValue = @Current_No
        SET @NewValue = RTrim(@Prefix) + Rtrim(@Newvalue) 
        IF @Length <> 0
            BEGIN
                SET @NewValue = RTrim(@Prefix) + Right('000000000000000000' + Cast(@Current_No AS VARCHAR),@Length)
                SET @NewValue=  Rtrim(@Newvalue) 
            END
        RETURN  @NewValue
END
GO

CREATE TABLE Party
(
	PartySno        INT PRIMARY KEY IDENTITY(1,1),
	Party_Type      TINYINT,
	Party_Name      VARCHAR(50),
	Address         VARCHAR(200),
	City            VARCHAR(50),
	Mobile          VARCHAR(20),
	Email           VARCHAR(50),
	Remarks         VARCHAR(100),
  Roi             FLOAT,
  Scheme          TINYINT,
  IntLastUpdate   DATE,
  NewPrincipal    MONEY,
  Party_Image     VARCHAR(200),
  
  Aadhar_No       VARCHAR(20),
  Pan_No          VARCHAR(20),
  Salutation      TINYINT,
  Sex             TINYINT,
  Ratings         TINYINT,
  Customer_Type   TINYINT,

  Enable_App      BIT,
  App_Code        INT,
  Enable_Accounts BIT,
  Enable_TopUp    BIT,
  Enable_Shop     BIT
)
GO


CREATE TABLE Accounts
(
  AccountSno INT PRIMARY KEY IDENTITY(1,1),
  Account_No VARCHAR(20),
  Account_Date INT,
  PartySno INT,
  Remarks VARCHAR(100),
  NewPrincipal MONEY,
  IntLastUpdate DATE,
  Roi DECIMAL(5,2),
  Scheme TINYINT,
  Account_Status TINYINT,
  CompSno INT
)
GO

CREATE TABLE Banks
(
	BankSno INT PRIMARY KEY IDENTITY(1,1),
	Bank_Name VARCHAR(50),
	Acc_Cat TINYINT,
	Acc_Name VARCHAR(50),
	Acc_No VARCHAR(20),
	Acc_Type TINYINT
)
GO

CREATE TABLE Bank_Branches
(
	BranchSno INT PRIMARY KEY IDENTITY(1,1),
	BankSno INT,
	Branch_Name VARCHAR(50),
	Branch_Address VARCHAR(200),
	Remarks VARCHAR(50),
)
GO

CREATE TABLE Transactions
(
	TransSno            INT PRIMARY KEY IDENTITY(1,1),
	Trans_No            VARCHAR(20),
	Trans_Date          INT,
	Ref_No              VARCHAR(20),
	SeriesSno           INT,
  AccountSno          INT,
	BorrowerSno         INT,
  BankSno             INT,
	BankBranchSno       INT,
	Loan_Type           VARCHAR(20),
	Roi                 FLOAT,
	DrAmount            MONEY,
	CrAmount            MONEY,
  PrincipalAmount     MONEY,
  IntAmount           MONEY,
  IntAccured          MONEY,
	Other_Charges       MONEY,
	RefSno              INT,
  Remarks             VARCHAR(100)
)
GO

CREATE TABLE Transaction_Details
(
	DetSno INT PRIMARY KEY IDENTITY(1,1),
	TransSno INT,
	GrossWt FLOAT,
	NettWt FLOAT,
	Purity FLOAT,
	Remarks VARCHAR(50),
  PureWt FLOAT
)
GO

CREATE TABLE Image_Details
(
  DetSno INT PRIMARY KEY IDENTITY(1,1),
  TransSno INT,
  Image_Name  VARCHAR(100),
  Image_Url   VARCHAR(200)  
)
GO

CREATE TABLE Messages
(
  MsgSno        INT PRIMARY KEY IDENTITY(1,1),
  Msg_Date      DATETIME,
  Msg_Cat       TINYINT, -- 1 - Normal Message, 2 - Group Message, 3- Braodcast Message
  Msg_Type      TINYINT, -- 1 - Text Message, 2- Photo Message, 3 - Video Message, 4- Document
  SenderSno     INT,
  RecipientSno  INT,
  Text_Content  VARCHAR(100),
  File_Path     VARCHAR(200),
  File_Desc     VARCHAR(50),
  Msg_Status    TINYINT,
  Del_Status    TINYINT
)

GO

