myApp.controller('CustomersCtrl',  function($scope, $http, defservice, $anchorScroll, $location, $filter, $timeout, $q) {

	$scope.$on('$routeChangeStart', function(ev,nURL, oURL) {		
		if(nURL.$$route.originalPath == "/Customers") //no reload inside /Costumers
		{
	  		ev.preventDefault();
		}
	});
	$scope.new = [];
	$scope.new.customer = [];
	$scope.submitNew = function() {
		console.log($scope.new.customer)
		// var data = angular.toJson($scope.new.customer);
		var data = [];


		//Make global function for scope object to json!!!!!
		for (var key in $scope.new.customer) {
			var tempObj = {};
			tempObj[key] = $scope.new.customer[key];
			data.push(tempObj);
		};
		data = angular.toJson(data)
		//Make global function for scope object to json----

		console.log(data)
	    $http({
			url: "/sql/customers.php",
			method: "POST",
			data: {"Save" : "kunden", data},
		}).success(function(response){	
			console.log(response)
		})
	};

	//Submenu Navigator
	$scope.anchor = 1;
    $scope.gotoAnchor = function(x) {
      var newHash = 'anchor' + x;
      if ($location.hash() !== newHash) {
        // set the $location.hash to `newHash` and
        // $anchorScroll will automatically scroll to it
        // var a1 =defservice.getDateTime();
        // $q.all([a1]).then(function(responsesArray)
        // {
        // 	 $scope.setting.currentdatetime = responsesArray[0].data;
        // }) 
        $location.hash(newHash);
        $anchorScroll(newHash);
        $scope.anchor = x;
      } else {
        // call $anchorScroll() explicitly,
        // since $location.hash hasn't changed
        $anchorScroll();
      }
    };
})