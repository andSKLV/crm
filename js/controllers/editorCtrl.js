app.controller('editorCtrl', function ($scope, $rootScope, $http, $q, $location, myFactory) {
    $scope.myFactory = myFactory;
    myFactory.scopes.profile = $scope;
    const scope = this;

    this.span = 1;
    this.karetkaDepth = 1;
    this.myFactory = myFactory;
    myFactory.scopes.calculation = $scope;
    this.search_params = [];
    this.isArray = angular.isArray;
    this.config = "HIP.json";
    this.myFactory.matrixType = 'HIP';
    if (this.myFactory.HIPname === undefined) this.myFactory.HIPname = 'Перевозчики';
    this.myFactory.scop = this;

    $scope.editor = {
        activeStage: 0,
        activeIndex: 0,
        all: [],
        urls: [],
        objs: [],
        active: {
            stage1: null,
            stage2: null,
            stage3: null,
            stage4: null,
            stage5: null,
        },
        editingObj: null,
        editingParam: null,
        editingObjCanDelete: false,
        stage1: null,
        stage2: null,
        stage3: null,
        stage4: null,
        stage5: null,
    }
    $scope.selectParam = (stage, index, stageNum) => {
        let selectedParam = stage[index];
        $scope.editor.exactEditingObj = selectedParam;
        $scope.editor.editingObjCanDelete = $scope.isDeletable (selectedParam);
        $scope.clearActive(stageNum);
        $scope.editor.active[`stage${stageNum}`] = index;
        if (selectedParam.type === "relocate_here") {
            const url = selectedParam.urlTo;
            selectedParam = $scope.editor.urls.find(x => x.url === url);
        }
        $scope.editor.activeIndex = index;
        $scope.makeStageName(selectedParam.values,stageNum);
        $scope.clearRest(stageNum); 
        $scope.makeEditing(selectedParam);
    }
    $scope.isDeletable = (obj) => {
        const notDeleteTypes = ["inputForCurrency","currencyValue","amountType","inputForCurrency"];
        if ($scope.editor.stage1.includes(obj)) return false;
        if (notDeleteTypes.includes(obj.type)) return false;
        return true;
    }
    $scope.clearActive = stageNum => {
        for (stageNum; stageNum < 5; stageNum++) {
            $scope.editor.active[`stage${stageNum}`] = null;
        }
    }
    /**
     * Удаляет ненужные уровни если был выбран 3, а теперь 1, то нужно удалить старые 2 и 3 
     * @param {number} stageNum номер уровня
     */
    $scope.clearRest = (stageNum) => {
        const stages = Object.keys($scope.editor).filter(x => x.match(/stage\d/));
        const res = stages.map((name, i) => (i > stageNum) && $scope.editor[name] && name)
        res.forEach(name => { if ($scope.editor[name]) $scope.editor[name] = null });
    }
    $scope.makeEditing = (param) => {
        $scope.editor.editingObj = param;
        $scope.editor.editingParam = Object.entries(param).filter(x => x[0] !== 'values' && x[0] !== '$$hashKey');
    }
    $scope.makeStageName = (arr,stageNum) => {
        if (!arr) return false;
        $scope.editor.activeStage = stageNum + 1;
        const ind = $scope.editor.activeStage
        const name = `stage${ind}`;
        $scope.editor.activeStage = ind;
        $scope.editor[name] = arr;
    }
    $scope.makeFirstStage = arr => {
        const res = arr;
        const ind = $scope.editor.activeStage + 1
        const name = `stage${ind}`;
        $scope.editor.activeStage = ind;
        $scope.editor[name] = res;
    }
    $scope.inputChange = (param, val) => {
        if (param[0] === 'url') {
            const changing = $scope.editor.urls.find(el => el.url === param[1]);
            changing.url = val;
            const parent = $scope.editor[`stage${$scope.editor.activeStage - 1}`].find(el => el.name === param[1]);
            parent.name = val;
            parent.urlTo = val;
        }
        $scope.editor.editingObj[param[0]] = val;
    }
    $scope.onDeleteActiveElement = () => {
        const el = $scope.editor.exactEditingObj;
        let deletingStageName, parentStageInd;
        Object.entries($scope.editor.active).forEach((x,i)=>{
            [name,val] = x;
            if (val!==null) {
                deletingStageName=name;
                parentStageInd=i;
            }
        })
        const st = $scope.editor[deletingStageName];
        st.splice(st.indexOf(el),1);
        $scope.selectParam($scope.editor[`stage${parentStageInd}`],$scope.editor.active[`stage${parentStageInd}`],parentStageInd)
    }
    $scope.switchOrder = direction => {
        let st = $scope.editor[`stage${($scope.editor.activeStage - 1)}`];
        const ind = $scope.editor.activeIndex;
        let newInd;
        if (direction === 'left') {
            if (ind === 0) return false;
            newInd = ind - 1;
        }
        else {
            if (ind === st.length-1) return false;
            newInd = ind + 1;
        }
        [st[newInd], st[ind]] = [st[ind], st[newInd]];
        $scope.editor.active[`stage${$scope.editor.activeStage - 1}`] = newInd;
        $scope.editor.activeIndex = newInd;
        // const el = st[$scope.editor.activeIndex];
        debugger;
    }
    this.loadMatrix = async function () {

        // const param = this.myFactory.karetkaTypes[this.myFactory.HIPname];
        const param = 'HIP-conf.json'
        await $http.post(`./php/${param}`).then(function success(response) {
            scope.currObj = response.data;
            scope.myFactory.currObj = response.data;
            let pack = scope.currObj.find(function (param) {
                return param.url == "Пакеты";
            });
            scope.myFactory.packages = pack.values;
            $scope.editor.all = response.data;
            $scope.editor.objs = response.data.filter(x => !x.url);
            $scope.editor.urls = response.data.filter(x => x.url);
            $scope.makeFirstStage($scope.editor.objs);
        }, function error(response) {
            console.error(response);
        }
        );
    }

    this.reloadDashboard = function (string, type) {
        if (string === "Компания") {
            string = "HIP.json", type = "HIP";
        }
        $timeout.cancel(timer);
        this.saveRes = 12345;
        const url = `./src/${string}`;
        this.karetka.mode = "listener";
        scope.myFactory.removeCellSelection('dashboard_container');
        $http.post(url).then(function success(response) {
            scope.myFactory.removeCellSelection();
            scope.currObj = [];
            scope.currObj = response.data;
            scope.myFactory.currObj = response.data;
            if (string != "HIP.json") scope.selectParam(0);
            else {
                let pack = scope.currObj.filter(function (param) {
                    return param.url == "Пакеты";
                });
                pack = pack[0];
                scope.myFactory.packages = pack.values;
                if (myFactory.parks.length != 0) scope.selectParam(0);
                else {
                    scope.selectParam(0);
                    scope.karetka.mode = "making new process";
                }
            }
            // scope.myFactory.keyCodes.qwerty.length=scope.currObj.filter(function (obj) {
            //     return obj["name"]!=undefined;
            // }).length;
            scope.config = string;
            if (typeof type != "undefined") scope.myFactory.matrixType = type;
            // если в меню сохранения расчета и расчет сохранен то заполняем импут его именем 
            if (scope.myFactory.matrixType === 'calculationActions' && scope.myFactory.document.currParam === 0 && scope.myFactory.document.selectedParam === 0) {
                setTimeout(() => putNameInInput(scope.myFactory), 0);
            }
        }, function error(response) {
            console.error(response);
        }
        );
    };
    this.relocateHere = function (url) {//переход в углубление вверху каретки
        for (let i = 0; i < scope.currObj.length; i++) {

            if (scope.currObj[i]['url'] === url) {
                scope.selectParam(scope.currObj.indexOf(scope.currObj[i]));
            }
        }
    };
    this.currentUl = function (index) {//функция проверки для анимации и переключения между ul
        if (index === scope.myFactory.document.currParam) return true;
    };
    this.setCurrentUl = function (key) {
        return transportProp.indexOf(key);
    };



    this.selectNextParam = function () {
        let i = 0;
        for (let key in myFactory.process) {
            if (myFactory.process[key] === "") {
                scope.selectParam(i);
                return false;
            }
            i++;
        }
        return true;
    };
    this.applyFilter = function (value, key, group) {
        if (group !== undefined) {
            if (!isNumeric(value) && value.indexOf("-") != -1) {
                value = value.split("-");
                if (key == "cost" || key == "limit" || key == "franchise") return $filter("currency")(value[0], '', 0) + " Р" + " - " + $filter("currency")(value[1], '', 0) + " Р";
                else if (key == "amount") {
                    if (this.myFactory.amountType == "Тягачей") {
                        return $filter("currency")(value[0] / TRACTOR, '', 0) + " " + chooseEnd(value[0] / TRACTOR, myFactory.amountType) + " - " + $filter("currency")(value[1] / TRACTOR, '', 0) + " " + chooseEnd(value[1] / TRACTOR, myFactory.amountType);
                    }
                    else if (this.myFactory.amountType == "Рейсов") {
                        return $filter("currency")(value[0], '', 0) + " " + chooseEnd(value[0], myFactory.amountType) + " - " + $filter("currency")(value[1], '', 0) + " " + chooseEnd(value[1], myFactory.amountType);
                    }
                }
            }
            else {
                if (key == "cost" || key == "limit" || key == "franchise") return $filter("currency")(value, '', 0) + " Р";
                else if (key == "amount") {
                    if (this.myFactory.amountType == "Тягачей") return $filter("currency")(value / TRACTOR, '', 0) + " " + chooseEnd(value / TRACTOR, myFactory.amountType);
                    else if (this.myFactory.amountType == "Рейсов") return $filter("currency")(value, '', 0) + " " + chooseEnd(value, myFactory.amountType);
                }
                return value;
            }
        }
        else if (typeof key == "undefined") {
            if (value.type == "currency") return $filter(value.type)(value.name, '', 0);
            else if (value.type == "amount") {
                if (this.myFactory.amountType == "Тягачей") return $filter("currency")(value.name / TRACTOR, '', 0);
                else if (this.myFactory.amountType == "Рейсов") return $filter("currency")(value.name, '', 0);
            }
            else return value.name;
        }
        else {
            if (key == "cost" || key == "limit" || key == "franchise") return $filter("currency")(value, '', 0) + " Р";
            else if (key == "amount") {
                if (this.myFactory.amountType == "Тягачей") return $filter("currency")(value / TRACTOR, '', 0) + " " + chooseEnd(value / TRACTOR, myFactory.amountType);
                else if (this.myFactory.amountType == "Рейсов") return $filter("currency")(value, '', 0) + " " + chooseEnd(value, myFactory.amountType);
            }
            // это вообще что такое???
            else if (key == "badAssAmount") {
                if (this.myFactory.amountType == "Тягачей") return $filter("currency")(value, '', 0) + " " + chooseEnd(value, myFactory.amountType);
                else if (this.myFactory.amountType == "Рейсов") return $filter("currency")(value, '', 0) + " " + chooseEnd(value, myFactory.amountType);
            }
            else if (Array.isArray(value) && value.length === 1) return value[0];
            else return value;
        }
        // склоняем существительные
        function chooseEnd(value, type) {
            value = +value;
            const typeN = (type === "Тягачей") ? 0 : 1;
            const endings = [["Тягач", "Тягача"], ["Рейс", "Рейса"]];
            if (value === 1 || (value > 20 && value % 10 === 1)) return endings[typeN][0];
            else if ((2 <= value && value <= 4) || (value > 20 && 2 <= value % 10 && value % 10 <= 4)) return endings[typeN][1];
            else return type;
        }
    };

    this.alreadySelected = function (model) {
        if ($rootScope.mode == "calc") return !(myFactory.process[model] === "");
        else return false;
    };
    this.addPropertyToProcess = function (param, value) {//меняем обычный процесс который у нас в фабрике
        myFactory.process[param.model] = value;//заполняем соответствующее свойство создаваемого процесса


        //*****************Заносим выбранное значение в нижнюю часть каретки
        if (!param.name) {
            scope.currObj.forEach(function (newParam) {
                if (newParam.name && newParam.model == param.model) param = newParam
            })
        }
        if (param.model == 'amount' && scope.myFactory.amountType == "Тягачей") {
            param.selected = value / TRACTOR;
        }
        else param.selected = value;
        //*****************

    };

    this.clickedSelectAll = function (param, value) {
        // SKLV 01.06.18:  кнопка вызова функции удалена из интерфейса
        scope.myFactory.multiChangeMode(true);

        let flag = true;
        let multi = scope.myFactory.multi;
        param.values.forEach(function (val) {
            if (val != value) {
                scope.myFactory.multi.mode = true; //включаем режим мульти

                if (multi.arrays[param.model].indexOf(val.name) == -1) {//если такой элемент не был выбран
                    val.selected = true;
                    multi.arrays[param.model].push(val.name);
                    flag = false;
                }

            }
        });
        if (flag) {
            param.values.forEach(val => {
                delete val.selected;
                multi.arrays[param.model].splice(multi.arrays[param.model].indexOf(val.name), 1);
            })
        }
    };

    this.karetka = {
        mode: "listener",
        multiClicked: function (param) {
        },
        clicked: function (param, value) {
            if (this.mode == "listener") this.mode = "making new process";


            if (this.mode == "making new process") {
                //если мы выбираем не мульти значения или режим не мульти
                if (!scope.myFactory.multi.mode || (scope.myFactory.multi.mode && param.model != "wrapping" && param.model != "risk")) {
                    scope.addPropertyToProcess(param, value.name);
                    value.selected = true;
                    //выбрать все - отключение надо доделать
                    if (value.action == "selectAll") {
                        scope.clickedSelectAll(param, value);
                    }

                    //если выбран пакет
                    else if (value.action == "package") {
                        let multi = scope.myFactory.multi;
                        multi.template = value.values;
                    }

                    if (scope.selectNextParam()) {//здесь мы имеем уже заполненный процесс, остается только добавить его в массив процессов и посчитать
                        myFactory.addNewProcess();
                        myFactory.finalCalc();
                        scope.clean();
                    }
                }
                else {
                    scope.clickedOnMulti(param, value);
                }

            }
            if (this.mode == "changing process") {
                if (myFactory.process.constructor.name == "Park") {
                    let park = myFactory.process;
                    if (Array.isArray(park[param.model]) || !isNumeric(park[param.model]) && park[param.model].indexOf("-") != -1) {
                        if (value.selected) {
                            let mass = [];
                            park.processes.forEach(function (process) {
                                if (process[param.model] == value.name) {
                                    if (mass.indexOf(process) == -1) mass.push(process);
                                }
                            });
                            myFactory.parkTemplate = mass;
                            myFactory.parkTemplateChangingValue = value.name;
                        }
                        else if (myFactory.parkTemplate.length > 0) {
                            value.selected = true;
                            //убрали старое подсвечивание
                            for (let i = 0; i < scope.currObj.length; i++) {
                                for (let j = 0; j < scope.currObj[i].values.length; j++) {
                                    if (myFactory.parkTemplateChangingValue == scope.currObj[i].values[j].name) {
                                        delete scope.currObj[i].values[j].selected;
                                        if (scope.currObj[i].url) {
                                            let flag = false;
                                            scope.currObj[i].values.forEach(function (otherValue) {
                                                if (otherValue.selected) flag = true;
                                            });
                                            if (!flag) {
                                                let url = scope.currObj[i].url;
                                                for (let a = 0; a < scope.currObj.length; a++) {
                                                    for (let b = 0; b < scope.currObj[a].values.length; b++) {
                                                        if (scope.currObj[a].values[b].urlTo == url) delete scope.currObj[a].values[b].selected;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            //*********
                            park.changeProperty(param.model, value.name, myFactory.parkTemplate);
                            myFactory.finalCalc();
                        }
                    }
                    else {
                        park.changeProperty(param.model, value.name);
                        myFactory.finalCalc();
                        scope.clean();
                    }
                }

                else if (myFactory.process.constructor.name == "Multi" || (myFactory.process.multi && myFactory.multi.mode)) {
                    myFactory.finalCalc();
                    let multi = myFactory.process;
                    //если включен режим мульти
                    if (myFactory.multi.mode) {
                        scope.clickedOnMulti(param, value);
                    }

                    //если режим мульти не включени мы выбираем либо числовые значения, либо меняем пакет
                    else if (isNumeric(multi[param.model]) || multi[param.model].length == 1) {
                        //param=param.model;
                        if (value.action == "package" || value.action == "selectAll") {
                            if (param.model == "risk") {
                                myFactory.multi.arrays.wrapping = multi.wrapping;
                                myFactory.process = multi.processes[0];
                                myFactory.process.risk = value.name;
                                if (value.action == "package") {
                                    myFactory.multi.arrays[param.model].push(value.name);
                                    if (multi.processes[0].package) {
                                        multi.processes.forEach(function (proc, i) {
                                            if (proc.package && i != 0) {
                                                proc.park.processes.splice(proc.park.processes.indexOf(proc), 1);
                                            }
                                        })
                                    }
                                }
                                else if (value.action == "selectAll") {
                                    let key = param.model;
                                    param.values.forEach(function (param) {
                                        if (param.name != value.name && myFactory.multi.arrays[key].indexOf(param.name) == -1) {
                                            myFactory.multi.arrays[key].push(param.name);
                                            param.selected = true;
                                        }
                                    })
                                }
                                myFactory.addNewProcess("changing", multi);
                                delete scope.myFactory.process.changing;//убираем выделение строки которую меняли
                                if (value.action == "package") {
                                    if (value.times) {
                                        myFactory.setAlimitAsTimes(value.times);
                                        myFactory.finalCalc();
                                    }
                                    else {
                                        // FIXME: добавить изменение на агр лимит при смене с кол-во раз
                                    }
                                }
                                scope.clean();
                            }
                        }
                        else if (multi[param.model][0] == multi.packName && param.model == "risk") {//если меняется риск с пакетом в мультистроке
                            let process = multi.processes[0];
                            if (multi.wrapping.length > 1) {//если кроме пакета есть еще узлы в этом комплексе
                                myFactory.multi.arrays.wrapping = multi.wrapping;
                                process[param.model] = value.name;
                                myFactory.process = process;
                                myFactory.addNewProcess("changing", multi);
                            }
                            else {//если мы просто делаем обычную строку

                                delete process.multi;
                                multi.processes.forEach(function (process, i) {
                                    if (i != 0) {
                                        let park = process.park;
                                        park.processes.splice(park.processes.indexOf(process), 1);
                                    }
                                });
                                multi.processes = [];
                                myFactory.multi.multies.splice(myFactory.multi.multies.indexOf(multi), 1);
                                myFactory.process = process;
                                if (myFactory.process.package !== undefined) delete myFactory.process.package;
                                scope.addPropertyToProcess(param, value.name);
                                delete scope.myFactory.process.changing;//убираем выделение строки которую меняли
                            }
                            myFactory.removeCellSelection();
                            scope.clean();
                        }
                        else {//если числовое значение       здесь нужно прикрутить изменение пакета
                            // создаем копию мульти узла с новыми параметрами для проверки
                            const multiWithNewParams = Object.assign({}, multi);
                            multiWithNewParams.processes.map(pr => {
                                pr[param.model] = value.name;
                            })
                            // проверяем, есть ли такие процы в парке
                            const parkContains = multi.processes[0].park.contains(multiWithNewParams.processes);
                            if (parkContains) {
                                // если какой то проц из мульти узла уже ест ьв этом парке, то нужно создать новый парка
                                myFactory.multi.arrays.risk = [value.name];
                                // в данном случае предусмотрено копирование мульти узлом только с мульти-отсеком
                                // поэтому параметром возможно задать только риск
                                myFactory.multi.arrays.wrapping = multi.wrapping;
                                if (param.model === "wrapping") console.error("Ожидалось изменение риска, пришел тип отсека. Необходимо поменять логику");
                                myFactory.process = Object.assign({}, multi.processes[0]);
                                // удаляем старый мульти из коллектора мульти узлов
                                myFactory.multi.multies.splice(myFactory.multi.multies.indexOf(multi), 1);
                                const oldPark = multi.processes[0].park;
                                // удаляем старые процы из его парка
                                multi.processes.forEach(pr => {
                                    oldPark.processes.splice(oldPark.processes.indexOf(pr), 1);
                                })
                                // делаем новые процы в новом парке
                                myFactory.addNewProcess();
                            }
                            else multi.changeProperty(param.model, value.name);
                            delete scope.myFactory.process.changing;//убираем выделение строки которую меняли
                            scope.clean();
                        }
                    }



                }
                else if (!scope.myFactory.multi.mode) {
                    if (value.action == "selectAll") {
                        scope.clickedSelectAll(param, value);
                        let process = myFactory.process;
                        if (myFactory.process.wrapping != "" && myFactory.process.wrapping != "multi" && myFactory.multi.arrays.wrapping.indexOf(myFactory.process.wrapping)) myFactory.multi.arrays.wrapping.push(myFactory.process.wrapping);
                        if (myFactory.process.risk != "" && myFactory.process.risk != "multi" && myFactory.multi.arrays.risk.indexOf(myFactory.process.risk)) myFactory.multi.arrays.risk.push(myFactory.process.risk);
                        myFactory.addNewProcess("changing");
                        scope.clean();
                        process = myFactory.multi.multies[myFactory.multi.multies.length - 1].processes[0];
                        scope.matrix.loadMulti(process, param.model);
                    }

                    //если выбран пакет
                    else if (value.action == "package") {
                        // если выбран пакет, то автоматически переносим его в новый парк
                        let multi = scope.myFactory.multi;
                        myFactory.deleteProcess(myFactory.process);
                        multi.template = value.values;
                        myFactory.process[param.model] = value.name;
                        // myFactory.addNewProcess("changing");
                        myFactory.addNewProcess();
                        delete scope.myFactory.process.changing;//убираем выделение строки которую меняли
                        myFactory.removeCellSelection();
                        if (value.times) {
                            myFactory.setAlimitAsTimes(value.times);
                        }
                        scope.clean();
                    }
                    else {
                        scope.addPropertyToProcess(param, value.name);
                        let myVar = myFactory.process[param.model];
                        let myEl = angular.element(document.querySelector('td.mi_selected'));
                        // myFactory.removeCellSelection();
                        myEl.addClass('alreadySelected');

                        if (myFactory.process.package && myFactory.process.multi && myFactory.process.multi != "deleted") {
                            delete myFactory.process.multi.template;
                            delete myFactory.process.multi.packName;
                            let pack = myFactory.process.package;
                            myFactory.process.multi.processes.forEach(function (process) {
                                if (process.package && process.package == pack) delete process.package;
                            });
                            delete myFactory.process.package;
                        }
                        // проверяем есть ли такой проц в парке, эта проблема встречается внутри мульти-узлов
                        if (myFactory.process.multi && myFactory.process.multi.show) {
                            const parkContains = myFactory.process.park.contains([myFactory.process]);
                            if (parkContains) {
                                // если такой уже есть, то удаляем старый и создаем такой же в новом парке
                                myFactory.deleteProcess(myFactory.process);
                                myFactory.addNewProcess();
                            }
                        }
                        delete scope.myFactory.process.changing;//убираем выделение строки которую меняли
                        scope.clean();
                    }
                }
                else {
                    //  меняем проц на мульти
                    if (param.selected === value.name) return;
                    myFactory.removeCellSelection();
                    let process = myFactory.process;
                    // формируем myFactory.multi.arrays
                    mulriArrayFormation();
                    if (isContaining()) {
                        myFactory.process = Object.assign({}, process);
                        myFactory.addNewProcess();
                    }
                    else {
                        myFactory.addNewProcess("changing");
                    }
                    scope.clean();
                    process = myFactory.multi.multies[myFactory.multi.multies.length - 1].processes[0];
                    scope.matrix.loadMulti(process, param.model);
                    function mulriArrayFormation() {
                        myFactory.multi.arrays.wrapping = [process.wrapping];
                        myFactory.multi.arrays.risk = [process.risk];
                        if (myFactory.multi.arrays[param.model].indexOf(value.name) == -1) myFactory.multi.arrays[param.model].push(value.name);
                    }
                    function isContaining() {
                        const procForCheck = Object.assign({}, process);
                        procForCheck[param.model] = value.name;
                        return procForCheck.park.contains([procForCheck]);
                    }
                }
            }
        },
    };


    $scope.saveJSON = async () => {
        const data = $scope.editor.all;
        let obj = JSON.stringify(data);
        obj = obj.replace(/,\"\$\$hashKey\":\"object:\d+\"/g, '');
        obj = JSON.parse(obj);
        obj = JSON.stringify(obj, null, '\n');
        // формирование запроса
        const fd = new FormData();
        fd.append("json", obj);
        fd.append("filename", 'HIP.json');
        const req = new Request("php/json.php", { method: "POST", body: fd });
        return fetch(req).then(
            resp => {
                console.log('success');
            },
            err => {
                console.error("Ошибка ");
            }
        );
    }

    this.loadMatrix('HIP.json');

});