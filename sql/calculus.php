<?php
	#includes:
	include("func_lib.php");
	
//connect to db:
$link = _connectSQL();
//post to indexed array:
$myPost = json_decode(file_get_contents('php://input'),true);

//Update/Insert Rows (Need a function to automate update or input for that somehow) :D
if( isset($myPost["InsertUpdateRow"])){
	$table = $myPost["InsertUpdateRow"];
	mysqli_query($link,"DELETE FROM $table WHERE PID = '".$myPost['PID']."'");
	mysqli_query($link,"INSERT INTO $table VALUES ('".$myPost['PID']."', '".$myPost['data']."')");
	//echo("INSERT INTO $table VALUES (".$myPost['PID'].", '".$myPost['data']."')");
	echo( mysqli_insert_id ($link) );	
}


if( isset($myPost["DelItem"])){
	$table = $myPost["DelItem"];
	mysqli_query($link,"DELETE FROM $table WHERE PID = '".$myPost['PID']."'");
}

if( isset($myPost["GetTableContents"])){
	$table = $myPost["GetTableContents"];
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

//noch nicht in verwendung... wird benutzt für mehere Maschinentypen bzw... dessen Kalkulationspreise
if( isset($myPost["GetTablesByPrefix"])){
	$table = $myPost["GetTablesByPrefix"];
	$result = mysqli_query($link,"SHOW TABLES LIKE '".$table."_%'");
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