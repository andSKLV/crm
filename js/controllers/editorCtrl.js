app.controller("editorCtrl", function(
  $scope,
  $rootScope,
  $http,
  $q,
  $location,
  myFactory
) {
  $scope.myFactory = myFactory;
  const scope = this;
  this.myFactory = myFactory;
  document.title = "Редактор каретки";
  $scope.createEditor = () => {
    $scope.editor = {
      risksReservedNames: [],
      risksCanUse: [],
      fileName: null,
      activeStage: 0,
      activeIndex: 0,
      all: [],
      urls: [],
      objs: [],
      active: {},
      editingObj: null,
      editingParam: null,
      editingObjCanDelete: false,
      editingObjCanSelectAll: false,
      editingObjCanAddRisk: false,
      editingObjCanAddPack: false,
      editingObjCanAddChild: false,
      editingObjCanAddDepth: false,
      newBaseName: null,
      pickerRisks: null
    };
    for (let i = 1; i < 7; i++) {
      const stageName = `stage${i}`;
      $scope.editor.active[stageName] = null;
      $scope.editor[stageName] = null;
    }
  };
  $scope.reselectParam = () => {
    const stage = $scope.editor[`stage${$scope.editor.activeStage}`];
    const elIndex = $scope.editor.activeIndex;
    const stageInd = $scope.editor.activeStage;
    $scope.selectParam(stage, elIndex, stageInd);
  };
  $scope.selectActiveCell = () => {
    const stage = $scope.editor[`stage${$scope.editor.editingStage}`];
    const elIndex = $scope.editor.activeIndex;
    const stageInd = $scope.editor.editingStage;
    $scope.selectParam(stage, elIndex, stageInd);
  };
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
  };
  $scope.objCanChecks = obj => {
    $scope.editor.editingObjCanDelete = $scope.isDeletable(obj);
    $scope.editor.editingObjCanSelectAll = $scope.isSelectAllPossible(obj);
    $scope.editor.editingObjCanAddRisk = $scope.canAddRisk(obj);
    $scope.editor.editingObjCanAddPack = $scope.canAddPack(obj);
    $scope.editor.editingObjCanAddChild = $scope.canAddChild(obj);
    $scope.editor.editingObjCanAddDepth = $scope.canAddDepth(obj);
  };
  $scope.deleteSelectedStyles = (num = 0) => {
    let rows = document.querySelectorAll(".nav_modified:not(.param_info)");
    rows = Array.prototype.slice.call(rows, num);
    if (!rows.length) return true;
    const elems = [];
    rows.forEach(r => {
      elems.push(r.querySelector(".alreadySelected"));
      elems.push(r.querySelector(".mi_selected"));
    });
    elems.forEach(
      el => el && el.classList.remove("mi_selected", "alreadySelected")
    );
  };
  $scope.isDeletable = obj => {
    const notDeleteTypes = [
      "inputForCurrency",
      "currencyValue",
      "amountType",
      "inputForCurrency"
    ];
    if ($scope.editor.stage1.includes(obj)) {
      $scope.editor.notDeleteMessage = "Нельзя удалить корневой элемент";
      return false;
    }
    if (notDeleteTypes.includes(obj.type)) {
      $scope.editor.notDeleteMessage = "Нельзя удалить обязательный элемент";
      return false;
    }
    if (obj.baseRisk) {
      $scope.editor.notDeleteMessage = "Нельзя удалить базовый риск";
      return false;
    }
    if ($scope.editor[`stage${$scope.editor.editingStage}`].length < 3) {
      $scope.editor.notDeleteMessage =
        "Нельзя удалить элемент, если у родителя осталось меньше трех дочерних элементов";
      return false;
    } //если 2 и меньше элементов, то нельзя удалить, чтоб не оставить один
    $scope.editor.notDeleteMessage = null;
    return true;
  };
  $scope.isSelectAllPossible = obj => {
    if (obj.type !== "url" || obj.model === "wrapping") return false;
    return obj.values.every(val => val.type === "risk" && isNumeric(val.value));
  };
  $scope.canAddRisk = obj => {
    return (
      $scope.editor.editingObj.model === "risk" ||
      $scope.editor.editingObj.model === "wrapping"
    );
  };
  $scope.canAddPack = obj => {
    if (
      (obj.values && obj.values.some(val => val.action === "selectAll")) ||
      obj.model === "wrapping"
    )
      return false;
    return (
      $scope.editor.editingObj.model === "risk" ||
      $scope.editor.editingObj.model === "wrapping"
    );
  };
  $scope.canAddChild = obj => {
    return (
      $scope.editor.editingObj.model &&
      $scope.editor.editingObj.model !== "risk" &&
      $scope.editor.editingObj.model !== "wrapping"
    );
  };
  $scope.canAddDepth = obj => {
    if (obj.values && obj.values.some(val => val.action === "selectAll"))
      return false;
    return (
      $scope.editor.editingObj.model === "risk" ||
      $scope.editor.editingObj.model === "wrapping"
    );
  };
  $scope.clearActive = stageNum => {
    for (stageNum; stageNum < 5; stageNum++) {
      $scope.editor.active[`stage${stageNum}`] = null;
    }
  };
  /**
   * Удаляет ненужные уровни если был выбран 3, а теперь 1, то нужно удалить старые 2 и 3
   * @param {number} stageNum номер уровня
   */
  $scope.clearRest = stageNum => {
    const stages = Object.keys($scope.editor).filter(x => x.match(/stage\d/));
    const res = stages.map(
      (name, i) => i + 1 > stageNum && $scope.editor[name] && name
    );
    res.forEach(name => {
      if ($scope.editor[name]) {
        $scope.editor[name] = null;
        $scope.editor.active[name] = null;
      }
    });
  };
  $scope.makeEditing = param => {
    $scope.editor.editingObj = param;
    $scope.editor.editingParam = Object.entries(param).filter(
      x => x[0] !== "values" && x[0] !== "$$hashKey"
    );
  };
  $scope.makeStageName = (arr, stageNum) => {
    if (!arr) return false;
    const ind = stageNum + 1;
    const name = `stage${ind}`;
    $scope.editor.activeStage = ind;
    $scope.editor[name] = arr;
  };
  $scope.makeFirstStage = arr => {
    const res = arr;
    const ind = $scope.editor.activeStage + 1;
    const name = `stage${ind}`;
    $scope.editor.activeStage = ind;
    $scope.editor[name] = res;
  };
  $scope.inputChange = (param, target) => {
    let val = target.value;
    if (
      $scope.editor.editingObj.type === "risk" &&
      $scope.editor.editingObj.value !== undefined
    ) {
      if (param[0] === "name") {
        if (param[1] === BASENAME) $scope.editor.newBaseName = val;
        $scope.editRiskInPool(param[1], val);
        $scope.editRiskInPackages(param[1], val);
      }
      if (param[0] === "value") {
        if (!isNumeric(val)) target.value = param[1];
        if (Number(val) < 0) {
          target.value = 0;
          val = 0;
        }
        if (Number(val) > 5) {
          target.value = 5;
          val = 5;
        }
      }
    }
    if (
      $scope.editor.editingObj.type === "amount" ||
      $scope.editor.editingObj.type === "currency"
    ) {
      if (!isNumeric(val) || Number(val) < 0) {
        target.value = 0;
        val = 0;
      }
    }
    if (param[0] === "url") {
      const changing = $scope.editor.urls.find(el => el.url === param[1]);
      changing.url = val;
      const parent = $scope.editor[
        `stage${$scope.editor.activeStage - 1}`
      ].find(el => el.name === param[1]);
      parent.name = val;
      parent.urlTo = val;
    }
    if (isNumeric(val)) val = Number(val);
    $scope.editor.editingObj[param[0]] = val;
  };
  /**
   * Поиск родителя активного элемента
   */
  $scope.findParent = () => {
    const nullIndex = Object.values($scope.editor.active).findIndex(
      x => x === null
    ); //смотрим на каком стейдже нет выбранных значений
    return nullIndex > 0 ? $scope.editor[`stage${nullIndex - 1}`] : []; //если это корень, то родителя нет, если не корень, то возвращаем предпоследний выделенный стейдж
  };
  $scope.onDeleteActiveElement = () => {
    const el = $scope.editor.exactEditingObj;
    if (el.type === "relocate_here") {
      const urlInd = $scope.editor.urls.indexOf($scope.editor.editingObj);
      const deletingRisks = [];
      const deletingUrls = [];
      $scope.editor.urls[urlInd].values.forEach(el => {
        if (el.type === "risk" && isNumeric(el.value)) deletingRisks.push(el);
        if (el.type === "relocate_here") deletingUrls.push(el);
      });
      while (deletingUrls.length) {
        const url = deletingUrls.pop();
        const ind = $scope.editor.urls.findIndex(u => u.url === url.urlTo);
        $scope.editor.urls[ind].values.forEach(el => {
          if (el.type === "risk" && isNumeric(el.value)) deletingRisks.push(el);
          if (el.type === "relocate_here") deletingUrls.push(el);
        });
        $scope.editor.urls.splice(ind, 1);
      }
      deletingRisks.forEach(el => {
        $scope.removeRiskFromPool(el.name);
        $scope.removeRiskFromPackages(el.name);
      });
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
    });
    //удаление
    const st = $scope.editor[deletingStageName];
    st.splice(st.indexOf(el), 1); //удаляем элемент из стейджа
    if (el.type === "risk" && el.value !== undefined) {
      //если это риск, то нужно удалить его из пула рисков и из всех пакетов
      $scope.removeRiskFromPool(el.name);
      $scope.removeRiskFromPackages(el.name);
    }

    $scope.selectParam(
      $scope.editor[`stage${parentStageInd}`],
      $scope.editor.active[`stage${parentStageInd}`],
      parentStageInd
    ); //делаем родителя активным элементом
  };
  $scope.onAddNew = type => {
    const parentEl = $scope.editor.editingObj;
    if (parentEl.model === "wrapping") type = "wrapRisk";
    const store = parentEl.values;
    let child, name;
    switch (type) {
      case "wrapRisk":
        child = $scope.createWrapRisk();
        break;
      case "risk":
        child = $scope.createRisk();
        break;
      case "packageRisk":
        child = $scope.createPackageRisk(store);
        break;
      case "url":
        name = `Углубление ${Math.floor(Math.random() * 1000)}`;
        child = $scope.createRelocate(name);
        const url = $scope.createUrl(name, parentEl.model);
        $scope.editor.urls.push(url);
        break;
      case "copy":
        name = `${Math.floor(Math.random() * 1000)}`;
        child = clearFields(Object.assign({}, store[store.length - 1]), name);
        break;
      case "package":
        child = $scope.createPackage();
        break;
      default:
        return false;
    }
    if (!child) return false;
    store.push(child);
    const nextStageInd = $scope.editor.editingStage + 1;
    const nextStage = $scope.editor[`stage${nextStageInd}`];
    $scope.selectParam(nextStage, nextStage.length - 1, nextStageInd);
    function clearFields(obj, name) {
      if (obj.$$hashKey) delete obj.$$hashKey;
      if (obj.name) obj.name = name;
      return obj;
    }
  };
  $scope.createPackage = name => {
    name = name || `Пакет ${Math.floor(Math.random() * 1000)}`;
    const pack = {
      name,
      type: "risk",
      action: "package",
      values: []
    };
    pack.values.push($scope.createPackageRisk(pack.values));
    pack.values.push($scope.createPackageRisk(pack.values));
    return pack;
  };
  $scope.createPackageRisk = store => {
    const names = $scope.getNamesForPack(store);
    if (names.length > 0)
      return {
        risk: names[0],
        limit: 0.1
      };
    return false;
  };
  $scope.makeTimesRow = () => {
    const parentEl = $scope.editor.editingObj;
    parentEl.times = "1";
    $scope.selectActiveCell();
  };
  $scope.deleteTimesRow = () => {
    const parentEl = $scope.editor.editingObj;
    delete parentEl.times;
    $scope.selectActiveCell();
  };
  $scope.makeSelectAll = () => {
    const store = $scope.editor.editingObj.values;
    const selectAll = {
      name: "Выбрать все",
      type: "risk",
      action: "selectAll"
    };
    store.push(selectAll);
    $scope.selectActiveCell();
  };
  $scope.getNamesForPack = store => {
    const risks = store.map(val => val.risk);
    return $scope.editor.risksCanUse.filter(el => !risks.includes(el));
  };
  $scope.createWrapRisk = name => {
    name = name || `Модификатор ${Math.floor(Math.random() * 1000)}`;
    return {
      name,
      type: "risk",
      value: 0
    };
  };
  $scope.createRisk = name => {
    while (!name) {
      name = `Риск ${Math.floor(Math.random() * 1000)}`;
      if ($scope.editor.risksReservedNames.includes(name)) name = null;
    }
    $scope.addRiskToPool(name);
    return {
      name,
      type: "risk",
      value: 0,
      title: "Описание риска"
    };
  };
  $scope.createRelocate = name => {
    return {
      name,
      type: "relocate_here",
      urlTo: name
    };
  };
  $scope.createUrl = (name, model) => {
    const obj = {
      url: name,
      model,
      type: "url"
    };
    obj.values = [$scope.createRisk(), $scope.createRisk()];
    return obj;
  };
  $scope.switchOrder = direction => {
    const stageName = `stage${$scope.editor.editingStage}`;
    let st = $scope.editor[stageName];
    const ind = $scope.editor.activeIndex;
    let newInd;
    if (direction === "left") {
      if (ind === 0) return false;
      newInd = ind - 1;
    } else {
      if (ind === st.length - 1) return false;
      newInd = ind + 1;
    }
    [st[newInd], st[ind]] = [st[ind], st[newInd]];
    $scope.editor.active[stageName] = newInd;
    $scope.editor.activeIndex = newInd;
  };
  $scope.switchRiskInPack = () => {
    const el = $scope.editor.editingObj;
    const name = el.risk;
    const store = $scope.editor[`stage${$scope.editor.activeStage}`];
    const names = $scope.getNamesForPack(store);
    $scope.editor.pickerRisks = [name, ...names];
    const picker = document.querySelector(".modal_picker");
    picker.style.display = "block";
  };
  $scope.makeRiskPool = () => {
    const allRisks = $scope.editor.all.filter(x => x.model === "risk");
    allRisks.forEach(host => {
      host.values.forEach(val => {
        if (val.type === "risk" && !val.action) {
          val.baseRisk
            ? $scope.editor.risksReservedNames.push(val.name)
            : $scope.addRiskToPool(val.name);
        }
      });
    });
  };
  $scope.onClickNameInPack = name => {
    $scope.editor.editingObj.risk = name;
    const picker = document.querySelector(".modal_picker");
    picker.style.display = "none";
    $scope.reselectParam();
  };
  $scope.addRiskToPool = name => {
    $scope.editor.risksReservedNames.push(name);
    $scope.editor.risksCanUse.push(name);
  };
  $scope.removeRiskFromPool = name => {
    $scope.editor.risksReservedNames = $scope.editor.risksReservedNames.filter(
      r => r !== name
    );
    $scope.editor.risksCanUse = $scope.editor.risksCanUse.filter(
      r => r !== name
    );
  };
  $scope.removeRiskFromPackages = name => {
    const containsRisk = [];
    const packages = $scope.getAllPackages();
    packages.forEach((pack, packInd) =>
      pack.values.forEach((val, valInd) => {
        if (val.risk === name) containsRisk.push([packInd, valInd]);
      })
    );
    if (containsRisk.length) {
      containsRisk.forEach(([packInd, riskInd]) => {
        packages[packInd].values.splice(riskInd, 1);
      });
    }
    $scope.checkPackagesForLength(packages);
  };
  $scope.checkPackagesForLength = packages => {
    const toDelete = [];
    packages.forEach(pack => {
      if (pack.values.length < 2) toDelete.push(pack);
    });
    if (toDelete.length) {
      toDelete.forEach(pack => {
        const deleteFrom = [];
        $scope.editor.objs.forEach(obj => {
          obj.values.forEach(val => {
            if (val === pack) deleteFrom.push(obj);
          });
        });
        $scope.editor.urls.forEach(url => {
          url.values.forEach(val => {
            if (val === pack) deleteFrom.push(url);
          });
        });
        deleteFrom.forEach(store => {
          const ind = store.values.indexOf(pack);
          store.values.splice(ind, 1);
        });
      });
    }
  };
  $scope.getAllPackages = () => {
    const risks = [
      ...$scope.editor.objs.filter(x => x.model === "risk"),
      ...$scope.editor.urls.filter(x => x.model === "risk")
    ];
    const packages = [];
    risks.forEach(store =>
      store.values.forEach(pack => {
        if (pack.action === "package") packages.push(pack);
      })
    );
    return packages;
  };
  $scope.editRiskInPool = (from, to) => {
    $scope.editor.risksReservedNames = $scope.editor.risksReservedNames.map(
      rName => (rName === from ? to : rName)
    );
    $scope.editor.risksCanUse = $scope.editor.risksCanUse.map(rName =>
      rName === from ? to : rName
    );
  };
  $scope.editRiskInPackages = (from, to) => {
    const packages = $scope.getAllPackages();
    packages.forEach(pack =>
      pack.values.forEach(val => {
        if (val.risk === from) val.risk = to;
      })
    );
  };
  $scope.reloadPage = () => {
    $scope.deleteSelectedStyles();
    $scope.createEditor();
    $scope.loadMatrix();
  };
  $scope.loadMatrix = async function() {
    myFactory.HIPname = "Перевозчики";
    const param = myFactory.karetkaTypes[myFactory.HIPname];
    this.myFactory.karetkaTypes[this.myFactory.HIPname];
    $scope.editor.fileName = param;
    hipFileName = param;
    await $http.post(`./php/${param}`).then(
      function success(response) {
        scope.currObj = response.data;
        scope.myFactory.currObj = response.data;
        let pack = scope.currObj.find(function(param) {
          return param.url === "Пакеты";
        });
        scope.myFactory.packages = pack.values;
        $scope.editor.all = response.data;
        $scope.editor.objs = response.data.filter(x => !x.url);
        $scope.editor.urls = response.data.filter(x => x.url);
        $scope.makeRiskPool();
        $scope.makeFirstStage($scope.editor.objs);
      },
      function error(response) {
        console.error(response);
      }
    );
  };
  $scope.relocatePage = location => {
    location = location === "dashboard" ? "" : location;
    $location.path(`/${location}`);
  };
  $scope.baseNameSave = async () => {
    const data = OLDBASENAMES;
    let obj = JSON.stringify(data);
    // формирование запроса
    const fd = new FormData();
    fd.append("json", obj);
    const req = new Request("php/baseNames.php", { method: "POST", body: fd });
    return fetch(req).then(
      async resp => {
        const res = await resp.text();
        res === "saved"
          ? console.log("old base names saved")
          : console.error(res);
      },
      err => {
        console.error("Ошибка ", err);
      }
    );
  };
  $scope.saveJSON = async () => {
    if (
      $scope.editor.newBaseName &&
      BASENAME !== $scope.editor.newBaseName &&
      !OLDBASENAMES.includes(BASENAME)
    ) {
      OLDBASENAMES.push(BASENAME);
      BASENAME = $scope.editor.newBaseName;
      await $scope.baseNameSave();
    }
    const data = [...$scope.editor.objs, ...$scope.editor.urls];
    let obj = JSON.stringify(data);
    obj = obj.replace(/,\"\$\$hashKey\":\"object:\d+\"/g, "");
    obj = JSON.parse(obj);
    obj = JSON.stringify(obj, null, "\t");
    // формирование запроса
    const fd = new FormData();
    fd.append("json", obj);
    fd.append("filename", $scope.editor.fileName);
    const req = new Request("php/json.php", { method: "POST", body: fd });
    return fetch(req).then(
      async resp => {
        const res = await resp.text();
        if (res === "saved") alert("Успешно сохранено");
        res === "saved" ? console.log(res) : console.error(res);
      },
      err => {
        console.error("Ошибка ", err);
      }
    );
  };

  $scope.createEditor();
  $scope.loadMatrix("HIP.json");
});
