app.controller('editorCtrl', function ($scope, $rootScope, $http, $q, $location, myFactory) {
    $scope.myFactory = myFactory;
    const scope = this;
    this.myFactory = myFactory;

    $scope.editor = {
        risksReserverNames: [],
        risksCanUse: [],
        fileName: null,
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
        editingObjCanSelectAll: false,
        editingObjCanAddRisk: false,
        editingObjCanAddPack: false,
        editingObjCanAddChild: false,
        editingObjCanAddDepth: false,
        pickerRisks: null,
        stage1: null,
        stage2: null,
        stage3: null,
        stage4: null,
        stage5: null,
    }
    $scope.reselectParam = () => {
        const stage = $scope.editor[`stage${$scope.editor.activeStage}`];
        const elIndex = $scope.editor.activeIndex;
        const stageInd = $scope.editor.activeStage;
        $scope.selectParam(stage, elIndex, stageInd);
    }
    $scope.selectActiveCell = () => {
        const stage = $scope.editor[`stage${$scope.editor.editingStage}`];
        const elIndex = $scope.editor.activeIndex;
        const stageInd = $scope.editor.editingStage;
        $scope.selectParam(stage, elIndex, stageInd);
    }
    $scope.selectParam = (stage, index, stageNum) => {
        $scope.deleteSelectedStyles(stageNum);
        let selectedParam = stage[index];
        $scope.editor.editingStage = stageNum;
        $scope.editor.exactEditingObj = selectedParam;
        $scope.clearActive(stageNum);
        $scope.editor.active[`stage${stageNum}`] = index;
        if (selectedParam.type === "relocate_here") {
            const url = selectedParam.urlTo;
            selectedParam = $scope.editor.urls.find(x => x.url === url);
        }
        $scope.editor.activeIndex = index;
        $scope.clearRest(stageNum);
        $scope.makeStageName(selectedParam.values, stageNum);
        $scope.makeEditing(selectedParam);
        $scope.objCanChecks(selectedParam);
    }
    $scope.objCanChecks = obj => {
        $scope.editor.editingObjCanDelete = $scope.isDeletable(obj);
        $scope.editor.editingObjCanSelectAll = $scope.isSelectAllPosible(obj);
        $scope.editor.editingObjCanAddRisk = $scope.canAddRisk(obj);
        $scope.editor.editingObjCanAddPack = $scope.canAddPack(obj);
        $scope.editor.editingObjCanAddChild = $scope.canAddChild(obj);
        $scope.editor.editingObjCanAddDepth = $scope.canAddDepth(obj);
    }
    $scope.deleteSelectedStyles = num => {
        let rows = document.querySelectorAll('.nav_modified:not(.param_info)');
        rows = Array.prototype.slice.call(rows, num);
        if (!rows.length) return true;
        const elems = [];
        rows.forEach(r => {
            elems.push(r.querySelector('.alreadySelected'))
            elems.push(r.querySelector('.mi_selected'));
        });
        elems.forEach(el => el && el.classList.remove('mi_selected', 'alreadySelected'));
    }
    $scope.isDeletable = (obj) => {
        const notDeleteTypes = ["inputForCurrency", "currencyValue", "amountType", "inputForCurrency"];
        if ($scope.editor.stage1.includes(obj)) {
            $scope.editor.notDeleteMessage = 'Нельзя удалить корневой элемент'
            return false;
        }
        if (notDeleteTypes.includes(obj.type)) {
            $scope.editor.notDeleteMessage = 'Нельзя удалить обязательный элемент'
            return false;
        }
        if (obj.baseRisk) {
            $scope.editor.notDeleteMessage = 'Нельзя удалить базовый риск'
            return false;
        }
        if ($scope.editor[`stage${$scope.editor.editingStage}`].length < 3) {
            $scope.editor.notDeleteMessage = 'Нельзя удалить элемент, если у родителя осталось меньше трех дочерних элементов'
            return false;
        } //если 2 и меньше элементов, то нельзя удалить, чтоб не оставить один
        $scope.editor.notDeleteMessage = null;
        return true;
    }
    $scope.isSelectAllPosible = (obj) => {
        if (obj.type !== 'url') return false;
        return obj.values.every(val => val.type === 'risk' && isNumeric(val.value));
    }
    $scope.canAddRisk = obj => {
        return $scope.editor.editingObj.model === 'risk' || $scope.editor.editingObj.model === 'wrapping';
    }
    $scope.canAddPack = obj => {
        if (obj.values&&obj.values.some(val=>val.action==='selectAll')) return false;
        return $scope.editor.editingObj.model === 'risk' || $scope.editor.editingObj.model === 'wrapping';
    }
    $scope.canAddChild = obj => {
        return $scope.editor.editingObj.model && $scope.editor.editingObj.model !== 'risk' && $scope.editor.editingObj.model !== 'wrapping'
    }
    $scope.canAddDepth = obj => {
        if (obj.values&&obj.values.some(val=>val.action==='selectAll')) return false;
        return $scope.editor.editingObj.model==='risk'||$scope.editor.editingObj.model==='wrapping';
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
        const res = stages.map((name, i) => ((i + 1) > stageNum) && $scope.editor[name] && name)
        res.forEach(name => { if ($scope.editor[name]) $scope.editor[name] = null });
    }
    $scope.makeEditing = (param) => {
        $scope.editor.editingObj = param;
        $scope.editor.editingParam = Object.entries(param).filter(x => x[0] !== 'values' && x[0] !== '$$hashKey');
    }
    $scope.makeStageName = (arr, stageNum) => {
        if (!arr) return false;
        const ind = stageNum + 1;
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
        if ($scope.editor.editingObj.type === 'risk' && $scope.editor.editingObj.value !== undefined) {
            $scope.editRiskInPool(param[1], val);
            $scope.editRiskInPackages(param[1], val);
        }
        if (param[0] === 'url') {
            const changing = $scope.editor.urls.find(el => el.url === param[1]);
            changing.url = val;
            const parent = $scope.editor[`stage${$scope.editor.activeStage - 1}`].find(el => el.name === param[1]);
            parent.name = val;
            parent.urlTo = val;
        }
        $scope.editor.editingObj[param[0]] = val;
    }
    /**
     * Поиск родителя активного элемента
     */
    $scope.findParent = () => {
        const nullIndex = Object.values($scope.editor.active).findIndex(x => x === null); //смотрим на каком стейдже нет выбранных значений
        return (nullIndex > 0) ? $scope.editor[`stage${nullIndex - 1}`] : []; //если это корень, то родителя нет, если не корень, то возвращаем предпоследний выделенный стейдж
    }
    $scope.onDeleteActiveElement = () => {
        const el = $scope.editor.exactEditingObj;

        if (el.type === 'relocate_here') {
            const urlInd = $scope.editor.urls.indexOf($scope.editor.editingObj);
            $scope.editor.urls.splice(urlInd, 1);
        }
        //определение стейджа
        let deletingStageName, parentStageInd;
        Object.entries($scope.editor.active).forEach((x, i) => {
            [name, val] = x;
            if (val !== null) {
                deletingStageName = name;
                parentStageInd = i;
            }
        })
        if (el.type === 'risk' && el.value !== undefined) { //если это риск, то нужно удалить его из пула рисков и из всех пакетов
            $scope.removeRiskFromPool(el.name);
            $scope.removeRiskFromPackages(el.name);
        }
        //удаление
        const st = $scope.editor[deletingStageName];
        st.splice(st.indexOf(el), 1); //удаляем элемент из стейджа
        $scope.selectParam($scope.editor[`stage${parentStageInd}`], $scope.editor.active[`stage${parentStageInd}`], parentStageInd) //делаем родителя активным элементом
    }
    $scope.onAddNew = type => {
        const parentEl = $scope.editor.editingObj;
        const store = parentEl.values;
        let child, name;
        switch (type) {
            case 'risk':
                child = $scope.createRisk();
                break;
            case 'packageRisk':
                child = $scope.createPackageRisk(store);
                break;
            case 'url':
                name = `Углубление ${Math.floor(Math.random() * 1000)}`;
                child = $scope.createRelocate(name);
                const url = $scope.createUrl(name, parentEl.model);
                $scope.editor.urls.push(url);
                break;
            case 'copy':
                name = `Введите название ${Math.floor(Math.random() * 1000)}`;
                child = clearFields(Object.assign({}, store[store.length - 1]), name);
                break;
            case 'package':
                child = $scope.createPackage();
                break;
            default:
                return false;
                break;
        }
        if (!child) return false;
        store.push(child);
        $scope.selectActiveCell ();
        function clearFields(obj, name) {
            if (obj.$$hashKey) delete obj.$$hashKey;
            if (obj.name) obj.name = name;
            return obj;
        }
    }
    $scope.createPackage = name => {
        name = name || `Пакет ${Math.floor(Math.random() * 1000)}`;
        const pack = {
            name,
            type: 'risk',
            action: "package",
            values: []
        };
        pack.values.push($scope.createPackageRisk(pack.values));
        pack.values.push($scope.createPackageRisk(pack.values));
        return pack;
    }
    $scope.createPackageRisk = store => {
        const names = $scope.getNamesForPack(store);
        if (names.length > 0) return {
            risk: names[0],
            limit: 0.1,
        }
        return false;
    }
    $scope.makeTimesRow = () => {
        const parentEl = $scope.editor.editingObj;
        parentEl.times = "1";
        $scope.selectActiveCell();
    }
    $scope.deleteTimesRow = () => {
        const parentEl = $scope.editor.editingObj;
        delete parentEl.times;
        $scope.selectActiveCell();
    }
    $scope.makeSelectAll = () => {
        const store = $scope.editor.editingObj.values;
        const selectAll = {
            name: 'Выбрать все',
            type: 'risk',
            action: 'selectAll',
        }
        store.push(selectAll);
        $scope.selectActiveCell();
    }
    $scope.getNamesForPack = store => {
        const risks = store.map(val => val.risk);
        return $scope.editor.risksCanUse.filter(el => !risks.includes(el));
    }
    $scope.createRisk = name => {
        while (!name) {
            name = `Риск ${Math.floor(Math.random() * 1000)}`;
            if ($scope.editor.risksReserverNames.includes(name)) name = null;
        }
        $scope.addRiskToPool(name);
        return {
            name,
            type: 'risk',
            value: 0,
            title: 'Описание риска'
        }
    }
    $scope.createRelocate = name => {
        return {
            name,
            type: 'relocate_here',
            urlTo: name,
        }
    }
    $scope.createUrl = (name, model) => {
        const obj = {
            url: name,
            model,
            type: 'url',
        };
        obj.values = [$scope.createRisk(), $scope.createRisk()];
        return obj;
    }
    $scope.switchOrder = direction => {
        const stageName = `stage${($scope.editor.editingStage)}`;
        let st = $scope.editor[stageName];
        const ind = $scope.editor.activeIndex;
        let newInd;
        if (direction === 'left') {
            if (ind === 0) return false;
            newInd = ind - 1;
        }
        else {
            if (ind === st.length - 1) return false;
            newInd = ind + 1;
        }
        [st[newInd], st[ind]] = [st[ind], st[newInd]];
        $scope.editor.active[stageName] = newInd;
        $scope.editor.activeIndex = newInd;
    }
    $scope.switchRiskInPack = direction => {
        const el = $scope.editor.editingObj;
        const name = el.risk;
        const store = $scope.editor[`stage${$scope.editor.activeStage}`];
        const names = $scope.getNamesForPack(store);
        $scope.editor.pickerRisks = [name, ...names];
        const picker = document.querySelector('.modal_picker');
        picker.style.display = 'block';
    }
    $scope.makeRiskPool = () => {
        const allRisks = $scope.editor.all.filter(x => x.model === 'risk');
        allRisks.forEach(host => {
            host.values.forEach(val => {
                if (val.type === 'risk' && !val.action) {
                    (val.baseRisk) ? $scope.editor.risksReserverNames.push(val.name) : $scope.addRiskToPool(val.name);
                }
            })
        })
    }
    $scope.onClickNameInPack = name => {
        $scope.editor.editingObj.risk = name;
        const picker = document.querySelector('.modal_picker');
        picker.style.display = 'none';
        $scope.reselectParam();
    }
    $scope.addRiskToPool = name => {
        $scope.editor.risksReserverNames.push(name);
        $scope.editor.risksCanUse.push(name);
    }
    $scope.removeRiskFromPool = name => {
        $scope.editor.risksReserverNames = $scope.editor.risksReserverNames.filter(r => r !== name);
        $scope.editor.risksCanUse = $scope.editor.risksCanUse.filter(r => r !== name);
    }
    $scope.removeRiskFromPackages = name => {
        const containsRisk = [];
        const packages = $scope.getAllPackages();
        packages.forEach((pack, packInd) => pack.values.forEach((val, valInd) => { if (val.risk === name) containsRisk.push([packInd, valInd]) }));
        if (containsRisk.length) {
            containsRisk.forEach(([packInd, riskInd]) => {
                packages[packInd].values.splice(riskInd, 1);
            })
        }
    }
    $scope.getAllPackages = () => {
        const risks = [...$scope.editor.objs.filter(x => x.model === 'risk'), ...$scope.editor.urls.filter(x => x.model === 'risk')]
        const packages = [];
        risks.forEach(store => store.values.forEach(pack => {
            if (pack.action === "package") packages.push(pack);
        }))
        return packages;
    }
    $scope.editRiskInPool = (from, to) => {
        $scope.editor.risksReserverNames = $scope.editor.risksReserverNames.map((rName) => (rName === from) ? to : rName);
        $scope.editor.risksCanUse = $scope.editor.risksCanUse.map((rName) => (rName === from) ? to : rName);
    }
    $scope.editRiskInPackages = (from, to) => {
        const packages = $scope.getAllPackages();
        packages.forEach(pack => pack.values.forEach(val => { if (val.risk === from) val.risk = to }))
    }
    this.loadMatrix = async function () {
        const param = 'HIP-conf.json';
        $scope.editor.fileName = param;
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
            $scope.makeRiskPool();
            $scope.makeFirstStage($scope.editor.objs);
        }, function error(response) {
            console.error(response);
        }
        );
    }

    $scope.saveJSON = async () => {
        const data = [...$scope.editor.objs, ...$scope.editor.urls];
        let obj = JSON.stringify(data);
        obj = obj.replace(/,\"\$\$hashKey\":\"object:\d+\"/g, '');
        obj = JSON.parse(obj);
        obj = JSON.stringify(obj, null, '\t');
        // формирование запроса
        const fd = new FormData();
        fd.append("json", obj);
        fd.append("filename", $scope.editor.fileName);
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