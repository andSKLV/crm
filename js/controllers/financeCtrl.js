app.controller("financeCtrl", function($scope, $http, $location){
    /**
     * newDashboard нужно для отображения необходимого содержимого и анимации
     */
    $scope.newDashboard={
        currentPage:0,
        previousPage: -1,
        toLeft(index){
            return this.previousPage<this.currentPage && this.previousPage==index;
        },
        toRight(index){
            return this.previousPage>this.currentPage && this.previousPage==index;
        },
        fromLeft(index){
            return this.previousPage>this.currentPage && this.currentPage==index;
        },
        fromRight(index){
            return this.previousPage<this.currentPage && this.currentPage==index;
        },
        checkCurrentPage(index){
            return index===this.currentPage;
        },
        setCurrentPage(index){
            this.previousPage=this.currentPage;
            this.currentPage=index;
        },
    }
    /**
     * currObj - наполнение каретки
     */
    $scope.currObj=[
        {
            "name": "Сумма",
            "type": "search/create",
            "values": [
                {
                    "name": "adsf"
                }
            ]
        },
        {
            "name": "Дата",
            "type": "search/create",
            "values": [
                {
                    "name": "asq11"
                }
            ]
        },
        {
            "name": "Долг",
            "type": "finance",
            "values": [
                {
                    "name": "something"
                },
                {
                    "name": "anything"
                }
            ]
        },
        {
            "name": "Дата",
            "type": "dates",
            "values":[]
        }
    ];
    $scope.returnToDashboard=()=>{
        $location.path('/polis');
    };
})