var app = angular.module('mainApp',['ngCookies']);
app.controller('app', function ($scope, $cookies) {
    $scope.myCookieVal={};
    $scope.myCookieVal.one = $cookies.get('cookie');
    $scope.myCookieVal.two = $cookies.get('cook');
    $scope.setCookie = function(val){
        $cookies.put('cookie', val.one);
        $cookies.put('cook', val.two);
    };

});