IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='SDateDiff') BEGIN DROP FUNCTION SDateDiff END
GO
CREATE FUNCTION [dbo].SDateDiff(@FromDate DATETIME,@ToDate DATETIME)
  RETURNS @Det TABLE(Months INTEGER,Days INTEGER)
  WITH ENCRYPTION AS

BEGIN
    --DECLARE @FromDate DATETIME	= [dbo].IntToDate(@FDate)
    --DECLARE @ToDate DATETIME	=  [dbo].IntToDate(@TDate)
    DECLARE @Fday           INTEGER
    DECLARE @Tday           INTEGER
    DECLARE @MonthsDiff     INTEGER
    DECLARE @DaysDiff       INTEGER
    SET @FDay   =   DAY(@FromDate)
    SET @TDay   =   DAY(@ToDate)    
    IF @FDay > @TDay
        BEGIN
            SET @MonthsDiff = DATEDIFF(MONTH,@Fromdate,@ToDate-DAY(@Todate)-1)
            SET @DaysDiff   = DAY(@ToDate-DAY(@Todate)) - @FDay + @TDay
        END
    ELSE IF @FDay < @TDay
        BEGIN
            SET @MonthsDiff = DATEDIFF(MONTH,@Fromdate,@ToDate-DAY(@Todate)-1) +1
            SET @DaysDiff   = @TDay - @FDay
        END
    ELSE IF @FDay = @TDay
        BEGIN
            SET @MonthsDiff = DATEDIFF(MONTH,@Fromdate,@ToDate-DAY(@Todate)-1) +1
            SET @DaysDiff   = 0
        END
    INSERT INTO @Det VALUES(@MonthsDiff,@DaysDiff)
    RETURN
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='SSp_Transactions') BEGIN DROP PROCEDURE SSp_Transactions END
GO
CREATE PROCEDURE [dbo].SSp_Transactions
        -- Add the parameters for the stored procedure here
         @TransSno            INT,
         @Trans_No            VARCHAR(20),
         @Trans_Date          INT,
         @Ref_No              VARCHAR(20),
         @SeriesSno           INT,
         @AccountSno            INT,
         @BorrowerSno         INT,
         @BankSno             INT,
         @BankBranchSno       INT,
         @Loan_Type           TINYINT,
         @Roi                 FLOAT,
         @Tenure              TINYINT,
         @DrAmount            MONEY,
         @CrAmount            MONEY,
         @PrincipalAmount     MONEY,
         @IntAmount            MONEY,
         @Other_Charges       MONEY,
         @RefSno              INT,
         @Remarks             VARCHAR(100),         
         @ItemDetailS         XML,
         @ImageDetailS        XML,
         @CloseAccount        BIT,         
         @RetTransSno         INT OUTPUT,
         @RetTrans_No         VARCHAR(20) OUTPUT

        WITH ENCRYPTION AS
        BEGIN
         SET NOCOUNT ON
         DECLARE @ISEXISTS INT
         BEGIN TRANSACTION

         DECLARE @ItemDetailXML XML
         SET @ItemDetailXML=@ItemDetailS
         
          DECLARE @ImageDetailXML XML
          SET @ImageDetailXML=@ImageDetailS

         IF EXISTS(SELECT TransSno FROM [dbo].Transactions WHERE TransSno=@TransSno)
             BEGIN                 
                  UPDATE [dbo].Transactions SET Trans_No=@Trans_No,Trans_Date=@Trans_Date,Ref_No=@Ref_No,SeriesSno=@SeriesSno,AccountSno=@AccountSno,BorrowerSno=@BorrowerSno,BankSno=@BankSno,
                  BankBranchSno=@BankBranchSno,Loan_Type=@Loan_Type,Roi=@Roi,Tenure=@Tenure,DrAmount=@DrAmount,CrAmount=@CrAmount,PrincipalAmount=@PrincipalAmount,IntAmount=@IntAmount,Other_Charges=@Other_Charges,RefSno=@RefSno,Remarks=@Remarks
                  WHERE   TransSno=@TransSno
                  IF @@ERROR <> 0 GOTO CloseNow
        
                  --For Deleting Sub Tble values
                  DELETE FROM [dbo].Transaction_Details WHERE TransSno=@TransSno
                  IF @@ERROR <> 0 GOTO CloseNow
                  DELETE FROM [dbo].Image_Details WHERE TransSno=@TransSno
                  IF @@ERROR <> 0 GOTO CloseNow
                  DELETE FROM Transactions WHERE SeriesSno=9 AND RefSno=@TransSno
                  IF @@ERROR <> 0 GOTO CloseNow                  
             END
         ELSE        
             BEGIN                 
              --FOR AUTO GENERATION OF SERIES NO
              DECLARE @Num_Method TINYINT                    
              SELECT @Num_Method=Numbering_Method FROM [dbo].Voucher_Series WHERE SeriesSno=@SeriesSno
              IF (@Num_Method=1)
                  BEGIN
                      SET @Trans_No= Dbo.[GenerateVoucherNo](@SeriesSno)               
                  END
                     
                INSERT INTO [dbo].Transactions(Trans_No,Trans_Date,Ref_No,SeriesSno,AccountSno,BorrowerSno,BankSno,BankBranchSno,Loan_Type,Roi,Tenure,DrAmount,CrAmount,PrincipalAmount,IntAmount,Other_Charges,RefSno,Remarks) 
                VALUES (@Trans_No,@Trans_Date,@Ref_No,@SeriesSno,@AccountSno,@BorrowerSno,@BankSno,@BankBranchSno,@Loan_Type,@Roi,@Tenure,@DrAmount,@CrAmount,@PrincipalAmount,@IntAmount,@Other_Charges,@RefSno,@Remarks)
                IF @@ERROR <> 0 GOTO CloseNow
                SET @TransSno=@@IDENTITY        
        
                --For Updating Voucher Series
                UPDATE Voucher_Series SET Current_No=Current_No+1 WHERE SeriesSno=@SeriesSno
              IF @@ERROR <> 0 GOTO CloseNow

              DECLARE @IntLastUpdate DATE
              SELECT @IntLastUpdate = IntLastUpdate FROM Accounts WHERE AccountSno=@AccountSno
              IF [dbo].IntToDate(@Trans_Date) < @IntLastUpdate
                BEGIN
                  UPDATE Accounts SET IntLastUpdate=[dbo].IntToDate(@Trans_Date) WHERE AccountSno=@AccountSno
                  IF @@ERROR <> 0 GOTO CloseNow
                END
             END


             IF @CloseAccount = 1
                BEGIN
                    INSERT INTO [dbo].Transactions(Trans_No,Trans_Date,Ref_No,SeriesSno,AccountSno,BorrowerSno,BankSno,BankBranchSno,Loan_Type,Roi,Tenure,DrAmount,CrAmount,PrincipalAmount,IntAmount,Other_Charges,RefSno,Remarks) 
                    VALUES      ('',[dbo].DateToInt(GETDATE()) ,@Trans_No, 9, @AccountSno,@BorrowerSno,@BankSno,@BankBranchSno,@Loan_Type,@Roi,@Tenure,0,0,0,0,0,@TransSno,'Acc Closed')
                    IF @@ERROR <> 0 GOTO CloseNow
                END
             --For Inserting Transaction Details Table
             IF @ItemDetailXML IS NOT NULL
                BEGIN                  
                   DECLARE @idoc       INT
                   DECLARE @doc        XML
                   DECLARE @Sno        INT                      
                   DECLARE @GrossWt    FLOAT                 
                   DECLARE @NettWt     FLOAT                 
                   DECLARE @Purity     FLOAT                 
                   DECLARE @IteRemarks VARCHAR(100)
                              
                   /*Declaring Temporary Table for Details Table*/
                   DECLARE @DetTable Table
                   (
                       Sno INT IDENTITY(1,1),GrossWt FLOAT,NettWt FLOAT,Purity FLOAT,IteRemarks VARCHAR(100)
                   )
                   Set @doc=@ItemDetailXML
                   Exec sp_xml_preparedocument @idoc Output, @doc
 

                   /*Inserting into Temporary Table from Passed XML File*/
                   INSERT INTO @DetTable
                   (
                       GrossWt,NettWt,Purity,IteRemarks
                   )
             
                   SELECT  * FROM  OpenXml 
                   (
                       @idoc, '/ROOT/Transaction/Transaction_Details',2
                   )
                   WITH 
                   (
                       GrossWt FLOAT '@GrossWt', NettWt FLOAT '@NettWt',Purity FLOAT '@Purity',IteRemarks VARCHAR(100) '@IteRemarks'
                   )
                   SELECT  TOP 1 @Sno=Sno,@GrossWt=GrossWt,@NettWt=NettWt,@Purity=Purity,@IteRemarks=IteRemarks
                   FROM @DetTable
                  
                   /*Taking from Temporary Details Table and inserting into details table here*/
                   WHILE @@ROWCOUNT <> 0 
                       BEGIN
                           INSERT INTO [dbo].Transaction_Details(TransSno,GrossWt,NettWt,Purity,Remarks,PureWt) 
                           VALUES (@TransSno,@GrossWt,@NettWt,@Purity,@IteRemarks,@NettWt * @Purity /100 )
                           IF @@Error <> 0 GOTO CloseNow
             
                           DELETE FROM @DetTable WHERE Sno = @Sno
                           SELECT  TOP 1 @Sno=Sno,@GrossWt=GrossWt,@NettWt=NettWt,@Purity=Purity,@IteRemarks=IteRemarks
                           FROM @DetTable
                       END
                   Exec Sp_Xml_Removedocument @idoc
                END

                --For Inserting Images Table
              IF @ImageDetailXML IS NOT NULL
                  BEGIN                     

                     DECLARE @idoc1       INT
                     DECLARE @doc1        XML
                     DECLARE @Image_Name  VARCHAR(100)
                     DECLARE @Image_Url   VARCHAR(100)
                                              
                     /*Declaring Temporary Table for Details Table*/
                     DECLARE @ImgTable Table
                     (
                         Sno INT IDENTITY(1,1),Image_Name VARCHAR(100), Image_Url VARCHAR(200)
                     )
                     Set @doc1=@ImageDetailXML
                     Exec sp_xml_preparedocument @idoc1 Output, @doc1
             
                     /*Inserting into Temporary Table from Passed XML File*/
                     INSERT INTO @ImgTable
                     (
                         Image_Name, Image_Url
                     )
             
                     SELECT  * FROM  OpenXml 
                     (
                         @idoc1, '/ROOT/Images/Image_Details',2
                     )
                     WITH 
                     (
                         Image_Name VARCHAR(100) '@Image_Name', Image_Url VARCHAR(200) '@Image_Url'
                     )
                     SELECT  TOP 1 @Sno=Sno,@Image_Name=Image_Name, @Image_Url=Image_Url
                     FROM @ImgTable
                  
                     /*Taking from Temporary Details Table and inserting into details table here*/
                     WHILE @@ROWCOUNT <> 0 
                         BEGIN
                             INSERT INTO [dbo].Image_Details(TransSno, Image_Name, Image_Url) 
                             VALUES (@TransSno,@Image_Name, 'Images/'+@Trans_No+'/'+ @Image_Name)
                             IF @@Error <> 0 GOTO CloseNow
             
                             DELETE FROM @ImgTable WHERE Sno = @Sno
                             SELECT  TOP 1 @Sno=Sno,@Image_Name=Image_Name, @Image_Url=Image_Url
                             FROM   @ImgTable
                         END
                     Exec Sp_Xml_Removedocument @idoc1
                END

          SET @RetTransSno = @TransSno
          SET @RetTrans_No = @Trans_No       
        COMMIT TRANSACTION
        RETURN @TransSno
        CloseNow:
         ROLLBACK TRANSACTION
         RETURN 0
        END
   GO
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='VW_TRANSACTIONS') BEGIN DROP VIEW VW_TRANSACTIONS END
GO
CREATE VIEW VW_TRANSACTIONS
AS
	SELECT		Trans.TransSno,Trans.Trans_No,Trans.Trans_Date,Trans.Ref_No,
				    Trans.SeriesSno,Ser.Series_Name,
            Acc.AccountSno, Acc.Account_No, Acc.Account_Date,
				    Acc.PartySno,Pty.Party_Name,Pty.Address, Pty.City, Pty.Mobile, Pty.IntLastUpdate,Pty.Roi,Pty.Party_Type,
				    Trans.BorrowerSno,Bwr.Party_Name as Borrower_Name, Bwr.Address as Borrower_Address, Bwr.City as Borrower_City, Bwr.Mobile as Borrower_Mobile,
            Trans.BankSno,Bnk.Bank_Name,
            Trans.BankBranchSno,Br.Branch_Name,				
				    Trans.Loan_Type,Trans.DrAmount,Trans.CrAmount,Trans.PrincipalAmount, Trans.IntAmount,Trans.Other_Charges,Trans.Remarks,

            GrossDrWeight = (SELECT ISNULL(SUM(GrossWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 1),
            GrossCrWeight = (SELECT ISNULL(SUM(GrossWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 2),

            DrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 1),
            CrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 2),

            DrWeight916 = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 1) AND (Purity >= 91.6)),
            CrWeight916 = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 2) AND (Purity >= 91.6)),

            GrossDrWeight916 = (SELECT ISNULL(SUM(GrossWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 1) AND (Purity >= 91.6)),
            GrossCrWeight916 = (SELECT ISNULL(SUM(GrossWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 2) AND (Purity >= 91.6)),
            
            Non916DrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 1) AND (Purity < 91.6)),
            Non916CrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 2) AND (Purity < 91.6)),

            GrossNon916DrWeight = (SELECT ISNULL(SUM(GrossWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 1) AND (Purity < 91.6)),
            GrossNon916CrWeight = (SELECT ISNULL(SUM(GrossWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 2) AND (Purity < 91.6)),

            PureDrWeight = (SELECT ISNULL(SUM(PureWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 1),
            PureCrWeight = (SELECT ISNULL(SUM(PureWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 2),

            ImgCount  = (SELECT ISNULL(COUNT(DetSno),0) FROM Image_Details WHERE TransSno = Trans.TransSno),
            Account_Status = CASE WHEN EXISTS (SELECT TransSno FROM Transactions WHERE SeriesSno=9 AND AccountSno=Trans.AccountSno) THEN 1 ELSE 0 END,
            Acc.CompSno, Comp.Comp_Code, Comp.Comp_Name
            /*DrWeight = CASE Trans.SeriesSno WHEN 1 THEN ISNULL(SUM(Td.NettWt),0) ELSE 0 END,
				    CrWeight = CASE Trans.SeriesSno WHEN 2 THEN ISNULL(SUM(Td.NettWt),0) ELSE 0 END,

            DrWeight916 = CASE Trans.SeriesSno WHEN 1 THEN ISNULL(SUM(CASE WHEN Td.Purity >= 91.6 THEN Td.NettWt ELSE 0 END),0) ELSE 0 END,
				    CrWeight916 = CASE Trans.SeriesSno WHEN 2 THEN ISNULL(SUM(CASE WHEN Td.Purity >= 91.6 THEN Td.NettWt ELSE 0 END),0) ELSE 0 END,

            Non916DrWeight = CASE Trans.SeriesSno WHEN 1 THEN ISNULL(SUM(CASE WHEN Td.Purity < 91.6 THEN Td.NettWt ELSE 0 END),0) ELSE 0 END,
				    Non916CrWeight = CASE Trans.SeriesSno WHEN 2 THEN ISNULL(SUM(CASE WHEN Td.Purity < 91.6 THEN Td.NettWt ELSE 0 END),0) ELSE 0 END,

            PureDrWeight = CASE Trans.SeriesSno WHEN 1 THEN ISNULL(SUM(Td.PureWt),0) ELSE 0 END,
				    PureCrWeight = CASE Trans.SeriesSno WHEN 2 THEN ISNULL(SUM(Td.PureWt),0) ELSE 0 END*/

	FROM		  Transactions Trans
				    INNER JOIN Voucher_Series Ser ON Ser.SeriesSno = Trans.SeriesSno
            INNER JOIN Accounts Acc ON Acc.AccountSno = Trans.AccountSno
				    INNER JOIN Party Pty ON Pty.PartySno = Acc.PartySno
				    LEFT OUTER JOIN Party Bwr ON Bwr.PartySno = Trans.BorrowerSno
            LEFT OUTER JOIN Banks Bnk ON Bnk.BankSno=Trans.BankSno
				    LEFT OUTER JOIN Bank_Branches Br ON Br.BranchSno = Trans.BankBranchSno												    
            INNER JOIN Companies Comp ON Comp.CompSno = Acc.CompSno

	GROUP BY	Trans.TransSno,Trans.Trans_No,Trans.Trans_Date,Trans.Ref_No,
				    Trans.SeriesSno,Ser.Series_Name,
            Acc.AccountSno, Acc.Account_No, Acc.Account_Date,Trans.AccountSno,
				    Acc.PartySno,Pty.Party_Name,Pty.Address, Pty.City, Pty.Mobile,Pty.IntLastUpdate,Pty.Roi,Pty.Party_Type,
				    Trans.BorrowerSno,Bwr.Party_Name, Bwr.Address, Bwr.City, Bwr.Mobile,
				    Trans.BankSno,Bnk.Bank_Name,Trans.BankBranchSno,Br.Branch_Name,
				    Trans.Loan_Type,Trans.DrAmount,Trans.CrAmount,Trans.PrincipalAmount, Trans.IntAmount,Trans.Other_Charges,Trans.Remarks,
            Acc.CompSno, Comp.Comp_Code, Comp.Comp_Name
        
  GO

  
IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='VW_STATEMENT') BEGIN DROP VIEW VW_STATEMENT END
GO
CREATE VIEW VW_STATEMENT AS
					SELECT    ROW_NUMBER() OVER (ORDER BY Trans.Trans_Date) as RowNo, Trans.AccountSno, Acc.PartySno, Trans.TransSno,Trans.Trans_Date,Trans.SeriesSno, Ser.Series_Name + ' (' + Trans.Trans_No + ')' as Particulars,Bnk.Bank_Name,
                    Brh.Branch_Name, 
								    CAST(ISNULL(Trans.CrAmount,0) AS DECIMAL) as CrAmount, CONVERT(INT, ISNULL(Trans.DrAmount,0)) DrAmount, Trans.PrincipalAmount, Trans.IntAmount,Trans.Remarks,Trans.IntAccured, 
								    /*CrWeight = CASE Trans.SeriesSno WHEN 1 THEN ISNULL(SUM(Td.NettWt),0) ELSE 0 END,
								    DrWeight = CASE Trans.SeriesSno WHEN 2 THEN ISNULL(SUM(Td.NettWt),0) ELSE 0 END,
                    ImgCount = COUNT(Id.DetSno),*/
                    
                    GrossDrWeight = (SELECT ISNULL(SUM(GrossWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 1),
                    GrossCrWeight = (SELECT ISNULL(SUM(GrossWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 2),

                    DrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 1),
                    CrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 2),

                    DrWeight916 = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 1) AND (Purity >= 91.6)),
                    CrWeight916 = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 2) AND (Purity >= 91.6)),

                    Non916DrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 1) AND (Purity < 91.6)),
                    Non916CrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 2) AND (Purity < 91.6)),

                    PureDrWeight = (SELECT ISNULL(SUM(PureWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 1),
                    PureCrWeight = (SELECT ISNULL(SUM(PureWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 2),

                    ImgCount  = (SELECT ISNULL(COUNT(DetSno),0) FROM Image_Details WHERE TransSno = Trans.TransSno),
                    Account_Status = CASE WHEN EXISTS (SELECT TransSno FROM Transactions WHERE SeriesSno=9 AND AccountSno=Trans.AccountSno) THEN 1 ELSE 0 END

          FROM      Transactions Trans
                    INNER JOIN Voucher_Series Ser ON Ser.SeriesSno = Trans.SeriesSno
                    INNER JOIN Accounts Acc ON Acc.AccountSno = Trans.AccountSno
                    LEFT OUTER JOIN Party Bwr ON Bwr.PartySno = Trans.BorrowerSno                              
                    LEFT OUTER JOIN Banks Bnk ON Bnk.BankSno = Trans.BankSno
                    LEFT OUTER JOIN Bank_Branches Brh ON Brh.BranchSno = Trans.BankBranchSno
                    
           WHERE    Trans.SeriesSno IN (1,2,5,7) 

          GROUP BY  Trans.AccountSno, Acc.PartySno, Trans.TransSno,Trans.Trans_Date,Trans.SeriesSno,Ser.Series_Name,Trans.Trans_No,Bnk.Bank_Name, Brh.Branch_Name, Trans.CrAmount, Trans.DrAmount, Trans.PrincipalAmount, Trans.IntAmount,Trans.Remarks, Trans.IntAccured

    GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='IntToDate') BEGIN DROP FUNCTION IntToDate END
GO
CREATE FUNCTION IntToDate(@IntDate INT)
RETURNS DATE
AS
BEGIN	
	RETURN  CAST (SUBSTRING(CAST(@IntDate AS VARCHAR),1,4)  + '-' + SUBSTRING(CAST(@IntDate AS VARCHAR),5,2) + '-' +  SUBSTRING(CAST(@IntDate AS VARCHAR),7,2) AS DATE)
END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='DateToInt') BEGIN DROP FUNCTION DateToInt END
GO
CREATE FUNCTION DateToInt(@DateInt DATE)
RETURNS INT
AS
BEGIN	
	RETURN  CAST(

            CAST(YEAR(@DateInt) AS VARCHAR) +
            CASE WHEN LEN(CAST(MONTH(@DateInt) AS VARCHAR)) = 1 THEN '0' + CAST(MONTH(@DateInt) AS VARCHAR) ELSE CAST(MONTH(@DateInt) AS VARCHAR) END  +
            CASE WHEN LEN(CAST(DAY(@DateInt) AS VARCHAR)) = 1 THEN '0' + CAST(DAY(@DateInt) AS VARCHAR) ELSE CAST(DAY(@DateInt) AS VARCHAR) END
          AS INT)
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='GetNewDebitInterest') BEGIN DROP FUNCTION GetNewDebitInterest END
GO
CREATE FUNCTION [dbo].GetNewDebitInterest(@AccountSno INT, @FromDate DATE, @ToDate DATE,@Roi FLOAT)
RETURNS MONEY
AS
BEGIN
DECLARE @IntAccured MONEY 

SELECT				@IntAccured = ISNULL(SUM(IntAccured),0)
						FROM 
											(
												SELECT		CASE WHEN @FromDate < [dbo].IntToDate(Trans_Date) THEN [dbo].IntToDate(Trans_Date) ELSE @FromDate END IntLastUpdate,DrAmount,@Roi as Roi,
															IntDays = DATEDIFF(DAY,CASE WHEN @FromDate < [dbo].IntToDate(Trans_Date) THEN [dbo].IntToDate(Trans_Date) ELSE @FromDate END,@ToDate),
															PerDayInterest = (@Roi/100)*DrAmount /360,
															IntAccured = CASE WHEN (DATEDIFF(DAY,CASE WHEN @FromDate < [dbo].IntToDate(Trans_Date) THEN [dbo].IntToDate(Trans_Date) ELSE @FromDate END,@ToDate)) < 28 THEN
															(DATEDIFF(DAY,CASE WHEN @FromDate < [dbo].IntToDate(Trans_Date) THEN [dbo].IntToDate(Trans_Date) ELSE @FromDate END,@ToDate)) * ((@Roi/100)*DrAmount /360) 
															ELSE
																((@Roi/100)*DrAmount/12) 
															END
												FROM		VW_TRANSACTIONS 
												WHERE		(AccountSno = @AccountSno) AND (SeriesSno = 1) AND ([dbo].IntToDate(Trans_Date) BETWEEN @FromDate AND DATEADD(DAY,-1,@ToDate))
											) as DebitInterest						

						RETURN @IntAccured
END
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='GetNewCreditInterest') BEGIN DROP FUNCTION GetNewCreditInterest END
GO
CREATE FUNCTION [dbo].GetNewCreditInterest(@AccountSno INT, @FromDate DATE, @ToDate DATE,@Roi FLOAT)
RETURNS MONEY
AS
BEGIN
DECLARE @IntAccured MONEY 

