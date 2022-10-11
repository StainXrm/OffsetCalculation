
myApp.controller('ToDoCtrl',  function($scope, $http, defservice, $anchorScroll, $location, $filter, $timeout, $q) {
	$scope.todos = []; //get em from db!!!!
	$scope.editshow = false;
  $scope.markAll = false;
    
  $scope.addTodo = function() {
      if(event.keyCode == 13 && $scope.todoText){
        	//$scope.todos.push(data);
        	this.savetoDb({text:$scope.todoText, done:false});
        	$scope.todoText = '';
      }
  };
  $scope.isTodo = function(){
      return $scope.todos.length > 0;  
  }
  $scope.editOnEnter = function(todo, pid){
      if(event.keyCode == 13 && todo.text){
          todo.editshow = false;
          this.savetoDb(todo, pid);
      }
  };
    
  $scope.remaining = function() {
    var count = 0;
    angular.forEach($scope.todos, function(todo) {
      count += todo.done ? 0 : 1;
    });
    return count;
  };

  $scope.hasDone = function() {
      return ($scope.todos.length != $scope.remaining());
  }    
    
  $scope.itemText = function() {
      return ($scope.todos.length - $scope.remaining() > 1) ? "items" : "item";     
  };
  
  $scope.clear = function() {
    var oldTodos = $scope.todos;
    $scope.todos = [];
    angular.forEach(oldTodos, function(todo) {
      if (!todo.done) $scope.todos.push(todo);
      if (todo.done) {
      	$scope.delfromDb(todo.pid);
      }
    });
  };

  $scope.savetoDb = function(todo, pid) {
  	delete todo.pid;
  	//console.log(todo)
  	var data = angular.toJson(todo);
  	//if (typeof index == "undefined") index = "NULL"; //an fucking index isn't an id, moron!
  	$http({
		url: "sql/todo.php",
		method: "POST",
		data: {"Save" : "todo_1",'PID' : pid , data }
	}).success(function(response){	
		//console.log(response)
		if (typeof parseInt(response) === "number") todo.pid = parseInt(response);
		if ($scope.todos.indexOf(todo) == -1) $scope.todos.push(todo);

	})
  }

  $scope.delfromDb = function(pid) {
  	$http({
		url: "sql/todo.php",
		method: "POST",
		data: {"Delete" : "todo_1",'PID' : pid }
	})
  }

  $scope.getfromDb = function() { //get whats in the db!
  	$http({
		url: "sql/todo.php",
		method: "POST",
		data: {"Get" : "todo_1"}
	}).success(function(response){	
		for (var i = 0 ; i < response.length; i++) { 
			var data = angular.fromJson(response[i].Data);
			data.pid = angular.fromJson(response[i].PID);
			$scope.todos.push(data);
		}
	})
  }
  $scope.getfromDb();
  
});