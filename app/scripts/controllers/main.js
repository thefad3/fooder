'use strict';

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;

}
angular.module('fooderApp')
  .controller('authPage', function($scope,$firebaseArray, Auth, $http, Ref, $firebaseObject, $timeout, $location, Yelp){
    $scope.callbBackId=0;
    $scope.business_index=0;
    var _authDataReturned = Auth.$getAuth();
    var fb = new Firebase('https://coderr.firebaseio.com/' + _authDataReturned.uid);
    var obj = $firebaseObject(fb);

    $scope.authData = obj;

    if(_authDataReturned.length > 1){
      $location.path('/#/');
    }

    var callBack = function (location) {
      //Location data for when Page loads
      $scope.locationData = location.city + ',' + location.region;

      //Google maps location generator and map generator
      $scope.showPosition = function(position) {
        var latlon = position.latitude + "," + position.longitude;
        var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="
          +latlon+"&zoom=14&size=900x350&sensor=false&format=png&visual_refresh=true&markers=size:mid%7Ccolor:0xff0000%7Clabel:1%7C"+latlon;
        document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
      };

      var _searchLoad = {
        location: $scope.locationData,
        term: 'food',
        callbackId: 0
      };
      Yelp.yelpSearch(_searchLoad, function(data){
        $scope.viewData = data.businesses;
      })
    };

    NoGPS.getLocation(callBack);

    $scope.comment = function(x, a){
      var fb = new Firebase('https://coderr.firebaseio.com/' + x.id);
      var arry = $firebaseArray(fb);
      arry.$add({ comments: a, pid: _authDataReturned.uid }).then(function(data){
          console.log('Success, posted!');
      });
    };

    $scope.like = function(index){
      var fb = new Firebase('https://coderr.firebaseio.com/' + _authDataReturned.uid+'/like');
      var obj = $firebaseObject(fb);
      fb.push({like:index});

      $scope.next();
    };
    $scope.dislike = function(index){
      var fb = new Firebase('https://coderr.firebaseio.com/' + _authDataReturned.uid+'/dislike');
      var obj = $firebaseObject(fb);
      fb.push({like:index});
      $scope.next();
    };


    $scope.next = function(){
      if($scope.business_index >= $scope.viewData.length -1){
        $scope.business_index=0;
      }else{
        $scope.business_index ++;
      }
    };


    $scope.search = function() {
      $scope.viewData=[];
      $scope.callbBackId++;
      var _search = {
        location: $scope.locationData,
        term: $scope.term,
        callbackId: $scope.callbBackId
      };
      Yelp.yelpSearch(_search, function(data){
        $scope.viewData = data.businesses;
      });

    };


  })
  .controller('MainCtrl', function ($scope, Auth, $location, Ref) {
      $scope.signup = function(){
        Auth.$createUser({
          email: $scope.register.email,
          password: $scope.register.password
        }).then(function(userData) {

          var usersRef = Ref.child("/"+userData.uid);
          usersRef.set(userData);
        })
      };

    $scope.login = function(){
      Auth.$authWithPassword({
        email: $scope.login.email,
        password: $scope.login.password
      }).then(function(authData) {
        $scope.authData = authData;
        $scope.auth = true;
        var usersRef = Ref.child("/"+authData.uid);
        usersRef.set(authData);
        $location.path( "/account");
      }).catch(function(error) {
        $scope.auth = false;
        console.error("Authentication failed:", error);
      });
    };

  })
  .factory("Yelp", function($http) {
    return {
      "yelpSearch": function (name, callback) {
        var method = 'GET',
          url = 'https://api.yelp.com/v2/search/',
          params = {
            callback: 'angular.callbacks._'+name.callbackId,
            location: name.location,
            oauth_consumer_key: '44dGAgblwMC4eiapEgv2Eg',
            oauth_token: 'a85eWTlMIhs34Ehs-z9ZmPxrbrVPAMnv',
            oauth_signature_method: "HMAC-SHA1",
            oauth_timestamp: new Date().getTime(),
            oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzA'),
            term: name.term
          },
         consumerSecret = '7cLJ2tyXnPmdvWDakkcyRTs4qYY',
          tokenSecret = '9qxs-Xd-d11WrjGd_96yQB-raQY',
          signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, {encodeSignature: false});
        params['oauth_signature'] = signature;
        $http.jsonp(url, {params: params}).success(callback);
      }
    }
  })
