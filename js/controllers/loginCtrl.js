/**
 * Created by RoGGeR on 30.05.17.
 */
app.controller('loginCtrl', function($scope, $location, $rootScope, $http, $cookies){
    $scope.username = '';
    $scope.password = '';
    $rootScope.loggedIn=false;
    //////////initialization
    const cookies=$cookies.getAll();
    const authorization=(login,pwd)=>{
        if($rootScope.loggedIn==false){
            let data={};
            data.login=$scope.username;
            data.pwd=$scope.password;
            if(login && pwd){
                data.login=login;
                data.pwd=pwd;
            }
            $http.post("authorization.php", data).then(function success (response) {
                    if (response.data['loggin'] === true) {
                        $rootScope.loggedIn = true;
                        $location.path('/dashboard');
                        $rootScope.name = response.data['name'];
                        $cookies.put('loggedIn', response.data['loggin']);
                        $cookies.put('username', response.data['name']);
                        $cookies.put('login', response.data['login']);
                        $cookies.put('pwd', response.data['pwd']);
                        console.log($cookies);
                    }
                    else {
                        $scope.username = '';
                        $scope.password = '';
                    }
                },function error (response){
                    console.log(response);
                }
            );
        }
    };
    if(cookies.hasOwnProperty("login") && cookies.hasOwnProperty("pwd")) authorization(cookies.login,cookies.pwd);
    $scope.enter=function(){
        if ($scope.username!="" && ($scope.password=="" || $scope.password==undefined)) document.getElementById("password").focus();
        else if($scope.password!="" && ($scope.username=="" || $scope.username==undefined)) document.getElementById("username").focus();
        else if($scope.password!="" && $scope.username!="") authorization();
    };

    $scope.submit=authorization;

});
