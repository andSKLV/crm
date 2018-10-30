app.controller("financeCtrl", function ($scope, $http, $location, myFactory) {
    $scope.myFactory = myFactory;
    $scope.init = async () => {
        const priceToString = () => {
            $scope.myFactory.payment.totalPrice = addSpaces(Math.round(
                $scope.myFactory.payment.totalPrice
            ).toString());
        };
        $scope.fake();
        priceToString();
        $scope.checkDebtEqual();
        await $scope.loadDashboard();
    };
    $scope.loadDashboard = () => {
        return $http.post("./src/finance.json").then(
            resp => {
                console.log(resp.data);
                $scope.currObj = resp.data;
            },
            err => { }
        );
    };
    /**
     * newDashboard нужно для отображения необходимого содержимого и анимации
     */
    $scope.newDashboard = {
        mode: "new",
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
        }
    };
    $scope.returnToDashboard = () => {
        $location.path("/polis");
    };
    //------------------
    /**
     * функция загрузки процесса из матрицы в каретку
     * @param {payment} payment новый процесс, который был создан при копировании
     * @param {number} index номер таба, который переключаем
     */
    $scope.loadPayment = (payment, index) => {
        // убираем все остальные строки ченджинг
        const dsh = $scope.newDashboard;
        const mf = $scope.myFactory;
        const pay = mf.payment;

        const selectPaymentOnMatrix = () => {
            // переназначаем выделенный объект
            if (dsh.currPayment) dsh.currPayment.changing = false;
            dsh.currPayment = payment;
            payment.changing = true;
        };

        dsh.mode = "change";
        dsh.setCurrentPage(index);
        selectPaymentOnMatrix();

        return false;

        scope.karetka.mode = "changing process";

        // проходим по всем параметрам в проце
        for (let key in process) {
            // если параметр входит в транспортные пропсы, а не является чем то вспомогательным для расчетов типа multi, baseRate и тд
            if (transportProp.indexOf(key) != -1) {
                if (
                    key == "cost" ||
                    key == "amount" ||
                    key == "limit" ||
                    key == "franchise"
                ) {
                    // если это один из перечисленных, то выбираем выбираем его в скоупе
                    const karetkaParam = scope.currObj.find(obj => obj["model"] == key);
                    // перебираем все возможные значения каретки, чтобы выделить подходящее
                    for (let i = 0; i < karetkaParam.values.length; i++) {
                        // если это инпут у количества груза и еще и тягачи, то пересчитываем рейсы в тягачи
                        if (karetkaParam.values[i].name == "input") {
                            if (key == "amount" && scope.myFactory.amountType == "Тягачей") {
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
                } else {
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
    };
    //-------------------
    /**
     * Функция пересчета оставшихся платежей, чтобы итоговая сумма не менялась
     */
    $scope.recalculateDebt = () => {
        const pay = $scope.myFactory.payment;
        const notPayed = intFromStr(pay.leftPrice);
        let manualPrice = 0;
        const notPayedCounter = pay.array.filter(p => {
            if (p.manual) manualPrice+=intFromStr(p.debt); // если сумма введена вручную, то ее нужно вычесть из общей, т к она не попадает под распределение
            if (!p.manual && !p.payed) return true;
        }).length; // количество платежей, которые можно пересчитать - они не должны быть заданы в ручныю либо оплачены
        if (notPayedCounter===0) {
            const newVal = notPayed-manualPrice + intFromStr($scope.newDashboard.currPayment.debt);
            $scope.newDashboard.currPayment.debt = addSpaces(newVal);
            $scope.newDashboard.currPayment.manual = false;
            return false;
        }
        let newDebt = Math.round((notPayed-manualPrice)/notPayedCounter); // пересчитанная часть долга
        newDebt = addSpaces(newDebt);
        // вставляем пересчитанные значения 
        pay.array.forEach(p=>{
            if (!p.manual && !p.payed) {
                p.debt = newDebt;
            }
        })
        pay.calcDebt = newDebt;
        $scope.checkDebtEqual();
    };
    /**
     * проверка итоговой суммы и пересчитанной суммы. из-за округлений может не сходиться на рубль
     * добавляем разницу к следующему не оплаченному и не введенному в ручную
     */
    $scope.checkDebtEqual = () => {
        const pay = $scope.myFactory.payment;
        const s = pay.array.reduce((acc,p)=>{return acc+=intFromStr(p.debt)},0);
        const total = intFromStr(pay.totalPrice);
        const diff = total - s;
        if (diff) {
            const fisrtDebt = pay.array.find(p=>{return (!p.manual&&!p.payed)});
            const int = intFromStr(fisrtDebt.debt) + diff;
            fisrtDebt.debt = addSpaces(int);
        }
    }
    /**
     * Функция проверки изменился ли долг после ввода, если да, то меняем значение "ручной ввод" на true
     * @param {obj} curr - текущий объект платежа
     */
    $scope.switchManual = curr => {
        const calced = intFromStr($scope.myFactory.payment.calcDebt);
        const input = intFromStr(curr.debt);
        if (Math.abs(calced - input)>1) curr.manual = true;
    };
    $scope.applyDebt = (curr) => {
        $scope.switchManual(curr);
        curr.debt = addSpaces (curr.debt);
        $scope.recalculateDebt();
    }
    $scope.endChange = (val, control) => {
        const pay = $scope.myFactory.payment;
        const curr = $scope.newDashboard.currPayment;
        if (!curr) return false; //выходиим если прошлого объекта нет
        switch (control) {
            case "debt":
                $scope.applyDebt (curr);
                break;
            case 'price':
                $scope.applyPayment(curr);
                break;
        }
        debugger;
    };
    $scope.applyPayment = (curr) => {
        if (curr.price==="0") return false;
        const pays = $scope.myFactory.payment;
        const expected = intFromStr(curr.debt);
        const payed = intFromStr(curr.price);
        const diff = expected - payed;
        curr.payed = true;
        if (diff) {
            curr.debt = curr.price;
            pays.array.find(p=>{
                if (!p.payed&&!p.manul) {
                    let debt = intFromStr(p.debt);
                    debt+=diff;
                    debt = addSpaces(debt);
                    p.debt = debt;
                    return true;
                }
            })
        }
        debugger;
        $scope.recalculateLeft ();
        
        
    }
    /**
     * Пересчет общего долга: общая сумма - уплоченное
     */
    $scope.recalculateLeft = () => {
        const pay = $scope.myFactory.payment;
        const payedSum = pay.array.reduce((acc,p)=>{
            return acc+=intFromStr(p.price);
        },0)
        const total = pay.totalPrice;
        let intTotal = intFromStr(total);
        intLeft = intTotal - payedSum;
        pay.leftPrice = addSpaces(intLeft);
    }
    $scope.setAsDebt = (val) => {
        const pays = $scope.myFactory.payment;
        const curr = $scope.newDashboard.currPayment;
        switch (val) {
            case 'price':
                curr.price = curr.debt;
                $scope.applyPayment(curr);
                $scope.recalculateDebt();
                break;
            case 'debt':
                break;
        }
        debugger;
    }



    $scope.fake = () => {
        const sc = $scope.myFactory.payment;
        sc.array = [{"price":"0","date":"","debt":"48 551","debtDate":"30.10.2018","manual":false,"$$hashKey":"object:473"},{"price":"0","date":"","debt":"48 551","debtDate":"30.12.2018","manual":false,"$$hashKey":"object:474"},{"price":"0","date":"","debt":"48 551","debtDate":"02.03.2019","manual":false,"$$hashKey":"object:475"},{"price":"0","date":"","debt":"48 551","debtDate":"30.04.2019","manual":false,"$$hashKey":"object:476"},{"price":"0","date":"","debt":"48 551","debtDate":"30.06.2019","manual":false,"$$hashKey":"object:477"},{"price":"0","date":"","debt":"48 551","debtDate":"30.08.2019","manual":false,"$$hashKey":"object:478"}];
        sc.hand = false;
        sc.koef = 1.0704058245275336;
        sc.leftPrice = "291 306";
        sc.totalPrice = 291305.891949874;
        sc.val = 6;
        sc.calcDebt = "48 551";
    };
    $scope.init();
});
