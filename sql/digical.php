<?php
	#includes:
	include("func_lib.php");
	
//connect to db:
$link = _connectSQL();
//post to indexed array:
$myPost = json_decode(file_get_contents('php://input'),true);

//Update/Insert Rows
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
	$result = mysqli_query($link,"CREATE TABLE IF NOT EXISTS ".$table." (PID INT AUTO_INCREMENT, PRIMARY KEY(PID), Data LONGTEXT)");
	if (!$result) { //create table if not present atm...
	  echo "Error creating table: " . mysqli_error($link);
	}

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