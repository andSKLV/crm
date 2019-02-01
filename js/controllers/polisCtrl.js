import Polis from '../protos/polis.js';
import { Car, CarGroup } from "../protos/car.js";
import Company from '../protos/company.js';
import { DeleteInsurant } from '../ServiceFunctions.js';
import { polisMaker, contractMaker } from '../polismaker.js';

app.controller("polisCtrl", function (myFactory, $http, $location, $scope, $rootScope, $timeout) {

    this.myFactory = myFactory;
    $scope.myFactory = myFactory;
    myFactory.scopes.polis = $scope;
    $scope.init = async () => {
        const makePolisObj = () => {
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
            else if (myFactory.cameFrom.name === 'Редактор карты клиента' || myFactory.cameFrom.name === 'Карту клиента') {
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
        const setInitialDates = () => {
            const setDay = new Date();
            $scope.myFactory.polisObj.dates.start = parseDate(setDay);
            $scope.myFactory.polisObj.dates.startDate = setDay;
            $scope.setEndByTime(setDay, $scope.myFactory.polisObj.dates.time);
        }

        makePolisObj();
        myFactory.polisObj.updateNames();
        selectNames();
        switchMakingPolis();
        clearSearchResults();
        const baseRiskNeeded = myFactory.parks.some(park => {
            return park.risks.includes(BASENAME);
        })
        //по необходимости загружаем каретку и "оговорки"
        if (!myFactory.polisObj || !myFactory.polisObj.isRequested || !$scope.currObj || $scope.currObj.length === 0) {
            if (!myFactory.polisObj.conditions && myFactory.parks.length > 0) {
                const type = (myFactory.calcObj.factory) ? myFactory.calcObj.factory.HIPname : 'Перевозчики';
                await myFactory.polisObj.loadConditions(type, baseRiskNeeded);
                myFactory.polisObj.additionsSeen = true;
            }
            await loadDashboardObj();
        };

        //если уже есть расчет и его тип не совпадает с типом оговорок, то загружаем новые оговорки
        if (myFactory.calcObj.factory && myFactory.polisObj.type !== myFactory.calcObj.factory.HIPname) {
            if (myFactory.polisObj.conditions) delete myFactory.polisObj.conditions; // если были какие то оговорки, то их нужно удалить, так как нужно загрузить новые
            await myFactory.polisObj.loadConditions(myFactory.calcObj.factory.HIPname, baseRiskNeeded);
            myFactory.polisObj.type = myFactory.calcObj.factory.HIPname;
            myFactory.polisObj.additionsSeen = true;
        }

        // если даты не назначены, то ставим их сегодняшним днем начало
        if (!$scope.myFactory.polisObj.dates.start && !$scope.myFactory.polisObj.dates.end) setInitialDates();

        myFactory.polisObj.updateConditionsCheck();
        // нужно ли обновить оговорки, машины, финансы после перехода
        const needRefreshCalc = myFactory.parks.length > 0 &&
            (myFactory.cameFrom.path === '/calculation' ||
                !myFactory.parks[0].processes[0].cars);
        if (needRefreshCalc) $scope.updateState();

        const needToClearState = myFactory.parks.length === 0 && (myFactory.payment.array && myFactory.payment.array.length > 0);
        if (needToClearState) $scope.clearState();
        openTab();

        //добавляем открытую компанию в сострахователи
        if (myFactory.companyObj.id &&
            !myFactory.polisObj.insurants.some(ins => ins.id === myFactory.companyObj.id)) {
            if (myFactory.polisObj.insurants.length === 4) $scope.deleteInsurant(myFactory.polisObj.insurants[0]);
            myFactory.polisObj.insurants.push(myFactory.companyObj);
        }
    }
    /**
     * Функция создания машин
     */
    $scope.createCars = () => {
        const mf = $scope.myFactory;
        mf.parks.forEach(park => {
            let max = -Infinity;
            //считаем максимальное количество машин в парке
            park.processes.forEach(pr => {
                max = Math.max(max, pr.amount / 24);
            })
            const carGroup = new CarGroup();
            carGroup.park = park;
            park.carGroup = carGroup;
            // создаем максимальное количество машин и добавляем в парк
            for (let i = 0; i < max; i++) {
                const car = new Car();
                car.park = park;
                carGroup.add(car);
            }
            // назначаем каждому процессу в парке машины
            park.processes.forEach(pr => {
                pr.cars = [];
                pr.showCars = false;
                if ((pr.amount / 24) === max) pr.isFull = true;
                for (let i = 0; i < pr.amount / 24; i++) {
                    const car = pr.park.carGroup.cars[i];
                    pr.cars.push(car);
                    //добавляем поле селектора, для того чтобы привязать к модели ng-change машины
                    car.selectorAutNumber = car.data.autNumber;
                }
            })
            park.processes.forEach(pr => {
                if (!pr.isFull) pr.carSelector = ''; //вспомогательный ничего не значащий объект, нужен чтобы поставить ng-change на выбор машины
            })
        })
        mf.setCarsFromExcel = async (cars, park, parkIndex, procIndex) => {
            park.carGroup.cars.forEach((car, index) => {
                const excelCar = cars[index];
                for (let key in excelCar) {
                    car.data[key] = excelCar[key];
                }
                car.selectorAutNumber = car.data.autNumber;
            })
            const parkUI = document.querySelectorAll('.park')[parkIndex];
            const procUI = parkUI.querySelectorAll('li')[procIndex];
            const inpUI = procUI.querySelector('.input_cars');
            // inpUI.focus();
            // await delay(50);
            // inpUI.blur();
            mf.applyAllScopes();
        }

    }
    /**
     * Функция обновления имени в селекторе
     * необходима для того, чтобы не оставалось старых значений селектора
     * @param {Car} car - объект машины, у которой меняли инпут 
     */
    $scope.updateSelectorAutNumber = car => {
        car.selectorAutNumber = car.data.autNumber;
    }
    /**
     * Функция замены машины в проце по выбору в select
     * @param {process} process - проц, в котором проходит замена
     * @param {car} car - объект машины, которой меняем
     * @param {array} group - массив машин этого парка
     */
    $scope.changeCar = (process, car, group) => {
        if (!car.selectorAutNumber) {
            //событие вызывается также на изменение имени в инпуте, этот случай надо отсекать
            car.selectorAutNumber = car.data.autNumber;
            return false;
        }
        const nextCar = group.find(c => c.data.autNumber === car.selectorAutNumber);
        const oldCarIndex = process.cars.indexOf(car);
        car.selectorAutNumber = car.data.autNumber;
        if (process.cars.includes(nextCar)) {
            //если в проце уже есть эта машина, тогда меняем их местами
            const nextCarIndex = process.cars.indexOf(nextCar);
            [process.cars[oldCarIndex], process.cars[nextCarIndex]] = [process.cars[nextCarIndex], process.cars[oldCarIndex]];
        }
        else {
            //меняем на выбранную машину
            process.cars[oldCarIndex] = nextCar;
        }
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
        const price = (myFactory.practicalPrice.val === '' || myFactory.practicalPrice.val == 0) ? myFactory.totalPrice : myFactory.practicalPrice.val;
        if (!myFactory.payment.array) myFactory.payment.makeArray(price, myFactory.polisObj.dates);
        else {
            let needToCreate = false;
            const payTotal = ((typeof myFactory.payment.totalPrice) === 'string') ? myFactory.payment.totalPrice : addSpaces(Math.round(myFactory.payment.totalPrice));
            const calcTotal = addSpaces(Math.round(price));
            if (payTotal !== calcTotal) needToCreate = true; //если сумма расчета изменилась, то нужно пересчитать финансы
            if (checkDiffInDates()) needToCreate = true; //если изменились даты или продолжительность договора - надо пересчитать
            if (needToCreate) myFactory.payment.makeArray(price, myFactory.polisObj.dates);
        }
    }
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
    /**
     * Функция вкл/откл отображения поп апа выбора файла экселя с парком машин
     * @param {event} ev 
     */
    $scope.showFilepickModal = (ev) => {
        const excelModal = ev.currentTarget.nextElementSibling;
        excelModal.classList.toggle('select--hidden');
    }
    $scope.changeLocation = (value) => {
        $scope.myFactory.cameFrom = {
            name: getPathName($location.$$path),
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
        const newAddition = {
            name: data.name,
            values: val,
            id: data.id,
            isNew: false,
        }
        if (data.type) newAddition.type = data.type;
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
            if (index === 3) $scope.myFactory.polisObj.datesSeen = true;
            if (index === 4) $scope.calcFinances();
            if (index === 4 && $scope.myFactory.payment.array && $scope.myFactory.payment.array.length > 0) $scope.myFactory.polisObj.financeSeen = true;
            $rootScope.search_result = [];
            if (!$scope.currObj) {
                return false; // происходит из-за повторной инициализации
            }
            $scope.currObj.forEach(param => {
                if (param.type == 'search/create') {
                    param.values[0].name = "";
                }
            })
            $scope.currObj[index].values.forEach(val => {
                if (val.type === 'btn-switch') {
                    val.selected = val.values[0];
                    val.switch = () => {
                        const i = val.values.indexOf(val.selected);
                        const setInd = (i === val.values.length - 1) ? 0 : i + 1;
                        val.selected = val.values[setInd];
                    }
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
                    return myFactory.polisObj.dates.start && myFactory.polisObj.dates.end && myFactory.polisObj.datesSeen;
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
            // Компанию не проверяем, поэтому начинаем с индекса 1
            for (let i = 1; i < 5; i++) {
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
        if (!$scope.newDashboard.allSelected()) return false;
        /**
         * Функция загрузки рисков. Еще раз, зачем? FIXME:
         */
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
        getRisks().then(async (data) => {
            let risks = [];
            data.forEach(({ model, values }) => {
                if (model == "risk") {
                    values.forEach((value) => {
                        if (value.action === undefined && value.type === "risk") risks.push(value);
                    })
                }
            })
            debugger;
            await polisMaker.start(myFactory, risks);
            contractMaker.makePDF(myFactory);
            return null;
        }, function error(response) {
            console.error(response);

        })
    }
    $scope.multiClicked = () => {
        const polis = $scope.myFactory.polisObj;
        polis.multi = !polis.multi;
    };
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
        const BTN_SWITCH_TODAY = $scope.currObj[$scope.newDashboard.currentPage].values.filter(val => (val.type === 'btn-switch' && val.control === 'today'))[0];
        const BTN_SWITCH_TIME = $scope.currObj[$scope.newDashboard.currentPage].values.filter(val => (val.type === 'btn-switch' && val.control === 'time'))[0];
        switch (control) {
            case 'start':
                if (valiDate(dates.start)) {
                    dates.start = changeDateView(dates.start);
                    dates.startDate = makeDateFromStr(dates.start);
                    $scope.setEndByTime(dates.startDate, dates.time);
                    BTN_SWITCH_TODAY.selected = ' '; //выставляем значение в ячейку btn-switch
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
                    //выставляем значение в ячейку btn-switch
                    BTN_SWITCH_TIME.selected = ' ';
                    BTN_SWITCH_TIME.name = 'Дата окончания: '
                    dates.time = 'Вручную';
                }
                else {
                    dates.end = null;
                    dates.endDate = null;
                }
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
        if (!start) return false;
        const setEnd = month => {
            const end = new Date(start.getFullYear(), start.getMonth() + month, start.getDate() - 1);
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
     * keyHandler на нажатие энтера в инпутах ввода даты
     * @param {obj} event - event нажатия
     * @param {*} param - объект dashboard , текщая вкладка
     * @param {obj} val - объект на котором нажали
     */
    $scope.keyHandler = (event, param, val) => {
        if (event.keyCode !== 13) return false;
        if (param.type === 'dates') {
            const inputId = `#input_${val.control}`;
            document.querySelector(inputId).blur();
        }
    }
    /**
     * Функция переключения кнопки  btn-switch
     * @param {obj} control объект по которому кликнули
     */
    $scope.switchBtnClick = control => {
        const dates = $scope.myFactory.polisObj.dates;
        control.switch();
        if (control.control === 'today') setStartDay(control);
        if (control.control === 'time') {
            dates.time = control.selected;
            control.name = 'Срок: '; //на всякий случай возвращаем исходное имя, так как оно может меняться, если инпут вручную
            $scope.setEndByTime(dates.startDate, dates.time);
        }
        /**
         * Функция выставления дня начала по переключению кнопки
         * @param {obj} control 
         */
        function setStartDay(control) {
            const ind = control.values.indexOf(control.selected);
            let setDay = new Date();
            const dd = setDay.getDate();
            setDay.setDate(dd + ind);
            $scope.myFactory.polisObj.dates.start = parseDate(setDay);
            $scope.myFactory.polisObj.dates.startDate = setDay;
            $scope.setEndByTime(setDay, $scope.myFactory.polisObj.dates.time);
        }
    }
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
    $scope.loadCompanyProfile = async function (id) {
        myFactory.cameFrom = {
            name: getPathName($location.$$path),
            path: $location.$$path,
        }
        if (myFactory.companyObj.id === id || !myFactory.companyObj || !myFactory.companyObj.id) $scope.changeLocation('Компания');
        else {
            myFactory.companyObj.id = id;
            $location.path('/profile');
        }
    }
    $scope.updateState = async (id) => {
        const baseRiskNeeded = myFactory.parks.some(park => {
            return park.risks.includes(BASENAME);
        })
        // проверяем когда расчеты загрузятся
        const calcIsLoaded = async () => {
            function check() {
                return (id) ? myFactory.calcObj.id === id : myFactory.parks.length > 0 && myFactory.calcObj.isInited;
            }
            return new Promise(resolve => {
                const id = setInterval(() => {
                    if (check()) {
                        clearInterval(id);
                        resolve();

                    }
                }, 100)
            })
        }
        await calcIsLoaded();
        myFactory.polisObj.conditions = []; //удаляем старые значения
        await myFactory.polisObj.loadConditions(myFactory.calcObj.factory.HIPname, baseRiskNeeded);
        myFactory.polisObj.type = myFactory.calcObj.factory.HIPname;
        myFactory.polisObj.additionsSeen = true;
        myFactory.polisObj.updateConditionsCheck();
        if (myFactory.parks.length > 0) $scope.createCars();
        myFactory.polisObj.datesSeen = true;
        $scope.calcFinances();
        myFactory.polisObj.financeSeen = true;
        myFactory.polisObj.dates = myFactory.polisObj.dates;
        myFactory.applyAllScopes();
    }
    /**
     * Функция очистки Оговорок и финансов и их атрибутов "просмотрено"
     */
    $scope.clearState = () => {
        myFactory.polisObj.additionsSeen = false;
        myFactory.polisObj.conditions = undefined;
        myFactory.polisObj.datesSeen = false;
        myFactory.polisObj.financeSeen = false;
        myFactory.payment.array = undefined;
        console.log('state cleared');
    }
    /**
     * удаление страхователя из списка страхователей
     * @param {Company} insurant - страхователь на удаление
     */
    $scope.deleteInsurant = (insurant) => {
        DeleteInsurant(insurant, myFactory);
    }
    /**
     * Перемещаем страхователя вниз или вверх по списку
     * @param {obj} insurant компания, которую надо переместить
     * @param {string} direction 'up'|'down'
     */
    $scope.moveInsurant = (insurant, direction) => {
        const all = myFactory.polisObj.insurants;
        if (all.length === 1) return false;
        const ind = all.indexOf(insurant);
        if (direction === 'up' && ind === 0) return false;
        if (direction === 'down' && ind === all.length - 1) return false;
        const newInd = direction === 'up' ? ind - 1 : ind + 1;
        [all[ind], all[newInd]] = [all[newInd], all[ind]]; //swap elements
    }
    $scope.onClickConfigCheckbox = (name) => {
        myFactory.polisObj.docsIncluded[name] = !myFactory.polisObj.docsIncluded[name];
    }
    $scope.onChange = (el,field,value) => {
        el[field] = value.trim();
    }
    $scope.onClickFocus = (type,elem) => {
        if (elem.tagName==='DIV') elem = elem.parentNode;
        if (type==='sibling') elem = elem.nextElementSibling;
        const focusEl = elem.children[0];
        focusEl.focus();
    }
    $scope.init();
})
