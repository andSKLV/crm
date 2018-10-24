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
        if (!myFactory.polisObj || !myFactory.polisObj.isRequested || !$scope.currObj || $scope.currObj.length === 0) {
            if (!myFactory.polisObj.conditions) await myFactory.polisObj.loadConditions();
            await loadDashboardObj();
        };
        myFactory.polisObj.updateConditionsCheck();
        openTab();
    }

    $scope.itemsList = {
        items1: [],
        items2: []
    };

    for (let i = 0; i <= 5; i += 1) {
        $scope.itemsList.items1.push({ 'Id': i, 'Label': 'Item A_' + i });
    }

    for (let i = 0; i <= 5; i += 1) {
        $scope.itemsList.items2.push({ 'Id': i, 'Label': 'Item B_' + i });
    }
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
    $scope.loadAddition = ind => {

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
                default:
                    return false;
                    break;
            }
        }
    }

    $scope.loadProcess = (process, key) => {
        myFactory.loadProcess = {
            process,
            key
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
    $scope.init();
})