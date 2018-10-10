<?

	header("Content-Type: text/html; charset=utf-8");
	include_once('db_connect.php');
	$data = json_decode(file_get_contents('php://input'), true);

	if($data['type']=="company_calculations"){
    $query="SELECT calc_id, date FROM calculation_link WHERE company_id = '".$data['id']."' ";
    $result = mysqli_query($link, $query) or die(mysqli_error());
    $resultJson = array();

    while($row=mysqli_fetch_array($result, MYSQLI_ASSOC)){
      $resultJson[]=$row;
    }
    echo json_encode($resultJson);
  }
  else if($data['type']=="load_linked_calcs"){
    $ids = $data['ids'];
    $resultJson = array();
    foreach ($ids as $id) {
      $query = "SELECT id, a_limit, a_limitType, agents, payment, total_price, amount, fact_premia, date FROM savedCopy WHERE id = '".$id."'";
      $result = mysqli_query($link, $query) or die(mysqli_error($link));
      while($row=mysqli_fetch_array($result, MYSQLI_ASSOC)){
        $resultJson[]=$row;
      }
    }

    echo json_encode($resultJson);
}
?>
