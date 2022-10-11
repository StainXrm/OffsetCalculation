var myApp = angular.module('compmApp', ['ngRoute']);

// configure those main nav routes
myApp.config( function($routeProvider) {
    $routeProvider
      .when('/Calculus', {
        templateUrl: 'calculus.html',
        controller: 'CalculusCtrl'
      })

      // .when('/Costumers', {
      //   templateUrl: 'partials/phone-detail.html',
      //   // controller: 'CostumersCtrl'
      // })

      .when('/DigiCal', {
        templateUrl: 'digical.html',
        controller: 'DigiCalCtrl'
      })

      .otherwise({
        templateUrl: 'startpage.html',
        // redirectTo: '/startpage.html',
        // controller: 'StartPageCtrl'
      });
});

//service style, probably the simplest one
myApp.service('defservice', function($http, $q) {
    //guess what it does: :P
    this.round = function(zahl, n_decimals) {
        var s_nulls = "1";
        for(i=0;i<n_decimals;++i){
           s_nulls += "0";
        }
         n_decimals = s_nulls;
      zahl = (Math.round(zahl * n_decimals) / n_decimals);
        return zahl;
    };
    this.roundup = function(zahl, n_decimals) {
        var s_nulls = "1";
        for(i=0;i<n_decimals;++i){
           s_nulls += "0";
        }
         n_decimals = s_nulls;
      zahl = (Math.ceil(zahl * n_decimals) / n_decimals);
        return zahl;
    };

    this.nutzenRechner = function(sourcex,sourcey,targetx,targety,greifer,anschnitt){
      typeof greifer == "undefined" ?  greifer = 0 : false ;
      typeof anschnitt == "undefined" ?  anschnitt = 0 : anschnitt = anschnitt * 2;
      var quer = Math.floor(sourcex/(targetx+anschnitt))*Math.floor((sourcey-greifer)/(targety+anschnitt));
      var hoch = Math.floor(sourcex/(targety+anschnitt))*Math.floor((sourcey-greifer)/(targetx+anschnitt));
      if (quer >= hoch){
        return parseFloat(quer);
      } else {
        return parseFloat(hoch);
      } 
    };
    this.Gesamtgewicht = function(auflage,gm2,fox,foy,farben,seiten, bogen){
      var farbgewichtgramm = 0.5 * (fox*1000)*(foy*1000)*farben*seiten //Wäre bei DIN a 4 dann: (0,5g/m² = 50% farbdeckung) *0,21 m*0,297 m* 4 (Farben) * 2 (Seiten) = 0,24948 g 
      var papiergewichtgramm = (fox*1000)*(foy*1000)*gm2
      var verpackungpercent = 1.02;
      return farbgewichtgramm*papiergewichtgramm*bogen*auflage*verpackungpercent //gramm to kilo would be nice
    }

    this.getDateTime = function(){
      return neuesPromise = $http({
        url: "sql/func_lib.php",
        method: "POST",
        data: {GetDateTime : true},
      })  
    }

    this.perecentcalc = function(ist,soll,abpreis,bispreis){
      var perc = Math.abs( ( ( ist/soll ) -1 ) );
      console.log(perc)
      perc < bispreis ? perc = bispreis : false ; //keep price between low and highest given!
      perc > abpreis ? perc = abpreis : false ; //keep price between low and highest given!
      console.log(perc)
      var cal = perc * abpreis;
      console.log(cal)
      return this.round(cal*ist,2);
    }

    this.curvecalc = function(ist,soll,abpreis,bispreis){
      var perc = ( ist/soll ) -1;
      perc <= -1 ? perc = -1 : false ; //keep price between low and highest given!
      perc >= 0 ? perc = 0 : false ; //keep price between low and highest given!
      perc = Math.abs(perc)
      var calpreis = abpreis - bispreis
      var cal = (perc * calpreis)+bispreis;
      return this.roundup(cal*ist,2);
    }

});

isLegitInt = function(value,gt0) {
  var value = parseInt(value);
  if (isNaN(value) && !isFinite(value)) { return false}
  if (gt0 !== "undefined" && gt0 && value <= 0) {
    return false;
  } 
  return value;
}

// printit = function(divName) {
//   //alert("printing...")
//   var printContents = document.getElementById(divName).outerHTML;
//   var popupWin = window.open('', '_blank',"");
//   popupWin.document.open();
//   popupWin.document.write('<html><head>');
//   popupWin.document.write('<link rel="stylesheet" type="text/css" href="css/companym3.default.css" />');
//   popupWin.document.write('<link rel="stylesheet" type="text/css" href="css/companym3.print.css" />');
//   popupWin.document.write('</head><body>');
//   popupWin.document.write(printContents);
//   popupWin.document.write('</body>');
//   popupWin.document.write('<script>setTimeout(function(){print();}, 250); </script>'); //close();
//   popupWin.document.write('</html>');
// };

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
Number.prototype.constrain = function (min, max) {
  if( this > max ) return max
  if( this < min ) return min
  return this;
}