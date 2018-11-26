<?

	header("Content-Type: text/html; charset=utf-8");
	include_once('../connect/db_connect.php');
	$data = json_decode(file_get_contents('php://input'), true);
	$value=$data['value'];

  if($data["type"]=="delete_calculation"){
    $id=$data['id'];
    $query = "DELETE FROM saved WHERE id = '".$id."'";
    $result = mysqli_query($link, $query) or die(mysqli_error());
    if ($result) echo "Успешно удалено";
  }
  else if ($data['type']=='delete_link_company') {
    $query = "UPDATE calculation_link SET company_id='' WHERE calc_id= '".$data['id']."'";
  }
  else if ($data['type']=='delete_link') {
    $query = "DELETE FROM calculation_link WHERE calc_id = '".$data['id']."'";
    $result = mysqli_query($link, $query) or die(mysqli_error());
    if ($result) echo "OK";
  }
  else if($data['type']=="save_calc"){
    $date=date("Y-m-d");
    $query = "INSERT INTO saved VALUES ('".$data['name']."', '123', '".$data['parks']."', '".$data['practicalPrice']."','".$data['payment']."', '".$data['agents']."', '".$date."','".$data['mass']."','','".$data['a_limit']."','".$data['a_limitType']."','".$data['totalAmount']."','".$data['totalPrice']."','','".$data['HIPname']."')";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    echo mysqli_insert_id($link);
  }
  else if ($data['type']=="update_calc"){
    $date=date("Y-m-d");
    $query = "UPDATE saved SET processes='".$data['parks']."', fact_premia='".$data['practicalPrice']."', payment='".$data['payment']."', agents='".$data['agents']."', date='".$date."',mass='".$data['mass']."', a_limit='".$data['a_limit']."', a_limitType='".$data['a_limitType']."', amount='".$data['totalAmount']."', total_price='".$data['totalPrice']."', HIPname='".$data['HIPname']."'  WHERE id = '".$data['id']."'";
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
    $query = "INSERT INTO CompaniesNew VALUES ('','".$data['name']."','".$data['OrganizationFormID']."', '".$data['status']."','".$data['director_name']."','".$data['give_date']."','".$data['director_authority']."','".$data['general_director_passport']."','".$data['director_birth_place']."','".$data['director_address']."','".$data['company_group']."','".$data['Communications']."','".$data['registration_date']."','".$data['who_registrate']."','".$data['company_phone']."','".$data['company_mail']."','".$data['company_url']."','".$data['OGRN']."','".$data['INN']."','".$data['KPP']."','".$data['OKPO']."','".$data['OKVED']."','".$data['r_account']."','".$data['k_account']."','".$data['bank']."','".$data['bik']."','".$data['Legal_address']."','".$data['Real_address']."','".$date."')";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    echo mysqli_insert_id($link);
  }
  else if ($data['type']=="update_company"){
    $card=$data['card'];
    $query = "UPDATE CompaniesNew SET Communications='".$card['Communications']."', INN='".$card['INN']."',KPP='".$card['KPP']."',Legal_address='".$card['Legal_address']."',OGRN='".$card['OGRN']."',OKPO='".$card['OKPO']."',OKVED='".$card['OKVED']."',OrganizationFormID='".$card['OrganizationFormID']."',Real_address='".$card['Real_address']."',bank='".$card['bank']."',bik='".$card['bik']."',company_group='".$card['company_group']."',company_mail='".$card['company_mail']."',company_phone='".$card['company_phone']."',company_url='".$card['company_url']."',general_director_passport='".$card['general_director_passport']."',director_name='".$card['director_name']."',give_date='".$card['give_date']."',director_authority='".$card['director_authority']."',k_account='".$card['k_account']."',name='".$card['name']."',r_account='".$card['r_account']."',registration_date='".$card['registration_date']."',status='".$card['status']."',who_registrate='".$card['who_registrate']."' WHERE id = '".$data['id']."'";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    echo $result;

  }
  else if ($data['type']=="save_company_changes") {
    $date = date('Y-m-d');
    $prev = $data['prev'];
    $company_id = $data['company_id'];
    $table_name = 'Companies';
    $time = time();
    foreach($prev as $key=>$value) {
      $query = "INSERT INTO Changes VALUES ('','".$table_name."','".$company_id."','".$key."','".$value."','".$date."','".$time."')";
      $result = mysqli_query($link, $query) or die(mysqli_error($link));
    }
    echo $result;
  }
  else if($data['type']=="new_connection"){
    $date=date("Y-m-d");
    $query = "INSERT INTO ConnectionsCopy VALUES ('','".$data['company_id']."','".$data['contact_id']."','".$data['status']."','".$data['email']."','".$data['phone']."','".$date."','".$data['end_date']."')";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    echo mysqli_insert_id($link);
  }
  else if ($data['type']=="addition_save"){
    $date=date("Y-m-d");
    $query = "INSERT INTO additions VALUES ('','".$data['name']."','".$data['text']."','".$date."')";
    $result = mysqli_query($link, $query) or die(mysqli_error($link));
    echo mysqli_insert_id($link);
  }
  if($data["type"]=="addition_delete"){
    $id=$data['id'];
    $query = "DELETE FROM additions WHERE id = '".$id."'";
    $result = mysqli_query($link, $query) or die(mysqli_error());
    if ($result) echo "success";
  }

?>
