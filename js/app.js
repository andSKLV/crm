import { Process, Park, Multi } from './proto.js';
import { loadRisks, SplineKoeff, Spline, Franchise, BubbleSort, Limit, isNumeric, addSpaces, intFromStr, delay, parseDate, getPathName} from './calculation.js';

window.app = angular.module("mainApp", [
    "ngRoute",
    "ngCookies",
    "ngAnimate",
    "as.sortable"
]);
app.config(function ($routeProvider) {
    //с помощью .config мы определяем маршруты приложения. Для конфигурации маршрутов используется объект $routeProvider.
    /*
       Метод $routeProvider.when принимает два параметра: название маршрута и объект маршрута.
       Объект маршрута задает представление и обрабатывающий его контроллер с помощью параметров
       templateUrl и controller. Поэтому для представлений нам не надо определять контроллер с помощью директивы.
       */
    $routeProvider
        .when("/", {
            templateUrl: "dashboard.html",
            controller: "dashboardCtrl as dashboard"
        })
        .when("/dashboard", {
            resolve: {
                check: function ($location, $cookies, $rootScope, $http) {
                    const cookies = $cookies.getAll();
                    if ($rootScope.loggedIn) $location.path("/dashboard");
                    else if (
                        cookies.hasOwnProperty("login") &&
                        cookies.hasOwnProperty("pwd")
                    ) {
                        let data = {};
                        data.login = cookies.login;
                        data.pwd = cookies.pwd;
                        $http.post("php/authorization.php", data).then(
                            function success(response) {
                                if (response.data["loggin"] === true) {
                                    $rootScope.loggedIn = true;
                                    $location.path("/dashboard");
                                    $rootScope.name = response.data["name"];
                                    $cookies.put("loggedIn", response.data["loggin"]);
                                    $cookies.put("username", response.data["name"]);
                                    $cookies.put("login", response.data["login"]);
                                    $cookies.put("pwd", response.data["pwd"]);
                                    console.log($cookies);
                                }
                            },
                            function error(response) {
                                console.log(response);
                            }
                        );
                    } else $location.path("/");
                }
            },
            templateUrl: "dashboard.html",
            controller: "dashboardCtrl as dashboard"
        })
        .when("/company", {
            templateUrl: "./templates/paths/company/index.html",
            controller: "companyCtrl"
        })
        .when("/polis", {
            templateUrl: "./templates/paths/polis/index.html",
            controller: "polisCtrl as polisCtrl"
        })
        .when("/calculation", {
            templateUrl: "./templates/paths/calculation/index.html",
            controller: "calculationCtrl as calculation"
        })
        .when("/polisEditor", {
            templateUrl: "./templates/paths/polisEditor/index.html",
            controller: "polisEditorCtrl"
        })
        .when("/finance", {
            templateUrl: "./templates/paths/finance/index.html",
            controller: "financeCtrl"
        })
        .when("/profile", {
            templateUrl: "./templates/paths/profile/index.html",
            controller: "profileCtrl"
        })
        .otherwise({
            redirectTo: "/"
        });
});
app.directive("financeDashboard", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/finance/dashboard.html"
    };
});
app.directive("financeMatrix", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/finance/matrix.html"
    };
});
app.directive("financeReturn", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/finance/return.html"
    };
});
app.directive("financeView", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/views/finance.view.html"
    };
});
app.directive("polisEditorReturn", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/polisEditor/return.html"
    };
});
app.directive("polisEditorDashboard", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/polisEditor/dashboard.html"
    };
});
app.directive("polisEditorMatrix", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/polisEditor/matrix.html"
    };
});
app.directive("polisEditorNav", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/polisEditor/navigation.html"
    };
});
app.directive("addition", function () {
    return {
        scope: {
            addition: "="
        },
        restrict: "A",
        templateUrl: "./templates/views/addition.view.html"
    };
});
app.directive("insurant", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/views/insurant.view.html"
    };
});
app.directive("companyView", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/views/company.view.html"
    };
});
app.directive("calculationBottomView", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/calculation/bottom.view.html"
    };
});
app.directive("calculationBottom", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/calculation/bottom.html"
    };
});
app.directive("calculationMatrix", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/calculation/matrix.html"
    };
});
app.directive("calculationReturn", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/calculation/return.html"
    };
});
app.directive("calculationNav", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/calculation/navigation.html"
    };
});
app.directive("calculationDashboard", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/calculation/dashboard.html"
    };
});
app.directive("calculationView", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/views/calculation.view.html"
    };
});
app.directive("polisDashboard", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/polis/dashboard.html"
    };
});
app.directive("polisMatrix", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/polis/matrix.html"
    };
});
app.directive("polisReturn", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/polis/return.html"
    };
});
app.directive("polisHeader", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/polis/header.html"
    };
});
app.directive("polisNav", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/polis/navigation.html"
    };
});
app.directive("companyDashboard", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/company/dashboard.html"
    };
});
app.directive("companyReturn", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/company/return.html"
    };
});
app.directive("companyMatrix", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/company/matrix.html"
    };
});
app.directive("companyNav", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/company/navigation.html"
    };
});
app.directive("karetka", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/dashboards/karetka.html"
    };
});
app.directive("return", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/main/return.html"
    };
});
app.directive("mainNav", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/main/navigation.html"
    };
});
app.directive("findCompany", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/matrix/find_company.html",
        link: function (scope, elements, attrs, ctrl) { }
    };
});
app.directive("searchCompany", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/calculation/search-company.html",
        link: function (scope, elements, attrs, ctrl) { }
    };
});
app.directive("findCalculation", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/matrix/find_calculation.html"
    };
});
app.directive("findCalculationView", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/views/find_calculation_view.html"
    };
});
app.directive("profileDashboard", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/profile/dashboard.html"
    };
});
app.directive("profileHeader", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/profile/header.html"
    };
});
app.directive("profileReturn", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/profile/return.html"
    };
});
app.directive("profileMatrix", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/profile/matrix.html"
    };
});
app.directive("profileNav", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/profile/navigation.html"
    };
});
app.directive("profileCalcs", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/paths/profile/calcs-matrix.html"
    };
});
app.directive("loading", function () {
    return {
        restrict: "A",
        templateUrl: "./templates/views/loading.html"
    };
});

