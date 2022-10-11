myApp.Calculator = function($scope, $filter, defservice)
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
				case "Schön":
					priceinfos["Druckformen"] = Math.ceil( $scope.setting.seitenZahl / iMSpB);
					priceinfos["Druckbogen"] = Math.ceil( (( auflage / (iMSpB) )  *  priceinfos["Druckformen"]) * $scope.setting.blattZahl );
					priceinfos["Maschinenbogen"] = Math.ceil( priceinfos["Druckbogen"]);
					break
				case "Umstülpen":
				case "Umschlagen":
					priceinfos["Druckformen"] = Math.ceil( ($scope.setting.seitenZahl / iMSpB) / 2 )
					priceinfos["Druckbogen"] = Math.ceil( (( auflage / ($scope.setting.offenFormat.nutzen) )  *  priceinfos["Druckformen"]) * $scope.setting.blattZahl  );
					priceinfos["Maschinenbogen"] = Math.ceil( priceinfos["Druckbogen"] * 2);
					break
				case "Schön-Wieder":

						priceinfos["Druckformen"] = Math.ceil( $scope.setting.seitenZahl / iMSpB)
						if (priceinfos["Druckformen"] === 1) {
							priceinfos["Druckformen"] = 2
						}
						priceinfos["Druckbogen"] = Math.ceil( ((($scope.setting.seitenZahl/iMSpB)/2)*auflage) * $scope.setting.blattZahl  );
						priceinfos["Maschinenbogen"] = Math.ceil( priceinfos["Druckbogen"] * 2);
					break
			}
			if ($scope.setting.druckart === "Offsetdruck") priceinfos["Druckplatten"] = isLegitInt( Math.ceil( ($scope.setting.farben * priceinfos["Druckformen"]) + $scope.setting.extraDruckplatten ) );
			if($scope.setting.seitenZahl > 0 ) priceinfos["Seiten"] = $scope.setting.seitenZahl;
			priceinfos["Rohbogen"] = isLegitInt( Math.ceil( priceinfos["Druckbogen"] / $scope.setting.druckFormat.nutzen ) );

			//Zuschuss:
			if( $scope.setting.druckart == "Digitaldruck" ){
				priceinfos["Zuschuss"] = isLegitInt( priceinfos["Druckformen"] * 5 );  //5 Bogen Zuschuss je Druckform
			} else {
				var aufschlagZuschuss = (priceinfos["Druckplatten"]*50) +( priceinfos["Maschinenbogen"]  * 0.04 ) //4 % Zuschuss + je Druckplatte 50 Bogen
				//Für Schöndruck (Rückrechnung auf Rohbogen):
				priceinfos["Zuschuss"] = isLegitInt( Math.ceil(  aufschlagZuschuss  ));
				// if( $scope.setting.duplex == "Schön" ) { priceinfos["Zuschuss"] = isLegitInt( Math.ceil( ( aufschlagZuschuss) / ($scope.setting.druckFormat.nutzen * $scope.setting.offenFormat.nutzen) ) ) }
				// //Für Duplexdruck (Rückrechnung auf Rohbogen):
				// if( $scope.setting.duplex != "Schön" ) { priceinfos["Zuschuss"] = isLegitInt( Math.ceil( ( (aufschlagZuschuss) / 2 ) / ($scope.setting.druckFormat.nutzen * $scope.setting.offenFormat.nutzen) ) ) }
				if( $scope.setting.duplex == "Schön" ) { priceinfos["Zuschuss"] = isLegitInt( Math.ceil( ( aufschlagZuschuss) / ($scope.setting.druckFormat.nutzen) ) ) }
				//Für Duplexdruck (Rückrechnung auf Rohbogen):
				if( $scope.setting.duplex != "Schön" ) { priceinfos["Zuschuss"] = isLegitInt( Math.ceil( ( (aufschlagZuschuss) / 2 ) / ($scope.setting.druckFormat.nutzen) ) ) }

			}
			if($scope.priceinfo[index] == "undefined") $scope.priceinfo[index] = [];		

			if( typeof $scope.setting.rawSheetSelect != "undefined") priceinfos["Papier"] = $scope.setting.rawSheetSelect.label +" "+$scope.setting.rawSheetSelect.gm2+"g";
			if( typeof $scope.setting.rawSheetSelect != "undefined") priceinfos["Rohformat"] = $scope.setting.rawSheetSelect.width +" x "+$scope.setting.rawSheetSelect.height+" mm";
			//if( typeof $scope.setting.rawSheetSelect != "undefined") priceinfos["Papier"] = $scope.setting.rawSheetSelect;
			priceinfos["Druckformat"] = $scope.setting.druckFormat.x+" x "+$scope.setting.druckFormat.y+" mm";
			priceinfos["Endformat"] = $scope.setting.geschlossenFormat.x+" x "+$scope.setting.geschlossenFormat.y+" mm";

			//Offset:
			if ($scope.setting.druckart === "Offsetdruck"){
					//Vorstufe (Arbeitszeit Büro):
					var label = "Vorstufe"
					var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
					typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
					if($scope.setting.verwaltung === 'Ja'){
						var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( $scope.setting.satzZeit, rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis )
					} else {
						var labelval = defservice.curvecalc( $scope.setting.satzZeit, rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis )
					}
					$scope.price[orderIndex][index] = {value: labelval, ep: labelval/$scope.setting.satzZeit};
					var sum = sum + labelval;
					orderIndex++;
				//Druckplatten:
				var label = "Druckplatten"
				if( isLegitInt( priceinfos[label]) ){
					var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
					typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
					var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( priceinfos[label], rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis )
					$scope.price[orderIndex][index] = {value: labelval, ep: labelval/priceinfos["Druckplatten"]};
					var sum = sum + labelval;
					orderIndex++;
				}

				//Einrichten:
				var label = "Einrichten"
				if( isLegitInt( priceinfos["Druckplatten"] ) ) {
					var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
					typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
					var einrichtPreis = rowfilter[0].einrichtPreis;
					if ($scope.setting.extraDruckplattenEinrichten === "Ja") {
						if ($scope.setting.ek_half === 'Ja') {
							var labelval =  (einrichtPreis + defservice.curvecalc( priceinfos["Druckplatten"]+ $scope.setting.extraDruckplatten, rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis ))/2
						} else {
							var labelval =  einrichtPreis + defservice.curvecalc( priceinfos["Druckplatten"]+ $scope.setting.extraDruckplatten, rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis )
						}
					} else {
						if ($scope.setting.ek_half === 'Ja') {
							var labelval = (einrichtPreis + defservice.curvecalc( priceinfos["Druckplatten"], rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis ))/2
						} else {
							var labelval = einrichtPreis + defservice.curvecalc( priceinfos["Druckplatten"], rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis )
						}
					}
					$scope.price[orderIndex][index] = {value: labelval, ep: labelval/priceinfos["Druckplatten"]};
					var sum = sum + labelval;
					orderIndex++;
				}
				//Offsetdruck:
				if (priceinfos["Maschinenbogen"] > 0){
					var label = "Offsetdruck"
					var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
					typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
					var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( priceinfos["Maschinenbogen"], rowfilter[0].bisMenge , rowfilter[0].abPreis / 1000, rowfilter[0].bisPreis / 1000 )
					$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
					var sum = sum + labelval;
					orderIndex++;
				}
			}

			//Digitaldruck:
			if ($scope.setting.druckart === "Digitaldruck"){
					//Vorstufe (Arbeitszeit Büro):
					var label = "Vorstufe"
					var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
					typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
					if($scope.setting.verwaltung === 'Ja'){
						var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( $scope.setting.satzZeit, rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis )
					} else {
						var labelval = defservice.curvecalc( $scope.setting.satzZeit, rowfilter[0].bisMenge , rowfilter[0].abPreis , rowfilter[0].bisPreis )

					}
					$scope.price[orderIndex][index] = {value: labelval, ep: labelval/$scope.setting.satzZeit};
					var sum = sum + labelval;
					orderIndex++;

				//Rechnung über Quadratmeterpreis
				var label = "Digitaldruck"
				if( isLegitInt( priceinfos["Maschinenbogen"] ) ) {
					var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
					typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
					// var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( priceinfos["Maschinenbogen"], rowfilter[0].bisMenge , rowfilter[0].abPreis / 1000, rowfilter[0].bisPreis / 1000 )
					// var sizepercent = ($scope.setting.druckFormat.x/1000) * ($scope.setting.druckFormat.y/1000)
					// sizepercent = sizepercent.constrain(0.036,0.144);//A5+ = 0.036, SRA3 = 0,144
					// sizepercent = sizepercent.map(0.036,0.144,0.25,1); //map to percent = A5+ is 25% of SRA3
					// colorpercent = ($scope.setting.farben/4);
					if( $scope.setting.farben == 4 ) { //Preisabstufung bei weniger farben!
						colorpercent = 1;
					} else if ($scope.setting.farben == 3){
						colorpercent = 0.75;
					} else if ($scope.setting.farben == 2){
						colorpercent = 0.5;
					} else if ($scope.setting.farben == 1){
						colorpercent = 0.25;
					} else {
						colorpercent = 1;
					}
					var labelval = rowfilter[0].einrichtPreis + (defservice.curvecalc( priceinfos["Maschinenbogen"], rowfilter[0].bisMenge , (rowfilter[0].abPreis / 1000) * colorpercent, (rowfilter[0].bisPreis / 1000) ) * colorpercent);
					$scope.price[orderIndex][index] = {value: labelval, ep: labelval/priceinfos["Maschinenbogen"]};
					var sum = sum + labelval;
					orderIndex++;
				}
			}

			//Papier:
			if( isLegitInt(priceinfos["Rohbogen"]) ){
				var label = "Papier"
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				//$scope.price[label][index] = { value: defservice.round(( ($scope.setting.rohbogenPreis / $scope.setting.druckFormat.nutzen) / 1000 ) * priceinfos["Druckbogen"],2 ) };
				var labelval = defservice.round(( $scope.setting.rohbogenPreis / 1000 ) * ( priceinfos["Rohbogen"]+priceinfos["Zuschuss"]),2 ) 
				$scope.price[orderIndex][index] = { value: labelval, ep: labelval/( priceinfos["Rohbogen"]+priceinfos["Zuschuss"])};
				var sum = sum + labelval;
				orderIndex++;
			}


			//Falzen:
			if ($scope.setting.falzen === "Ja"){
				var label = "Falzen"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( priceinfos["Maschinenbogen"], rowfilter[0].bisMenge , rowfilter[0].abPreis / 1000, rowfilter[0].bisPreis / 1000 )
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Heften:
			if ($scope.setting.heften === "Ja"){
				var label = "Heften"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( auflage, rowfilter[0].bisMenge , rowfilter[0].abPreis / 1000, rowfilter[0].bisPreis / 1000 )
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Formatschnitt:
			if ($scope.setting.formatschnitt === "Ja"){
				var label = "Formatschnitt"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( priceinfos["Druckbogen"]*$scope.setting.offenFormat.nutzen, rowfilter[0].bisMenge , rowfilter[0].abPreis / 1000, rowfilter[0].bisPreis / 1000 )
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Verpackung:
			if ($scope.setting.verpacken === "Ja"){
				var label = "Verpackung"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( priceinfos["Maschinenbogen"], rowfilter[0].bisMenge , rowfilter[0].abPreis / 1000, rowfilter[0].bisPreis / 1000 )
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Farbwaschen:
			if ($scope.setting.farbWaschen > 0){
				var label = "Farbwaschen"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( $scope.setting.farbWaschen, rowfilter[0].bisMenge , rowfilter[0].abPreis, rowfilter[0].bisPreis)
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Lackieren:
			if ($scope.setting.lackieren == 'Ja'){
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
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( lc_bogen, rowfilter[0].bisMenge , rowfilter[0].abPreis /1000, rowfilter[0].bisPreis /1000)
				console.log(lc_bogen)
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Laminieren:
			if ($scope.setting.cellophanieren == 'Ja'){
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
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( lc_bogen, rowfilter[0].bisMenge , rowfilter[0].abPreis /1000, rowfilter[0].bisPreis /1000)
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Leimen:
			if ($scope.setting.leimen == 'Ja'){
				var label = "Leimen"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( priceinfos["Druckbogen"], rowfilter[0].bisMenge , rowfilter[0].abPreis /1000, rowfilter[0].bisPreis /1000)
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Lochen:
			if ($scope.setting.lochen == 'Ja'){
				var label = "Lochen"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				//2er oder 4er Lochung!?!?!?!?!
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( priceinfos["Druckbogen"], rowfilter[0].bisMenge , rowfilter[0].abPreis /1000, rowfilter[0].bisPreis /1000)
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Personalisieren:
			if ($scope.setting.perosonalieren == 'Ja'){
				var label = "Personalisieren"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( auflage, rowfilter[0].bisMenge , rowfilter[0].abPreis /1000, rowfilter[0].bisPreis /1000)
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Rillen/Stanzen:
			if ($scope.setting.rillenStanzen == 'Ja'){
				var label = "Rillen/Stanzen"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( priceinfos["Druckbogen"], rowfilter[0].bisMenge , rowfilter[0].abPreis /1000, rowfilter[0].bisPreis /1000)
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}


			//Zusammentragen:
			if ($scope.setting.zusammentragen == 'Ja'){
				var label = "Zusammentragen"
				checkboxes.push(label);
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( auflage, rowfilter[0].bisMenge , rowfilter[0].abPreis /1000, rowfilter[0].bisPreis /1000)
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}

			//Liefern:
			if ($scope.setting.liefern > 0){
				var label = "Liefern"
				var rowfilter = $filter('filter')($scope.setting.price, {Label: label}, true);
				typeof $scope.price[orderIndex] === "undefined" ? $scope.price[orderIndex] = {label: label, i : orderIndex} : false;
				//Gewicht ausrechnen und in formel einbauen!!!!!
				var labelval = rowfilter[0].einrichtPreis + defservice.curvecalc( $scope.setting.liefern, rowfilter[0].bisMenge , rowfilter[0].abPreis, rowfilter[0].bisPreis)
				$scope.price[orderIndex][index] = {value: labelval, ep: labelval/auflage};
				var sum = sum + labelval;
				orderIndex++;
			}



			//Trennzeichen:
			//$scope.price[orderIndex] = {label: ""};
			delete orderIndex++;//orderIndex++; 

			//sum + manual entries:
			var sum = sum + $scope.setting.special[0].price + $scope.setting.special[1].price + $scope.setting.special[2].price;

			//Umsatz:
			var i = 0;
			var label = "Gewinn"
			typeof $scope.pricesum[i] === "undefined" ? $scope.pricesum[i] = {label: label, i : i, css: "greenLine"} : false;
			if ($scope.setting.autoprofit) {
				if($scope.setting.druckart === "Offsetdruck"){
					var profit = defservice.curvecalc( sum, 3000 , 0.30, 0.15 ); //30% bis 15% bei €3000 im Offsetdruck;
				} else {
					var profit = defservice.curvecalc( sum, 500 , 0.35, 0.15 ); //35% bis 15% bei €500 im Digitaldruck;
				}
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
			//Brutto (Summe)
			var label = "Brutto"
			typeof $scope.pricesum[i] === "undefined" ? $scope.pricesum[i] = {label: label, i : i, css: "orangeLine"} : false;
			$scope.pricesum[i][index]  = { value: sum *( $scope.setting.mwst / 100+1), ep: sum *( $scope.setting.mwst / 100+1)/auflage };
			delete i;//i++;  

			var i=0;
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
		//console.log($scope.checkboxes);
		 //console.log($scope.pricesum)
		 console.log($scope.priceinfo)
	}

}