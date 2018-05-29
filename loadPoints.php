<?
    header("Content-Type: text/html; charset=utf-8");
    include_once('db_connect.php');
    $query="SELECT * FROM points ORDER BY x ASC";
    $result = mysqli_query($link, $query) or die(mysqli_error());
    $resultJson = array();

    while($row=mysqli_fetch_array($result, MYSQLI_ASSOC)){
       $resultJson[]=$row;
    }
    echo json_encode($resultJson);


?>