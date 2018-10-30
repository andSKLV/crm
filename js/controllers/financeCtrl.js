app.controller("financeCtrl", function ($scope, $http, $location, myFactory) {
    $scope.myFactory = myFactory;
    $scope.init = async () => {
        await $scope.loadDashboard();

    }
    $scope.loadDashboard = () => {
        return $http.post('./src/finance.json').then((resp) => {
            console.log(resp.data);
            $scope.currObj = resp.data;
            debugger;
        }, err => {

        })
    }
    /**
     * newDashboard нужно для отображения необходимого содержимого и анимации
     */
    $scope.newDashboard = {
        currentPage: 0,
        previousPage: -1,
        toLeft(index) {
            return this.previousPage < this.currentPage && this.previousPage == index;
        },
        toRight(index) {
            return this.previousPage > this.currentPage && this.previousPage == index;
        },
        fromLeft(index) {
            return this.previousPage > this.currentPage && this.currentPage == index;
        },
        fromRight(index) {
            return this.previousPage < this.currentPage && this.currentPage == index;
        },
        checkCurrentPage(index) {
            return index === this.currentPage;
        },
        setCurrentPage(index) {
            this.previousPage = this.currentPage;
            this.currentPage = index;
        },
    }
    $scope.returnToDashboard = () => {
        $location.path('/polis');
    };

    $scope.init();
})