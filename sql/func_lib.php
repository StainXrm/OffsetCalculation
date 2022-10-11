<?php
	#constants
	$dbhost = "localhost";
	$dbname = "ipcal";
	$dbuser = "root";
	$dbpass = "";

//connect to sql
function _connectSQL() {
	global $dbhost, $dbuser, $dbpass, $dbname;
	$link = mysqli_connect($dbhost, $dbuser, $dbpass);
	if (!$link) {
		die('Could not connect: ' . mysqli_error($link));
	}
	mysqli_query($link,"SET NAMES 'utf8'");
	mysqli_select_db($link,$dbname);
	return $link;
}

function _closeSQL() {
	global $link;
	mysqli_close($link);
}

function _datetime() {
 return date('d.m.Y H:i:s');
}

// Get Posts an do stuff here:
$myPost = json_decode(file_get_contents('php://input'),true);
if( isset($myPost["GetDateTime"])){
	echo _datetime();
}


/*
	$result = mysqli_query($link,"SELECT * FROM  ".$db_table." WHERE  Bezeichnung =  '".$where."'");

	
	if($result){
		while($row = mysqli_fetch_array($result,MYSQLI_NUM)){
		  foreach($row as $key => $value){
		  //echo nl2br($row[$key]." : ".$a_value[$key]."\n");
		  }
		}
	} else {
		echo 'Error: ' . mysqli_error($link);
	}
}
*/
?>