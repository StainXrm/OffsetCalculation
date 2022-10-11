
myApp.controller('DigiCalCtrl',  function($scope, $http, defservice, $anchorScroll, $location, $filter, $timeout, $q) {
	myApp.DigiCal($scope, $filter, defservice);
	//myApp.SaveLoad($scope, $filter, defservice);
	$scope.$on('$routeChangeStart', function(ev,nURL, oURL) {		
		if(nURL.$$route.originalPath == "/DigiCal") //no reload inside menueentry
		{
	  		ev.preventDefault();
		}
	});

	$scope.setting = {
		//auflage : [1000], 
		rabatt : 0,
		rohbogenpreis : 0,
		druckFormat : {x: 450, y:320, nutzen: 0},
		offenFormat : {x: 210, y:297, nutzen: 0, anschnitt: 2},
		geschlossenFormat : {x: 210, y:297, nutzen: 0},
		maschine : "Versafire",
		duplex : "Simplex",
		satzZeit : 10,
		verpacken : true,
		formatschnitt : true,
		farbe : true,
		verwaltung: true,
		datenannahme: true,
		seitenZahl : 0,
		blattZahl : 1,
		liefern : 10,
		rohbogenPreis : "",
		autoprofit : true,
		lc_duplex : 2,
		special : 
		[{price:0},{price:0},{price:0}]
	};

	var a1 = defservice.getDateTime();
    $q.all([a1]).then(function(responsesArray)
    {
    	 $scope.setting.currentdatetime = responsesArray[0].data;
    }) 

	//init percent provit
	oldprovit = 20;

	$scope.autoProfit = function() {
		if($scope.setting.autoprofit) {
			oldprovit = $scope.setting.profit
			$scope.setting.profit = "";
		} else {
			$scope.setting.profit = oldprovit;
		}
	}

	$scope.moreWash = function(){
		if($scope.setting.lackieren == 'Ja') {
			$scope.setting.farbWaschen++;
		} else {
			$scope.setting.farbWaschen--;
		}
	}

    //Submenu Navigator
	$scope.anchor = 1;
    $scope.gotoAnchor = function(x) {
      var newHash = 'anchor' + x;
      if ($location.hash() !== newHash) {
        // set the $location.hash to `newHash` and
        // $anchorScroll will automatically scroll to it
        var a1 =defservice.getDateTime();
        $q.all([a1]).then(function(responsesArray)
        {
        	 $scope.setting.currentdatetime = responsesArray[0].data;
        }) 
        $location.hash(newHash);
        $anchorScroll(newHash);
        $scope.anchor = x;
      } else {
        // call $anchorScroll() explicitly,
        // since $location.hash hasn't changed
        $anchorScroll();
      }
    };


    //Price
    $scope.FlashOK = [];
    $scope.saveSettingPrice = function(data,PID){
    	var a1 = defservice.getDateTime()
    	console.log(data);
		//called after ajax complete( get datetime from server):
		$q.all([a1]) 
		.then(function(responsesArray){
			delete data.PID; //we don't need it a second time in there (espacially not as json!)
			$scope.setting.price[PID].PID = PID; //well, we need to set it again, cuz the deleted data is in scope!
			$scope.setting.price[PID].Datum = responsesArray[0].data; //set changed datetime to view
			data.Datum = responsesArray[0].data;
			//data = LZString.compress(angular.toJson(data));
			data = angular.toJson(data);
			$http({
				url: "sql/digical.php",
				method: "POST",
				data: {"InsertUpdateRow" : "digi_preise",'PID' : PID, data},
			}).success(function(response){	
				$scope.FlashOK[PID] = 'greenFlash'
				$timeout(function(){
					$scope.FlashOK[PID] = false
					$scope.startcalc()
				},1200)
			})
		});
	}

    $scope.predicate = 'Label';
    $scope.setting.price = [];
    var priceLabels = {
    	//"":"", //not null in table, makes it more easy to do stuff, delete after loading this!
    	"Verwaltung": "Verwaltungskosten",
		"Datenannahme" : "", 
		"Satzkosten": "Minuten",
		"Heften" : "TBg. Auflagebogen", 
		"Zusammentragen" : "TBg. Auflagebogen", 
		"Falzen" : "TBg. Auflagebogen", 
		"Leimen" : "TBg. Druckbogen", 
		"Laminieren" : "TBg. Druckbogen", 
		"Formatschnitt" : "TBg. Auflage (x Nutzen)", 
		"Lochen" : "TBg. Auflagebogen", 
		"Liefern" : "km", 
		"Personalisieren" : "TBg. Auflagebogen", 
		"Rillen/Stanzen" : "TBg. Druckbogen", 
		"Versafire" : "TBg. Maschinenbogen",
		"Versafire-Minimal" : "TBg. Maschinenbogen",
		"DC242" : "TBg. Maschinenbogen",
		"Verpackung" : "TBg. Maschinenbogen"
    }

    i = 0
	angular.forEach(priceLabels, function(value, key){
		var elem = {
			"PID" : i,
			"Label" : key,
			"Datum" : "Noch nicht Eingetragen",
			"Einheit" : value,
			"einrichtPreis" : 0,
			"prodPreis" : 0
		}
		$scope.setting.price.push(elem)
		i++;
	});
	delete i;

	//console.log($scope.setting.price);

	$http({
		url: "sql/digical.php",
		method: "POST",
		data: {GetTableContents : "digi_preise"},
	})	
	.success( function(response) {
			for (var i = 0 ; i < response.length; i++) { 
				//var data = LZString.decompress(response[i].Data);
				var data = angular.fromJson(response[i].Data);
				//data.PID = parseInt(response[i].PID);
				
				angular.forEach($scope.setting.price, function(value, key){ //looking for Match in Price htmlTable here:
					if(data.Label == value.Label) {
						data.PID = key;
					}
				})
				$scope.setting.price[data.PID] = {
					PID : data.PID,
					Label : data.Label,
					Datum : data.Datum,
					Einheit : data.Einheit,
					einrichtPreis: data.einrichtPreis,
					prodPreis : data.prodPreis
				} 
			}
	})


	//Rawpaper
	$scope.orderrawpaper = '-datum';
	//$scope.predicate = "Datum";


	$http({
		url: "sql/digical.php",
		method: "POST",
		data: {GetTableContents : "digi_papier"},
	})	
	.success( function(response) {
			for (var i = 0 ; i < response.length; i++) { 
				var data = angular.fromJson(response[i].Data)
				data.PID = parseInt(response[i].PID);
				if (typeof $scope.setting.rawpaper === "undefined"){//if no object exist... create one
					$scope.setting.rawpaper = [];
				}
				var index = $scope.setting.rawpaper.length
				//console.log(index)
				$scope.setting.rawpaper[index] = {
					PID : data.PID,
					datum : data.datum,
					label : data.label,
					gm2 : data.gm2,
					width : data.width,
					height : data.height,
					tbgprice : data.tbgprice,
					kgprice : data.kgprice,
					description : data.label+" "+data.gm2+"g/m² "+data.width+"x"+data.height+"mm"
				};
			}
	})
    $scope.rawPaperSave = function(data,PID){
    if(typeof data == "undefined") {return false};
	var a1 = defservice.getDateTime()

	//called after ajax complete( get datetime from server):
	$q.all([a1])
		.then(function(responsesArray){
			

			data.datum = responsesArray[0].data;
			var found = $filter('filter')($scope.setting.rawpaper, {PID: PID}, true);
			if (found.length) { //update if found the PID else... just insert
				PID = found[0].PID;
				data = found[0];
				delete data.PID; //nnaahhh do not save that as data!!!!
				var dataJSON = angular.toJson(data);
				data.PID = PID; //reset... so it not gets deleted in $scope
			} else { //insert here
				//PID = 0;
				var dataJSON = angular.toJson(data);
			}

			$http({
				url: "sql/digical.php",
				method: "POST",
				data: {"InsertUpdateRow" : "digi_papier",'PID' : PID, "data" : dataJSON},
			})
			.success(function(response){
				PID = response;

				if (typeof $scope.setting.rawpaper === "undefined"){//if no object exist... create one
					$scope.setting.rawpaper = [];
				}
				if(!found.length){
					var index = $scope.setting.rawpaper.length
					//console.log(index)
					$scope.setting.rawpaper[index] = { //new row!
						PID : PID,
						datum : data.datum,
						label : data.label,
						gm2 : data.gm2,
						width : data.width,
						height : data.height,
						tbgprice : data.tbgprice,
						kgprice : data.kgprice,
						description : data.label+" "+data.gm2+"g/m² "+data.width+"x"+data.height+"mm"
					};
					$scope.setting.newRawpaper = { //empty the imputs for new entries
						PID : "",
						datum : "",
						label : "",
						gm2 : "",
						width : "",
						height : "",
						tbgprice : "",
						kgprice : ""
					}
				}
				$scope.FlashOK[PID] = 'greenFlash'
				$timeout(function(){
					$scope.FlashOK[PID] = false
				},1200)
			})
		});
	}

    $scope.rawPaperDelete = function(PID){
    	found = $filter('filter')($scope.setting.rawpaper, {PID: PID}, true);
    	if (found.length) { //update if found the PID else... just insert
				$scope.setting.rawpaper.splice($scope.setting.rawpaper.indexOf(found[0]),1);
			}
    	$http({
			url: "sql/digical.php",
			method: "POST",
			data: {"DelItem" : "digi_papier" , "PID" : PID}
		})
    }

	//Calculator:
	//Nutzen Druckformat:
    $scope.$watch('[setting.rawSheetSelect.width, setting.rawSheetSelect.height, setting.druckFormat.x, setting.druckFormat.y]',function(old_v,new_v){
	    if(typeof $scope.setting.rawSheetSelect != 'undefined'){
	    	$scope.setting.druckFormat.nutzen = defservice.nutzenRechner( $scope.setting.rawSheetSelect.width, $scope.setting.rawSheetSelect.height, $scope.setting.druckFormat.x, $scope.setting.druckFormat.y);
		}
	});

    //Nutzen Format Offen:
    $scope.$watch('[setting.druckFormat.x, setting.druckFormat.y, setting.offenFormat.x, setting.offenFormat.y, setting.offenFormat.greiferRand, setting.offenFormat.anschnitt]',function(old_v,new_v){
    	$scope.setting.offenFormat.nutzen = defservice.nutzenRechner( $scope.setting.druckFormat.x, $scope.setting.druckFormat.y, $scope.setting.offenFormat.x, $scope.setting.offenFormat.y, $scope.setting.offenFormat.greiferRand, $scope.setting.offenFormat.anschnitt );
	});
	//Nutzen Format Geschlossen:
    $scope.$watch('[setting.geschlossenFormat.x, setting.geschlossenFormat.y, setting.offenFormat.x, setting.offenFormat.y]',function(old_v,new_v){
    	$scope.setting.geschlossenFormat.nutzen = defservice.nutzenRechner( $scope.setting.offenFormat.x, $scope.setting.offenFormat.y, $scope.setting.geschlossenFormat.x, $scope.setting.geschlossenFormat.y);
	});

	$scope.showtoggler = false;
	$scope.showtogglericon = "glyphicon-chevron-up";
    $scope.toggleCustom = function() {
            $scope.showtoggler = $scope.showtoggler === false ? "upsettings": false;
            $scope.showtogglericon = $scope.showtogglericon === "glyphicon-chevron-down" ? "glyphicon-chevron-up": "glyphicon-chevron-down";
            if($scope.showtoggler){
            	$scope.startcalc();
            }
    };

    //selector for rawsheets:
	$scope.rawSheetChange = function(){
		if(typeof $scope.setting.rawSheetSelect == "undefined"){return false;} // must be something at least!
		if($scope.setting.rawSheetSelect.width + $scope.setting.rawSheetSelect.height == 0){ //beigestellt ist immer 1 nutzen! hoffe ich!
			$scope.setting.rohbogenPreis = 0;
			$scope.setting.druckFormat.nutzen = 1;
		} else {
			//!!tbgprice not given!?!?!?!?! kgprice converter needed!
			$scope.setting.rohbogenPreis = $scope.setting.rawSheetSelect.tbgprice;
		    $scope.setting.druckFormat.nutzen = defservice.nutzenRechner( $scope.setting.rawSheetSelect.width, $scope.setting.rawSheetSelect.height, $scope.setting.druckFormat.x, $scope.setting.druckFormat.y);
		}
	}
	$scope.rawSheetChange()


	//saveas Area

	// $scope.saveasselects = [
	//     { value: 0, label: "Vorlage" },
	//     { value: 1, label: "Angebot" },
	//     { value: 2, label: "Auftrag" },
	//     { value: 3, label: "Rechnung" },
	// ];	
	// $scope.saveasselects.sel = { value: 0, label: "Vorlage" };
	// $scope.saveasselector = function(){
	// 	console.log($scope.priceinfo);
	// 	// alert($scope.saveasselects.sel.label)

	// }



});

