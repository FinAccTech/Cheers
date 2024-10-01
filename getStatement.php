<?php 
header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Headers: X-Requested-With");
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS, HEAD, DELETE');  
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Max-Age: 86400');    // cache for 1 day

  // error_reporting(E_ALL); 
  // ini_set('display_errors', 1);


  $request 	= explode("/", substr(@$_SERVER['PATH_INFO'], 1)); 
	
  $method   = $_SERVER['REQUEST_METHOD']; 

  if ($method === "POST")
  {
  	$data = $_POST['data'];              
  }
  else
  {
  	$data = $_GET['data'];     
  } 

	$data     = json_decode($data,false); 

  $qerror = "";
  
  

	$serverName = "184.168.125.210\FinAcc2019"; //serverName\instanceName
	$connectionInfo = array( "Database"=>"CheersApp", "UID"=>"sa", "PWD"=>"Vel2021Dev2013Srini!(*#");

	$GLOBALS['$conn'] = sqlsrv_connect( $serverName, $connectionInfo);	
	
  
  if(!$GLOBALS['$conn']) 
  {    
      $qerror = sqlsrv_errors();
      $respData = array("queryStatus"=>0,"apiData"=>$qerror);               
      print json_encode ($respData);                
      die();
  }

  // print_r("Connected");
  // die();
  
  function IntToDate($num)
  {
      return substr($num,6,2)."/".substr($num,4,2)."/".substr($num,0,4);
  }


  $PartySno     = $data->PartySno;
  $Party_Name   = $data->Party_Name;
  $FromDate     = $data->FromDate;
  $ToDate       = $data->ToDate;

  $query =  " SELECT CAST(ISNULL(SUM(CrAmount),0) AS INT) as CrAmount, CAST(ISNULL(SUM(DrAmount),0) AS INT) as DrAmount, ISNULL(SUM(CrWeight),0) as CrWeight, ISNULL(SUM(DrWeight),0) as DrWeight

                  FROM  VW_TRANSACTIONS

                  WHERE SeriesSno IN (1,2,5,7) AND (PartySno = " . $PartySno.") AND (Trans_Date BETWEEN ".$FromDate." AND ". $ToDate.")";

      $result = sqlsrv_query($GLOBALS['$conn'],$query);
      if ($result === false)
      {
            if( ($errors = sqlsrv_errors() ) != null)
            {
              foreach( $errors as $error )
              {
                $qerror = $error["message"];
              }
            }
          $qerror = substr($qerror, strpos($qerror, "[SQL Server]")+12,strlen($qerror));
          $respData = array("queryStatus"=>0,"apiData"=>$qerror);       
          print json_encode ($respData);   
          die();
      }
      Else
      {   
          $BalanceData = '';
          $row = sqlsrv_fetch_array($result);
          $CrAmount  = $row['CrAmount'];
          $DrAmount  = $row['DrAmount'];
          $CrWeight  = $row['CrWeight'];
          $DrWeight  = $row['DrWeight'];

          $BalanceData = '<h3> Cash Balance : '. ($DrAmount-$CrAmount). ' &nbsp; &nbsp;  Weight Balance: '. ($DrWeight-$CrWeight) .'</h3>';          
      }

  $query = "    SELECT    Tv.RowNo,Tv.TransSno,Tv.Trans_Date,Tv.SeriesSno,Tv.Particulars,Tv.Bank_Name,Tv.Branch_Name,CAST(Tv.CrAmount AS INT) AS CrAmount,Tv.DrAmount,CAST(Tv.IntAmount AS INT) as IntPaid, CAST(Tv.IntAccured AS INT) AS IntAccured,Tv.CrWeight,Tv.DrWeight,Tv.Remarks,
                              

                                  /* 
                                    CAST(ISNULL((SELECT ((SUM(DrAmount) - SUM(CrAmount)) + SUM(IntAmount)) + (CASE WHEN (SELECT Scheme FROM Party WHERE PartySno=".$PartySno.") = 1 THEN 0 ELSE ISNULL(Tv.IntAccured,0) END) + ( CASE WHEN Tv.SeriesSno = 7 THEN 0 ELSE ((Tv.DrAmount - Tv.CrAmount) + Tv.IntAmount) END)  FROM VW_STATEMENT WHERE (SeriesSno <> 7) AND (PartySno=".$PartySno.") AND (RowNo < Tv.RowNo)), 
                                     CASE WHEN DrAmount = 0 THEN (CrAmount-CrAmount*2 ) ELSE DrAmount END)  AS INT)  as PrinBalance,
                                  */

                                  CAST(ISNULL((SELECT ((SUM(DrAmount) - SUM(CrAmount)) + SUM(IntAmount)) + ( CASE WHEN Tv.SeriesSno = 7 THEN 0 ELSE ((Tv.DrAmount - Tv.CrAmount)) END)  FROM VW_STATEMENT WHERE (SeriesSno <> 7) AND (PartySno=".$PartySno.") AND (RowNo < Tv.RowNo)), 
                                                                      CASE WHEN DrAmount = 0 THEN (CrAmount-CrAmount*2 ) ELSE DrAmount END)  AS INT)  as PrinBalance,


                                  CAST(ISNULL((SELECT (SUM(DrAmount) - SUM(CrAmount)) + (Tv.DrAmount - Tv.CrAmount)  FROM VW_STATEMENT WHERE PartySno=". $PartySno ." AND RowNo < Tv.RowNo), CASE WHEN DrAmount = 0 THEN (CrAmount-CrAmount*2 ) ELSE DrAmount END) AS INT) as Balance,

                              ISNULL((SELECT (SUM(GrossDrWeight) - SUM(GrossCrWeight)) + Tv.GrossDrWeight - Tv.GrossCrWeight FROM VW_STATEMENT WHERE PartySno=". $PartySno ." AND RowNo < Tv.RowNo), CASE WHEN GrossDrWeight = 0 THEN (GrossCrWeight-GrossCrWeight*2 ) ELSE GrossDrWeight END) as BalanceWt,ImgCount
                    FROM      VW_STATEMENT Tv
                    WHERE     (PartySno = ". $PartySno.") AND (Tv.Trans_Date BETWEEN ".$FromDate." AND ". $ToDate.")";
    
      $result = sqlsrv_query($GLOBALS['$conn'],$query);
      if ($result === false)
      {
            if( ($errors = sqlsrv_errors() ) != null)
            {
              foreach( $errors as $error )
              {
                $qerror = $error["message"];
              }
            }
          $qerror = substr($qerror, strpos($qerror, "[SQL Server]")+12,strlen($qerror));
          $respData = array("queryStatus"=>0,"apiData"=>$qerror);                                     
      }
      Else
      {   
          $rows = array();
          $rowData = '';
          $CrTotal = 0; $DrTotal = 0; $IntAccTotal = 0; $IntPaidTotal = 0; $CrWeightTotal = 0; $DrWeightTotal = 0;

          while ($row = sqlsrv_fetch_array($result)) 
          {
              $rowData .= '<tr>';

                $rowData .= '<td>'. IntToDate($row['Trans_Date']) .'</td>';
                $rowData .= '<td>'. $row['Particulars'] .'</td>';

                if ($row['Bank_Name'] == 'Cash')
                {
                  $rowData .= '<td>'. $row['Bank_Name'] .'</td>';  
                }
                else
                {
                  $rowData .= '<td> On Account</td>';
                }
                
                $rowData .= '<td>'. $row['CrAmount'] .'</td>';
                $CrTotal += $row['CrAmount'];

                $rowData .= '<td>'. $row['DrAmount'] .'</td>';
                $DrTotal += $row['DrAmount'];

                $rowData .= '<td>'. $row['IntAccured'] .'</td>';
                $IntAccTotal += $row['IntAccured'];

                $rowData .= '<td>'. $row['IntPaid'] .'</td>';
                $IntPaidTotal += $row['IntPaid'];

                $rowData .= '<td>'. $row['DrWeight'] .'</td>';
                $DrWeightTotal += $row['DrWeight'];

                $rowData .= '<td>'. $row['CrWeight'] .'</td>';
                $CrWeightTotal += $row['CrWeight'];

              $rowData .= '</tr>';              
          }                                                                            
      }

      $query = "    SELECT         Trans.TransSno,Id.Image_Name, 'http://184.168.125.210/CheersApp/data/' + Id.Image_Url as Image_Url,SeriesSno,     
                                   Image_Details = Trans.Trans_No + ' / ' + CAST([dbo].IntToDate (Trans.Trans_Date) AS varchar) + ' / G:' +  CAST(SUM(Td.GrossWt) AS VARCHAR) + '/N:' + CAST(SUM(Td.NettWt) AS VARCHAR),
                                   Trans.Trans_Date AS Trans_Date,
                                   ISNULL(SUM(Td.GrossWt),0) AS GrossWt,
                                   ISNULL(SUM(Td.NettWt),0) as NettWt,
                                   ISNULL(Trans.Party_Name,'') AS Party_Name,
                                   ISNULL(Trans.Borrower_Name,'') AS Borrower_Name,
                                   ISNULL(Trans.Bank_Name,'') AS Bank_Name,
                                   ISNULL(Trans.Branch_Name,'') AS Branch_Name
                                                    
                    FROM          Image_Details Id
                                  INNER JOIN VW_TRANSACTIONS Trans ON Trans.TransSno = Id.TransSno
                                  LEFT OUTER JOIN Transaction_Details Td ON Td.TransSno = Trans.TransSno ";

        
        
          $query.=     "WHERE       Trans.PartySno = ".$PartySno;  
          $query.=     " GROUP BY    Trans.TransSno,Id.Image_Name, Id.Image_Url, Trans.SeriesSno,Trans.Trans_No,Trans.Trans_Date, Trans.Party_Name, Trans.Borrower_Name, Trans.Bank_Name, Trans.Branch_Name
                         ORDER BY    SeriesSno";              


        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
              if( ($errors = sqlsrv_errors() ) != null)
              {
                foreach( $errors as $error )
                {
                  $qerror = $error["message"];
                }
              }
            $qerror = substr($qerror, strpos($qerror, "[SQL Server]")+12,strlen($qerror));
            $respData = array("queryStatus"=>0,"apiData"=>$qerror);                                     
        }
        Else
        {   

            $ImgData      = "";
            $ReleaseData  = "";

            $rows = array();
            while ($row = sqlsrv_fetch_array($result)) 
            {
              if ($row['SeriesSno'] == 2)
              {
                $ReleaseData .= '<div class="img">';
                  $ReleaseData .= '<p>'. $row['Image_Details'] .'</p>';                  
                  $ReleaseData .= '<img src="'.$row['Image_Url'].'"/> ';
                $ReleaseData .= '</div>';
              }
              else
              {
                $ImgData .= '<div class="img">';
                  $ImgData .= '<p>'. $row['Image_Details'] .'</p>';                  
                  $ImgData .= '<img src="'.$row['Image_Url'].'"/> ';
                $ImgData .= '</div>';
              }
            }
            
            
        }


  $html = '<html>';

    $html .= '<thead>';
    $html .= '<style>
            #customers {
              font-family: Arial, Helvetica, sans-serif;
              border-collapse: collapse;
              width: 100%;            
            }

            #customers td, #customers th {
              border: 1px solid #ddd;
              padding: 8px;
            }

            #customers tr:nth-child(even){background-color: #f2f2f2;}

            #customers tr:hover {background-color: #ddd;}

            

            #customers th {
              padding-top: 12px;
              padding-bottom: 12px;
              text-align: left;
              background-color: #04AA6D;
              color: white;              
            }
            .total{
              font-weight: bold;
              background-color:#ccc;
            }

          .imgList{
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              width: 100%;
              align-items: center;
              justify-content: space-around;
              padding:10px;
              margin:5px;
              gap: 5px;

              .img{
                display: flex;
                flex-direction: column;
                width: 33.33%;
                font-weight:bold;
                
                img{
                  width: 300px;
                  height: 300px;
                }
                  
                  
                
              }
            }
            </style>';
    $html .= '</thead>';

    $html .= '<body>';

      $html .= '<h3>Statement of '.$Party_Name.' for the Period ' . IntToDate($FromDate). ' to '. IntToDate($ToDate).'</h3>';
      
      $html .= $BalanceData;

      $html .= '<table id="customers" style="width:100%" >';
    
        $html .= '<thead>';
          $html .= '<th> Date </th>';
          $html .= '<th> Particulars </th>';
          $html .= '<th> Bank </th>';
          $html .= '<th> Cr Amount </th>';
          $html .= '<th> Dr Amount </th>';
          $html .= '<th> Int Accured </th>';
          $html .= '<th> Int Paid </th>';
          $html .= '<th> Cr Weight </th>';
          $html .= '<th> Dr Weight </th>';
        $html .= '</thead>';

        $html .= '<tbody>';
          $html .= $rowData;          
          $html .= '<tr class="total" > <td colspan="3" style="text-align:center" > Total </td>  <td>'.$CrTotal.' </td> <td>'.$DrTotal.'</td> <td>'.$IntAccTotal.' </td> <td>'. $IntPaidTotal.' </td> <td>' . $CrWeightTotal . '</td> <td>' . $DrWeightTotal . ' </td> </tr>';
        $html .= '</tbody>';
    
      $html .= '</table>';
    
      $html .= '<h2> Customer Images </h2>';
      $html .= '<div class="imgList">';
        $html .= $ImgData;
      $html .= '</div>';

      $html .= '<h2> Release Images </h2>';
      $html .= '<div class="imgList">';
        $html .= $ReleaseData;
      $html .= '</div>';

      
    $html .= '</body>';
  $html .= '</html>';

  $myfile = fopen("Statements/".$PartySno."Statement of ".$Party_Name.".html", "w") or die("Unable to open file!");  
  fwrite($myfile, $html);
  fclose($myfile);

  // $Url = "http://cheers.finacc.in/"."Statements/".$PartySno."Statement of ".$Party_Name.".html";
  $Url = "http://184.168.125.210/CheersApp/data/"."Statements/".$PartySno."Statement of ".$Party_Name.".html";
  
  $respData = array("queryStatus"=>1,"apiData"=>($Url));                                                                                        
      
  print json_encode ($respData); 
  
?>