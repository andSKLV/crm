app.controller("financeCtrl", function ($scope, $http, $location, myFactory) {
    $scope.myFactory = myFactory;
    $scope.init = async () => {
        $scope.fake();
        await $scope.loadDashboard();

    }
    $scope.loadDashboard = () => {
        return $http.post('./src/finance.json').then((resp) => {
            console.log(resp.data);
            $scope.currObj = resp.data;
        }, err => {

        })
    }
    /**
     * newDashboard нужно для отображения необходимого содержимого и анимации
     */
    $scope.newDashboard = {
        mode: 'new',
        currentPage: 0,
        previousPage: -1,
        currPayment: null,
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
    //------------------
    /**
     * функция загрузки процесса из матрицы в каретку
     * @param {process} payment новый процесс, который был создан при копировании
     * @param {number} index номер таба, который переключаем
     */
    $scope.loadProcess = (payment, index) => {
        // убираем все остальные строки ченджинг
        const dsh = $scope.newDashboard;
        const mf = $scope.myFactory;
        const pay = mf.payment;

        const selectPaymentOnMatrix = () => {
            // переназначаем выделенный объект 
            if (dsh.currPayment) dsh.currPayment.changing = false;
            dsh.currPayment = payment;
            payment.changing = true;
        }

        dsh.mode = 'change';
        dsh.setCurrentPage(index);
        selectPaymentOnMatrix();

        return false;


        scope.karetka.mode = "changing process";



        // проходим по всем параметрам в проце
        for (let key in process) {
            // если параметр входит в транспортные пропсы, а не является чем то вспомогательным для расчетов типа multi, baseRate и тд
            if (transportProp.indexOf(key) != -1) {
                if (key == 'cost' || key == 'amount' || key == 'limit' || key == 'franchise') {
                    // если это один из перечисленных, то выбираем выбираем его в скоупе
                    const karetkaParam = scope.currObj.find(obj => obj['model'] == key);
                    // перебираем все возможные значения каретки, чтобы выделить подходящее
                    for (let i = 0; i < karetkaParam.values.length; i++) {
                        // если это инпут у количества груза и еще и тягачи, то пересчитываем рейсы в тягачи
                        if (karetkaParam.values[i].name == "input") {
                            if (key == 'amount' && scope.myFactory.amountType == "Тягачей") {
                                karetkaParam.selected = process[key] / TRACTOR;
                            }
                            // а если цена или рейсы, то просто вставляем цену проца
                            else karetkaParam.selected = process[key];
                        }
                        // если значение скоупа соответсвует значению в проце, то выбираем его
                        if (karetkaParam.values[i].name == process[key]) {
                            karetkaParam.values[i].selected = true;
                            break;
                        }

                    }
                }
                else {
                    for (let i = 0; i < scope.currObj.length; i++) {
                        for (let j = 0; j < scope.currObj[i].values.length; j++) {
                            if (scope.currObj[i].values[j].name == process[key]) {
                                scope.currObj[i].selected = process[key];
                                scope.currObj[i].values[j].selected = true;
                                if (key == prop) scope.selectParam(i);
                                break;
                            }
                        }
                    }
                }
            }
        }

    }
    //-------------------

    $scope.fake = () => {
        const sc = $scope.myFactory.payment;
        sc.array = [{ "price": "0", "date": "", "debt": "48 551", "debtDate": "30.10.2018", "payments": [], "$$hashKey": "object:298" }, { "price": "0", "date": "", "debt": "48 551", "debtDate": "30.12.2018", "payments": [], "$$hashKey": "object:299" }, { "price": "0", "date": "", "debt": "48 551", "debtDate": "02.03.2019", "payments": [], "$$hashKey": "object:300" }, { "price": "0", "date": "", "debt": "48 551", "debtDate": "30.04.2019", "payments": [], "$$hashKey": "object:301" }, { "price": "0", "date": "", "debt": "48 551", "debtDate": "30.06.2019", "payments": [], "$$hashKey": "object:302" }, { "price": "0", "date": "", "debt": "48 551", "debtDate": "30.08.2019", "payments": [], "$$hashKey": "object:303" }];
        sc.hand = false;
        sc.koef = 1.0704058245275336;
        sc.leftPrice = "291 306";
        sc.manual = false;
        sc.payedPrice = 0;
        sc.totalPrice = 291305.891949874;
        sc.val = 6;
    }
    $scope.init();
})