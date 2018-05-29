<?
    ini_set('display_errors',1);

    header("Content-Type: text/html; charset=utf-8");
    include_once('db_connect.php');

	$data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['pwd']) && isset($data['login'])){
        $query = "SELECT * FROM users";
        $result = mysqli_query($link,$query) or die(mysqli_error());
        while($row=mysqli_fetch_array($result, MYSQLI_ASSOC)){
            if($row['LOGIN']===$data['login'] && $row['PWD']===$data['pwd']){
                $answer['name']= $row['NAME'];
                $answer['options']=$row['OPTIONS'];
                $answer['loggin']=true;
                $answer['login']=$data['login'];
                $answer['pwd']=$data['pwd'];

            }
        }
        if(!isset($answer))  $answer['loggin']=false;
    }
    echo json_encode($answer);

?>