'use strict';

angular.module('fccstockjumpApp').controller('MainCtrl', function($scope, $http, socket) {
  $scope.awesomeThings = [];

  $http.get('/api/things').success(function(awesomeThings) {
    $scope.awesomeThings = awesomeThings;
    socket.syncUpdates('thing', $scope.awesomeThings);
  });

  $scope.addThing = function() {
    if (!$scope.symbol || $scope.symbol === '') return;
    $scope.symbol = $scope.symbol.toLocaleUpperCase();

    if (_.find($scope.awesomeThings, {name: $scope.symbol})) {
      return;
    }

    $http.post('/api/things', {name: $scope.symbol}).then(function() {
      $scope.symbol = '';
    }, function(err) {
      // TODO: Add error message to form.
      console.log(err);
    });
  };

  $scope.deleteThing = function(thing) {
    $http.delete('/api/things/' + thing._id);
  };

  $scope.$on('$destroy', function() {
    socket.unsyncUpdates('thing');
  });
});
