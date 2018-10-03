<?
  header("Content-Type: text/html; charset=utf-8");
	include_once('../db_connect.php');
  $calc_id = $_POST['id'];
  $query="SELECT * FROM calculation_link WHERE calc_id=".$calc_id;
  $result = mysqli_query($link,$query) or die(mysqli_error($link));
  $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
  echo json_encode($row);
