<?php
  header("Content-Type: text/html; charset=utf-8");
  include_once('../connect/db_connect.php');
   $json = $_POST['json'];
   $myFile = $_POST['fileName'];
   /* sanity check */
   try {
      
      if(file_put_contents($myFile, $json)) {
        echo "saved";
        }
      else 
        echo "error";
   }
   catch (Exception $e) {
    echo 'Caught exception: ',  $e->getMessage(), "\n";
  }

?>