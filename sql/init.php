<?php
	#includes:
	include("func_lib.php");

// Connect to MySQL
$link = mysqli_connect($dbhost, $dbuser, $dbpass);
	mysqli_query($link,"SET NAMES 'utf8'");
if (!$link) {
	die('Could not connect: ' . mysqli_error($link));
}

// Make my_db the current database
$db_selected = mysqli_select_db($link,$dbname);

if (!$db_selected) {
  // If we couldn't, then it either doesn't exist, or we can't see it.
  $sql = 'CREATE DATABASE '.$dbname.' CHARACTER SET utf8 COLLATE utf8_general_ci';

  if (!mysqli_query($link, $sql)) {
  	echo 'Error creating database: ' . mysqli_error($link);
  }
 	$db_selected = mysqli_select_db($link,$dbname);
}

	// Create tables
	$sql="CREATE TABLE IF NOT EXISTS calculus_preise (PID INT NULL, PRIMARY KEY(PID), Data LONGTEXT)"; //AUTO_INCREMENT = PID cannot be 0!
	
	// Error:
	if (!mysqli_query($link,$sql)) {
	  echo "Error creating table: " . mysqli_error($link);
	}
	
	//rohbogen table create:
	$sql="CREATE TABLE IF NOT EXISTS calculus_papier (PID INT AUTO_INCREMENT, PRIMARY KEY(PID), Data LONGTEXT)";
	if (!mysqli_query($link,$sql)) {
	  echo "Error creating table: " . mysqli_error($link);
	}
	
	// Error:
	if (!mysqli_query($link,$sql)) {
	  echo "Error creating table: " . mysqli_error($link);
	}
	
	//vorlagen table create
	$sql="CREATE TABLE IF NOT EXISTS calculus_vorlagen (PID INT AUTO_INCREMENT, PRIMARY KEY(PID), Data LONGTEXT)";
	if (!mysqli_query($link,$sql)) {
	  echo "Error creating table: " . mysqli_error($link);
	}
	
	// Error:
	if (!mysqli_query($link,$sql)) {
	  echo "Error creating table: " . mysqli_error($link);
	}
	
	//Kunden table create
	$sql="CREATE TABLE IF NOT EXISTS kunden (PID INT AUTO_INCREMENT,PRIMARY KEY(PID), DATA LONGTEXT)";
	if (!mysqli_query($link,$sql)) {
	  echo "Error creating table: " . mysqli_error($link);
	}
	
	// Error:
	if (!mysqli_query($link,$sql)) {
	  echo "Error creating table: " . mysqli_error($link);
	}
	
	// 	//Lieferanten table create
	// $sql="CREATE TABLE IF NOT EXISTS lieferanten (PID INT NOT NULL AUTO_INCREMENT,PRIMARY KEY(PID),NR INT, Firma TEXT, Nachname TEXT, Vorname TEXT, PLZ TEXT, Ort TEXT, Strasse TEXT, UID TEXT, Website TEXT, Email TEXT, Telefon TEXT, Mobil TEXT, Fax TEXT, Notizen LONGTEXT)";
	// if (!mysqli_query($link,$sql)) {
	//   echo "Error creating table: " . mysqli_error($link);
	// }
	
	// // Error:
	// if (!mysqli_query($link,$sql)) {
	//   echo "Error creating table: " . mysqli_error($link);
	// }
	
	// //ERRechnungen table create
	// $sql="CREATE TABLE IF NOT EXISTS angebote (PID INT NOT NULL AUTO_INCREMENT,PRIMARY KEY(PID),NR INT, Projekt TEXT, Kunde TEXT, Daten LONGTEXT)";
	// if (!mysqli_query($link,$sql)) {
	//   echo "Error creating table: " . mysqli_error($link);
	// }
	
	// // Error:
	// if (!mysqli_query($link,$sql)) {
	//   echo "Error creating table: " . mysqli_error($link);
	// }

	//Gespeicherte Kalkulationsarchiv table create
	// $sql="CREATE TABLE IF NOT EXISTS k_archive (PID INT NOT NULL AUTO_INCREMENT,PRIMARY KEY(PID),NR INT, Projekt TEXT, Kunde TEXT, Daten LONGTEXT)";
	// if (!mysqli_query($link,$sql)) {
	//   echo "Error creating table: " . mysqli_error($link);
	// }




	
mysqli_close($link);
?>