app.directive("ngRightClick", function ($parse) {
    return function (scope, element, attrs) {
        let fn = $parse(attrs.ngRightClick);
        element.bind("contextmenu", function (event) {
            scope.$apply(function () {
                event.preventDefault();
                fn(scope, { $event: event });
            });
        });
    };
});
app.directive("importSheetJs", function SheetJSImportDirective(myFactory) {
    return {
        scope: { opts: '=' },
        link: function ($scope, $elm, $attrs) {
            $elm.on('change', function (changeEvent) {
                try {
                    $scope.changeE = changeEvent;
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        /* read workbook */
                        try {
                            const parkInd = $attrs.importSheetJs.match(/\d+/gi)[0];
                            const procInd = $attrs.importSheetJs.match(/\d+/gi)[1];
                            const park = myFactory.parks[parkInd];
                            const bstr = e.target.result;
                            const workbook = XLSX.read(bstr, { type: 'binary' });
                            const firstList = workbook.Sheets[workbook.SheetNames[0]];
                            $scope.changeE.target.parentNode.classList.toggle('select--hidden'); //закрываем попап с выбором файла
                            const cars = prepareList(firstList);//преобразовываем полученные данные в вид массива с машинами
                            myFactory.setCarsFromExcel(cars,park,parkInd,procInd);// применяем данные машины
                        }
                        catch (e) {
                            alert('Выбран несоответствующий файл. Пожалуйста, выберите файл формата xls или xlsx');
                            console.error(e);
                        }
                    };
                    reader.readAsBinaryString(changeEvent.target.files[0]);
                }
                catch (e) {
                    alert('Выбран несоответствующий файл. Пожалуйста, выберите файл формата xls или xlsx');
                    console.error(e);
                }
                
            });
        }
    };
    /**
     * 
     * @param {object} list - объект данных, полученных из эксель
     * Правила для Экселя: в столбце А стоит нумерация строк с машинами
     * Столбец B C D E это марка, номер, вин и год соответственно
     * @returns {Array} массив с машинами
     */
    function prepareList (list) {
        const validList = [];
        let startRow = 0;
        let endRow = 0;
        const lastRowInFile = parseInt(list['!ref'].match(/.:[A-Z]+(\d*)/)[1]);
        let countStarted = false;
        //определяем строки первой и последней машин
        for (let i=1;i<=lastRowInFile;i++) {
            const key = `A${i}`;
            if (list[key]&&list[key].v===1) {
                // если в ячейке стоит 1, значит это первая машина и это первая строка
                startRow = i;
                countStarted = true;
            }
            if (!list[key]&&countStarted) {
                // если значение в столбце А пустое,а отсчет уже начат, значит таблица закончилась
                endRow = i-1;
                break;
            }
        }
        const cars = [];
        for (let i=startRow;i<=endRow;i++) {
            const car = {
                model: (list[`B${i}`]) ? list[`B${i}`].w.trim() : '',
                autNumber: (list[`C${i}`]) ? list[`C${i}`].w : '',
                VIN: (list[`D${i}`]) ? list[`D${i}`].w : '',
                prodYear: (list[`E${i}`]) ? list[`E${i}`].w : '',
            }
            cars.push(car);
        }
        return cars;
    }
});

