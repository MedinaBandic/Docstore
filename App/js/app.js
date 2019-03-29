 var app = angular.module( 'Docstore', [ 'ngMaterial', 'ui.router', 'md.data.table'] );
 
 app.controller("homeController", function ($scope, $http, $rootScope){

 	var req = {
 		method: 'GET',
 		url: 'http://localhost:3001/allDocs'
 	}

 	var updateDocs = function() {
	 	$http(req).then(function(data){
	 		$scope.documents = data.data;
	 	}, function(err){
	 		console.log("failed");

	 	});
	}
	updateDocs();

 	$scope.deleteDoc = function(id) {
 		$http.delete("http://localhost:3001/delDoc?id="+id).then(function() {
 			updateDocs();
 		})
 	}

    $scope.getSelectedRating = function (rating) {
        console.log(rating);
    }

 });

 app.controller("detailsController", function ($scope, $http, $state, $mdDialog, $rootScope, $timeout){

 	var id = $state.params.id;

 	var req = {
 		method: 'GET',
 		url: 'http://localhost:3001/details/?id='+id
 	}

 	$http(req).then(function(data){
 		$scope.oneDoc = data.data[0];
 		console.log($scope.oneDoc);

 	}, function(err){
 		console.log("failed");
 	});

  /////////

 	$scope.documentTransaction = {
 		doc_id: id,
 		member_id: $rootScope.user.member_id
 	}

  $scope.postTransaction = function (){
    var postReq = {
      method: 'POST',
      url: 'http://localhost:3001/transactions',
      data: $scope.documentTransaction
    }

    $http(postReq).then(function(data){
      console.log("success");
    }, function(err){
      console.log("failed");
    });
  }
  //////////////////////////

 	// stars and comments

 	var feedbackReq = {
 		method: 'GET',
 		url: 'http://localhost:3001/feedbacks?id='+id
 	}

 	$http(feedbackReq).then(function(data){

    var size = data.data.length;
    var stars = data.data[size-1].rating;

    delete data.data[size-1];
    data.data.length = data.data.length - 1;

 		$scope.feedback = data.data;
    console.log($scope.feedback);

 		//var size = $scope.feedback.length;
 		//var stars = $scope.feedback[size-1].rating;

 		$scope.rating = 0;
	    $scope.ratings = [{    	
	        current: stars,
	        max: 5
	    }];

 	}, function(err){
 		console.log("failed");
 	});
	

    $scope.getSelectedRating = function (rating) {
        console.log(rating);
    }

 	//dialog 

 	$scope.showTabDialog = function(ev) {
 		$mdDialog.show({
 			controller: ratingController(id),
 			scope: $scope.$new(),
 			templateUrl: '/Views/rateDialog.html',
 			parent: angular.element(document.body),
 			targetEvent: ev,
 			clickOutsideToClose:true
 		})
 		.then(function(answer) {
 			$scope.status = 'You said the information was "' + answer + '".';
 		}, function() {
 			$scope.status = 'You cancelled the dialog.';
 		});
 	};


 	function ratingController(id){

 		$scope.rating = 0;
 		$scope.star = 1;

	    $scope.rating = {    	
	        current: $scope.star,
	        max: 5
	    };

 		$scope.hide = function() {
			$mdDialog.hide();
		};
		$scope.cancel = function() {
			$mdDialog.cancel();
		};
		$scope.answer = function(answer) {
			$mdDialog.hide(answer);

			if(answer == 'rate'){

				var obj = {};

				obj.comment = $scope.feedback.comment;
			    obj.rate = $scope.rating.current;
			    obj.doc_id = id;

			   	var postReq = {
			 		method: 'POST',
			 		url: 'http://localhost:3001/feedback',
			 		data: obj
			 	}

			 	$http(postReq).then(function(data){
			 		console.log("success");
          $state.reload();

			 	}, function(err){
			 		console.log("failed");
			 	});

			}
		};
 	}
	


 });

 app.controller("userController", function ($scope, $state, $http, $rootScope, $timeout){

 	var id;
 	id = $rootScope.user.member_id;

 $timeout(function(){

 		var req = {
	 		method: 'GET',
	 		url: 'http://localhost:3001/user?id='+id
	 	}

	 	$http(req).then(function(data){

	 		$scope.currentUser = data.data[0];
	 		console.log($scope.currentUser);

	 	}, function(err){
	 		console.log("failed");
	 	});

	 	var reqTransactions = {
	 		method: 'GET',
	 		url: 'http://localhost:3001/transactions?id='+id
	 	}

	 	$http(reqTransactions).then(function(data){

	 		$scope.transactions = data.data;
	 		//console.log($scope.transactions);

	 	}, function(err){
	 		console.log("failed");
	 	});

 	},1000)
 	
 	// table
 	$scope.selected = [];

	$scope.query = {
		order: 'name',
		limit: 5,
		page: 1
	};


 });

 app.controller("loginController", function ($scope, $timeout, $http, $location, $rootScope) {

 	$scope.login = {};

 	$scope.logingIn = function(login) {

 		$scope.error = "";
 		var req = {
 			method: 'POST',
 			url: 'http://localhost:3001/login',
 			data: login
 		}


 		$http(req).then(function(data){
 			$rootScope.user = data.data;
 			$location.path("/");
 		}, function(err){
 			$scope.error = "Error logging in";
 		});

 	}

 });

 app.controller("logoutController", function( $rootScope, $location, $http) {
 	$rootScope.user = null;
 	$http.delete("/me");
 	$location.path('/');
 });

 app.controller("registerController", function ($scope, $timeout, $http, $location) {

 	$scope.register = {};

 	$scope.registerIn = function(register) {


 		var req = {
 			method: 'POST',
 			url: 'http://localhost:3001/register',
 			data: register
 		}

 		if (register.password != register.repeat_password)
 		{
 			$scope.error = "Passwords are not equal";
 			return;
 		}

 		$scope.error = "";

 		$http(req).then(function(data){
 			$location.path("/");
 		}, function(err){
 			$scope.error = "Error registering";
 		});

 	}

 });

  app.controller("addDocController", function ($rootScope, $scope, $timeout, $http, $location, $state) {

 	$scope.addDoc = {};
 	var id = $state.params.id;

 

 	$http.get('http://localhost:3001/languages').success(function(languages) {
 		$rootScope.languages = languages;
 		if (!id)
 			$scope.addDoc.language_id = languages[0].Language_id;
 	});

 	$http.get('http://localhost:3001/genre').success(function(genres) {
 		$rootScope.genres = genres;
 		if (!id)
 			$scope.addDoc.genre_id = genres[0].Genre_id;
 	});

 	if (id) {
 		$scope.submitText = "Submit";
 	} else {
 		$scope.submitText = "Add";
 	}

 	if (id) {
 		$http.get("http://localhost:3001/details?id=" + id).success(function(data) {
 			data = data[0];
 			$scope.addDoc.author = data.Author;
 			$scope.addDoc.title = data.Title;
 			$scope.addDoc.language_id = data.Language_id;
 			$scope.addDoc.edition = data.Edition;
 			$scope.addDoc.genre_id = data.Genre_id;
 			$scope.addDoc.short_version = data.Short_Version;
 			$scope.addDoc.full_version = data.Full_Version;
      $scope.addDoc.description = data.Description;

 			$scope.addDoc.id = id;
 		});
 	};

 	$scope.adding = function(addDoc) {

 		console.log(addDoc);

 		var req = {
 			method: 'POST',
 			url: 'http://localhost:3001/addDoc',
 			data: addDoc
 		};
 		if (id) {
 			req = {
	 			method: 'POST',
	 			url: 'http://localhost:3001/editDoc',
	 			data: addDoc
	 		};
 		}

 		
 		$scope.error = "";

 		$http(req).then(function(data){
 			$location.path("/success");
 		}, function(err){
 			$scope.error = "Error adding";
 		});

 	}

 });


