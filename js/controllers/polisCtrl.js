import Polis from '../protos/polis.js';

app.controller("polisCtrl", function (myFactory, $http, $location, $scope, $rootScope, $timeout) {

    this.myFactory = myFactory;
    $scope.myFactory = myFactory;
    $scope.init = async () => {
        const makePolsiObj = () => {
            // создаем объект хранения для полиса, если не создан
            if (!myFactory.polisObj) {
                const polisObj = new Polis(myFactory);
                myFactory.polisObj = polisObj;
            }
        }
        const selectNames = () => {
            //определяем имена расчета и компании для заголовка
            if (myFactory.calculationName !== "" && myFactory.calculationName !== undefined) this.calculationName = myFactory.calculationName;
            else if (myFactory.calcObj.isLinked) this.calculationName = 'привязанный';
            else if (!myFactory.calcObj.isInited) this.calculationName = 'не выбран';
            if (myFactory.newClientCard) this.companyName = myFactory.newClientCard['Данные компании']['Наименование организации'];
            myFactory.parks.forEach((park) => {
                park.processes.forEach((process) => {
                    process.showCars = false;
                })
            })
        }
        const switchMakingPolis = () => {
            if (myFactory.makingPolis !== false) {
                switch (myFactory.makingPolis) {
                    case "Расчет":
                        $scope.newDashboard.setCurrentPage(1);
                        break;
                    case "Компания":
                        $scope.newDashboard.setCurrentPage(0);
                        break;
                }
            }
            myFactory.makingPolis = true;
        }
        const clearSearchResults = () => {
            //обнуляем  search_result
            if (!($rootScope.search_result)) $scope.newDashboard.setCurrentPage(0);
            if ($rootScope.search_result) $rootScope.search_result = [];
            myFactory.polisObj.isInited = true;
        }
        /**
         * Загружаем из json наполнение каретки
         */
        const loadDashboardObj = () => {
            myFactory.polisObj.isRequested = true;
            return $http.post('./src/polis.json').then((resp) => {
                if (!Array.isArray(resp.data) || resp.data.length < 1) {
                    alert('Возникла ошибка при загрузке данных. Пожалуйста, по возможности не закрывайте окно и обратитесь к разработчику');
                    console.error(resp);
                }
                else {
                    $scope.currObj = resp.data;
                }
            }, (err) => {
                console.log(err);
            })
        }
        /**
         * Выбираем какую вкладку каретки открыть
         */
        const openTab = () => {
            if (!$scope.currObj) return false;
            let tabIndex = 0;
            if (myFactory.cameFrom.name === 'Редактор полиса') {
                //если пришли из редактора полиса, то открываем сразу это меню
                tabIndex = $scope.currObj.findIndex(val => val.name === 'Оговорки и условия');
            }
            else if (myFactory.cameFrom.name === 'Редактирование финансов') {
                //если пришли из редактора полиса, то открываем сразу это меню
                tabIndex = $scope.currObj.findIndex(val => val.name === 'Финансы');
            }
            else if (myFactory.cameFrom.name === 'Расчет') {
                tabIndex = $scope.currObj.findIndex(val => val.name === 'Расчет');
            }
            else if (myFactory.cameFrom.name === 'Редактор карты клиента' || 'Карту клиента') {
                tabIndex = $scope.currObj.findIndex(val => val.name === 'Компания');
            }
            else if (!myFactory.companyObj.card) {
                tabIndex = 0;
            }
            else if (!myFactory.companyObj.isFull) {
                tabIndex = 0;
            }
            else {
                // ищем первую незаполненную вкладку
                const tabsAmount = $scope.currObj.filter((val) => val.name).length;
                for (let i = 0; i < tabsAmount; i++) {
                    // если вкладка пустая, то выбираем ее на открытие и завершаем перебор
                    if (!$scope.newDashboard.alreadySelected(i)) {
                        tabIndex = i;
                        break;
                    }
                }
            }
            $scope.newDashboard.setCurrentPage(tabIndex);
        }

        makePolsiObj();
        myFactory.polisObj.updateNames();
        selectNames();
        switchMakingPolis();
        clearSearchResults();

        //по необходимости загружаем каретку и "оговорки"
        if (!myFactory.polisObj || !myFactory.polisObj.isRequested || !$scope.currObj || $scope.currObj.length === 0) {
            if (!myFactory.polisObj.conditions) {
                const type = (myFactory.calcObj.factory) ? myFactory.calcObj.factory.HIPname : 'Перевозчики';
                await myFactory.polisObj.loadConditions(type);
            }
            await loadDashboardObj();
        };

        //если уже есть расчет и его тип не совпадает с типом оговорок, то загружаем новые оговорки
        if (myFactory.calcObj.factory && myFactory.polisObj.type !== myFactory.calcObj.factory.HIPname) {
            if (myFactory.polisObj.conditions) delete myFactory.polisObj.conditions; // если были какие то оговорки, то их нужно удалить, так как нужно загрузить новые
            await myFactory.polisObj.loadConditions(myFactory.calcObj.factory.HIPname);
            myFactory.polisObj.type = myFactory.calcObj.factory.HIPname;
            myFactory.polisObj.additionsSeen = false;
        }
        myFactory.polisObj.updateConditionsCheck();
        openTab();
    }
    /**
     * Функция создания массива с предварительными платежами
     */
    $scope.calcFinances = () => {
        const checkDiffInDates = () => {
            const dates = $scope.myFactory.polisObj.dates;
            const paymentDates = $scope.myFactory.payment.datesWhenCreated;
            let flag = false;
            for (let key in paymentDates) {
                if (paymentDates[key] !== dates[key]) flag = true;
            }
            return flag;
        }

        if (myFactory.parks.length === 0 || !(myFactory.polisObj.dates.start || myFactory.polisObj.dates.end)) return false;
        if (!myFactory.payment.array) myFactory.payment.makeArray(myFactory.totalPrice, myFactory.polisObj.dates);
        else {
            let needToCreate = false;
            const payTotal = ((typeof myFactory.payment.totalPrice) === 'string') ? myFactory.payment.totalPrice : addSpaces(Math.round(myFactory.payment.totalPrice));
            const calcTotal = addSpaces(Math.round(myFactory.totalPrice));
            if (payTotal !== calcTotal) needToCreate = true; //если сумма расчета изменилась, то нужно пересчитать финансы
            if (checkDiffInDates()) needToCreate = true; //если изменились даты или продолжительность договора - надо пересчитать
            if (needToCreate) myFactory.payment.makeArray(myFactory.totalPrice, myFactory.polisObj.dates);
        }
    }
    //Удалено за ненадобностью. Какой то драгбл контейнер
    // $scope.itemsList = {
    //     items1: [],
    //     items2: []
    // };

    // for (let i = 0; i <= 5; i += 1) {
    //     $scope.itemsList.items1.push({ 'Id': i, 'Label': 'Item A_' + i });
    // }

    $scope.sortableOptions = {
        containment: '#horizontal-container',
        //restrict move across columns. move only within column.
        accept: function (sourceItemHandleScope, destSortableScope) {
            return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
        },
        itemMoved: function (event) {
            console.log(1)
        }
    };
    $scope.returnToDashboard = () => {
        $location.path('/');
    };
    $scope.clicking = (event, process) => {
        event.stopImmediatePropagation();
        myFactory.parks.forEach((park) => {
            park.processes.forEach((process) => {
                process.showCars = false;
            })
        })
        process.showCars = !process.showCars;
    }
    $scope.console = (param) => {
        console.dir($scope.itemsList.items1);
    }

    $scope.changeLocation = (value) => {
        $scope.myFactory.cameFrom = {
            name: 'Проект документа',
            path: $location.$$path,
        };
        switch (value) {
            case "Компания":
                $location.path(`/company`);
                break;
            case "Расчет":
                $location.path(`/calculation`);
                break;
            case 'Оговорки и условия':
                $scope.myFactory.addNewPolisProperty();
                $timeout(() => $location.path(`/polisEditor`), 0);
            default:
                $location.path(value);
                break;
        }
    }
    /**
     * Функция загрузки объекта дополнения в окно редактирования дополнений
     * @param {obj} data - объект дополнения выгруженный из базы данных
     */
    $scope.loadAddition = data => {
        const addition = data;
        const conditions = $scope.myFactory.polisObj.conditions;
        const val = [];
        // формируем текстовые значения в нужную структуру
        data.text.forEach(txt => {
            const obj = {};
            obj.checked = true;
            obj.text = txt;
            val.push(obj);
        })
        //добавляем новое дополнение
        // conditions.push({
        //     name: data.name,
        //     values: val,
        //     id: data.id,
        //     isNew: false,
        // });
        const newAddition = {
            name: data.name,
            values: val,
            id: data.id,
            isNew: false,
        }
        $scope.myFactory.polisCurrent = newAddition;
        $timeout(() => $location.path(`/polisEditor`), 0);
    }
    $scope.newDashboard = {
        currentPage: null,
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
            if (index === 2) $scope.myFactory.polisObj.additionsSeen = true;
            if (index === 4) $scope.calcFinances();
            if (index === 4 && $scope.myFactory.payment.array && $scope.myFactory.payment.array.length > 0) $scope.myFactory.polisObj.financeSeen = true;
            $rootScope.search_result = [];
            $scope.currObj.forEach(param => {
                if (param.type == 'search/create') {
                    param.values[0].name = "";
                }
            })
        },
        alreadySelected(index) {
            switch (index) {
                case 0:
                    return (myFactory.companyObj.isFull);
                    break;
                case 1:
                    return myFactory.parks.length > 0;
                    break;
                case 2:
                    return myFactory.polisObj.additionsSeen;
                    break;
                case 3:
                    return myFactory.polisObj.dates.start && myFactory.polisObj.dates.end;
                    break;
                case 4:
                    return myFactory.polisObj.financeSeen && myFactory.payment.array && myFactory.payment.array.length > 0;
                    break;
                default:
                    return false;
                    break;
            }
        },
        allSelected() {
            for (let i = 0; i < 5; i++) {
                if (!$scope.newDashboard.alreadySelected(i)) return false;
            }
            return true;
        }
    }

    $scope.loadProcess = (process, key) => {
        myFactory.loadProcess = {
            process,
            key
        }
        myFactory.cameFrom = {
            name: "Проект документа",
            path: '/polis',
        }
        $location.path(`/calculation`);
    }
    $scope.loadClient = (key) => {
        myFactory.loadClient = key;
    }
    this.makePDF = () => {
        const getRisks = () => {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.addEventListener('readystatechange', () => {
                    if (xhr.readyState == 4) {
                        resolve(JSON.parse(xhr.responseText));

                    }
                })
                xhr.open("GET", "./src/HIP.json", true);
                xhr.send();
            })
        };
        getRisks().then((data) => {
            let risks = [];
            data.forEach(({ model, values }) => {
                if (model == "risk") {
                    values.forEach((value) => {
                        if (value.action === undefined && value.type === "risk") risks.push(value);
                    })
                }
            })
            console.log(risks);

            polis.makePDF(myFactory, risks);
            return null;
        }, function error(response) {
            console.log(response);

        })
    }
    $scope.multiClicked = () => {
        const polis = $scope.myFactory.polisObj;
        polis.multi = !polis.multi;
    }
    $scope.deleteAdditionFromDB = id => {
        if (id < 3) return false;
        const query = {};
        query.type = 'addition_delete';
        query.id = id;
        $http.post('./php/save.php', query).then(resp => {
            if (resp.data !== 'success') {
                alert('Ошибка удаления. Пожалуйста, по возможности не закрывайте окно и обратитесь к разработчику');
                console.error(resp.data);
            }
            else $rootScope.search_result = $rootScope.search_result.filter(val => val.id !== id);
        }, err => {
            console.error(err);
        });
    }
    /**
     * Функция запускается после ухода с инпута в дэшборде
     * @param {string} control - control инпута, чтобы разделять какой именно изменился
     */
    $scope.endChange = control => {
        const dates = $scope.myFactory.polisObj.dates;
        const valiDate = dateStr => {
            const reg = /(2[01][012][0-9])-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])/;
            return reg.test(dateStr);
        }
        const changeDateView = dateStr => {
            const reg = /(\d+)-(\d+)-(\d+)/;
            const newDate = dateStr.replace(reg, `$3.$2.$1`);
            return newDate;
        }
        const makeDateFromStr = dateStr => {
            const dates = dateStr.match(/(\d+).(\d+).(\d+)/);
            const newDate = new Date(dates[3], Number(dates[2]) - 1, dates[1]);
            return newDate;
        }

        switch (control) {
            case 'start':
                if (valiDate(dates.start)) {
                    dates.start = changeDateView(dates.start);
                    dates.startDate = makeDateFromStr(dates.start);
                    $scope.setEndByTime(dates.startDate, dates.time);
                }
                else {
                    dates.start = null;
                    dates.startDate = null;
                }
                break;
            case 'end':
                if (valiDate(dates.end)) {
                    dates.end = changeDateView(dates.end);
                    dates.endDate = makeDateFromStr(dates.end);
                    if (dates.endDate < dates.startDate) {
                        dates.end = null;
                        dates.endDate = null;
                        return false;
                    }
                    dates.time = 'Вручную';
                }
                else {
                    dates.end = null;
                    dates.endDate = null;
                }
                break;
            case 'time':
                if (!dates.startDate) return false;
                $scope.setEndByTime(dates.startDate, dates.time);
                break;
            default:
                return false;
        }
    }
    /**
     * установка даты окончания в зависимости от выбранного срока действия
     * @param {Date} start 
     * @param {string} time - Год, 6 месяцев или вручную 
     */
    $scope.setEndByTime = (start, time) => {
        const setEnd = month => {
            const end = new Date(start.getFullYear(), start.getMonth() + month, start.getDate());
            $scope.myFactory.polisObj.dates.endDate = end;
            $scope.myFactory.polisObj.dates.end = parseDate(end);
        }
        switch (time) {
            case 'Год':
                setEnd(12);
                break;
            case '6 месяцев':
                setEnd(6);
                break;
            case 'Вручную':
                $scope.myFactory.polisObj.dates.time = 'Вручную';
                break;
            default:
                console.log(time);
                debugger;
                break;
        }
    }
    /**
     * Функция вызывается когда был клик по кнопке в дэшборде, в описании которой есть тип btn
     * @param {string} control - control кнопки, чтобы разделять какая именно нажата
     */
    $scope.btnClick = control => {
        const todayStart = () => {
            const today = new Date();
            $scope.myFactory.polisObj.dates.start = parseDate(today);
            $scope.myFactory.polisObj.dates.startDate = today;
            return today;
        };
        switch (control) {
            case "today":
                const today = todayStart();
                $scope.setEndByTime(today, $scope.myFactory.polisObj.dates.time);
                break;
            default:
                return false;
        }
    };
    /**
     * Преобразование объекта даты в строку
     * @param {Date} date 
     * @returns {string} dd.mm.yyyy
     */
    function parseDate(date) {
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        if (day < 10) day = `0${day}`;
        if (month < 10) month = `0${month}`;
        return `${day}.${month}.${year}`;
    }


    $scope.init();
})