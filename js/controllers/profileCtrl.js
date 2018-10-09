app.controller('profileCtrl', function ($scope,$rootScope, $http, $q, $location, myFactory) {
  this.myFactory = myFactory;
  const scope = this;
  init();

  function init () {
    $http.post('src/profile-dashboard.json').then((resp)=>{
      $scope.currObj = resp.data;
      debugger;
    },(err)=>{
      console.error(err);
    })
  }
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
    getIndex(param) {
      // FIXME:
      // this.setCurrentPage($scope.clientCard.indexOf(param));
    }
  }
  $scope.loadToDashboard = (key) => {//обратный переход для карточки клиента
    $scope.currObj.forEach((param, i) => {
      param.values.forEach(({ name }, j) => {
        if (name == key) {
          Array.from(document.querySelectorAll(".company_dashboard_inputs")).forEach(item => {
            item.classList.remove("selected");
          });
          Array.from(document.querySelectorAll("div.clientCard td")).forEach(node => {
            node.classList.remove("mi_selected");
            if (node.title == key) node.classList.add("mi_selected");
          })
          if ($scope.newDashboard.currentPage != i) $scope.newDashboard.setCurrentPage(i);
          setTimeout(() => {
            const elem = document.querySelector(".ul_current").firstElementChild.children[j].firstElementChild;
            elem.classList.add("selected");
            elem.focus();
          }, 100);
        }
      })
    })
  };
  $scope.isntEmpty = (obj) => {
    for (let key in obj) {
        if (obj[key] != "" && obj[key] != "Форма организации" && obj[key] != undefined) return true;
    }
    return false;
  };
});