app.directive("currencyInput", function ($filter, myFactory) {
    return {
        require: "?ngModel",
        link: function ($scope, $element, $attrs, ctrl) {
            if (!ctrl) {
                return;
            }

            ctrl.$formatters.unshift(function () {
                return $filter("number")(ctrl.$modelValue);
            });

            ctrl.$parsers.unshift(function (viewValue) {
                let plainNumber = viewValue.replace(/[\,\.\s]/g, ""),
                    b = $filter("number")(plainNumber);

                $element.val(b);

                return plainNumber;
            });
            $element.bind("click", $event => {
                $event.target.select();
            });
            $element.bind('blur',$event=>{
                if ($attrs["currencyInput"] == "a_limit") {
                    let val = $element.val().replace(/[\s\,]/g, "") * 1;
                    LimKoef = 1;
                    let a_limit = myFactory.a_limit;
                    a_limit.hand = true;
                    myFactory.finalCalc();
                    a_limit.value = $element.val().replace(/[\s\,]/g, "") * 1;
                    if (a_limit.value == "" || a_limit.value == 0) {
                        a_limit.type = "Агр. лимит";
                        a_limit.value = a_limit.max_limit;
                        myFactory.a_limit.value = a_limit.max_limit;
                        a_limit.hand = false;
                        LimKoef = 1;
                    } else if (a_limit.value == a_limit.max_limit) {
                        a_limit.hand = false;
                        LimKoef = 1;
                    }
                    myFactory.applyAlimit();
                    myFactory.finalCalc();
                    $scope.$apply();
                } else if ($attrs.currencyInput == "payment") {
                    if ($element.val() <= 0 || $element.val() == "") {
                        $element.val(1);
                        myFactory.payment.hand = false;
                    } else {
                        if ($element.val() > 12) $element.val(12);
                        myFactory.payment.hand = true;
                    }
                    myFactory.payment.val = $element.val();
                    myFactory.finalCalc();
                    $scope.$apply();
                } else if ($attrs.currencyInput == "practicalPrice") {
                    console.log(myFactory.totalPrice - (myFactory.totalPrice % 1));
                    if (
                        $element.val() == 0 ||
                        $element.val() == "" ||
                        myFactory.practicalPrice.val ==
                        myFactory.totalPrice - (myFactory.totalPrice % 1)
                    ) {
                        //если мы очистили форму для фактической премии
                        myFactory.checkPracticalPriceKoef(false);
                        if (
                            myFactory.practicalPrice.val ==
                            myFactory.totalPrice - (myFactory.totalPrice % 1)
                        )
                            $element.val("");
                        myFactory.bottom.priceMode = "price";
                    } else {
                        //если мы что-то ввели в фактическую премию
                        if (myFactory.bottom.singleAmount) {
                            myFactory.practicalPrice.val *=
                                myFactory.totalAmount / myFactory.totalAmountForSingle;
                        }
                        myFactory.practicalPrice.koef =
                            myFactory.practicalPrice.val / myFactory.totalPrice;
                        myFactory.checkPracticalPriceKoef(true);
                    }
                    myFactory.finalCalc();
                    $scope.$apply();
                    
                } else if ($attrs.currencyInput == "agents") {
                    const val = myFactory.agents.val;
                    const mode = myFactory.agents.mode;
                    //  ограничиваем агентский процент на 50
                    if (mode === "%" && val > 50) myFactory.agents.val = 50;
                    myFactory.finalCalc();
                    $scope.$apply();
                } else {
                    if ($scope.calculation.karetka.mode == "listener")
                        $scope.calculation.karetka.mode = "making new process";
                    let val = $element.val().replace(/[\s\,]/g, "") * 1;
                    if (myFactory.process.constructor.name == "Park") {
                        if (
                            $attrs["param"] == "amount" &&
                            myFactory.amountType == "Тягачей"
                        )
                            val *= 24;
                        let park = myFactory.process;
                        if (Array.isArray(park[$attrs["param"]])) {
                            if (myFactory.parkTemplate.length > 0) {
                            }
                        } else {
                            park.changeProperty($attrs["param"], val);
                            myFactory.finalCalc();
                            $scope.$apply();
                        }
                    } else if (myFactory.process.constructor.name == "Multi") {
                        if (
                            $attrs["param"] == "amount" &&
                            myFactory.amountType == "Тягачей"
                        )
                            myFactory.process.changeProperty($attrs["param"], val * 24);
                        else myFactory.process.changeProperty($attrs["param"], val);
                    } else {
                        if (
                            $attrs["param"] == "amount" &&
                            myFactory.amountType == "Тягачей"
                        )
                            myFactory.process[$attrs["param"]] = val * 24;
                        else myFactory.process[$attrs["param"]] = val;
                    }
                    if ($scope.calculation.karetka.mode == "making new process") {
                        let i = 0;
                        for (let key in myFactory.process) {
                            if (myFactory.process[key] === "") {
                                $scope.calculation.selectParam(i);
                                let target = $event.target;
                                target.blur();
                                document.querySelector(".dashboard_container").focus();
                                console.log(myFactory.process);
                                return;
                            }
                            i++;
                        }
                        myFactory.addNewProcess();
                        myFactory.finalCalc();
                        $scope.$apply();
                    }
                    if ($scope.calculation.karetka.mode == "changing process")
                        delete myFactory.process.changing;
                }
            })
            $element.bind("keydown keypress", $event => {
                let key = $event.which;
                // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                // This lets us support copy and paste too
                if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40))
                    return;
                if ($attrs["currencyInput"] == "a_limit") {
                    let val = $element.val().replace(/[\s\,]/g, "") * 1;
                    if (key == 13) {
                        LimKoef = 1;
                        let a_limit = myFactory.a_limit;
                        a_limit.hand = true;
                        myFactory.finalCalc();
                        a_limit.value = $element.val().replace(/[\s\,]/g, "") * 1;
                        if (a_limit.value == "" || a_limit.value == 0) {
                            a_limit.type = "Агр. лимит";
                            a_limit.value = a_limit.max_limit;
                            myFactory.a_limit.value = a_limit.max_limit;
                            a_limit.hand = false;
                            LimKoef = 1;
                        } else if (a_limit.value == a_limit.max_limit) {
                            a_limit.hand = false;
                            LimKoef = 1;
                        }
                        myFactory.applyAlimit();
                        myFactory.finalCalc();
                        console.log(myFactory.a_limit.value);
                        $scope.$apply();
                    }
                } else if ($attrs.currencyInput == "payment") {
                    if (key == 13) {
                        if ($element.val() <= 0 || $element.val() == "") {
                            $element.val(1);
                            myFactory.payment.hand = false;
                        } else {
                            if ($element.val() > 12) $element.val(12);
                            myFactory.payment.hand = true;
                        }
                        myFactory.payment.val = $element.val();
                        myFactory.finalCalc();
                        $scope.$apply();
                    }
                } else if ($attrs.currencyInput == "practicalPrice") {
                    if (key == 13) {
                        console.log(myFactory.totalPrice - (myFactory.totalPrice % 1));
                        if (
                            $element.val() == 0 ||
                            $element.val() == "" ||
                            myFactory.practicalPrice.val ==
                            myFactory.totalPrice - (myFactory.totalPrice % 1)
                        ) {
                            //если мы очистили форму для фактической премии
                            myFactory.checkPracticalPriceKoef(false);
                            if (
                                myFactory.practicalPrice.val ==
                                myFactory.totalPrice - (myFactory.totalPrice % 1)
                            )
                                $element.val("");
                            myFactory.bottom.priceMode = "price";
                        } else {
                            //если мы что-то ввели в фактическую премию
                            if (myFactory.bottom.singleAmount) {
                                myFactory.practicalPrice.val *=
                                    myFactory.totalAmount / myFactory.totalAmountForSingle;
                            }
                            myFactory.practicalPrice.koef =
                                myFactory.practicalPrice.val / myFactory.totalPrice;
                            myFactory.checkPracticalPriceKoef(true);
                        }
                        myFactory.finalCalc();
                        $scope.$apply();
                    }
                } else if ($attrs.currencyInput == "agents") {
                    if (key == 13) {
                        const val = myFactory.agents.val;
                        const mode = myFactory.agents.mode;
                        //  ограничиваем агентский процент на 50
                        if (mode === "%" && val > 50) myFactory.agents.val = 50;
                        myFactory.finalCalc();
                        $scope.$apply();
                    }
                } else {
                    if ($scope.calculation.karetka.mode == "listener")
                        $scope.calculation.karetka.mode = "making new process";
                    if (key == 13) {
                        let val = $element.val().replace(/[\s\,]/g, "") * 1;
                        if (myFactory.process.constructor.name == "Park") {
                            if (
                                $attrs["param"] == "amount" &&
                                myFactory.amountType == "Тягачей"
                            )
                                val *= 24;
                            let park = myFactory.process;
                            if (Array.isArray(park[$attrs["param"]])) {
                                if (myFactory.parkTemplate.length > 0) {
                                }
                            } else {
                                park.changeProperty($attrs["param"], val);
                                myFactory.finalCalc();
                                $scope.$apply();
                            }
                        } else if (myFactory.process.constructor.name == "Multi") {
                            if (
                                $attrs["param"] == "amount" &&
                                myFactory.amountType == "Тягачей"
                            )
                                myFactory.process.changeProperty($attrs["param"], val * 24);
                            else myFactory.process.changeProperty($attrs["param"], val);
                        } else {
                            if (
                                $attrs["param"] == "amount" &&
                                myFactory.amountType == "Тягачей"
                            )
                                myFactory.process[$attrs["param"]] = val * 24;
                            else myFactory.process[$attrs["param"]] = val;
                        }
                        if ($scope.calculation.karetka.mode == "making new process") {
                            let i = 0;
                            for (let key in myFactory.process) {
                                if (myFactory.process[key] === "") {
                                    $scope.calculation.selectParam(i);
                                    let target = $event.target;
                                    target.blur();
                                    document.querySelector(".dashboard_container").focus();
                                    console.log(myFactory.process);
                                    return;
                                }
                                i++;
                            }
                            myFactory.addNewProcess();
                            myFactory.finalCalc();
                            $scope.$apply();
                        }
                        if ($scope.calculation.karetka.mode == "changing process")
                            delete myFactory.process.changing;
                        $scope.calculation.clean();
                        let target = $event.target;
                        target.blur();
                    }
                }
            });
        }
    };
});

