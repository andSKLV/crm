<?

    //ini_set('display_errors',1);
	//error_reporting(E_ALL);
	header("Content-Type: text/html; charset=utf-8");
	include_once('db_connect.php');

	$data = json_decode(file_get_contents('php://input'), true);
	$value=$data['value'];
	if($data['type']=="find_company" || $data['type']=="Компания"){
	    $query="SELECT con.phone, com.id, com.name, ctx.LastName, ctx.FirstName, com.company_phone, addr.City, addr.Street ";
	    $query.="FROM Connections as con ";
	    $query.="LEFT JOIN Companies as com on con.company_id = com.id ";
	    $query.="LEFT JOIN Contacts as ctx on con.contact_id = ctx.id ";
	    $query.="LEFT JOIN addresses as addr on addr.id = com.Legal_address ";
	    if($value['db']=='companies') $query.="WHERE LOWER(com.".$value['model'].") RLIKE LOWER('".$value['val']."')";
	    else if($value['db']=='contacts') $query.="WHERE LOWER(ctx.FirstName) RLIKE LOWER('".$value['val']."') OR LOWER(ctx.LastName) RLIKE LOWER('".$value['val']."')";
        else if($value['db']=='addresses') $query.="WHERE LOWER(addr.City) RLIKE LOWER('".$value['val']."') OR LOWER(addr.Street) RLIKE LOWER('".$value['val']."')";
        //echo $query;
        $result = mysqli_query($link,$query) or die(mysqli_error());
        $resultJson = array();

        while($row=mysqli_fetch_array($result, MYSQLI_ASSOC)){
           //$addresses[$row['id']] = $row['City'].", ".$row['Street'];
           $resultJson[]=$row;

        }

        foreach($resultJson as $key=>$value){
            $resultJson[$key]['contact']=$resultJson[$key]['FirstName']." ".$resultJson[$key]['LastName'];
            unset($resultJson[$key]['LastName']);
            unset($resultJson[$key]['FirstName']);
            $resultJson[$key]['Legal_address']=$resultJson[$key]['City']." ".$resultJson[$key]['Street'];
            unset($resultJson[$key]['City']);
            unset($resultJson[$key]['Street']);
        }
        $array=[];
        foreach($resultJson as $item){
            if(!isset($array[$item['id']])){
                $array[$item['id']]=$item;
                $array[$item['id']]['contact']=[];
                $ctx=[];
                if( ( !isset($item['company_phone']) || $item['company_phone']=="") && isset($item['phone']) && $item['phone']!=""  ) $array[$item['id']]['company_phone']=$array[$item['id']]['phone'];
                $ctx['name']=$item['contact'];
                if(isset($item['phone']) && $item['phone']!="") $ctx['phone']=$item['phone'];
                else $ctx['phone']=$item['company_phone'];
                $array[$item['id']]['contact'][]=$ctx;
                /*if(isset($item['company_phone'])){
                    $mass=explode(";", $item['company_phone']);
                    $array[$item['id']]['company_phone']=[];
                    foreach($mass as $mass_item){
                        if(isset($mass_item) && $mass_item!="") $array[$item['id']]['company_phone'][]=$mass_item;
                    }
                }
                if(count($array[$item['id']]['company_phone'])==0) $array[$item['id']]['company_phone']="";
                else if(count($array[$item['id']]['company_phone'])==1) $array[$item['id']]['company_phone']=$array[$item['id']]['company_phone'][0];*/
            }
            else{
                $ctx=[];
                $ctx['name']=$item['contact'];
                if(isset($item['phone']) && $item['phone']!="") $ctx['phone']=$item['phone'];
                else $ctx['phone']=$item['company_phone'];
                $array[$item['id']]['contact'][]=$ctx;

            }

        }
        $resultJson=[];
        foreach($array as $item){
            $resultJson[]=$item;
        }
        echo json_encode($resultJson);
        //echo json_encode($array);


	}
	else if($data['type']=="find_calculation" || $data['type']=="Расчет"){
	    $query="SELECT id, name, a_limit, total_price, amount, fact_premia, date FROM saved WHERE LOWER(".$value['model'].") RLIKE LOWER('".$value['val']."')";
        $result = mysqli_query($link, $query) or die(mysqli_error());
        $resultJson = array();

        while($row=mysqli_fetch_array($result, MYSQLI_ASSOC)){
           $resultJson[]=$row;
        }
        echo json_encode($resultJson);
	}
	else if($data['type']=="load_calculation"){
	    $query="SELECT * FROM saved WHERE id=".$data['id'];
	    $result = mysqli_query($link, $query) or die(mysqli_error());
	    $row=mysqli_fetch_array($result, MYSQLI_ASSOC);
	    echo json_encode($row);
	}
	else if($data["type"]=="delete_calculation"){
        $id=$data['id'];
        $query = "DELETE FROM saved WHERE id = '".$id."'";
        $result = mysqli_query($link, $query) or die(mysqli_error());
        if ($result) echo "Успешно удалено";
    }
	else if($data['type']=="addNewCalculationToDB"){
        $date=date("Y-m-d");
        $query = "INSERT INTO saved VALUES ('".$data['name']."', '123', '".$data['parks']."', '".$data['practicalPrice']."','".$data['payment']."', '".$data['agents']."', '".$date."','".$data['mass']."','','".$data['a_limit']."','".$data['a_limitType']."','".$data['totalAmount']."','".$data['totalPrice']."','')";


        $result = mysqli_query($link, $query) or die(mysqli_error());
	}