myApp.DigiCal = function($scope, $filter, defservice)
{
$scope.startcalc = function(){
		$scope.price = [];
		var priceinfos = {};
		$scope.priceinfo = [];
		$scope.pricesum = [];
		var iMS =	($scope.setting.geschlossenFormat.nutzen*$scope.setting.offenFormat.nutzen) * 2; //Maximale Seiten im S-W
		var iMSpB = ($scope.setting.geschlossenFormat.nutzen*$scope.setting.offenFormat.nutzen) ; //Maximale Seiten im S

		//need to set this shit for every auflage given!!!
		angular.forEach($scope.setting.auflage, function(auflage, index){
			var checkboxes = [];
			if (!auflage > 0) return false;
			var orderIndex = 0;
			var sum = 0;
			
			//Druckbogen && Maschinenbogen && Rohbogen && Druckformen && Druckplatten:
			priceinfos["Druckart"] = $scope.setting.duplex;
			switch($scope.setting.duplex){
				case "Simplex":
					priceinfos["Druckformen"] = Math.ceil( $scope.setting.seitenZahl / iMSpB);
					priceinfos["Druckbogen"] = Math.ceil( (( auflage / (iMSpB) )  *  priceinfos["Druckformen"]) * $scope.setting.blattZahl );
					priceinfos["Maschinenbogen"] = Math.ceil( priceinfos["Druckbogen"]);
					break
				// case "Duplex":
				// 	priceinfos["Druckformen"] = Math.ceil( ($scope.setting.seitenZahl / iMSpB) / 2 )
				// 	priceinfos["Druckbogen"] = Math.ceil( (( auflage / ($scope.setting.offenFormat.nutzen) )  *  priceinfos["Druckformen"]) * $scope.setting.blattZahl  );
				// 	priceinfos["Maschinenbogen"] = Math.ceil( priceinfos["Druckbogen"] * 2);
				// 	break
				case "Duplex":
						priceinfos["Druckformen"] = Math.ceil( $scope.setting.seitenZahl / iMSpB)
						if (priceinfos["Druckformen"] === 1) {
							priceinfos["Druckformen"] = 2
						}
						priceinfos["Druckbogen"] = Math.ceil( ((($scope.setting.seitenZahl/iMSpB)/2)*auflage) * $scope.setting.blattZahl  );
						priceinfos["Maschinenbogen"] = Math.ceil( priceinfos["Druckbogen"] * 2);
					break
			}
			if($scope.setting.seitenZahl > 0 ) priceinfos["Seiten"] = $scope.setting.seitenZahl;
			priceinfos["Rohbogen"] = isLegitInt( Math.ceil( priceinfos["Druckbogen"] / $scope.setting.druckFormat.nutzen ) );

			//Zuschuss:
			//priceinfos["Zuschuss"] = isLegitInt( priceinfos["Druckformen"] * 5 );  //5 Bogen Zuschuss je Druckform
			//priceinfos["Rohbogen"] = priceinfos["Rohbogen"]+priceinfos["Zuschuss"];

			if($scope.priceinfo[index] == "undefined") $scope.priceinfo[index] = [];		

			if( typeof $scope.setting.rawSheetSelect != "undefined") priceinfos["Papier"] = $scope.setting.rawSheetSelect.label +" "+$scope.setting.rawSheetSelect.gm2+"g";
			if( typeof $scope.setting.rawSheetSelect != "undefined") priceinfos["Rohformat"] = $scope.setting.rawSheetSelect.width +" x "+$scope.setting.rawSheetSelect.height+" mm";
			//if( typeof $scope.setting.rawSheetSelect != "undefined") priceinfos["Papier"] = $scope.setting.rawSheetSelect;
			priceinfos["Druckformat"] = $scope.setting.druckFormat.x+" x "+$scope.setting.druckFormat.y+" mm";
			priceinfos["Endformat"] = $scope.setting.geschlossenFormat.x+" x "+$scope.setting.geschlossenFormat.y+" mm";

			//Druck:
			//Verwaltungskosten für Rechnung schreiben, Probedrucke etc....:
			if($scope.setting.verwaltung){
			var label = "Verwaltung";
			var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
			typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis + rowfilter[0].prodPreis;//defservice.curvecalc( $scope.setting.satzZeit, rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis )
				//var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( auflage, 500 , 0 , rowfilter[0].prodPreis )
			$scope.price[orderIndex][index] = {value: labelval, ep: labelval/$scope.setting.satzZeit};

			var sum = sum + labelval;
			orderIndex++;
			}

			//Datenannahme:
			if($scope.setting.datenannahme){
			var label = "Datenannahme";
			var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
			typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
			if($scope.setting.datenannahme){
				var labelval = rowfilter[0].einrichtPreis + rowfilter[0].prodPreis;//defservice.curvecalc( $scope.setting.satzZeit, rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis )
			}
			$scope.price[orderIndex][index] = {value: labelval, ep: labelval/$scope.setting.satzZeit};
			var sum = sum + labelval;
			orderIndex++;
			}


			//Satzkosten
			var label = "Satzkosten";
			var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
			typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
			var labelval = $scope.setting.satzZeit * rowfilter[0].prodPreis;//defservice.curvecalc( $scope.setting.satzZeit, rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis )
			$scope.price[orderIndex][index] = {value: labelval, ep: labelval/$scope.setting.satzZeit};
			var sum = sum + labelval;
			orderIndex++;

		//Digitaldruck Klicks:
		//Versafire
		var label = $scope.setting.maschine;
		if( isLegitInt( priceinfos["Maschinenbogen"] ) ) {
			var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
			typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
			// var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( priceinfos["Maschinenbogen"], rowfilter[0].bisMenge , rowfilter[0].abPreis / 1000, rowfilter[0].bisPreis / 1000 )
			// var sizepercent = ($scope.setting.druckFormat.x/1000) * ($scope.setting.druckFormat.y/1000)
			// sizepercent = sizepercent.constrain(0.036,0.144);//A5+ = 0.036, SRA3 = 0,144
			// sizepercent = sizepercent.map(0.036,0.144,0.25,1); //map to percent = A5+ is 25% of SRA3
			// colorpercent = ($scope.setting.farbe/4);
			if( $scope.setting.farbe) { //Preisabstufung bei SW!
				colorpercent = 1;
			} else {
				colorpercent = 0.35;
			}
			var labelval = rowfilter[0].einrichtPreis +  ( priceinfos["Maschinenbogen"] * ( ( rowfilter[0].prodPreis * colorpercent )/1000 ) );
			$scope.price[orderIndex][index] = {value: labelval, ep: labelval/priceinfos["Maschinenbogen"]};
			var sum = sum + labelval;
			orderIndex++;
		}

			//Papier:
			if( isLegitInt(priceinfos["Rohbogen"]) ){
				var label = "Papier"
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				//$scope.price[label][index] = { value: defservice.round(( ($scope.setting.rohbogenPreis / $scope.setting.druckFormat.nutzen) / 1000 ) * priceinfos["Druckbogen"],2 ) };
				var labelval = 2 + defservice.round(( $scope.setting.rohbogenPreis / 1000 ) * ( priceinfos["Rohbogen"]),2 ) 
				$scope.price[orderIndex][index] = { value: labelval, ep: labelval/( priceinfos["Rohbogen"])};
				var sum = sum + labelval;
				orderIndex++;
			}


			//Falzen:
			if ($scope.setting.falzen){
				var label = "Falzen"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis +  ((auflage*$scope.setting.blattZahl) * (rowfilter[0].prodPreis/1000) );
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Heften:
			if ($scope.setting.heften){
				var label = "Heften"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis +  ((auflage*$scope.setting.blattZahl) * (rowfilter[0].prodPreis/1000) );
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Formatschnitt:
			if ($scope.setting.formatschnitt){
				var label = "Formatschnitt"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				//var nutzenaufschlag = 1+ ( $scope.setting.offenFormat.nutzen/2 ); //aufschlag für mehr schnitte
				//var labelval = rowfilter[0].einrichtPreis +  (priceinfos["Druckbogen"] * ( ( rowfilter[0].prodPreis/1000) * $scope.setting.offenFormat.nutzen ) );
				//var labelval = rowfilter[0].einrichtPreis +  (priceinfos["Druckbogen"] * ( ( rowfilter[0].prodPreis/1000) * $scope.setting.offenFormat.nutzen ) );
				//var labelval = (rowfilter[0].einrichtPreis +  (priceinfos["Druckbogen"] * ( rowfilter[0].prodPreis/1000) ))*(($scope.setting.offenFormat.nutzen/10)+1);
				var labelval = rowfilter[0].einrichtPreis +  ((auflage * ( rowfilter[0].prodPreis/1000) )*(($scope.setting.offenFormat.nutzen/10)+1));
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Verpackung:
			if ($scope.setting.verpacken){
				var label = "Verpackung"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis +  (priceinfos["Druckbogen"] * (rowfilter[0].prodPreis/1000) );
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Lackieren:
			if ($scope.setting.lackieren){
				var label = "Lackieren"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				if($scope.setting.lc_duplex == 1){
					var lc_bogen = priceinfos["Druckbogen"];
					if($scope.setting.lc_umschlag) {var lc_bogen = priceinfos["Maschinenbogen"]/priceinfos["Druckformen"]} //Nur Umschlag ES
				} else {
					var lc_bogen = priceinfos["Druckbogen"]*2;
					if($scope.setting.lc_umschlag) {var lc_bogen = (priceinfos["Maschinenbogen"]/priceinfos["Druckformen"])*2} //Nur Umschlag BS
				}
				var labelval = rowfilter[0].einrichtPreis +  (lc_bogen * (rowfilter[0].prodPreis/1000) ); //rowfilter[0].einrichtPreis + defservice.curvecalc( lc_bogen, rowfilter[0].bisMenge , rowfilter[0].abPreis /1000, rowfilter[0].bisPreis /1000)
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Laminieren:
			if ($scope.setting.cellophanieren){
				var label = "Laminieren"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				if($scope.setting.lc_duplex == 1){
					var lc_bogen = priceinfos["Druckbogen"];
					if($scope.setting.lc_umschlag) {var lc_bogen = priceinfos["Maschinenbogen"]/priceinfos["Druckformen"]} //Nur Umschlag ES
				} else {
					var lc_bogen = priceinfos["Druckbogen"]*2;
					if($scope.setting.lc_umschlag) {var lc_bogen = (priceinfos["Maschinenbogen"]/priceinfos["Druckformen"])*2} //Nur Umschlag BS
				}
				var labelval = rowfilter[0].einrichtPreis +  (lc_bogen * (rowfilter[0].prodPreis/1000) );
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Leimen:
			if ($scope.setting.leimen){
				var label = "Leimen"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis +  (priceinfos["Druckbogen"] * (rowfilter[0].prodPreis/1000) );
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Lochen:
			if ($scope.setting.lochen){
				var label = "Lochen"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				//2er oder 4er Lochung!?!?!?!?!
				var labelval = rowfilter[0].einrichtPreis +  (priceinfos["Druckbogen"] * (rowfilter[0].prodPreis/1000) );
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Personalisieren:
			if ($scope.setting.perosonalieren){
				var label = "Personalisieren"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis +  (priceinfos["Druckbogen"] * (rowfilter[0].prodPreis/1000) );
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Rillen/Stanzen:
			if ($scope.setting.rillenStanzen){
				var label = "Rillen/Stanzen"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis +  (priceinfos["Druckbogen"] * (rowfilter[0].prodPreis/1000) );
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}


			//Zusammentragen:
			if ($scope.setting.zusammentragen){
				var label = "Zusammentragen"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis +  (priceinfos["Druckbogen"] * (rowfilter[0].prodPreis/1000) );
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Liefern:
			if ($scope.setting.liefern > 0){
				var label = "Liefern"
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				//Gewicht ausrechnen und in formel einbauen?!
				var labelval = rowfilter[0].einrichtPreis + ( $scope.setting.liefern * rowfilter[0].prodPreis);
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}



			//Trennzeichen:
			//$scope.price[orderIndex] = {label: ""};
			delete orderIndex++;//orderIndex++; 

			//sum + manual entries:
			var sum = sum + $scope.setting.special[0].price + $scope.setting.special[1].price + $scope.setting.special[2].price;

			var i = 0;
			var label = "Einkaufspreis"
			typeof $scope.pricesum[i] === "undefined" ? $scope.pricesum[i] = {label: label, i : i, css: "orangeLine"} : false;
			$scope.pricesum[i][index] = { value: sum, ep: sum/auflage };
			i++;


			//Umsatz:
			var label = "Umsatz"
			typeof $scope.pricesum[i] === "undefined" ? $scope.pricesum[i] = {label: label, i : i, css: "greenLine"} : false;
			if ($scope.setting.autoprofit) {	
				var profit = defservice.curvecalc( sum, 400 , 0.60, 0.23 ); //EKP + XX% je nach Kosten	
			} else {
				var profit = sum * ($scope.setting.profit/100);
			}
			var profit_perc = defservice.roundup( ( (profit / sum ) *100),2);
			$scope.pricesum[i][index] = { value: profit, ep: profit/auflage , title:  profit_perc + "% " };
			//sum = sum+labelval
			i++; 

			var label = "Rabatt"
			if(isLegitInt($scope.setting.rabatt)) {
				typeof $scope.pricesum[i] === "undefined" ? $scope.pricesum[i] = {label: label, i : i, css: "magentaLine"} : false;
				if ($scope.setting.rabatt > profit_perc) {
					var discount = -Math.abs(profit); //is always negative or 0!
				} else {
					var discount = -Math.abs(sum*($scope.setting.rabatt/100)); //is always negative or 0!
				}
				$scope.pricesum[i][index] = { value: discount, ep: discount/auflage , title:  defservice.roundup( ( (discount / sum ) *100),2) + "% " };
				i++; 
			} else {
				var discount = 0;
			}

			sum = sum+profit+discount;
			//Nettopreis (Summe)
			var label = "Netto"
			typeof $scope.pricesum[i] === "undefined" ? $scope.pricesum[i] = {label: label, i : i, css: "blueLine"} : false;
			$scope.pricesum[i][index] = { value: sum, ep: sum/auflage };
			i++;

			var i=0;
			delete priceinfos["Druckformen"];
			angular.forEach(priceinfos, function(value, key){
				if ( value == false ) {
					typeof $scope.priceinfo[i] !== 'object'  ? $scope.priceinfo[i] = {label : key, i : i, error: true} : false;
					$scope.priceinfo[i][index] = {val: "Fehler!"};
				} else {
					typeof $scope.priceinfo[i] !== 'object'  ? $scope.priceinfo[i] = {label : key, i : i, error: false} : false;
					$scope.priceinfo[i][index] = {val: value};
				}
				i++;
			});
			delete i;
			$scope.checkboxes = checkboxes;
		});
		 //console.log($scope.priceinfo)
	}

}