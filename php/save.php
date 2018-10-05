<?

	header("Content-Type: text/html; charset=utf-8");
	include_once('db_connect.php');
	$data = json_decode(file_get_contents('php://input'), true);
	$value=$data['value'];

  if($data["type"]=="delete_calculation"){
    $id=$data['id'];
    $query = "DELETE FROM savedCopy WHERE id = '".$id."'";
    $result = mysqli_query($link, $query) or die(mysqli_error());
    if ($result) echo "Успешно удалено";
  }
  else if($data['type']=="save_calc"){
    $date=date("Y-m-d");
    $query = "INSERT INTO savedCopy VALUES ('".$data['name']."', '123', '".$data['parks']."', '".$data['practicalPrice']."','".$data['payment']."', '".$data['agents']."', '".$date."','".$data['mass']."','','".$data['a_limit']."','".$data['a_limitType']."','".$data['totalAmount']."','".$data['totalPrice']."','','".$data['HIPname']."')";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    echo mysqli_insert_id($link);
  }
  else if ($data['type']=="update_calc"){
    $date=date("Y-m-d");
    $query = "UPDATE savedCopy SET processes='".$data['parks']."', fact_premia='".$data['practicalPrice']."', payment='".$data['payment']."', agents='".$data['agents']."', date='".$date."',mass='".$data['mass']."', a_limit='".$data['a_limit']."', a_limitType='".$data['a_limitType']."', amount='".$data['totalAmount']."', total_price='".$data['totalPrice']."', HIPname='".$data['HIPname']."'  WHERE id = '".$data['id']."'";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    echo $result;
  }
  else if($data['type']=="link_calc"){
    $date=date("Y-m-d");
    $query = "INSERT INTO calculation_link VALUES ('','".$data['calc_id']."','".$data['company_id']."','".$data['contact_id']."','".$data['agent_id']."','".$date."')";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    echo mysqli_insert_id($link);
  }
  else if($data['type']=="save_company"){
    $date=date("Y-m-d");
    $query = "INSERT INTO CompaniesCopy VALUES ('','".$data['name']."','".$data['OrganizationFormID']."', '".$data['status']."','".$data['director_name']."','".$data['give_date']."','".$data['director_authority']."','".$data['general_director_passport']."','".$data['company_group']."','".$data['Communications']."','".$data['registration_date']."','".$data['who_registrate']."','".$data['company_phone']."','".$data['company_mail']."','".$data['company_url']."','".$data['OGRN']."','".$data['INN']."','".$data['KPP']."','".$data['OKPO']."','".$data['OKVED']."','".$data['r_account']."','".$data['k_account']."','".$data['bank']."','".$data['bik']."','".$data['Legal_address']."','".$data['Real_address']."','".$date."')";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    echo mysqli_insert_id($link);
  }
  else if ($data['type']=="update_company"){

  }
  else if($data['type']=="new_connection"){
    $date=date("Y-m-d");
    $query = "INSERT INTO ConnectionsCopy VALUES ('','".$data['company_id']."','".$data['contact_id']."','".$data['status']."','".$data['email']."','".$data['phone']."','".$date."','".$data['end_date']."')";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    echo mysqli_insert_id($link);
  }

?>