SELECT				@IntAccured = ISNULL(SUM(IntAccured),0)
						FROM 
											(
												SELECT		CASE WHEN @FromDate < [dbo].IntToDate(Trans_Date) THEN [dbo].IntToDate(Trans_Date) ELSE @FromDate END IntLastUpdate,CrAmount,@Roi as Roi,

																IntDays = DATEDIFF(DAY,CASE WHEN @FromDate < [dbo].IntToDate(Trans_Date) THEN [dbo].IntToDate(Trans_Date) ELSE @FromDate END,@ToDate),

																PerDayInterest = (@Roi/100)*CrAmount /360,

																IntAccured = CASE WHEN (DATEDIFF(DAY,CASE WHEN @FromDate < [dbo].IntToDate(Trans_Date) THEN [dbo].IntToDate(Trans_Date) ELSE @FromDate END,@ToDate)) < 28 THEN
																(DATEDIFF(DAY,CASE WHEN @FromDate < [dbo].IntToDate(Trans_Date) THEN [dbo].IntToDate(Trans_Date) ELSE @FromDate END,@ToDate)) * ((@Roi/100)* (CrAmount-IntAmount) /360)
																ELSE
																	((@Roi/100)*(CrAmount-IntAmount) /12)
																END
												FROM		VW_TRANSACTIONS
												WHERE		(AccountSno = @AccountSno) AND (SeriesSno = 2) AND ([dbo].IntToDate(Trans_Date) BETWEEN @FromDate AND DATEADD(DAY,-1,@ToDate))
											) AS CreditInterest

						RETURN @IntAccured
