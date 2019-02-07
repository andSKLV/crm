app.controller('editorCtrl', function ($scope, $rootScope, $http, $q, $location, myFactory) {
    $scope.myFactory = myFactory;
    const scope = this;
    this.myFactory = myFactory;

    $scope.editor = {
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
        stage1: null,
        stage2: null,
        stage3: null,
        stage4: null,
        stage5: null,
    }
    $scope.selectParam = (stage, index, stageNum) => {
        $scope.deleteSelectedStyles(stageNum);
        let selectedParam = stage[index];
        $scope.editor.editingStage = stageNum;
        $scope.editor.exactEditingObj = selectedParam;
        $scope.editor.editingObjCanDelete = $scope.isDeletable(selectedParam);
        $scope.clearActive(stageNum);
        $scope.editor.active[`stage${stageNum}`] = index;
        if (selectedParam.type === "relocate_here") {
            const url = selectedParam.urlTo;
            selectedParam = $scope.editor.urls.find(x => x.url === url);
        }
        $scope.editor.activeIndex = index;
        $scope.makeStageName(selectedParam.values, stageNum);
        $scope.clearRest(stageNum);
        $scope.makeEditing(selectedParam);
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
        if ($scope.editor.stage1.includes(obj)) return false;
        if (notDeleteTypes.includes(obj.type)) return false;
        if (obj.baseRisk) return false;
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
        if (el.type === 'relocate_here') {
            const urlInd = $scope.editor.urls.indexOf($scope.editor.editingObj);
            $scope.editor.urls.splice(urlInd, 1);
        }
        let deletingStageName, parentStageInd;
        Object.entries($scope.editor.active).forEach((x, i) => {
            [name, val] = x;
            if (val !== null) {
                deletingStageName = name;
                parentStageInd = i;
            }
        })
        const st = $scope.editor[deletingStageName];
        st.splice(st.indexOf(el), 1); //удаляем элемент из стейджа
        $scope.selectParam($scope.editor[`stage${parentStageInd}`], $scope.editor.active[`stage${parentStageInd}`], parentStageInd) //делаем родителя активным элементом
    }
    $scope.onAddNew = () => {
        const parentEl = $scope.editor.editingObj;
        const store = parentEl.values;
        const example = Object.assign({}, store[store.length - 1]);
        example.name = 'Введите название';
        clearFields(example);//обнуление полей
        store.push(example);
        function clearFields(obj) {
            if (obj.$$hashKey) delete obj.$$hashKey;
            const emptyName = 'Введите название';
            if (obj.name) obj.name = emptyName;
            if (obj.urlTo) {
                obj.urlTo = emptyName;
                $scope.editor.urls.push($scope.createUrl(emptyName, parentEl.model));
            }
        }
    }
    $scope.createUrl = (name, model) => {
        const obj = {
            url: name,
            model
        };
        obj.values = [$scope.createEl()];
        return obj;
    }
    $scope.createEl = (name = 'Введите название', type = 'risk') => {
        return {
            name, type,
            "value": 0,
        }
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
        debugger;
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