app.factory("myFactory", function () {
    return {
        scopes: {}, //сохраняем скоупы для ререндеринга
        /**
         * Функция принудительного ререндераа всех скоупов
         */
        applyAllScopes: function () {
            for (let key in this.scopes) {
                const sc = this.scopes[key];
                sc.$apply();
            }
        },
        cameFrom: {
            name: null,
            path: null
        },
        karetkaTypes: {
            'Перевозчики':'HIP.json',
            'Экспедиторы': 'HIP-conf.json',
        },
        calcObj: {},
        companyObj: {},
        makingPolis: false,
        addNewPolisProperty: function () {
            const conditions = this.polisObj.conditions;
            conditions.push({
                name: "",
                values: []
            });
            this.polisCurrent = conditions[conditions.length - 1];
            this.polisCurrent.isNew = true;
        },
        polisCurrent: "",
        multi: {
            multies: [],
            mode: false,
            count: 0,
            template: [],
            arrays: {
                risk: [],
                wrapping: []
            },
            clean: function () {
                this.arrays.risk = [];
                this.arrays.wrapping = [];
                this.mode = false;
                this.template = [];
            }
        },
        /**
         * function multiChangeMode функция меняет состояние мульти
         * @param {boolean} mode режим мульти
         */
        multiChangeMode: function (mode) {
            if (mode === undefined) {
                if (this.multi.mode == false) {
                    if (
                        this.process.wrapping != "" &&
                        this.process.wrapping != "multi" &&
                        this.multi.arrays.wrapping.indexOf(this.process.wrapping)
                    )
                        this.multi.arrays.wrapping.push(this.process.wrapping);
                    if (
                        this.process.risk != "" &&
                        this.process.risk != "multi" &&
                        this.multi.arrays.risk.indexOf(this.process.risk)
                    )
                        this.multi.arrays.risk.push(this.process.risk);
                    this.multi.mode = true;
                } else this.multi.mode = false;
            } else this.multi.mode = mode;
            console.log(this.multi.mode);
        },
        /**
         * этот раздел с keyCodes можно удалить
         */
        keyCodes: {
            qwerty: {
                mass: [113, 119, 101, 114, 116, 121, 117, 105, 111, 112],
                length: 0
            },
            number: {
                mass: [49, 50, 51, 52, 53, 54, 55, 56, 57, 48], //длину придется пока задавать
                length: 7
            },
            tab: {
                mass: [60, 62, 167, 177]
            }
        },
        document: {
            model: "Расчет",
            currParam: 0,
            selectedParam: 0,
            clean: function () {
                this.currParam = "";
                this.selectedParam = "";
            },
            currency: "Р"
        },
        bottom: {
            singleAmount: false,
            priceMode: "price"
        },
        matrixType: "find",

        a_limit: {
            max_limit: 0,
            value: 0,
            type: "Агр. лимит",
            hand: false
        },
        /**
         * ручной ввод агрегатного лимита
         */
        changeAlimit() {
            let a_limit = this.a_limit;
            if (a_limit.type == "Агр. лимит") {
                a_limit.type = "Кол-во случаев";
                a_limit.value = 1;
                a_limit.hand = true;
                this.applyAlimit();
            } else {
                a_limit.hand = false;
                a_limit.type = "Агр. лимит";
                if (!a_limit.hand) a_limit.value = a_limit.max_limit;
            }
        },
        /**
         * Функция для изменения значения лимита на "кол-во случае" со значением times - раз
         * @param {number} times - количество случаев
         */
        setAlimitAsTimes(times) {
            let a_limit = this.a_limit;
            if (a_limit.type === "Кол-во случаев" && a_limit.value === times)
                return true;
            LimKoef = 1;
            a_limit.type = "Кол-во случаев";
            a_limit.value = times;
            a_limit.hand = true;
            // первый расчет нужен для формирования значений цены
            this.finalCalc();
            // применение лимита к существующим значениям
            this.applyAlimit();
            this.finalCalc();
        },
        /**
         * Функция изменения на агр. лимит
         */
        setAlimitAsAgr() {
            const a_limit = this.a_limit;
            a_limit.hand = false;
            a_limit.type = "Агр. лимит";
            if (!a_limit.hand) a_limit.value = a_limit.max_limit;
        },
        /**
         * применение агрегатного лимита
         */
        applyAlimit: function () {
            let a_limit = this.a_limit;
            if (a_limit.value < a_limit.max_limit && a_limit.type == "Агр. лимит") {
                this.parks.forEach(function (park) {
                    park.cutDownLimits(a_limit.value);
                });
                a_limit.hand = false;
                LimKoef = 1;
            } else {
                let overall = 0;
                this.cleanUpProcessesInParks();
                if (a_limit.type == "Кол-во случаев") {
                    this.parks.forEach(function (park) {
                        overall += park.calculateMatrixWithAlimit(a_limit.value, true) * 1;
                    });
                    LimKoef = overall / this.totalPrice;
                } else {
                    this.parks.forEach(function (park) {
                        overall += park.calculateMatrixWithAlimit(a_limit.value, false) * 1;
                    });
                    overall = Math.abs(overall - this.totalPriceWithoutPayments);
                    overall *= a_limit.max_limit / a_limit.value;
                    overall += this.totalPrice;
                    overall = overall / this.totalPrice;
                    LimKoef = overall;
                }
            }
        },
        /**
         * все что касается этапов платежей
         */
        payment: {
            val: 0,
            hand: false,
            mode: "ON",
            totalPrice: null,
            leftPrice: null,
            calcDebt: null,
            payed: "0",
            changeMode: function () {
                if (this.mode == "ON") {
                    this.mode = "OFF";
                    this.val = 1;
                    this.hand = false;
                } else this.mode = "ON";
            },
            /**
             * функция создает массив из этапов платежей, необходимо для дальнейшего управления финансами полиса
             * @param {number} price
             */
            makeArray(price, { start = "", end = "", time = "", startDate = ''}) {
                const getCurrentDate = date => {
                    let day = date.getDate();
                    let month = date.getMonth() + 1;
                    let year = date.getFullYear();
                    if (day < 10) day = `0${day}`;
                    if (month < 10) month = `0${month}`;
                    return `${day}.${month}.${year}`;
                };
                const chooseLong = (start, end, time) => {
                    switch (time) {
                        case "Год":
                            return 12;
                        case "6 месяцев":
                            return 6;
                        case "Вручную":
                            //возвращаем примерное количество месяцев
                            return Math.ceil(
                                (new Date(end) - new Date(start)) / (30 * 86400000)
                            );
                        default:
                            return 12;
                            break;
                    }
                };
                this.totalPrice = price;
                this.datesWhenCreated = { start, end, time }; //записываем значение, чтобы потом сравнивать и если что обновлять финансы

                let payment = addSpaces(Math.round(price / this.val)); //рассчитываем цену одного платежа
                this.calcDebt = payment; //устанавливаем долг равный полной цене
                this.leftPrice = addSpaces(Math.round(price / this.val) * this.val);
                start = start.replace(/(\d+).(\d+).(\d+)/, "$2.$1.$3"); // меняем местами месяц и день в дате, чтобы js воспринимал нормально дату
                end = end.replace(/(\d+).(\d+).(\d+)/, "$2.$1.$3");
                const array = [];
                const long = chooseLong(start, end, time); //выбираем продолжительность

                if (long < this.val)
                    console.warn("Продолжительность договора меньше чем этапов платежей"); // пока неизвестно, что с этим делать
                for (let i = 0; i < this.val; i++) {
                    let date = start.length === 10 ? new Date(startDate) : new Date();
                    date.setMonth(date.getMonth() + i*(long / this.val));
                    date = getCurrentDate(date);
                    array.push({
                        price: "",
                        date: "",
                        debt: payment,
                        debtDate: date,
                        manual: false
                    });
                }
                this.array = array;
            }
        },
        agents: {
            val: "",
            getKoef: function (totalPrice) {
                this.val *= 1;
                if (this.mode == "%") {
                    let newPrice = totalPrice / (1 - this.val / 100);
                    return newPrice / totalPrice;
                } else {
                    let newPrice = totalPrice + this.val;
                    return newPrice / totalPrice;
                }
            },
            mode: "%",
            changeMode: function () {
                if (this.mode == "Р") this.mode = "%";
                else this.mode = "Р";
            }
        },
        practicalPrice: {
            val: "",
            koef: 1
        },
        process: {
            cost: "",
            amount: "",
            wrapping: "",
            risk: "",
            limit: "",
            franchise: ""
        },
        cleanProcess: function () {
            // очищаем каретку от заполненного процесса
            this.process = {};
            for (let i = 0; i < transportProp.length; i++)
                this.process[transportProp[i]] = "";
        },
        amountType: "Тягачей", // для фильтра тягачей
        changeAmountType: function () {
            //для фильтра тягачей
            if (this.amountType == "Тягачей") this.amountType = "Рейсов";
            else this.amountType = "Тягачей";
        },
        parks: [],
        parkTemplate: [],
        /**
         * функция распределения процессов по паркам
         * @param {array} array массив процессов
         * @param {park} park если данный агрумент есть - значит процессы нужно вставить именно в этот парк
         * @param {number} index если index получен, то процессы нужно вставить после данного номера в парке
         * @param {park} oldPark
         */
        choosePark(array, park, index, oldPark) {
            // проверяем если передали список мультиузлов
            for (let j = 0; j < array.length; j++) {
                let process = array[j];
                if (process.constructor.name == "Multi") {
                    let multi = process;
                    array.splice(j, 1);
                    for (let i = 0; i < multi.processes.length; i++) {
                        array.splice(j + i, 0, multi.processes[i]);
                    }
                }
            }

            if (park) {
                let indexToPaste = index;
                // присваиваем новым процам старый парк
                array.forEach(function (process) {
                    // назначаем каждому новому процессу этот парк
                    process.park = park;
                    // если этого проца нет в парке то ставим его на место инжекс в этом парке
                    if (park.processes.indexOf(process) === -1) {
                        park.processes.splice(indexToPaste, 0, process);
                        indexToPaste++;
                    }
                });
            } else {
                let newParkFlag = false;
                let myFactory = this;
                if (this.parks.length == 0) newParkFlag = true;
                else {
                    array.forEach(function (process) {
                        if (myFactory.parks[0].risks.indexOf(process.risk) != -1)
                            newParkFlag = true;
                    });
                }
                if (newParkFlag) {
                    if (oldPark) {
                        for (let i = 0; i < array.length; i++) {
                            if (i == 0) {
                                this.parks.push(new Park(array[i]));
                            } else {
                                array[i].park = this.parks[this.parks.length - 1];
                                this.parks[this.parks.length - 1].processes.splice(
                                    i,
                                    0,
                                    array[i]
                                );
                            }
                        }
                    } else {
                        for (let i = 0; i < array.length; i++) {
                            if (i == 0) {
                                this.parks.splice(i, 0, new Park(array[i]));
                            } else {
                                array[i].park = this.parks[0];
                                this.parks[0].processes.splice(i, 0, array[i]);
                            }
                        }
                    }
                } else {
                    //если таких рисков в первом парке нету
                    for (let i = 0; i < array.length; i++) {
                        array[i].park = this.parks[0];
                        this.parks[0].processes.unshift(array[i]);
                    }
                }
            }
        },
        /**
         * функция меняет коэффициент фактической премии
         * @param {boolean} mode фактическая премия либо есть либо нет
         *
         */
        checkPracticalPriceKoef: function (mode) {
            let myFactory = this;
            if (mode) {
                this.parks.forEach(function (park) {
                    park.processes.forEach(function (process) {
                        process.practicalPriceKoef = myFactory.practicalPrice.koef;
                    });
                });
            } else {
                this.parks.forEach(function (park) {
                    park.processes.forEach(function (process) {
                        delete process.practicalPriceKoef;
                    });
                });
            }
        },
        /**
         * функция считает количество траков по всем паркам
         */
        calculateParksAmount() {
            let sum = 0;
            this.parks.forEach(function (park) {
                sum += park.calculateAmount();
            });
            totalAmount = sum;
            this.totalAmount = totalAmount;
        },
        /**
         * функция ищет максимальный лимит по случаю
         */
        findMaxLimit() {
            let max = 0;
            this.parks.forEach(function (park) {
                max = Math.max(park.findMaxLimit(), max);
            });
            this.a_limit.max_limit = max;
            //if(!this.a_limit.hand) this.a_limit.value=max;
        },
        makePackage() {
            //пакеты
            let array = [];
            let obj = {};
            obj.packName = this.process.risk;
            obj.template = this.multi.template;
            this.process.risk = BASENAME;
            this.process["package"] = obj.packName;
            //this.process.multi=this.multi.count;
            array.push(new Process(this.process));
            let myFactory = this;

            this.multi.template.forEach(function (proc) {
                let newProcess = {};
                for (let key in myFactory.process)
                    newProcess[key] = myFactory.process[key];
                for (let key in proc) {
                    if (key == "limit" || key == "franchise")
                        newProcess[key] = proc[key] * myFactory.process[key];
                    else newProcess[key] = proc[key];
                }

                array.push(new Process(newProcess));
            });
            obj.array = array;
            delete this.process["package"];
            return obj;
        },
        /**
         * @function функция для того чтобы совместить старый мульти узел и новый создаваемый
         * @param {array} array массив с новыми процами
         * @param {object} старый объект мульти
         * @return
         */
        bindMulti: function (array, multi) {
            if (multi.packName) delete multi.packName;
            if (multi.template) delete multi.template;
            let myFactory = this;
            let mass = [];
            // копируем все процы из старого мульти в массив
            multi.processes.forEach(proc => mass.push(proc));
            // удаляем все эти процы которые были в массиве
            for (let i = 0; i < mass.length; i++) {
                let process = mass[i];
                process.remove();
            }
            // ставим новые процы на место старых
            multi.processes = array;
            // привязываем процам мульти объект
            multi.processes.forEach(function (process) {
                process.multi = multi;
            });
            return multi;
        },
        /**
         * @function функция для создания мультиузлов
         * @param {array} bindMulti массив с процессами, для которым мы создаем мультиузел
         * @return {object} возвращает массив с процессами
         */
        makeMulti(bindMulti) {
            if (this.multi.arrays.risk.length == 0) {
                this.multi.arrays.risk.push(this.process.risk);
            }
            if (this.multi.arrays.wrapping.length == 0) {
                this.multi.arrays.wrapping.push(this.process.wrapping);
            }
            if (
                this.multi.arrays.wrapping.length === 1 &&
                this.multi.arrays.risk.length === 1
            ) {
                this.process.risk = this.multi.arrays.risk[0];
                this.process.wrapping = this.multi.arrays.wrapping[0];
                let risk = this.multi.arrays.risk[0];
                let packages = this.packages.filter(function (pack) {
                    //пакеты
                    return pack.name == risk;
                });
                if (packages.length > 0) {
                    this.multi.template = packages[0].values;
                    let obj = this.makePackage();
                    if (bindMulti) {
                        this.bindMulti(obj.array, bindMulti);
                        bindMulti.packName = obj.packName;
                        bindMulti.template = obj.template;
                    } else
                        this.multi.multies.push(
                            new Multi(obj.array, obj.packName, obj.template)
                        );
                    return obj.array;
                } else {
                    if (bindMulti) {
                        let myFactory = this;
                        bindMulti.processes.forEach(function (process) {
                            if (
                                myFactory.multi.arrays.risk.indexOf(process.risk) == -1 ||
                                myFactory.multi.arrays.wrapping.indexOf(process.wrapping) == -1
                            )
                                bindMulti.processes.splice(
                                    bindMulti.processes.indexOf(process),
                                    1
                                );
                        });
                    } else return [new Process(this.process)];
                }
            }
            //  массив который потом возвращаем как новый мульти объект
            let array = [];
            let obj;
            // блок для поштучного создания процев из данных
            // для каждого пункта "тип отсека" в коллекторе мульти
            for (let i = 0; i < this.multi.arrays.wrapping.length; i++) {
                // для каждого пункта "риск" в коллекторе мульти
                for (let j = 0; j < this.multi.arrays.risk.length; j++) {
                    this.process.wrapping = this.multi.arrays.wrapping[i];
                    this.process.risk = this.multi.arrays.risk[j];
                    let risk = this.process.risk;
                    let packages = this.packages.filter(function (pack) {
                        //пакеты
                        return pack.name == risk;
                    });
                    if (packages.length > 0) {
                        this.multi.template = packages[0].values;
                        obj = this.makePackage();
                        obj.array.forEach(function (proc) {
                            array.push(proc);
                        });
                    } else {
                        // получаем объект голых процев
                        array.push(new Process(this.process));
                    }
                }
            }
            // перемещение базовых рисков на первую строчку если они есть
            let flag = false;
            array.forEach(process => {
                if (process.risk == BASENAME) flag = true;
            });
            if (flag) {
                while (array[0].risk != BASENAME) {
                    array.push(array.splice(0, 1)[0]);
                }
            }
            //
            let multi;
            // если уже есть мульти с которым связываем
            // bindMulti старый мульти узел по которому кликнули
            if (bindMulti) {
                multi = this.bindMulti(array, bindMulti);
            }
            // если новый мульти
            else {
                multi = new Multi(array);
                this.multi.multies.push(multi);
            }

            if (obj) {
                multi.packName = obj.packName;
                multi.template = obj.template;
            }
            return array;
        },
        /**
         * @function функция добавления нового процесса/процессов
         * @param {string} mode режим
         * @param {array} multiChanging массив с процессами для мультиузла
         */
        addNewProcess(mode, multiChanging, indexToPaste) {
            //если мульти
            if (mode == "changing") {
                let park = this.process.park;
                let process = this.process;
                // очищаем myFActory.process на котором нажали
                this.cleanProcess();
                // создаем тот же проц с ключевыми параметрами, но без всех атрибутов типа мульти, парк и расчеты
                // потом будем им заменять старый
                for (let key in process) {
                    if (transportProp.indexOf(key) != -1)
                        this.process[key] = process[key];
                }
                //SKLV: deleting existing procceses that are in multi
                let index = park.processes.indexOf(process);
                const nubOfMulti = multiChanging ? multiChanging.processes.length : 1;
                if (process.multi) {
                    //SKLV: 30.05.18 fixed index of multi-cell
                    let minIndex = park.processes.length;
                    process.multi.processes.forEach(proc => {
                        let ind = park.processes.indexOf(proc);
                        if (ind < minIndex) minIndex = ind;
                    });
                    index = minIndex;
                } else {
                    park.processes.splice(index, nubOfMulti);
                }
                if (this.multi.template.length > 0) {
                    //если меняем на пакет
                    let obj = this.makePackage();
                    let array = obj.array;
                    this.multi.multies.push(new Multi(array, obj.packName, obj.template));
                    this.choosePark(array, park, index);
                } else if (
                    this.multi.arrays.risk.length > 0 ||
                    this.multi.arrays.wrapping.length > 0
                ) {
                    //если меняем на комплекс
                    // создаем новый мульти узел из старого объекта на основании того, что у него записано в рисках и типах отсека
                    let array = this.makeMulti(multiChanging);
                    // новый мульти узел, парк, индекс для вставки
                    if (indexToPaste !== undefined) index = indexToPaste;
                    this.choosePark(array, park, index);
                    this.multi.template = [];
                }
            } else if (
                this.multi.arrays.risk.length > 0 ||
                this.multi.arrays.wrapping.length > 0
            ) {
                let array = [];
                // разделяем мульти-риски на пакеты и просто риски
                const splittedRisks = splitRisks.call(this);
                // проверяем есть ли там больше пакетов чем надо
                const needToEnroll = checkEnroll(splittedRisks);
                // если есть, делаем из этого один большой мульти-узел
                if (needToEnroll) {
                    const enrolledRisks = enrollRisks.call(this, splittedRisks);
                    this.multi.arrays.risk = [];
                    // удаляем базовые риски, чтобы потом поместить в начало
                    delete enrolledRisks[BASENAME];
                    this.multi.arrays.risk = Object.keys(enrolledRisks);
                    // добавляем базовые риски в начало списка
                    this.multi.arrays.risk.unshift(BASENAME);
                    array = this.makeMulti();
                    array.forEach(pr => {
                        const limitKoef = enrolledRisks[pr.risk]
                            ? enrolledRisks[pr.risk]
                            : 1;
                        pr.limit = pr.limit * limitKoef;
                    });
                } else {
                    array = this.makeMulti();
                }
                this.choosePark(array);

                function splitRisks() {
                    const packages = []; // все выбранные пакеты
                    const notPackages = []; // все выбранные процы
                    const multiArr = [...this.multi.arrays.risk];
                    // сортируем на пакеты и просто риски
                    multiArr.map(risk => {
                        if (this.packages.some(pack => pack.name === risk))
                            packages.push(risk);
                        else notPackages.push(risk);
                    });
                    return { packages, notPackages };
                }
                function checkEnroll({ packages, notPackages }) {
                    return !(
                        packages.length === 0 ||
                        (notPackages.length === 0 && packages.length === 1)
                    );
                }
                function enrollRisks({ packages, notPackages }) {
                    const sum = {};
                    packages.forEach(pack => {
                        // проходимся по каждому пакету, вытаскиваем его риск, добавляем в коллектор, запоминаем лимит
                        // если риск повторяется, сравниваем по лимиту и оставляем больший лимит
                        const thisPack = this.packages
                            .find(p => p.name === pack)
                            .values.map(val => {
                                const limit = val.limit ? val.limit : 1;
                                sum[val.risk] = sum[val.risk]
                                    ? Math.max(sum[val.risk], limit)
                                    : limit;
                            });
                    });
                    // проходимся по каждому отдельному риску и добавляем его в список, если уже существует, то ставим коэф 1
                    notPackages.forEach(risk => {
                        sum[risk] = 1;
                    });
                    return sum;
                }
            } else if (this.multi.template.length > 0) {
                //пакеты
                let obj = this.makePackage();
                let array = obj.array;
                this.multi.multies.push(new Multi(array, obj.packName, obj.template));
                this.choosePark(array);
                const times = packageTimes.call(this, obj.packName);
                if (times) {
                    this.setAlimitAsTimes(times);
                }
                /**
                 * Функция нахождения параметра "кол-во раз" в пакете
                 * @param {string} name - название пакета
                 * @returns {number} кол-во раз, если undefined значит такого параметра нет
                 */
                function packageTimes(name) {
                    const searchedPack = this.packages.find(pack => pack.name === name);
                    return searchedPack ? searchedPack.times : false;
                }
            }
            //если не мульти
            else {
                this.choosePark(
                    [new Process(this.process)],
                    undefined,
                    undefined,
                    mode
                );
            }
            this.cleanProcess();
        },
        /**
         * функция получения итоговой премии
         */
        getTotal: function () {
            let sum = 0;
            this.parks.forEach(function (park) {
                sum += park.getTotal();
            });
            return sum;
        },
        /**
         * функция для очистки мусора
         * сюда поступают уже измененные массивы, то есть с добавленным или удаленным узлами
         */
        cleanUpProcessesInParks() {
            let mass = [];
            let myFactory = this;
            // создаем новые парки из имеющихся процессов
            this.parks.forEach(function (park, i) {
                let arr = park.check(); //обнуляем все значения для парка(риски, базовая премия, коэфф риска)
                arr.forEach(function (process) {
                    delete process.park;
                    mass.push(new Process(process));
                });
                if (park.processes.length > 0) park.replaceBase(); //Базовый риск ставим на первое место
            });
            const toSplice = [];
            for (let i = 0; i < this.parks.length; i++) {
                const park = this.parks[i];
                if (park.processes.length == 0) toSplice.push(park); //выбираем для удаления пустые парки
            }
            toSplice.forEach(park=>myFactory.parks.splice(myFactory.parks.indexOf(park), 1)); // удаляем пустые парки
            for (let i = 0; i < mass.length; i++) {
                this.process = mass[i];
                this.addNewProcess("replacing");
            }

            this.parks.forEach(function (park) {
                let mass = park.check(false);
                park.replaceBase();
            });
        },
        /**
         * основная функция для расчета, в которую входят все остальные
         */
        finalCalc() {
            this.parkTemplate = [];

            //**************************при загрузке расчета из БД**************************
            if (risks.length == 0 && this.currObj !== undefined) {
                for (let i = 0; i < this.currObj.length; i++) {
                    let currObj = this.currObj;
                    for (let j = 0; j < currObj[i].values.length; j++) {
                        if (currObj[i].values[j].type == "risk")
                            risks[currObj[i].values[j].name] = currObj[i].values[j].value;
                    }
                }
            }
            //******************************************************************************
            this.cleanUpProcessesInParks(); //обнуляем все значения, необходимые для парка:     +//смотрим есть ли повторяющиеся риски                   +
            this.calculateParksAmount();
            this.findMaxLimit();
            let myFactory = this;
            this.parks.forEach(park => {
                park.processes.forEach(process => {
                    delete process.showRows;
                });
            });
            this.multi.multies.forEach(function (multi) {
                if (multi.processes.length == 1) {
                    delete multi.processes[0].multi;
                    myFactory.multi.multies.splice(
                        myFactory.multi.multies.indexOf(multi),
                        1
                    );
                }
            });
            // это какой то бред который удаляет парки если они пустые, кажется вижу уже второй раз
            this.parks.forEach(function (park, i) {
                //
                if (park.processes.length == 0)
                    myFactory.parks.splice(myFactory.parks.indexOf(park), 1);
                else park.calculate(); //считаем каждую строку парка
            });
            //подсчет премии с агрегатным лимитом, отличным от обычного
            //***************** считаем Агр. лимит
            if (
                this.a_limit.hand &&
                ((this.a_limit.type == "Агр. лимит" &&
                    this.a_limit.value > this.a_limit.max_limit) ||
                    this.a_limit.type == "Кол-во случаев")
            ) {
                this.parks.forEach(function (park) {
                    park.applyKoef(LimKoef);
                });
            } else {
                this.a_limit.hand = false;
                this.a_limit.value = this.a_limit.max_limit;
                this.a_limit.type = "Агр. лимит";
            }
            this.totalPrice = this.getTotal();
            //****************
            if (isNaN(this.totalPrice)) return;
            //****************считаем этапы платежей
            if (this.payment.mode == "ON") {
                if (!this.payment.hand) {
                    let a = this.totalPrice / 30000;
                    a -= a % 1;
                    if (a == 0) a = 1;
                    else if (a > 12) a = 12;
                    else {
                        while (a != 1 && a != 2 && a != 4 && a != 6 && a != 12) {
                            a--;
                        }
                    }
                    this.payment.val = a;
                }
                let spline = Spline(this.totalPrice, Points.payment, 3);
                spline /= 100 * (12 - 1);
                spline = spline * this.payment.val - spline;
                this.payment.koef = 1 + spline;
                this.parks.forEach(function (park) {
                    park.applyKoef(1 + spline);
                });
                this.totalPriceWithoutPayments = this.totalPrice;
                this.totalPrice = this.getTotal();
            }
            //****************
            //****************Агентские
            if (this.agents.val != 0) {
                let agentKoef = this.agents.getKoef(this.totalPrice);
                this.parks.forEach(function (park) {
                    park.applyKoef(agentKoef);
                });
            }
            //****************
            //****************Для одного тягача
            this.totalPrice = this.getTotal();
            if (this.amountType == "Тягачей") {
                this.totalAmountForSingle = 24;
            } else {
                this.totalAmountForSingle = 1;
            }
            this.totalPriceForSingle =
                this.totalPrice / (this.totalAmount / this.totalAmountForSingle);
            //****************
            //****************Фактическая премия
            if (this.practicalPrice.val != 0 && this.practicalPrice.val != "") {
                this.parks.forEach(function (park) {
                    park.applyPracticalPriceKoef();
                });
                let val = this.getTotal();
                //SKLV 19.06.2018: changed round of val instead of val-(val%1)
                this.practicalPrice.val = Math.round(val);
                if (this.bottom.singleAmount)
                    this.practicalPrice.val /=
                        this.totalAmount / this.totalAmountForSingle;
            }
            //****************
            this.multi.multies.forEach(function (multi) {
                multi.calculatePrice();
            });
            this.parks.forEach(function (park) {
                park.getValues();
            });
            this.fixHeight();
        },
        fixHeight() {
            //andSKLV: 13.06.2018
            // this method made to auto change Calc matrix max-height so it can fit in one screen
            const windowHeight = document.documentElement.clientHeight;
            const matrix = document.querySelector(".calc");
            const top = matrix ? matrix.offsetTop : 233; //there is the problem with script working before render and matrix=null, 233 is a common offsetTop value
            const bottomMatrix = document.querySelector(".bottom");
            //check if bottomMAtrix exist. without chech will be error throw at start
            const bottomMatrixHeight = bottomMatrix ? bottomMatrix.offsetHeight : 80;
            let maxHeight = windowHeight - (top + bottomMatrixHeight + 8);
            if (matrix) {
                matrix.style.maxHeight = `${maxHeight}px`;
            }
        },
        removeCellSelection(matrix = "matrix_table", withoutAlready) {
            const selectedCell = document.querySelector(`.${matrix} .mi_selected`);
            if (selectedCell !== null) selectedCell.classList.toggle("mi_selected");
            if (withoutAlready) return true;
            const alreadySelectedCells = document.querySelectorAll(
                `.${matrix} .alreadySelected`
            );
            alreadySelectedCells.forEach(cell =>
                cell.classList.toggle("alreadySelected")
            );
        },
        /**
         * Функция удаления проца, удаляет из парка и из мульти-узла с учетом наследственности мульти-узла
         * @param {Object} process - проц, который надо удалить
         */
        deleteProcess(process) {
            if (process.multi) {
                if (process.multi.multi) {
                    process.multi.multi.processes.splice(
                        process.multi.multi.processes.indexOf(process.multi),
                        1
                    );
                }
                process.multi.processes.splice(
                    process.multi.processes.indexOf(process),
                    1
                );
                if (process.multi.processes.length < 2) {
                    let newMulti;
                    if (process.multi.prevMulti) newMulti = process.multi.prevMulti;
                    else if (process.multi.multi) newMulti = process.multi.multi;
                    if (newMulti) {
                        // если в мульти узле остался только один проц
                        // то удаляем этот мульти, а оставшемуся процу присваиваем предыдущим мульти узел
                        process.multi.processes[0].multi = newMulti;
                        if (!newMulti.processes) {
                            throw new Error(
                                "Верхний мульти с другой структурой. Нет .processes"
                            );
                            debugger;
                        }
                        newMulti.processes.push(process.multi.processes[0]);
                    }
                    this.multi.multies.splice(
                        this.multi.multies.indexOf(process.multi),
                        1
                    );
                }
            }
            if (process.park.processes.length > 1) {
                //удаляем процесс из парка
                process.park.processes.splice(
                    process.park.processes.indexOf(process),
                    1
                );
            }
            // если процесс единственный в парке, удаляем парк
            else this.parks.splice(this.parks.indexOf(process.park), 1);
        },
        /**
         * Функция очистки фактори от всех следов вычислений. обнуление
         */
        cleanCalculations() {
            debugger;
            this.calculationName = "";
            const lim = this.a_limit;
            lim.max_limit = 0;
            lim.value = 0;
            lim.type = "Агр. лимит";
            lim.hand = false;
            this.agents.mode = "%";
            this.agents.val = "";
            this.amountType = "Тягачей";
            this.bottom.priceMode = "price";
            this.bottom.singleAmount = false;
            this.matrixType = "HIP";
            this.multi.arrays.risk = [];
            this.multi.arrays.wrapping = [];
            this.multi.count = 0;
            this.multi.mode = false;
            this.multi.multies = [];
            this.multi.template = [];
            this.parkTemplate = [];
            this.parks = [];
            this.payment.hand = false;
            this.payment.mode = "ON";
            this.payment.val = 0;
            this.practicalPrice.koef = 1;
            this.practicalPrice.val = "";
            this.cleanProcess();
            delete this.totalAmount;
            delete this.totalAmountForSingle;
            delete this.totalPrice;
            delete this.totalPriceForSingle;
            delete this.totalPriceWithoutPayments;
        },
        /**
         * Запрос на получение данных из БД calculation_link
         * @param {string} type - тип по которому искать в БД: 'calc_id','company_id' ...
         * @param {string} id - id по которому искать в формате строки
         */
        async loadLinks(type, id) {
            // проверка запроса
            if (typeof id === "number") id = `${id}`;
            if (
                type !== "calc_id" &&
                type !== "company_id" &&
                type !== "agent_id" &&
                type !== "contact_id" &&
                type !== "id"
            ) {
                console.error(
                    `Параметры функции неверны: ${type} должен быть calc_id, company_id ...`
                );
                return undefined;
            }
            // формирование запроса
            const fd = new FormData();
            fd.append("type", type);
            fd.append("id", id);
            const req = new Request("php/get_link.php", { method: "POST", body: fd });
            return fetch(req).then(
                async resp => {
                    return (resp = await resp.json());
                },
                err => {
                    console.error("Ошибка поиска привязки расчета");
                }
            );
        }
    };
});
