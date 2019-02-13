<?
  header("Content-Type: text/html; charset=utf-8");
  include_once('../connect/db_connect.php');
  
  $type = $_POST['type']; 
  if ($type=="GET") {
    $query="SELECT * FROM karetkaNames";
    $result = mysqli_query($link,$query) or die(mysqli_error($link));
    $resultJson = array();
    while($row=mysqli_fetch_array($result, MYSQLI_ASSOC)){
      $resultJson[]=$row;
    }
    echo json_encode($resultJson);
  }
  else if ($type=="POST") {
    $query = "INSERT INTO karetkaNames VALUES ('','".$_POST['name']."','".$_POST['fileName']."')";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    echo mysqli_insert_id($link);
  }
  else if ($type=="DELETE") {
    $query = "DELETE FROM karetkaNames WHERE id = '".$_POST['id']."'";
    $result = mysqli_query($link, $query) or die(mysqli_error());
    if ($result) echo "success";
  }
  else if ($type=="UPDATE") {
    $query = "UPDATE karetkaNames SET name='".$_POST['name']."'  WHERE id = '".$_POST['id']."'";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    if ($result) echo "success";
  }
  ?>