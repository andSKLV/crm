<?php

$host="92.53.114.76:3306";
$user="cm52806_calcgr";
$password="A2hF9eSaDg76FnS5D";
$db="cm52806_calcgr";
$link=mysqli_connect($host,$user,$password) or die("MySQL сервер недоступен!".mysqli_error());
mysqli_select_db($link, $db) or die("Нет соединения с БД");

if(isset($_GET['server_root'])){$server_root = $_GET['server_root'];unset($server_root);}
if(isset($_POST['server_root'])){$server_root = $_POST['server_root'];unset($server_root);}

$server_root = "http://capitalpolis.ru";

$link=mysqli_connect($host,$user,$password);
mysqli_select_db($link, $db) or die("Нет соединения с БД");



?>