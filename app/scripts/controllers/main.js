'use strict';

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

angular.module('fooderApp')
  .controller('MainCtrl', function ($scope, Auth, $http, Yelp) {

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


    var callBack = function (location) {
        $scope.locationData = location.city + ',' + location.region;
    };

    NoGPS.getLocation(callBack);

    $scope.loadingFalse=1;
    $scope.businesses=1;

    $scope.search = function() {
      $scope.loading=1;
      $scope.businesses='';

          var _search = {
            location: $scope.locationData,
            term: $scope.term
          };
          Yelp.yelpSearch(_search, function (data) {
              $scope.businesses = data.businesses;
            console.log($scope.businesses);

          });
    };
  })
  .factory("Yelp", function($http) {
    return {
      "yelpSearch": function(name, callback) {
        var method = 'GET',
        url = 'http://api.yelp.com/v2/search/',
        params = {
          callback: 'angular.callbacks._0',
          location: name.location,
          oauth_consumer_key: '44dGAgblwMC4eiapEgv2Eg',
          oauth_token: 'a85eWTlMIhs34Ehs-z9ZmPxrbrVPAMnv',
          oauth_signature_method: "HMAC-SHA1",
          oauth_timestamp: new Date().getTime(),
          oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
          term: name.term
          },
        consumerSecret = '7cLJ2tyXnPmdvWDakkcyRTs4qYY',
        tokenSecret = '9qxs-Xd-d11WrjGd_96yQB-raQY',
        signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, { encodeSignature: false});
        params['oauth_signature'] = signature;
        $http.jsonp(url, {params: params}).success(callback);
      }
    }
  });
