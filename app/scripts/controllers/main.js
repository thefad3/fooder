'use strict';

angular.module('fooderApp')
  .controller('MainCtrl', function ($scope, Auth) {


      $scope.signup = function(){

        Auth.$createUser({
          email: $scope.register.email,
          password: $scope.register.password
        }).then(function(userData) {

          console.log("User " + userData.uid + " created successfully!");
        })

      };


    $scope.login = function(){
      Auth.$authWithPassword({
        email: $scope.login.email,
        password: $scope.login.password
      }).then(function(authData) {
        $scope.authData = authData;
        console.log(authData);
        console.log("Logged in as:", authData.uid);
      }).catch(function(error) {
        console.error("Authentication failed:", error);
      });
    };


  });
