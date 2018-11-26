<?

	header("Content-Type: text/html; charset=utf-8");
	include_once('../connect/db_connect.php');
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
      $query = "SELECT id, a_limit, a_limitType, agents, payment, total_price, amount, fact_premia, name, date FROM saved WHERE id = '".$id."'";
      $result = mysqli_query($link, $query) or die(mysqli_error($link));
      while($row=mysqli_fetch_array($result, MYSQLI_ASSOC)){
        $resultJson[]=$row;
      }
    }
    echo json_encode($resultJson);
  }
  else if ($data['type']='addresses') {
    $resultJson = array();
    $query="SELECT * FROM addresses WHERE id=".$data['legal_id'];
    $result = mysqli_query($link,$query) or die(mysqli_error($link));
    $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
    $resultJson[]=$row;
    
    $query2="SELECT * FROM addresses WHERE id=".$data['real_id'];
    $result2 = mysqli_query($link,$query2) or die(mysqli_error($link));
    $row2 = mysqli_fetch_array($result2, MYSQLI_ASSOC);
    $resultJson[]=$row2;
    echo json_encode($resultJson);
  }
?>