END

--SELECT [dbo].GetNewCreditInterest(2, '2023/05/31', DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0),24)
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='GetInterestPaid') BEGIN DROP FUNCTION GetInterestPaid END
GO
CREATE FUNCTION [dbo].GetInterestPaid(@AccountSno INT, @FromDate DATE, @ToDate DATE)
RETURNS MONEY
AS
BEGIN
DECLARE @IntPaid MONEY

	SELECT	@IntPaid = ISNULL(SUM(IntAmount),0)
	FROM	VW_TRANSACTIONS
	WHERE	(AccountSno=@AccountSno) AND (SeriesSno = 2) AND ([dbo].IntToDate(Trans_Date) BETWEEN @FromDate AND DATEADD(DAY,-1,@ToDate))
	RETURN @IntPaid					

END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='GetDateDiff') BEGIN DROP FUNCTION GetDateDiff END
GO
CREATE FUNCTION [dbo].GetDateDiff(@FromDate DATE, @ToDate DATE)
RETURNS VARCHAR(MAX)
AS
BEGIN

	RETURN CAST ( CASE WHEN DATEDIFF(MONTH,@FromDate,DATEADD(MONTH, DATEDIFF(MONTH, 0, @ToDate), 0) ) = 0 THEN 0 ELSE DATEDIFF(MONTH,@FromDate,DATEADD(MONTH, DATEDIFF(MONTH, 0, @ToDate), 0) ) -1 END as VARCHAR)+ ' Months ' + CAST( CASE WHEN (DATEDIFF(MONTH,@FromDate,DATEADD(MONTH, DATEDIFF(MONTH, 0, @ToDate), 0) )) = 0 THEN (DATEDIFF(DAY,@FromDate,@ToDate))  ELSE (DATEDIFF(DAY, DATEADD(MONTH, DATEDIFF(MONTH, 0, @ToDate), 0), @ToDate)) END as VARCHAR) + ' Days'

