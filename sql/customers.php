<?php
	#includes:
	include("../sql/func_lib.php");
	
//connect to db:
$link = _connectSQL();
//post to indexed array:
$myPost = json_decode(file_get_contents('php://input'),true);

//Update/Insert Rows :D
if( isset($myPost["Save"])){
	$table = $myPost["Save"];
	mysqli_query($link,"CREATE TABLE IF NOT EXISTS ". $table . " (PID INT AUTO_INCREMENT, PRIMARY KEY(PID), Data LONGTEXT)");
	if( isset( $myPost["PID"] ) ) { //if PID is given...
		mysqli_query($link,"DELETE FROM $table WHERE PID = '".$myPost['PID']."'");
		mysqli_query($link,"INSERT INTO $table VALUES ('".$myPost['PID']."', '".$myPost['data']."')");
	} else {
		mysqli_query($link,"INSERT INTO $table VALUES ('', '".$myPost['data']."')");
	}
	//echo("INSERT INTO $table VALUES (".$myPost['PID'].", '".$myPost['data']."')");
	//echo( mysqli_error ($link) );
	echo( mysqli_insert_id ($link) );	
}

if( isset($myPost["Delete"])){
	$table = $myPost["Delete"];
	mysqli_query($link,"CREATE TABLE IF NOT EXISTS ". $table . " (PID INT AUTO_INCREMENT, PRIMARY KEY(PID), Data LONGTEXT)");
	mysqli_query($link,"DELETE FROM $table WHERE PID = '".$myPost['PID']."'");
}

if( isset($myPost["Get"])){
	$table = $myPost["Get"];
	mysqli_query($link,"CREATE TABLE IF NOT EXISTS ". $table . " (PID INT AUTO_INCREMENT, PRIMARY KEY(PID), Data LONGTEXT)");
	$result = mysqli_query($link,"SELECT * FROM $table WHERE 1 ORDER BY PID ASC");
	if($result){
		$arr = array();
		while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
		  array_push($arr,$row);		  
		}
		echo(json_encode($arr));
	} else {
		echo 'Error: ' . mysqli_error($link);
	}
}

_closeSQL();
?>