app.directive('starRating', function () {
    return {
        restrict: 'A',
        template: '<ul class="rating">' +
            '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
            '\u2605' +
            '</li>' +
            '</ul>',
        scope: {
            ratingValue: '=',
            max: '=',
            onRatingSelected: '&'
        },
        link: function (scope, elem, attrs) {

            var updateStars = function () {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };

            scope.toggle = function (index) {
                scope.ratingValue = index + 1;
                scope.onRatingSelected({
                    rating: index + 1
                });
            };

            scope.$watch('ratingValue', function (oldVal, newVal) {
                if (newVal) {
                    updateStars();
                }
            });
        }
    }
});

 app.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/");
  //
  // Now set up the states
  $stateProvider
  .state('home', {
  	url: "/",
  	templateUrl: "Views/home.html",
  	controller:"homeController"
  })
  .state('user', {
  	url: "/user",
  	templateUrl: "Views/user.html",
  	controller:"userController"
  })
  .state('login', {
  	url: "/login",
  	templateUrl: "Views/login.html",
  	controller: "loginController"
  })
  .state('register', {
  	url: "/register",
  	templateUrl: "Views/register.html",
  	controller: "registerController"
  })
  .state('addDoc', {
  	url: "/addDoc",
  	templateUrl: "Views/addDoc.html",
  	controller: "addDocController"
  })
  .state('editDoc', {
  	url: "/editDoc/:id",
  	templateUrl: "Views/addDoc.html",
  	controller: "addDocController"
  })
  .state('details', {
  	url: "/details/:id",
  	templateUrl: "Views/description.html",
  	controller: "detailsController"
  })
  .state('logout', {
  	url: "/logout",
  	controller: "logoutController"
  });

  $mdThemingProvider.theme('default')
    .primaryPalette('teal')
    .accentPalette('orange');

});

app.run(function($rootScope, $http) {
	$http.get('http://localhost:3001/me').success(function(data) {
		$rootScope.user = data;
	});
	console.log('run');
});