END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='VW_REPLEDGE') BEGIN DROP VIEW VW_REPLEDGE END
GO
CREATE VIEW VW_REPLEDGE 
AS
SELECT		Trans.TransSno,Trans.Trans_No, Trans.Trans_Date,Trans.Ref_No,
          Trans.SeriesSno,Ser.Series_Name,
          Acc.AccountSno, Acc.Account_No,
			    Acc.PartySno, Pty.Party_Name,
          Bwr.PartySno  as BorrowerSno,
			    Bwr.Party_Name as Borrower_Name,
			    Trans.BankSno, Bnk.Bank_Name,
			    Trans.BankBranchSno, Brch.Branch_Name,
			    Trans.Roi, Trans.Tenure,CAST(Trans.DrAmount AS INT) as DrAmount, CAST(Trans.CrAmount as INT) as CrAmount, Trans.IntAmount, Trans.Other_Charges,
          Trans.RefSno,
			    ISNULL(Ref.Trans_No,'') as RefTrans_No, 
			    Trans.Remarks,
			    Trans.Loan_Type,
        /*
          DrWeight = CASE Trans.SeriesSno WHEN 3 THEN ISNULL(SUM(Td.NettWt),0) ELSE 0 END,
				  CrWeight = CASE Trans.SeriesSno WHEN 6 THEN ISNULL(SUM(Td.NettWt),0) ELSE 0 END,
          */

          GrossDrWeight = (SELECT ISNULL(SUM(GrossWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 1),
          GrossCrWeight = (SELECT ISNULL(SUM(GrossWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 2),

          DrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 3),
          CrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 6),

          DrWeight916 = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 3) AND (Purity >= 91.6)),
          CrWeight916 = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 6) AND (Purity >= 91.6)),

          Non916DrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 3) AND (Purity < 91.6)),
          Non916CrWeight = (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE (TransSno = Trans.TransSno) AND (Trans.SeriesSno = 6) AND (Purity < 91.6)),

          PureDrWeight = (SELECT ISNULL(SUM(PureWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 3),
          PureCrWeight = (SELECT ISNULL(SUM(PureWt),0) FROM Transaction_Details WHERE TransSno = Trans.TransSno AND Trans.SeriesSno = 6),

          ImgCount  = (SELECT ISNULL(COUNT(DetSno),0) FROM Image_Details WHERE TransSno = Trans.TransSno),
    
          Duration = [dbo].GetDateDiff([dbo].IntToDate(Trans.Trans_Date), GETDATE()),
          RpStatus = CASE WHEN (Trans.SeriesSno=6 OR Trans.SeriesSno=8) THEN 0 ELSE
                                                        CASE WHEN EXISTS (
                                                                          SELECT TransSno FROM Transactions WHERE SeriesSno=6 AND RefSno=Trans.TransSno
                                                                        )
                                                                          THEN 2
                                                                        ELSE
                                                                          (
                                                                            CASE WHEN GETDATE() >= DATEADD(MONTH,CAST(Trans.Tenure AS INT),[dbo].IntToDate(Trans.Trans_Date))
                                                                              THEN 3
                                                                              ELSE 1
                                                                              END
                                                                            )
                                                                        END -- 1-Open Status, 2-Closed Status, 3-OverDuue
                                                        END,
          TransferPending = Trans.CrAmount - (SELECT ISNULL(SUM(DrAmount),0) FROM Transactions WHERE SeriesSno = 4 AND BorrowerSno=Trans.BorrowerSno AND RefSno=Trans.TransSno),
          Mature_Date = DATEADD(MONTH,Trans.Tenure,[dbo].IntToDate(Trans.Trans_Date)),
          Balance = Trans.CrAmount - ISNULL((SELECT SUM(DrAmount) FROM TRANSACTIONS WHERE (RefSno=Trans.TransSno) AND (SeriesSno IN (6,8))),0)
          --ImgCount = COUNT(Id.DetSno)

FROM	    Transactions Trans
			    INNER JOIN Voucher_Series Ser ON Ser.SeriesSno = Trans.SeriesSno
          INNER JOIN Accounts Acc ON Acc.AccountSno = Trans.AccountSno
			    INNER JOIN Party Pty ON Pty.PartySno = Acc.PartySno
			    INNER JOIN Party Bwr ON Bwr.PartySno = Trans.BorrowerSno
			    INNER JOIN Banks Bnk ON Bnk.BankSno = Trans.BankSno
			    LEFT OUTER JOIN Bank_Branches Brch ON Brch.BranchSno = Trans.BankBranchSno
			    LEFT OUTER JOIN Transactions Ref ON Ref.TransSno = Trans.RefSno          

WHERE		  Trans.SeriesSno IN (3,4,6,8)

GROUP BY  Trans.TransSno,Trans.Trans_No, Trans.Trans_Date,Trans.Ref_No,Trans.SeriesSno,Trans.BorrowerSno,Ser.Series_Name,Acc.AccountSno, Acc.Account_No,Acc.PartySno, Pty.Party_Name,Bwr.PartySno,Bwr.Party_Name,Trans.BankSno, Bnk.Bank_Name,Trans.BankBranchSno, Brch.Branch_Name,
			    Trans.Roi,Trans.Tenure, Trans.DrAmount, Trans.CrAmount, Trans.IntAmount, Trans.Other_Charges,Trans.RefSno,Ref.Trans_No,Trans.Remarks,Trans.Loan_Type
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='VW_PARTY_RP_CONSOLIDATED') BEGIN DROP VIEW VW_PARTY_RP_CONSOLIDATED END
GO
CREATE VIEW VW_PARTY_RP_CONSOLIDATED
AS
SELECT    Rp.PartySno,Rp.Party_Name, (SELECT ISNULL(COUNT(TransSno),0) FROM VW_REPLEDGE WHERE PartySno=Rp.PartySno  AND SeriesSno = 3 AND RpStatus <> 2) as PendingRp,
                              (SELECT ISNULL(SUM(CrAmount),0) FROM VW_REPLEDGE WHERE PartySno=Rp.PartySno    AND SeriesSno = 3 AND RpStatus <> 2) as PendingRpAmount,
                              (SELECT ISNULL(COUNT(TransSno),0) FROM VW_REPLEDGE WHERE PartySno=Rp.PartySno  AND SeriesSno = 3 AND RpStatus <> 2 AND TransferPending > 0) as PendingTransfers,
                              (SELECT ISNULL(SUM(CrAmount),0) FROM VW_REPLEDGE WHERE PartySno=Rp.PartySno    AND SeriesSno = 3 AND RpStatus <> 2 AND TransferPending > 0) as PendingTransferAmt,

                              (SELECT ISNULL(SUM(DrWeight),0) - ISNULL(SUM(CrWeight),0) FROM  VW_TRANSACTIONS WHERE PartySno=Rp.PartySno AND SeriesSno IN (1,2)) as TotalWeight,
                              
                              (SELECT ISNULL(SUM(DrWeight),0) FROM VW_REPLEDGE WHERE PartySno=Rp.PartySno    AND SeriesSno = 3 AND RpStatus <> 2) as TotalRpWeight,
                              (SELECT CAST(ISNULL(SUM(DrAmount),0) AS INT) FROM VW_REPLEDGE WHERE PartySno=Rp.PartySno    AND SeriesSno = 8 AND RpStatus <> 2) as PrincipalPaid,
                              (SELECT CAST(ISNULL(SUM(IntAmount),0) AS INT) FROM VW_REPLEDGE WHERE PartySno=Rp.PartySno   AND SeriesSno = 8 AND RpStatus <> 2) as InterestPaid

FROM      Party Rp
                    
WHERE Party_Type = 1

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='VW_BANK_RP_CONSOLIDATED') BEGIN DROP VIEW VW_BANK_RP_CONSOLIDATED END
GO
CREATE VIEW VW_BANK_RP_CONSOLIDATED
AS 
SELECT    Bnk.BankSno,Bnk.Bank_Name, 
								(SELECT ISNULL(COUNT(TransSno),0) FROM VW_REPLEDGE WHERE BankSno=Bnk.BankSno  AND SeriesSno = 3 AND RpStatus <> 2) as PendingRp,
								(SELECT ISNULL(SUM(CrAmount),0) FROM VW_REPLEDGE WHERE BankSno=Bnk.BankSno    AND SeriesSno = 3 AND RpStatus <> 2) as PendingRpAmount,								

								(SELECT ISNULL(SUM(DrWeight),0) - ISNULL(SUM(CrWeight),0) FROM  VW_TRANSACTIONS WHERE BankSno=Bnk.BankSno AND SeriesSno IN (1,2)) as TotalWeight,
                              
								(SELECT ISNULL(SUM(DrWeight),0) FROM VW_REPLEDGE WHERE BankSno=Bnk.BankSno    AND SeriesSno = 3 AND RpStatus <> 2) as TotalRpWeight,
								(SELECT CAST(ISNULL(SUM(DrAmount),0) AS INT) FROM VW_REPLEDGE WHERE BankSno=Bnk.BankSno    AND SeriesSno = 8 AND RpStatus <> 2) as PrincipalPaid,
								(SELECT CAST(ISNULL(SUM(IntAmount),0) AS INT) FROM VW_REPLEDGE WHERE BankSno=Bnk.BankSno   AND SeriesSno = 8 AND RpStatus <> 2) as InterestPaid
