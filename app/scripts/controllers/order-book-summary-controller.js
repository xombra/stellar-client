var sc = angular.module('stellarClient');

sc.controller('OrderBookSummaryCtrl', function($scope) { 

  $scope.$on("trading:order-book-updated", function(e, orderBook) {
    if(orderBook === $scope.currentOrderBook) {
      $scope.loadOrderBookSummary();
    }
  });

  $scope.$watch("currentOrderBook", function() {
    $scope.loadOrderBookSummary();
  });

  $scope.loadOrderBookSummary = function() {
    if($scope.currentOrderBook) {
      var summary = $scope.currentOrderBook.getSummary();
      $scope.highestBid = summary.highestBid;
      $scope.lowestAsk  = summary.lowestAsk;
      $scope.spread     = summary.spread;
    } else {
      $scope.highestBid = null;
      $scope.lowestAsk  = null;
      $scope.spread     = null;
    }
  };


});