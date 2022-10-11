<?php
	#initialize Stuff and Create Tables if not exist, blabla:
	include("sql/init.php");
?>

<html>
<head>
	<meta charset="utf8" />
	<meta http-equiv="Cache-Control" content="no-store" />
	<meta http-equiv="expires" content="0" />
	<title>Company M v3.1</title>
	<!-- Angular and JS Magic here -->
	<script src="angular-1.3.15/angular.js"></script>
	<script src="angular-1.3.15/angular-route.js"></script>
	<script src="angular-1.3.15/angular-touch.js"></script>
	<script src="angular-1.3.15/i18n/angular-locale_de-at.js"></script>

	<!--script src="js/lz-string-1.0.2.js"></script-->
	<script src="js/my.compm.app.js"></script>
	<script src="js/digical.control.js"></script>
	<script src="js/my.calc.control.js"></script>
	<script src="js/my.calc.calculations.js"></script>
	<!-- Bootstrap should be local for update compatibility thingy... ya know? -->
	<link rel="stylesheet" href="bootstrap-3.3.5/css/bootstrap.min.css">
	<link rel="stylesheet" href="css/companym3.default.css" >
	<link rel="stylesheet" href="css/companym3.print.css"><!-- media="print" -->
	
</head>
<body ng-app="compmApp">

<!-- Main Navigation -->
<div id="mainnav" >

	<!-- Logo -->
	<a href="#Startpage" id="logo"></a>
	<!-- End Logo -->

	<!-- Menu Entries -->
	<!-- Kalkulation -->
	<a href="#DigiCal">
		<div class="glyphicon glyphicon-equalizer"></div>
		Kalkulation Digital
	</a>

<!-- 	<a href="#SolCal">
		<div class="glyphicon glyphicon-equalizer"></div>
		Kalkulation Solvent
	</a> -->

	<a href="#Calculus">
		<div class="glyphicon glyphicon-equalizer"></div>
		Kalkulation Alt
	</a>
	
	<!-- End Menu Entries -->

</div>
<!-- End Main Navigation -->

<!-- Here is definetly where the magic happens -->
<ng-view></ng-view>

</body>
</html>