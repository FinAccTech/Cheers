USE cheers2
go

ALTER PROCEDURE Ssp_Post_Interest
@AccountSno INT,
@PostMethod TINYINT,
@AsonType TINYINT

AS
BEGIN
  SET NOCOUNT ON
	DECLARE @IntLastUpdate DATE 
	DECLARE @IntAccured MONEY
	DECLARE @NewPrincipal MONEY 
	DECLARE @Roi FLOAT
  DECLARE @Scheme TINYINT

  DECLARE @FromDate DATE 
  DECLARE @ToDate DATE 
  DECLARE @DebitInt MONEY = 0
  DECLARE @CreditInt MONEY = 0
  DECLARE @IntPaid MONEY = 0
  DECLARE @RegularInt MONEY
  DECLARE @IntAccuredb4IntPaid MONEY
  DECLARE @Remarks VARCHAR(100)


  --CLEARING OLD POSTINGS
    DELETE FROM Transactions WHERE SeriesSno=7 AND AccountSno=@AccountSno
    UPDATE Accounts SET NewPrincipal=0, IntLastUpdate=(SELECT ISNULL([dbo].IntToDate(MIN(Trans_Date)),GETDATE()) FROM Transactions WHERE AccountSno=@AccountSno) WHERE AccountSno=@AccountSno

	  SELECT @NewPrincipal = ISNULL(NewPrincipal,0),@Roi = Roi,@Scheme=Scheme FROM Accounts WHERE AccountSno=@AccountSno

	IF EXISTS(SELECT TransSno FROM Transactions WHERE SeriesSno= 7 AND AccountSno=@AccountSno)
		BEGIN
			SELECT @IntLastUpdate = [dbo].IntToDate(MAX(Trans_Date)) FROM Transactions WHERE SeriesSno= 7 AND AccountSno=@AccountSno		
		END
	
	ELSE
		BEGIN
			--SELECT @IntLastUpdate = IntLastUpdate FROM Party WHERE PartySno=@PartySno
      SELECT @IntLastUpdate = [dbo].IntToDate(MIN( Trans_Date)) FROM Transactions WHERE AccountSno=@AccountSno
      IF @IntLastUpdate IS NULL
        BEGIN
          GOTO CloseNow
        END 
		END

    DECLARE @Ason DATE

    SET @AsOn = CASE @PostMethod
                        WHEN  1 THEN
                          CASE WHEN EXISTS(SELECT TransSno FROM Transactions WHERE AccountSno=@AccountSno)
                            THEN
                              (SELECT [dbo].IntToDate(MAX(Trans_Date)) FROM Transactions WHERE AccountSno=@AccountSno)
                            ELSE
                              GETDATE()
                          END
                        WHEN 2 THEN
                          GETDATE()                        
                END     
                
          
		

    WHILE @AsOn > @IntLastUpdate      
			BEGIN

			  IF MONTH(@AsOn) < MONTH(@IntLastUpdate)
          BEGIN
            IF YEAR(@AsOn) < YEAR(@IntLastUpdate) GOTO CloseNow            
          END

        
        IF (MONTH(@AsOn) = MONTH(@IntLastUpdate)) AND (YEAR(@AsOn) = YEAR(@IntLastUpdate)) GOTO FinalInt

          BEGIN
				    DECLARE @IpDate DATE = DATEADD(MONTH,1,@IntLastUpdate) 
				    SET @IpDate = CAST(CAST(YEAR(@IpDate) AS VARCHAR) + '/'+ (CAST(MONTH(@IpDate) AS VARCHAR)) + '/01' AS DATE)

				    SET @FromDate = @IntLastUpdate        
            SET @ToDate = @IpDate
          END

        --SELECT @FromDate,@todate
        		
				SET @RegularInt = ((@Roi /100)*@NewPrincipal/12) -- * (DATEDIFF(DAY,@FromDate,@ToDate)) --Interest for Opening Balance (New Principal)

        SET @DebitInt = [dbo].GetNewDebitInterest(@AccountSno,@FromDate,@ToDate,@Roi)
        SET @CreditInt  = [dbo].GetNewCreditInterest(@AccountSno,@FromDate,@ToDate,@Roi)
        SET @IntPaid = [dbo].GetInterestPaid(@AccountSno,@FromDate, @ToDate)

				SET @IntAccuredb4IntPaid = (@RegularInt	+	@DebitInt) -  (@CreditInt)
        SET @IntAccured = (@RegularInt	+	@DebitInt) -  (@CreditInt )
        SET @IntAccured = ABS(@IntAccured)

          
          --select @IntPaid, @IntAccuredb4IntPaid, @RegularInt, @DebitInt, @CreditInt, @ExcessInt, @IntAccured
        --SELECT @FromDate, @todate, [dbo].GetNewDebitInterest(@PartySno,@FromDate,@ToDate,@Roi), [dbo].GetNewCreditInterest(@PartySno,@FromDate,@ToDate,@Roi), [dbo].GetInterestPaid(@PartySno,@FromDate, @ToDate)

  			SET @NewPrincipal = (@NewPrincipal	+ (SELECT ISNULL(SUM(DrAmount),0) FROM Transactions WHERE (SeriesSno = 1) AND (AccountSno=@AccountSno) AND ([dbo].IntToDate(Trans_Date) BETWEEN @FromDate AND DATEADD(DAY,-1,@ToDate))))  
															- (SELECT ISNULL(SUM(CrAmount-IntAmount),0) FROM Transactions WHERE (SeriesSno = 2) AND (AccountSno=@AccountSno) AND ([dbo].IntToDate(Trans_Date) BETWEEN @FromDate AND DATEADD(DAY,-1,@ToDate))) 

            
            IF @Scheme=1 --SIMPLE INTEREST
              BEGIN
                UPDATE Accounts SET NewPrincipal = @NewPrincipal WHERE AccountSno=@AccountSno
                SET @Remarks = 'Interest Posted '+ CAST(@FromDate as VARCHAR) + ' to '+ CAST(@ToDate AS VARCHAR)

						    INSERT INTO Transactions  (Trans_No,Trans_Date,Ref_No,SeriesSno,AccountSno,BorrowerSno,BankSno,BankBranchSno,Loan_Type,Roi,DrAmount,CrAmount,IntAmount,Other_Charges,RefSno,Remarks,IntAccured)
							              VALUES        (Dbo.[GenerateVoucherNo](7),[dbo].DateToInt(@IpDate),'',7,@AccountSno,0,0,0,'',0,@IntAccured ,0,0,0,0,@Remarks,@IntAccuredb4IntPaid)

                             UPDATE Voucher_Series SET Current_No=Current_No+1 WHERE SeriesSno=7
              END
            ELSE IF @Scheme=2 --COMPOUND INTEREST
              BEGIN
                SET @NewPrincipal = @NewPrincipal + @IntAccured
                UPDATE Accounts SET NewPrincipal = @NewPrincipal + @IntAccured WHERE AccountSno=@AccountSno
                SET @Remarks  = 'Interest for'+ CAST(@FromDate as VARCHAR) + ' to '+ CAST(@ToDate AS VARCHAR) + ' - ' + CAST(@IntAccured AS VARCHAR) + ' compounded to Principal'

						    INSERT INTO Transactions  (Trans_No,Trans_Date,Ref_No,SeriesSno,AccountSno,BorrowerSno,BankSno,BankBranchSno,Loan_Type,Roi,DrAmount,CrAmount,IntAmount,Other_Charges,RefSno,Remarks,IntAccured)
							              VALUES        (Dbo.[GenerateVoucherNo](7),[dbo].DateToInt(@IpDate),'',7,@AccountSno,0,0,0,'',0,@IntAccured,0,0,0,0,@Remarks,@IntAccuredb4IntPaid)
              END

				SELECT @IntLastUpdate = [dbo].IntToDate(MAX(Trans_Date)) FROM Transactions WHERE SeriesSno= 7 AND AccountSno=@AccountSno
			END

      FinalInt:

      IF @PostMethod = 2      
        BEGIN
          --select @PostMethod
          SET @FromDate = CAST(CAST(YEAR(GETDATE()) AS VARCHAR) + '/'+ (CAST(MONTH(GETDATE()) AS VARCHAR)) + '/01' AS DATE)
          SET @ToDate = GETDATE()

          SET @RegularInt = CASE @AsonType
                                    WHEN 0
                                      THEN
                                         (((@Roi /100)*@NewPrincipal/12)/30) * (DATEDIFF(DAY,@FromDate,@ToDate))
                                    WHEN 1
                                      THEN
                                         ((((@Roi /100)*@NewPrincipal/12)/30) * 7) * ((DATEDIFF(DAY,@FromDate,@ToDate) / 7) + 1)
                            END

          SET @DebitInt = [dbo].GetNewDebitInterest(@AccountSno,@FromDate,@ToDate,@Roi)
          SET @CreditInt  = [dbo].GetNewCreditInterest(@AccountSno,@FromDate,@ToDate,@Roi)
          SET @IntPaid = [dbo].GetInterestPaid(@AccountSno,@FromDate, @ToDate)

        
          SET @IntAccuredb4IntPaid = (@RegularInt	+	@DebitInt) -  (@CreditInt)
          SET @IntAccured = (@RegularInt	+	@DebitInt) -  (@CreditInt)
          SET @IntAccured = ABS(@IntAccured)  

          SET @Remarks = 'Interest for ' + CAST(@FromDate AS varchar) + ' to ' + CAST(@ToDate AS varchar)

          INSERT INTO   Transactions  (Trans_No,Trans_Date,Ref_No,SeriesSno,AccountSno,BorrowerSno,BankSno,BankBranchSno,Loan_Type,Roi,DrAmount,CrAmount,IntAmount,Other_Charges,RefSno,Remarks,IntAccured)
					VALUES        (Dbo.[GenerateVoucherNo](7),[dbo].DateToInt(@ToDate),'',7,@AccountSno,0,0,0,'',0,@IntAccured,0,0,0,0,@Remarks,@IntAccuredb4IntPaid)

          UPDATE Voucher_Series SET Current_No=Current_No+1 WHERE SeriesSno=7

        END

      CloseNow:
END

	

	/*
	DELETE FROM Transactions WHERE SeriesSno = 7 and partysno = 38
	update party set newprincipal = 0
	SELECT * FROM Transactions where partysno=38
	SELECT * FROM PARTY 
  update party set intlastupdate = '2023/05/01'
	EXEC Ssp_Post_Interest 54,1,0
	select DATEDIFF(DAY,'2023-06-01','2023-06-30')
	select DATEDIFF(MONTH,'2023-06-01','2023-06-30')
	*/


  --SELECT * from Transactions where PartySno =68  and SeriesSno=7
