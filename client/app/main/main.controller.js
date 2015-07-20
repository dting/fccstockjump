'use strict';

angular.module('fccstockjumpApp').controller('MainCtrl',
  function($scope, $http, socket) {
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

    $scope.$watchCollection('awesomeThings', function(newVals, oldVals) {
      if (newVals.length > oldVals.length) {
        var newStocks = _.difference(newVals, oldVals);
        _.each(newStocks, function(newStock) {
          var s = {name: newStock.name, data: []};
          _.each(newStock.info, function(point) {
            s.data.push([new Date(point.date).valueOf(), point.close]);
          });

          $scope.chartConfig.series.push(s);
        });
      } else if (newVals.length < oldVals.length) {
        var removedStocks = _.difference(oldVals, newVals);
        _.each(removedStocks, function(removedStock) {
          _.remove($scope.chartConfig.series, {name: removedStock.name});
        });
      }
    });

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.chartConfig = {
      options: {
        chart: {}, rangeSelector: {
          buttons: [
            {
              type: 'week', count: 1, text: '1w'
            }, {
              type: 'month', count: 1, text: '1m'
            }, {
              type: 'all', text: 'All'
            }
          ],
          inputEnabled: false
        }, navigator: {
          enabled: true
        }, exporting: {
          enabled: false
        }
      }, series: [], title: {}, useHighStocks: true
    };

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });
  });