FROM      Banks Bnk

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='VW_CUSTOMER_ANALYSIS') BEGIN DROP VIEW VW_CUSTOMER_ANALYSIS END
GO
CREATE VIEW VW_CUSTOMER_ANALYSIS
AS
SELECT		Pty.PartySno, Pty.Party_Name, 
			Wt916         = (SELECT ISNULL(SUM(DrWeight),0) - ISNULL(SUM(CrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.Account_Status=0) AND (Tr.PartySno = Pty.PartySno) AND (Tr.SeriesSno IN (1,2))),
			Non916Wt      = (SELECT ISNULL(SUM(Non916DrWeight),0) - ISNULL(SUM(Non916CrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.Account_Status=0) AND (Tr.PartySno = Pty.PartySno) AND (Tr.SeriesSno IN (1,2))),
			PureWt        = (SELECT ISNULL(SUM(PureDrWeight),0) - ISNULL(SUM(PureCrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.Account_Status=0) AND (Tr.PartySno = Pty.PartySno) AND (Tr.SeriesSno IN (1,2))),
			Sale_Value    = CAST( (SELECT Pure_Rate FROM Gold_Rates WHERE RateSno= (SELECT MAX(RateSno) FROM Gold_Rates)) 
													*
													(SELECT ISNULL(SUM(PureDrWeight),0) - ISNULL(SUM(PureCrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.Account_Status=0) AND (Tr.PartySno = Pty.PartySno) AND (Tr.SeriesSno IN (1,2))) AS INT),

			Release_Value = CAST((SELECT ISNULL(SUM(DrAmount),0) - ISNULL(SUM(CrAmount),0)  FROM  VW_TRANSACTIONS WHERE (Account_Status=0) AND SeriesSno IN (1,2,5,7) AND PartySno =Pty.PartySno) AS INT),
			Difference    = CAST(((SELECT Pure_Rate FROM Gold_Rates WHERE RateSno= (SELECT MAX(RateSno) FROM Gold_Rates)) 
													*
													(SELECT ISNULL(SUM(PureDrWeight),0) - ISNULL(SUM(PureCrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.Account_Status=0) AND (Tr.PartySno = Pty.PartySno) AND (Tr.SeriesSno IN (1,2))))
													-
													(SELECT ISNULL(SUM(DrAmount),0) - ISNULL(SUM(CrAmount),0)  FROM  VW_TRANSACTIONS WHERE (Account_Status=0) AND SeriesSno IN (1,2,5,7) AND PartySno =Pty.PartySno) AS INT),
                          
			IntPostDate   = (SELECT ISNULL(MAX(Trans_Date),0) FROM VW_TRANSACTIONS WHERE (Account_Status=0) AND PartySno=Pty.PartySno),
			RpGrams     = (SELECT ISNULL(SUM(DrWeight),0) FROM VW_REPLEDGE WHERE (PartySno = Pty.PartySno) AND (SeriesSno = 3) AND (RpStatus <> 2)),
			RpValue     = CAST((SELECT ISNULL(SUM(CrAmount),0) FROM VW_REPLEDGE WHERE (PartySno=Pty.PartySno) AND (SeriesSno=3) AND RpStatus <> 2) AS INT),
			NonRpGrams    = ((SELECT ISNULL(SUM(DrWeight),0) - ISNULL(SUM(CrWeight),0) FROM VW_TRANSACTIONS Tr WHERE  (Tr.Account_Status=0) AND (Tr.PartySno = Pty.PartySno) AND (Tr.SeriesSno IN (1,2)))
						+ 
						(SELECT ISNULL(SUM(Non916DrWeight),0) - ISNULL(SUM(Non916CrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.Account_Status=0) AND (Tr.PartySno = Pty.PartySno) AND (Tr.SeriesSno IN (1,2))))
						-
						(
						(SELECT ISNULL(SUM(DrWeight),0) FROM VW_REPLEDGE WHERE (PartySno = Pty.PartySno) AND (SeriesSno = 3) AND (RpStatus <> 2))
						)

FROM		Party Pty
        INNER JOIN Accounts Acc ON Acc.PartySno=Pty.PartySno 
			  LEFT OUTER JOIN VW_TRANSACTIONS CustTrans ON CustTrans.PartySno = Pty.PartySno AND  (CustTrans.Account_Status=0) AND CustTrans.SeriesSno IN (1,2) 
			  LEFT OUTER JOIN Transaction_Details Td ON Td.TransSno = CustTrans.TransSno
			  LEFT OUTER JOIN VW_TRANSACTIONS RpTrans ON CustTrans.PartySno = Pty.PartySno AND RpTrans.SeriesSno = 3
			  LEFT OUTER JOIN Transaction_Details RTd ON RTd.TransSno = RPTrans.TransSno

WHERE		Pty.Party_Type = 1

GROUP BY	Pty.PartySno, Pty.Party_Name

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='VW_ACCOUNT_ANALYSIS') BEGIN DROP VIEW VW_ACCOUNT_ANALYSIS END
GO
CREATE VIEW VW_ACCOUNT_ANALYSIS
AS
SELECT		    Acc.AccountSno, Acc.Account_No, Acc.PartySno, Acc.CompSno, Comp.Comp_Code, Comp.Comp_Name,
			        Wt916     = (SELECT ISNULL(SUM(DrWeight),0) - ISNULL(SUM(CrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.AccountSno = Acc.AccountSno) AND (Tr.SeriesSno IN (1,2))),
			        Non916Wt    = (SELECT ISNULL(SUM(Non916DrWeight),0) - ISNULL(SUM(Non916CrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.AccountSno = Acc.AccountSno) AND (Tr.SeriesSno IN (1,2))),
			        PureWt      = (SELECT ISNULL(SUM(PureDrWeight),0) - ISNULL(SUM(PureCrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.AccountSno = Acc.AccountSno) AND (Tr.SeriesSno IN (1,2))),
			        Sale_Value    = CAST( (SELECT Pure_Rate FROM Gold_Rates WHERE RateSno= (SELECT MAX(RateSno) FROM Gold_Rates)) 
													        *
													        (SELECT ISNULL(SUM(PureDrWeight),0) - ISNULL(SUM(PureCrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.AccountSno = Acc.AccountSno) AND (Tr.SeriesSno IN (1,2))) AS INT),

			        Release_Value = CAST((SELECT ISNULL(SUM(DrAmount),0) - ISNULL(SUM(CrAmount),0)  FROM  VW_TRANSACTIONS WHERE SeriesSno IN (1,2,5,7) AND AccountSno =Acc.AccountSno) AS INT),
			        Difference    = CAST(((SELECT Pure_Rate FROM Gold_Rates WHERE RateSno= (SELECT MAX(RateSno) FROM Gold_Rates)) 
													        *
													        (SELECT ISNULL(SUM(PureDrWeight),0) - ISNULL(SUM(PureCrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.AccountSno = Acc.AccountSno) AND (Tr.SeriesSno IN (1,2))))
													        -
													        (SELECT ISNULL(SUM(DrAmount),0) - ISNULL(SUM(CrAmount),0)  FROM  VW_TRANSACTIONS WHERE SeriesSno IN (1,2,5,7) AND AccountSno =Acc.AccountSno) AS INT),
                          
			        IntPostDate   = (SELECT ISNULL(MAX(Trans_Date),0) FROM VW_TRANSACTIONS WHERE AccountSno=Acc.AccountSno),
			        RpGrams     = (SELECT ISNULL(SUM(DrWeight),0) FROM VW_REPLEDGE WHERE (AccountSno = Acc.AccountSno) AND (SeriesSno = 3) AND (RpStatus <> 2)),
			        RpValue     = CAST((SELECT ISNULL(SUM(CrAmount),0) FROM VW_REPLEDGE WHERE (AccountSno=Acc.AccountSno) AND (SeriesSno=3) AND RpStatus <> 2) AS INT),
			        NonRpGrams    = ((SELECT ISNULL(SUM(DrWeight),0) - ISNULL(SUM(CrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.AccountSno = Acc.AccountSno) AND (Tr.SeriesSno IN (1,2)))
						        + 
						        (SELECT ISNULL(SUM(Non916DrWeight),0) - ISNULL(SUM(Non916CrWeight),0) FROM VW_TRANSACTIONS Tr WHERE (Tr.AccountSno = Acc.AccountSno) AND (Tr.SeriesSno IN (1,2))))
						        -
						        (
						        (SELECT ISNULL(SUM(DrWeight),0) FROM VW_REPLEDGE WHERE (AccountSno = Acc.AccountSno) AND (SeriesSno = 3) AND (RpStatus <> 2))
						        ),
              Account_Status = CASE WHEN EXISTS(SELECT TransSno FROM Transactions WHERE AccountSno=Acc.AccountSno AND SeriesSno=9) THEN 1 ELSE 0 END

FROM		    Accounts Acc            
			      LEFT OUTER JOIN VW_TRANSACTIONS AccTrans ON AccTrans.AccountSno = Acc.AccountSno AND AccTrans.SeriesSno IN (1,2)
			      LEFT OUTER JOIN Transaction_Details Td ON Td.TransSno = AccTrans.TransSno
			      LEFT OUTER JOIN VW_TRANSACTIONS RpTrans ON AccTrans.AccountSno = Acc.AccountSno AND RpTrans.SeriesSno = 3
			      LEFT OUTER JOIN Transaction_Details RTd ON RTd.TransSno = RPTrans.TransSno
            INNER JOIN Companies Comp ON Comp.CompSno = Acc.CompSno
                       
GROUP BY	Acc.AccountSno, Acc.Account_No, Acc.PartySno, Acc.CompSno, Comp.Comp_Code, Comp.Comp_Name

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='VW_BORROWER_ANALYSIS') BEGIN DROP VIEW VW_BORROWER_ANALYSIS END
GO
CREATE VIEW VW_BORROWER_ANALYSIS
AS
SELECT		Pty.PartySno, Pty.Party_Name,  
			      RpGrams				    = (SELECT ISNULL(SUM(DrWeight),0) FROM VW_REPLEDGE WHERE (BorrowerSno = Pty.PartySno) AND (SeriesSno = 3) AND (RpStatus <> 2)),
            RpValue				    = CAST((SELECT ISNULL(SUM(CrAmount),0) FROM VW_REPLEDGE WHERE (BorrowerSno=Pty.PartySno) AND (SeriesSno=3) AND RpStatus <> 2) AS INT),
			      Principal_Paid		= CAST((SELECT ISNULL(SUM(DrAmount),0) FROM VW_REPLEDGE WHERE (BorrowerSno=Pty.PartySno) AND (SeriesSno=8) AND RpStatus <> 2) AS INT),
			      Interest_Paid		  = CAST((SELECT ISNULL(SUM(IntAmount),0) FROM VW_REPLEDGE WHERE (BorrowerSno=Pty.PartySno) AND (SeriesSno=8) AND RpStatus <> 2) AS INT),
            Other_Charges     = CAST((SELECT ISNULL(SUM(Other_Charges),0) FROM VW_REPLEDGE WHERE (BorrowerSno=Pty.PartySno) AND (SeriesSno=8) AND RpStatus <> 2) AS INT)

FROM		Party Pty
WHERE		Pty.Party_Type = 2
GROUP BY  Pty.PartySno, Pty.Party_Name

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='Ssp_UpdateInterestForAll') BEGIN DROP PROCEDURE Ssp_UpdateInterestForAll END
GO
CREATE PROCEDURE Ssp_UpdateInterestForAll
AS
BEGIN
  DECLARE       
      @AccountSno   INT

  DECLARE Cursor_Account CURSOR
  FOR SELECT 
          AccountSno
      FROM 
          Accounts

  OPEN Cursor_Account

  FETCH NEXT FROM Cursor_Account INTO 
      @AccountSno

  WHILE @@FETCH_STATUS = 0
      BEGIN
          
          FETCH NEXT FROM Cursor_Account INTO 
              @AccountSno
              EXEC Ssp_Post_Interest @AccountSno,2,1
      END

  CLOSE Cursor_Party

  DEALLOCATE Cursor_Party
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='Sp_Messages') BEGIN DROP PROCEDURE Sp_Messages END
GO

CREATE PROCEDURE Sp_Messages
  @MsgSno        INT,
  @Msg_Date      DATETIME,
  @Msg_Cat       TINYINT, -- 1 - Normal Message, 2 - Group Message, 3- Braodcast Message
  @Msg_Type      TINYINT, -- 1 - Text Message, 2- Photo Message, 3 - Video Message, 4- Document
  @SenderSno     INT,
  @RecipientSno  INT,
  @Text_Content  VARCHAR(100),
  @File_Path     VARCHAR(200),
  @File_Desc     VARCHAR(50),
  @Msg_Status    TINYINT,
  @Del_Status    TINYINT,
  @RetSno         INT OUTPUT
WITH ENCRYPTION AS
BEGIN
  BEGIN TRANSACTION

  INSERT INTO Messages  (Msg_Date, Msg_Cat, Msg_Type, SenderSno, RecipientSno, Text_Content, File_Path, File_Desc, Msg_Status, Del_Status)
    VALUES                (@Msg_Date, @Msg_Cat, @Msg_Type, @SenderSno, @RecipientSno, @Text_Content, @File_Path, @File_Desc, @Msg_Status, @Del_Status)    
    IF @@ERROR <> 0 GOTO CloseNow

    SET @MsgSno =  @@IDENTITY

  COMMIT TRANSACTION
  SET @RetSno = @MsgSno
  RETURN @MsgSno
CloseNow:
  ROLLBACK TRANSACTION
  RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='Udf_getPartySummary') BEGIN DROP FUNCTION Udf_getPartySummary END
GO

CREATE FUNCTION Udf_getPartySummary(@PartySno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
  SELECT	VAcc.AccountSno, VAcc.Account_No, Acc.Account_Date, Acc.CompSno, VAcc.Comp_Code, VAcc.Comp_Name, Acc.Scheme, Acc.Remarks, Acc.PartySno, Pty.Party_Name,      
		  Age_In_Months = (SELECT Months FROM [dbo].SDateDiff((SELECT  [dbo].IntToDate(ISNULL(MIN(Trans_Date),[dbo].DateToInt (GETDATE()))) FROM VW_TRANSACTIONS WHERE AccountSno = VAcc.AccountSno),GETDATE())),		
		  Age_In_Days = (SELECT Days FROM [dbo].SDateDiff((SELECT  [dbo].IntToDate(ISNULL(MIN(Trans_Date),[dbo].DateToInt (GETDATE()))) FROM VW_TRANSACTIONS WHERE AccountSno = VAcc.AccountSno),GETDATE())),		
		
		  Ltd_In_Months = (SELECT Months FROM [dbo].SDateDiff((SELECT  [dbo].IntToDate(ISNULL(MAX(Trans_Date),[dbo].DateToInt (GETDATE()))) FROM VW_TRANSACTIONS WHERE AccountSno = VAcc.AccountSno),GETDATE())),		
		  Ltd_In_Days = (SELECT Days FROM [dbo].SDateDiff((SELECT  [dbo].IntToDate(ISNULL(MAX(Trans_Date),[dbo].DateToInt (GETDATE()))) FROM VW_TRANSACTIONS WHERE AccountSno = VAcc.AccountSno),GETDATE())),		

		  VAcc.Release_Value, VAcc.Sale_Value,

		  DiffPer = CASE  WHEN VAcc.Sale_Value =0
                      THEN 0
                ELSE
                      CASE WHEN VAcc.Sale_Value >= VAcc.Release_Value
                            THEN
                              CAST(( cast(VAcc.Release_Value as float)/ cast(VAcc.Sale_Value as float) )  * 100 AS DECIMAL(20,2))
                            ELSE
                                CAST(( cast(VAcc.Sale_Value as float)/ cast(VAcc.Release_Value as float) )  * 100 AS DECIMAL(20,2))
                                -
                                (CAST(( cast(VAcc.Sale_Value as float)/ cast(VAcc.Release_Value as float) )  * 100 AS DECIMAL(20,2))) *2
                      END

                END,

      Principal = (SELECT ISNULL(SUM(DrAmount),0)-ISNULL(SUM(CrAmount),0)  FROM VW_TRANSACTIONS WHERE AccountSno	= VAcc.AccountSno),
		  Pledge_Wt = (SELECT	ISNULL(SUM(GrossDrWeight),0)-ISNULL(SUM(GrossCrWeight),0)  FROM VW_TRANSACTIONS WHERE AccountSno	= VAcc.AccountSno),
		
		  GrossWt_916	= (SELECT	ISNULL(SUM(GrossDrWeight916),0)-ISNULL(SUM(GrossCrWeight916),0)  FROM VW_TRANSACTIONS WHERE AccountSno	= VAcc.AccountSno),
		  NettWt_916	= (SELECT	ISNULL(SUM(DrWeight916),0)-ISNULL(SUM(CrWeight916),0)  FROM VW_TRANSACTIONS WHERE AccountSno	= VAcc.AccountSno),
		
		  GrossWt_Non916	= (SELECT	ISNULL(SUM(GrossNon916DrWeight),0)-ISNULL(SUM(GrossNon916CrWeight),0)  FROM VW_TRANSACTIONS WHERE AccountSno	= VAcc.AccountSno),
		  NettWt_Non916	= (SELECT	ISNULL(SUM(Non916DrWeight),0)-ISNULL(SUM(Non916CrWeight),0)  FROM VW_TRANSACTIONS WHERE AccountSno	= VAcc.AccountSno),

		  Acc.Roi, VAcc.Account_Status,
      Int_Earned = CAST((SELECT SUM(IntAccured) FROM VW_STATEMENT WHERE AccountSno = VAcc.AccountSno) AS DECIMAL(20,2))
            
  FROM	VW_ACCOUNT_ANALYSIS VAcc
		    INNER JOIN Accounts Acc ON Acc.AccountSno = VAcc.AccountSno
        INNER JOIN Party Pty ON Pty.PartySno = Acc.PartySno
  WHERE	VAcc.PartySno = @PartySno
  

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='VW_MIS') BEGIN DROP VIEW VW_MIS END
GO

CREATE VIEW VW_MIS
WITH ENCRYPTION AS

SELECT			Trans_Date as TransDate, SeriesSno, Series_Name, CompSno, Comp_Name,
				SUM(DrAmount) + SUM(CrAmount) as TransAmount,
				SUM(PureDrWeight) + SUM(PureCrWeight) as TransWeight
			
FROM			VW_TRANSACTIONS

GROUP BY		Trans_Date, SeriesSno, Series_Name, CompSno, Comp_Name

HAVING	NOT		(SUM(DrAmount) + SUM(CrAmount) = 0) AND (SUM(PureDrWeight) + SUM(PureCrWeight) = 0)

GO



