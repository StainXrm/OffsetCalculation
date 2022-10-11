
myApp.controller('CalculusCtrl',  function($scope, $http, defservice, $anchorScroll, $location, $filter, $timeout, $q) {
	myApp.Calculator($scope, $filter, defservice);
	//myApp.SaveLoad($scope, $filter, defservice);
	$scope.$on('$routeChangeStart', function(ev,nURL, oURL) {		
		if(nURL.$$route.originalPath == "/Calculus") //no reload inside /Calculus
		{
	  		ev.preventDefault();
		}
	});

	$scope.setting = {
		auflage : [1000,5000], 
		mwst : 20,
		rabatt : 0,
		rohbogenpreis : 0,
		druckFormat : {x: 450, y:320, nutzen: 0},
		offenFormat : {x: 210, y:297, nutzen: 0, greiferRand: 9, anschnitt: 2},
		geschlossenFormat : {x: 210, y:297, nutzen: 0},
		druckart : "Offsetdruck",
		duplex : "Schön",
		satzZeit : 5,
		verpacken : 'Ja',
		formatschnitt : 'Ja',
		farben : 4,
		verwaltung: 'Ja',
		seitenZahl : 1,
		farbWaschen : 0,
		extraDruckplatten : 0,
		blattZahl : 1,
		liefern : 0,
		rohbogenPreis : "",
		autoprofit : true,
		lc_duplex : 2,
		special : 
		[{price:0},{price:0},{price:0}]
	};

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
    	console.log(data)
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
				url: "sql/calculus.php",
				method: "POST",
				data: {"InsertUpdateRow" : "calculus_preise",'PID' : PID, data},
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
    	//"Umsatz" : "je Preis" , 
		"Druckplatten" : "Stück" , 
		"Einrichten" : "Druckplatte", 
		"Farbwaschen" : "Farbe", 
		"Vorstufe" : "Minute", 
		"Offsetdruck" : "TBg. Maschinenbogen", 
		"Heften" : "TBg. Auflagebogen", 
		"Zusammentragen" : "TBg. Auflagebogen", 
		"Falzen" : "TBg. Auflagebogen", 
		"Leimen" : "TBg. Druckbogen", 
		"Laminieren" : "TBg. Druckbogen", 
		"Lackieren" : "TBg. Druckbogen", 
		"Formatschnitt" : "TBg. Maschinenbogen", 
		"Lochen" : "TBg. Druckbogen", 
		"Liefern" : "km", 
		"Personalisieren" : "TBg. Auflagebogen", 
		"Rillen/Stanzen" : "TBg. Druckbogen", 
		"Digitaldruck" : "TBg. Maschinenbogen",
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
			"abPreis" : 0,
			"bisMenge" : 0,
			"bisPreis" : 0
		}
		$scope.setting.price.push(elem)
		i++;
	});
	delete i;

	$http({
		url: "sql/calculus.php",
		method: "POST",
		data: {GetTableContents : "calculus_preise"},
	})	
	.success( function(response) {
			for (var i = 0 ; i < response.length; i++) { 
				//var data = LZString.decompress(response[i].Data);
				var data = angular.fromJson(response[i].Data);
				data.PID = response[i].PID;
				$scope.setting.price[data.PID] = {
					PID : data.PID,
					Label : data.Label,
					Datum : data.Datum,
					Einheit : data.Einheit,
					einrichtPreis: data.einrichtPreis,
					abPreis : data.abPreis,
					bisMenge : data.bisMenge,
					bisPreis : data.bisPreis
				} 
			}
	})

	//Rawpaper
	$scope.orderrawpaper = '-datum';


	$http({
		url: "sql/calculus.php",
		method: "POST",
		data: {GetTableContents : "calculus_papier"},
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
				url: "sql/calculus.php",
				method: "POST",
				data: {"InsertUpdateRow" : "calculus_papier",'PID' : PID, "data" : dataJSON},
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
			url: "sql/calculus.php",
			method: "POST",
			data: {"DelItem" : "calculus_papier" , "PID" : PID}
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

	$scope.saveasselects = [
	    { value: 0, label: "Vorlage" },
	    { value: 1, label: "Angebot" },
	    { value: 2, label: "Auftrag" },
	    { value: 3, label: "Rechnung" },
	];	
	$scope.saveasselects.sel = { value: 0, label: "Vorlage" };
	$scope.saveasselector = function(){
		console.log($scope.priceinfo);
		// alert($scope.saveasselects.sel.label)

	}



});