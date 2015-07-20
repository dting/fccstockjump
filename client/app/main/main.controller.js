'use strict';

angular.module('fccstockjumpApp').controller('MainCtrl', function($scope, $http, socket) {
  $scope.awesomeThings = [];

  $http.get('/api/things').success(function(awesomeThings) {
    $scope.awesomeThings = awesomeThings;
    socket.syncUpdates('thing', $scope.awesomeThings);
  });

  $scope.addThing = function() {
    $scope.form.symbol.$setValidity('duplicate', true);
    $scope.form.symbol.$setValidity('not-found', true);
    if (!$scope.symbol || $scope.symbol === '') return;
    $scope.symbol = $scope.symbol.toLocaleUpperCase();

    if (_.find($scope.awesomeThings, {name: $scope.symbol})) {
      $scope.form.symbol.$setValidity('duplicate', false);
      return;
    }

    $http.post('/api/things', {name: $scope.symbol}).success(function() {
      $scope.symbol = '';
    }).error(function(err) {
      console.log(err);
      if (err === 'Symbol already exists.') {
        $scope.form.symbol.$setValidity('duplicate', false);
      } else if (err === 'Invalid stock symbol.') {
        $scope.form.symbol.$setValidity('not-found', false);
      }
    });
  };

  $scope.deleteThing = function(thing) {
    $http.delete('/api/things/' + thing._id);
  };

  $scope.$on('$destroy', function() {
    socket.unsyncUpdates('thing');
  });
});
