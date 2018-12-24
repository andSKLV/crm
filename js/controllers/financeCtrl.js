import { loadRisks, isNumeric, addSpaces, intFromStr, delay, parseDate, getPathName} from '../calculation.js';

app.controller("financeCtrl", function ($scope, $http, $location, myFactory) {
    $scope.myFactory = myFactory;
    
    /**
     * Инициализация, запускается каждый раз при открытии окна финансы
     */
    $scope.init = async () => {
        if ($scope.myFactory.parks.length===0) $scope.returnToDashboard();
        const priceToString = () => {
            $scope.myFactory.payment.totalPrice = addSpaces(
                Math.round($scope.myFactory.payment.totalPrice).toString()
            );
        };

        priceToString();
        $scope.checkDebtEqual();
        await $scope.loadDashboard();
    };
    /**
     * Загрузка объекта каретки
     */
    $scope.loadDashboard = () => {
        return $http.post("./src/finance.json").then(
            resp => {
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
        currentPage: ($scope.myFactory.polisObj && $scope.myFactory.polisObj.isSaved) ? 0 : 2,
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
        async setCurrentPage(index) {
            this.previousPage = this.currentPage;
            this.currentPage = index;
            await delay();
            $scope.inputFocus(index);
        }
    };
    $scope.returnToDashboard = () => {
        $scope.myFactory.cameFrom = {
            name: 'Редактирование финансов',
            path: $location.$$path,
        };
        $location.path("/polis");
    };
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
        if (!mf.polisObj.isSaved && index<2) return false; // если полис еще не сохранен, то внесения не работают
        const selectPaymentOnMatrix = () => {
            // переназначаем выделенный объект
            if (dsh.currPayment) dsh.currPayment.changing = false;
            dsh.currPayment = payment;
            payment.changing = true;
        };
        const inputFocus = tab => {

        }
        dsh.mode = "change";
        dsh.setCurrentPage(index);
        selectPaymentOnMatrix();
    };
    $scope.inputFocus = tab => {
        let el;
        switch (tab) {
            case 0:
                el = document.querySelector('#input_date');
                break;
            case 1:
                el = document.querySelector('#input_price');
                break;
            case 2:
                el = document.querySelector('#input_debtDate');
                break;
            case 3:
                el = document.querySelector('#input_debt');
                break;
            default:
                return false;
        }
        el.focus();
    }
    /**
     * Функция пересчета оставшихся платежей, чтобы итоговая сумма не менялась
     */
    $scope.recalculateDebt = () => {
        const pay = $scope.myFactory.payment;
        const notPayed = intFromStr(pay.leftPrice);
        let manualPrice = 0;
        const notPayedCounter = pay.array.filter(p => {
            if (p.manual) manualPrice += intFromStr(p.debt); // если сумма введена вручную, то ее нужно вычесть из общей, т к она не попадает под распределение
            if (!p.manual && !p.payed) return true;
        }).length; // количество платежей, которые можно пересчитать - они не должны быть заданы в ручныю либо оплачены
        if (notPayedCounter === 0) {
            const newVal = notPayed - manualPrice + intFromStr($scope.newDashboard.currPayment.debt);
            $scope.newDashboard.currPayment.debt = addSpaces(newVal);
            $scope.newDashboard.currPayment.manual = false;
            return false;
        }
        let newDebt = Math.round((notPayed - manualPrice) / notPayedCounter); // пересчитанная часть долга
        newDebt = addSpaces(newDebt);
        // вставляем пересчитанные значения
        pay.array.forEach(p => {
            if (!p.manual && !p.payed) {
                p.debt = newDebt;
            }
        });
        pay.calcDebt = newDebt;
        $scope.checkDebtEqual();
    };
    /**
     * проверка итоговой суммы и пересчитанной суммы. из-за округлений может не сходиться на рубль
     * //TODO: отключена из-за некорректной работы после изменений
     * добавляем разницу к следующему не оплаченному и не введенному в ручную
     */
    $scope.checkDebtEqual = () => {
        return false;//заглушка
        // const pay = $scope.myFactory.payment;
        // const s = pay.array.reduce((acc, p) => {
        //     return (acc += intFromStr(p.debt));
        // }, 0);
        // const total = intFromStr(pay.totalPrice);
        // const diff = total - s;
        // if (diff) {
        //     const fisrtDebt = pay.array.find(p => {
        //         return !p.manual && !p.payed;
        //     });
        //     const int = intFromStr(fisrtDebt.debt) + diff;
        //     fisrtDebt.debt = addSpaces(int);
        // }
    };
    /**
     * Функция проверки изменился ли долг после ввода, если да, то меняем значение "ручной ввод" на true
     * @param {obj} curr - текущий объект платежа
     */
    $scope.switchManual = curr => {
        const calced = intFromStr($scope.myFactory.payment.calcDebt);
        const input = intFromStr(curr.debt);
        if (Math.abs(calced - input) > 1) curr.manual = true;
    };
    $scope.applyDebt = curr => {
        if (curr.debt==='') {
            curr.debt = 0;
        }
        $scope.switchManual(curr);
        curr.debt = addSpaces(curr.debt);
        $scope.recalculateDebt();
    };
    /**
     * Функция активируется на leave focus с inputa, применяется для обработки введенного значения и дальнейшего действия
     * @param {obj} val - объект, который был нажат
     * @param {String} control - название столбца: date,price,debtdate,debt 
     */
    $scope.endChange = (val, control) => {
        const pay = $scope.myFactory.payment;
        const curr = $scope.newDashboard.currPayment;
        if (!curr) return false; //выходиим если прошлого объекта нет
        switch (control) {
            case "debt":
                $scope.applyDebt(curr);
                break;
            case "price":
                $scope.applyPayment(curr);
                $scope.recalculateDebt ();
                break;
            case "debtDate":
                $scope.applyDate(curr, control);
                break;
            case "date":
                $scope.applyDate(curr, control);
                break;
        }
    };
    /**
     * Преобразование даты в формате ГГГГ-ММ-ДД в ДД.ММ.ГГГГ
     * @param {object} curr - текущий изменяемый платеж 
     * @param {String} control - название столбца: date/debtdate
     */
    $scope.applyDate = (curr, control) => {
        const changing = curr[control];
        if (changing === '') return false;
        if (/\d{2}.\d{2}.\d{4}/.test(changing)) return false;
        if (/\d{4}-\d{2}-\d{2}/.test(changing)) {
            const newDate = changing.replace(/(\d{4})-(\d{2})-(\d{2})/, `$3.$2.$1`);
            curr[control] = newDate;
        }
    };
    $scope.applyPayment = curr => {
        if (curr.price==='') {
            return false;
        }
        if (curr.price === "0" && curr.debt!== '0' && !curr.payed) return false;
        const pays = $scope.myFactory.payment;
        const expected = intFromStr(curr.debt);
        const payed = intFromStr(curr.price);
        const diff = expected - payed;
        if (curr.payed) {
            curr.debt = '0';
            $scope.recalculateLeft();
            return true;
        }
        curr.debt = '0';
        curr.payed = true;
        if (diff<0) {
            pays.array.find(p => {
                if (!p.payed && !p.manul) {
                    let debt = intFromStr(p.debt);
                    debt += diff;
                    debt = addSpaces(debt);
                    p.debt = debt;
                    return true;
                }
            });
        }
        else if (diff>0) {
            const diffStr = addSpaces(diff);
            const newPayment = {
                price: '0',
                date: '',
                debt: diffStr,
                debtDate: curr.debtDate,
                manual: true,
            };
            const i = pays.array.indexOf(curr);
            pays.array.splice(i+1,0,newPayment);
        }
        $scope.recalculateLeft();
    };
    /**
     * Пересчет общего долга: общая сумма - уплоченное
     */
    $scope.recalculateLeft = () => {
        const pay = $scope.myFactory.payment;
        const payedSum = pay.array.reduce((acc, p) => {
            return (acc += intFromStr(p.price));
        }, 0);
        const total = pay.totalPrice;
        let intTotal = intFromStr(total);
        intLeft = intTotal - payedSum;
        pay.leftPrice = addSpaces(intLeft);
        pay.payed = addSpaces(payedSum);
    };
    /**
     * Устанаваливает значение платежа или даты как в долге
     * @param {String} control - название столбца: date,price,debtdate,debt 
     */
    $scope.setAsDebt = control => {
        const pays = $scope.myFactory.payment;
        const curr = $scope.newDashboard.currPayment;
        switch (control) {
            case "price":
                curr.price = curr.debt;
                $scope.applyPayment(curr);
                $scope.recalculateDebt ();
                break;
            case "date":
                curr.date = curr.debtDate;
                $scope.applyDate(curr, control);
                break;
        }
    };

    $scope.init();
});
