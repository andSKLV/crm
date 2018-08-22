/**
 * Created by RoGGeR on 30.05.17.
 */

app.controller('calculationCtrl',function($rootScope,$http,$cookies, myFactory, $filter, $timeout, $location){
    this.span=1;
    this.myFactory=myFactory;
    let scope=this;
    this.search_params=[];
    this.isArray = angular.isArray;
    this.config="HIP.json";
    $http.post("HIP.json").then(function success (response) {
        scope.currObj=[];
        scope.currObj=response.data;
        scope.myFactory.currObj=response.data;
        
        let pack=scope.currObj.filter(function (param) {
            return param.url=="Пакеты";
        });
        pack=pack[0];
        scope.myFactory.packages=pack.values;
        if(myFactory.parks.length!=0) scope.selectParam("");
        else{
            scope.selectParam(0);
            scope.karetka.mode="making new process";
        }
        scope.myFactory.keyCodes.qwerty.length=scope.currObj.filter(function (obj) {
            return obj["name"]!=undefined;
        }).length;
        scope.navStyle="width:" + 100 / scope.currObj.length + "%;";
        scope.config="HIP.json";
        scope.myFactory.matrixType="HIP";

        if(myFactory.loadProcess!==undefined){
            scope.matrix.loadProcess(scope.myFactory.loadProcess.process, scope.myFactory.loadProcess.key);
            delete scope.myFactory.loadProcess;
        }
    },function error (response){
            console.log(response);
        }
    );
    /**
     * меняем в парке значение для всех строк
     * @param {any} value значение, либо string либо number на которое нужно поменять
     * @param {string} key параметр, который нужно поменять
     * @param {park} park в каком парке нужно поменять
     */
    this.setParamToAllProcess=function(value,key,process){
        const park = process.park;
        const index = park.processes.indexOf(process);
        let processes;
        const multies = [];
        chooseCase.call (this);
        myFactory.finalCalc();

        function chooseCase () {
            const caseWrap = () => {
                // сортируем на процесы и мульти узлы
                processes = park.processes.filter((proc, i) => {
                    // если проц не мульти +
                    // отсекаем процы в этом мульти узле
                    if (i>index&&(!proc.multi||(proc.multi!==process.multi||process.multi.show===true))) {
                        // проверяем есть ли еще процы с таким мульти, если есть, то это не проц, а мульти
                        if (!proc.multi||(!(proc.multi.show===false&&park.processes.filter(pr=>pr.multi===proc.multi).length>1))) return true;
                    }
                    if (i>index&&proc.multi&&!multies.includes(proc.multi)&&(proc.multi!==process.multi||proc.multi.show===true)) {
                        multies.push(proc.multi);
                        return false;
                    }

                    return false;
                });

                // выбираем подрежим
                if (Array.isArray(value)) copyMultiWrapParams.call(this);
                else copySingleWrapParam.call(this);
            }
            const caseNonWrap = () => {
                processes = park.processes.filter((proc, i) => i>index);
                copySingleParam.call(this);
            }
            // выбираем режим
            (key==="wrapping") ? caseWrap() : caseNonWrap();
        }
        function copySingleParam () {
            // меняем процы
            processes.forEach(process => {
                process[key]=value;
                if(key==="limit" && process.package!==undefined){
                    delete process.multi.packName;
                    delete process.multi.template;
                    let mass=process.multi.processes.filter(proc=>proc.package==process.package);
                    mass.forEach(proc=>delete proc.package);
                }
            });
        }
        function copySingleWrapParam() {
            // запоминаем состояния для дальнейшего изменения
            const karetkaState = this.karetka.mode;
            const multiModeState = myFactory.multi.mode;
            // меняем процы
            processes.forEach(process => {
                process[key]=value;
                if(key==="limit" && process.package!==undefined){
                    delete process.multi.packName;
                    delete process.multi.template;
                    let mass=process.multi.processes.filter(proc=>proc.package==process.package);
                    mass.forEach(proc=>delete proc.package);
                }
            });
            multies.forEach(multi=>{
                const excessValues =  [];
                let isValueExist = false;
                // выбираем лишние параметры, которые надо отжать, а также проверяем, есть ли в мульти узле копируемый параметр
                multi.wrapping.forEach(wrap=>{
                    if (wrap!==value) excessValues.push(wrap);
                    else isValueExist=true;
                })
                // если копируемого проца еще нет, то сначала нажиамем на него, чтобы добавить
                if (!isValueExist) excessValues.unshift(value);
                // генерация искуственных оберток
                const param = {model:"wrapping"};
                myFactory.process = multi;
                myFactory.multi.mode = true;
                excessValues.forEach(val=>{
                    const pseudoValue = {
                        name: val,
                        type:"risk",
                        value: risks[val],
                        selected : true
                    }
                    this.karetka.mode = "changing process";
                    this.karetka.clicked(param,pseudoValue);
                })
            })
            this.karetka.mode = karetkaState;
            myFactory.multi.mode = multiModeState;
        }
        function copyMultiWrapParams () {
            // запоминаем состояния для дальнейшего изменения
            const karetkaState = this.karetka.mode;
            const multiModeState = myFactory.multi.mode;
            const param = {model:"wrapping"};
            myFactory.multi.mode = true;
            this.karetka.mode = "changing process";
            
            // изменяем процы на +1 параметр, делая их теперь мульти узлами
            processes.forEach(proc=>{
                // переназначаем изменяемый объект
                myFactory.process = proc;
                const clickValues = [];
                // проверяем какие параметры нужно нажать
                value.forEach(val => {
                    if (val!==proc.wrapping) clickValues.push(val);
                })
                // генерация искуственной обертки
                const pseudoValue = {
                    name: clickValues[0],
                    type:"risk",
                    value: risks[clickValues[0]],
                    selected : true
                }
                this.karetka.clicked(param,pseudoValue);
                // находим измененный проц в измененном парке
                const changedProc = proc.park.processes.find(newProc=>(newProc.wrapping===proc.wrapping)&&(newProc.risk===proc.risk));
                // теперь он стал мульти узлом, поэтому добавлем его в коллектор мультиузлов
                multies.push(changedProc.multi);
            })
            // изменяем мульти узлы
            multies.forEach(multi=>{
                // переназначаем изменяемый объект
                const clickValues = [];
                // проверяем какие параметры нужно нажать
                value.forEach(val => {
                    if (!multi.wrapping.includes(val)) clickValues.push(val);
                })
                // проверяем какие параметры нужно отжать
                multi.wrapping.forEach(val=>{
                    if (!value.includes(val)) clickValues.push(val);
                })
                // нажимаем на нужные параметры
                clickValues.forEach(val=>{
                    myFactory.process = multi;
                    const pseudoValue = {
                        name: val,
                        type:"risk",
                        value: risks[val],
                        selected : true
                    }
                    this.karetka.clicked(param,pseudoValue);
                })
            })
            this.karetka.mode = karetkaState;
            myFactory.multi.mode = multiModeState;
        }
    };
    /**
     * это вспомогательная функция для angularJS
     * @param {*} obj ez
     * @param {*} key ez
     */
    this.deleteProperty=function(obj, key){
        delete obj[key];
    };
    /**
     * функция генерации уникального id для поля процесса в матрице
     * @param {process} process 
     * @param {number} index 
     */
    this.getUniqueId = (process, index) =>{
        return myFactory.parks.indexOf(process.park).toString()+process.park.processes.indexOf(process)+index;
    }
    /**
     * handler при нажатии на верхнюю часть каретки
     * @param {*} value 
     * @param {*} param 
     */
    this.clickedOnTopOfDashboard=(value, param)=>{
        const type=value.type;
        switch(type){
            case "relocate_here":
                this.relocateHere(value.urlTo);
                break;
            case "relocatePage":
                this.relocatePage(value.urlTo);
                break;
            case "reloadDashboard":
                this.reloadDashboard(value.json,value.matrix);
                break;
            case "text":
                this.karetka.clicked(param, value);
                break;
            case "currency":
                this.karetka.clicked(param, value);
                break;
            case "amount":
                this.karetka.clicked(param, value);
                break;
            case "risk":
                this.karetka.clicked(param, value);
                break;
            case "amountType":
                this.myFactory.changeAmountType();
                break;
            case "currencyValue":
                //меняем валюту
                break;
            case "saveCalc":
                this.saveCalculation();
                break;
            case "polisProject":
                this.makePolisProject();
                break;
        }
    };
    /**
     * для вывода подсказок
     */
    this.tooltip={
        title:"",
        fadeIn(title){

            let isTitle=false;
            if(typeof title === "object"){
                // DONE SKLV: no more ['...'] if it is array
                title=title.join(`; `);
                isTitle=true;
            }
            else if (risks[title]!==undefined){
                scope.currObj.forEach(obj=>{
                    obj.values.forEach(value=>{
                        if(value.name==title && value.title!==undefined){
                            isTitle=true;
                            title=value.title;
                        }
                    })
                })
            }
            if(isTitle){
                this.title=title;
                scope.oldConfig=scope.config;
                scope.config='tooltip';
            }


        },
        fadeOut(){
            this.title='';
            scope.config=scope.oldConfig;
            delete scope.oldConfig;
        }
    };
    /**
     * функция для отображения "ёлочкой" или "лесинкой", чтобы повторяющиеся значения были полупрозначными
     * @param {object} process 
     * @param {string} key 
     */
    this.isRepeated=function(process,key){
        let park=process.park;
        if(myFactory.parks.length==1 && park.processes.length==1 || park.processes.indexOf(process)==0) return false;
        let prevProcess;
        if(park.processes.indexOf(process)!==0){//если объект не первый в парке
            prevProcess=park.processes[park.processes.indexOf(process)-1];

        }
        else if(myFactory.parks.indexOf(park)!==0){//если мы сравниваем первый объект в парке с последним объектом предыдущего парка
            let prevPark=myFactory.parks[myFactory.parks.indexOf(park)-1];
            prevProcess=prevPark.processes[prevPark.processes.length-1];
        }
        return prevProcess[key]===process[key];

    };
    /**
     * если в режиме мульти ткнули на верхнюю часть каретки
     */
    this.multiClicked=function(){

        if(this.karetka.mode=="making new process"){
            myFactory.multiChangeMode();
            if(!myFactory.multi.mode && scope.selectNextParam()){//здесь мы имеем уже заполненный процесс, остается только добавить его в массив процессов и посчитать
                myFactory.addNewProcess();
                myFactory.finalCalc();
                scope.clean();
            }
        }
        else if(this.karetka.mode=="changing process"){
            let process=myFactory.process;
            if(!myFactory.multi.mode){
                if(transportProp[myFactory.document.currParam]=="risk" || transportProp[myFactory.document.currParam]=="wrapping") myFactory.multiChangeMode();
                else if(this.currObj[myFactory.document.currParam].url!==undefined){
                    let url=this.currObj[myFactory.document.currParam].url;
                    let obj;
                    this.currObj.forEach(objects=>{
                        objects.values.forEach(val=>{
                            if(val.urlTo===url) obj=objects;
                        })
                    });
                    let index=this.currObj.indexOf(obj);
                    if(transportProp[index]=="risk" || transportProp[index]=="wrapping") myFactory.multiChangeMode();
                }
            }
            else{
                if(process.constructor.name=="Multi" && process[transportProp[myFactory.document.currParam]].length>1){
                    this.clean();
                }
                else myFactory.multiChangeMode();
            }
        }
    };
    //*************//*************//*************
    let timer;
    this.Confirm=function(){
        if(myFactory.makingPolis){
            myFactory.makingPolis="Расчет";
            $location.path(`/polis`);
        }
        this.karetka.mode="confirm refresh";

        timer=$timeout(function () {
            scope.karetka.mode="listener"
        },4000);

    };
    //**************

    this.alert=function(str){
      alert(str);
    };
    this.console=console;
    this.isNaN=function(val){
        return isNaN(val);
    };
    this.clean=function(){//очищаем каретку и возвращаем ее в исходное состояние
        this.tooltip.fadeOut();
        for(let i=0;i<scope.currObj.length;i++){
            delete scope.currObj[i].selected;//убираем подсвечивание нижней части
            for(let j=0;j<scope.currObj[i].values.length;j++){
                delete scope.currObj[i].values[j].selected;//убираем подсвечивание верхней части
                if(scope.currObj[i].values[j].oldValue!==undefined){
                    scope.currObj[i].values[j].name=scope.currObj[i].values[j].oldValue;
                    delete scope.currObj[i].values[j].oldValue;
                }
                if(scope.currObj[i].values[j].temporarily){
                    scope.currObj[i].values.splice(j,1);
                    j--;
                }
            }
        }
        myFactory.parkTemplate=[];
        myFactory.multi.multies.forEach(function (multi) {
                delete multi.changing;
                delete multi.showRows;
                delete multi.unselectable;
        });
        myFactory.parks.forEach(function (park) {
            delete park.changing;
            delete park.showRows;
            delete park.unselectable;
            park.processes.forEach(function (process) {
                delete process.changing;
                delete process.showRows;
                delete process.unselectable;
            })
        });
        this.myFactory.document.clean();
        this.myFactory.cleanProcess();
        this.myFactory.multi.clean();
        this.karetka.mode="listener";
        myFactory.finalCalc();
    };
    this.isValue=function(ctx){//что то для контактов, при создании мульти выбора нужно изменить
        let val = ctx.phone;
        return val!="" && val!=undefined && val!=null && !isNaN(val) && !angular.equals("", val)
    };
    this.isMulti=function(row){//это тоже изменить
        return row.contact.length>1;
    };
    this.multiHeight=function(contacts){//и это изменить
        let height=100/contacts.length;
        height="{height:"+height+"%;}";
        return height;
    };
    this.reloadDashboard=function(string, type){
        if(string==="Компания"){
            string="HIP.json", type="HIP";
        }
        $timeout.cancel(timer);
        this.saveRes=12345;
        this.karetka.mode="listener";
        $http.post(string).then(function success (response) {
            scope.currObj=[];
            scope.currObj=response.data;
            scope.myFactory.currObj=response.data;
            if(string!="HIP.json")scope.selectParam(0);
            else{
                let pack=scope.currObj.filter(function (param) {
                    return param.url=="Пакеты";
                });
                pack=pack[0];
                scope.myFactory.packages=pack.values;
                if(myFactory.parks.length!=0) scope.selectParam("");
                else{
                    scope.selectParam(0);
                    scope.karetka.mode="making new process";
                }

            }

            scope.myFactory.keyCodes.qwerty.length=scope.currObj.filter(function (obj) {
                return obj["name"]!=undefined;
            }).length;
            scope.navStyle="width:"+100/scope.currObj.length+"%;";

            scope.config=string;

            if(typeof type !="undefined") scope.myFactory.matrixType=type;
            },function error (response){
                console.log(response);
            }
        );
    };
    this.relocatePage=function(value){//переход на другую страницу(как в случае с калькулятором который не написан)
        value = (value==="dashboard") ? "" : value;
        $location.path(`/${value}`);
        location.reload();
    };
    this.relocateHere=function(url){//переход в углубление вверху каретки
        for(let i=0; i<scope.currObj.length;i++){

            if(scope.currObj[i]['url']===url){
                scope.selectParam(scope.currObj.indexOf(scope.currObj[i]));
            }
        }
    };
    this.currentUl=function(index){//функция проверки для анимации и переключения между ul
        if(index===scope.myFactory.document.currParam) return true;
    };
    this.setCurrentUl=function(key){
        return transportProp.indexOf(key);
    };
    this.currentProcess={};
    this.selectParam=function (index) { // нажатии на nav
        if(myFactory.parkTemplate.length>0) myFactory.parkTemplate=[];
        if(this.currObj[index] && this.currObj[index].name===undefined){
            let url=this.currObj[index].url;
            this.currObj.forEach(function (params, i) {
                params.values.forEach(function (value) {
                    if(value.urlTo==url) myFactory.document.selectedParam=i;
                })
            })
        }
        else myFactory.document.selectedParam=index;
        this.myFactory.document.currParam=index;
        $rootScope.search_result=[];
        if(index!==""){
            this.myFactory.keyCodes.number.length=this.currObj[this.myFactory.document.currParam].values.length+1;
            if(this.karetka.mode=="listener") this.karetka.mode="making new process";
        }
    };
    this.selectNextParam=function(){
        let i=0;
        for(let key in myFactory.process){
            if(myFactory.process[key]===""){
                scope.selectParam(i);
                return false;
            }
            i++;
        }
        return true;
    };
    this.checkTransportProp=function (key) {
        return transportProp.indexOf(key);
    };
    this.configuration=function(value){
        if(value===1){
            return scope.config==='navigation';
        }
    };
    function get_value(text){// функция получения из "100 500 рублей" значения "100500"
        text=text.split(' ');
        let result="";
        for (let i = 0; i < text.length; i++) {
            if(!isNaN(text[i])) result+=text[i];
        }
        return result*1;
    }
    this.applyFilter = function(value, key, group){
        if(group!==undefined){
            if(!isNumeric(value) && value.indexOf("-")!=-1){
                value=value.split("-");
                if(key=="cost" || key =="limit" || key=="franchise") return $filter("currency")(value[0], '', 0) + " Р"+" - "+$filter("currency")(value[1], '', 0) + " Р";
                else if(key=="amount"){
                    if(this.myFactory.amountType=="Тягачей") {
                        return $filter("currency")(value[0]/TRACTOR, '', 0)+" "+chooseEnd(value[0]/TRACTOR,myFactory.amountType)+" - "+$filter("currency")(value[1]/TRACTOR, '', 0)+" "+chooseEnd(value[1]/TRACTOR,myFactory.amountType);
                    }
                    else if(this.myFactory.amountType=="Рейсов") {
                        return $filter("currency")(value[0], '', 0)+" "+chooseEnd(value[0],myFactory.amountType)+" - "+$filter("currency")(value[1], '', 0)+" "+chooseEnd(value[1],myFactory.amountType);
                    }
                }
            }
            else{
                if(key=="cost" || key =="limit" || key=="franchise") return $filter("currency")(value, '', 0) + " Р";
                else if(key=="amount"){
                    if(this.myFactory.amountType=="Тягачей") return $filter("currency")(value/TRACTOR, '', 0)+" "+chooseEnd(value/TRACTOR,myFactory.amountType);
                    else if(this.myFactory.amountType=="Рейсов") return $filter("currency")(value, '', 0)+" "+chooseEnd(value,myFactory.amountType);
                }
                return value;
            }
        }
        else if(typeof key == "undefined"){
            if(value.type=="currency") return $filter(value.type)(value.name, '', 0);
            else if(value.type=="amount"){
                if(this.myFactory.amountType=="Тягачей") return $filter("currency")(value.name/TRACTOR, '', 0);
                else if(this.myFactory.amountType=="Рейсов") return $filter("currency")(value.name, '', 0);
            }
            else return value.name;
        }
        else{
            if(key=="cost" || key =="limit" || key=="franchise") return $filter("currency")(value, '', 0) + " Р";
            else if(key=="amount"){
                if(this.myFactory.amountType=="Тягачей") return $filter("currency")(value/TRACTOR, '', 0)+" "+chooseEnd(value/TRACTOR,myFactory.amountType);
                else if(this.myFactory.amountType=="Рейсов") return $filter("currency")(value, '', 0)+" "+chooseEnd(value,myFactory.amountType);
            }
            // это вообще что такое???
            else if(key=="badAssAmount") {
                if(this.myFactory.amountType=="Тягачей")return $filter("currency")(value, '', 0)+" "+chooseEnd(value,myFactory.amountType);
                else if(this.myFactory.amountType=="Рейсов") return $filter("currency")(value, '', 0)+" "+chooseEnd(value,myFactory.amountType);
            }
            else if(Array.isArray(value)&&value.length===1) return value[0]; 
            else return value;
        }
        // склоняем существительные
        function chooseEnd(value,type) {
            value= +value;
            const typeN = (type==="Тягачей") ? 0 : 1;
            const endings = [["Тягач","Тягача"],["Рейс","Рейса"]];
            if (value===1 || (value>20 && value%10===1)) return endings[typeN][0];
            else if ((2<=value&&value<=4) || (value>20 && 2<=value%10&& value%10<=4)) return endings[typeN][1];
            else return type;
        }
    };

    this.alreadySelected = function(model){
        if($rootScope.mode=="calc") return !(myFactory.process[model]==="");
        else return false;
    };
    this.addPropertyToProcess=function(param, value){//меняем обычный процесс который у нас в фабрике
        myFactory.process[param.model]=value;//заполняем соответствующее свойство создаваемого процесса


        //*****************Заносим выбранное значение в нижнюю часть каретки
        if(!param.name){
            scope.currObj.forEach(function(newParam){
                if(newParam.name && newParam.model==param.model) param=newParam
            })
        }
        if(param.model=='amount' && scope.myFactory.amountType=="Тягачей"){
            param.selected=value/TRACTOR;
        }
        else param.selected=value;
        //*****************

    };

    this.clickedSelectAll=function(param, value){
        // SKLV 01.06.18:  кнопка вызова функции удалена из интерфейса
        scope.myFactory.multiChangeMode(true);

        let flag=true;
        let multi=scope.myFactory.multi;
        param.values.forEach(function(val){
            if(val!=value){
                scope.myFactory.multi.mode=true; //включаем режим мульти

                if(multi.arrays[param.model].indexOf(val.name)==-1){//если такой элемент не был выбран
                    val.selected=true;
                    multi.arrays[param.model].push(val.name);
                    flag=false;
                }

            }
        });
        if(flag){
            param.values.forEach(val=>{
                delete val.selected;
                multi.arrays[param.model].splice(multi.arrays[param.model].indexOf(val.name),1);
            })
        }
        console.log(scope.myFactory.multi);
        //this.addPropertyToProcess(param, "multi");
    };

    this.clickedOnMulti=function(param, value){//при нажатии на верх каретки в мульти параметры при режиме мульти
    // изменение открытого мульти узла
        if (scope.karetka.mode=="changing process" && myFactory.process.constructor.name=="Process" && myFactory.multi.mode) {
            let newMulti;
            let multi = myFactory.process.multi;
            let process=multi.processes[multi.processes.indexOf(myFactory.process)];
            const park = process.park;
            // сохраняем индекс чтобы потом поставить поц на нужное место
            let indexProcInPark = process.park.processes.indexOf(process);
            const indexProcInMulti = multi.processes.indexOf(process);
            // проверка на наличие в парке такого проца
            const isContaining = parkContain();
            // если того что мы хотим добавить еще нет в нашем мульти
            if(multi[param.model].indexOf(value.name)==-1 ||  multi[param.model].length>1) {
                if (isContaining) {
                    // если такой проц уже есть в парке,то создаем новый парк
                    myFactory.process = Object.assign({},process);
                    myFactory.multi.arrays.risk = [process.risk];
                    myFactory.multi.arrays.wrapping = [process.wrapping];
                    myFactory.multi.arrays[param.model].push(value.name);
                    myFactory.addNewProcess();
                    // новый парк всегда помещается в начало, значит берем из него ссылку на мульти
                    newMulti = myFactory.parks[0].processes[0].multi;
                }
                else {
                    myFactory.process = process;
                    // добавляем новые данные в учет в коллектор "мульти"
                    myFactory.multi.arrays.risk = [process.risk];
                    myFactory.multi.arrays.wrapping = [process.wrapping];
                    myFactory.multi.arrays[param.model].push(value.name);
                    const array = myFactory.makeMulti();
                    park.processes.splice(indexProcInPark,1);
                    // меняем проц на мульти узел
                    myFactory.addNewProcess("changing",null,indexProcInPark);
                    // переопределяем индекс проца в парке, так как он может сползти
                    let newProc = park.processes.find(pr=>(pr.risk===process.risk)&&(pr.wrapping===process.wrapping));
                    indexProcInPark = park.processes.indexOf(newProc);
                    multi.processes[indexProcInMulti] = park.processes[indexProcInPark].multi;
                    newMulti = multi.processes[indexProcInMulti];
                    // запоминаем прошлый мульти
                    newMulti.prevMulti = multi;
                    // назначаем родителя
                    if (multi.parent) {
                        if (multi.parent.processes) multi.parent.processes.push(newMulti);
                        else multi.parent.push(newMulti);
                        newMulti.parent = multi.parent;
                    }
                    else {
                        newMulti.parent = multi;
                        newMulti.multi = multi;
                    }
                }
                value.selected=true;
                myFactory.removeCellSelection();
                myFactory.finalCalc();
                // выдедилть ту ячейку которую сейчас изменяем
                scope.matrix.loadMulti(newMulti.processes[0],param.model);
                return;
            }
            /**
             * Проверка на то, содержит ли парк такой проц
             */
            function parkContain () {
                const procForCheck = Object.assign({},process);
                procForCheck[param.model]=value.name;
                return park.contains([procForCheck]);
            }
        }
    // изменение закрытого мульти узла
        if(scope.karetka.mode=="changing process" && (myFactory.process.constructor.name=="Multi")){
            let mode;
            // мульти-узел на котором кликнули
            let multi = myFactory.process;
            // первый проц из этого мультиузла
            let process=multi.processes[0];
            // если он мульти, то берем из него первый проц. ...интересно, а если там 3 уровня?
            if(process.constructor.name=="Multi") process=process.processes[0];
            // если того что мы хотим добавить еще нет в нашем мульти
            if(multi[param.model].indexOf(value.name)==-1 ||  multi[param.model].length>1) {
                myFactory.process = process;
                // добавляем новые данные в учет в коллектор "мульти"
                myFactory.multi.arrays.risk = multi.risk;
                myFactory.multi.arrays.wrapping = multi.wrapping;

                //если мы отжимаем(т.е. такой процесс уже есть)
                if (myFactory.multi.arrays[param.model].indexOf(value.name) != -1) {
                    myFactory.multi.arrays[param.model].splice(myFactory.multi.arrays[param.model].indexOf(value.name), 1);
                    mode = 'unclick';
                    // myFactory.removeCellSelection();
                    delete value.selected;
                }
                //если такого процесса нету
                else{
                    console.log(param, value);
                    // если нажали "выбрать все"
                    if(value.action=="selectAll"){
                        if(multi.packName===undefined) this.clickedSelectAll(param, value);
                        else{
                            let mass=[];
                            multi.template.forEach(obj=>mass.push(obj.risk));
                            let flag=true;
                            param.values.forEach(val=>{
                                if(val.name!=value.name && mass.indexOf(val.name)===-1 && myFactory.multi.arrays[param.model].indexOf(val.name)===-1){
                                    val.selected=true;
                                    flag=false;
                                    myFactory.multi.arrays[param.model].push(val.name);
                                }
                            });
                            if(flag){
                                myFactory.process=multi;
                                return false;
                            }
                        }
                    }
                    
                    else{
                        // если выбрали пакеты
                        if(value.action=="package"){
                            multi.template=value.values;
                            if(multi.packName!==undefined){

                                myFactory.multi.arrays[param.model].splice(myFactory.multi.arrays[param.model].indexOf(multi.packName))
                            }
                            multi.removePackage();
                            multi.prepareForPackage();
                            let riskMass=myFactory.multi.arrays[param.model];
                            if(riskMass.indexOf("Базовые риски")!=-1) riskMass.splice(riskMass.indexOf("Базовые риски"),1);
                            let mass=[];
                            multi.template.forEach(obj=>mass.push(obj.risk));
                            mass.forEach(risk=>{
                                if(riskMass.indexOf(risk)!=-1) riskMass.splice(riskMass.indexOf(risk),1);
                            })

                        }
                        if(multi.packName!==undefined){
                            param.values.forEach(val=>{
                                if(val.name==multi.packName) delete val.selected;
                            });
                            let mass=[];
                            multi.template.forEach(obj=>mass.push(obj.risk));
                            if(mass.indexOf(value.name)!==-1){
                                console.log("такой риск есть в пакете");
                                myFactory.process=multi;
                                return false;
                            }
                        }
                        // добавляем новый параметр в учет в коллектор мульти
                        myFactory.multi.arrays[param.model].push(value.name);
                        value.selected=true;
                    }
                }
                // проходим по массиву объекта мульти на котором нажали
                // если вложенные процы тоже мульти то...
                multi.processes.forEach(function (multik) {
                    if(multik.constructor.name=="Multi"){
                        myFactory.multi.multies.splice(myFactory.multi.multies.indexOf(multik), 1);
                    }
                });
                if(multi.risk.length==1 && multi.risk[0]==multi.packName) myFactory.process.risk=multi.risk[0];
                const isNotMulti = () => {
                    // если в параметрах мульти коллектора теперь осталось по одному аргументу =
                    return Object.values(myFactory.multi.arrays).every(el => el.length===1)
                };
                // если произошло отжатие предпоследнего аргумента в мульти, то мульти должен превратиться в проц
                if (isNotMulti()) {
                    myFactory.removeCellSelection();
                    const key = (param.model==="risk") ? "wrapping" : "risk";
                    // определяем проц, который надо удалить
                    const deletingProc = process.park.processes.find(proc=>{
                        return (proc[param.model]===value.name)&&(proc[key]===process[key]);
                    });
                    deleteProcFromMulti(deletingProc);
                    myFactory.finalCalc();
                    // блок удаления этого проца
                    function deleteProcFromMulti(deletingProc) {
                        if(deletingProc.multi) {
                            //удаляем процесс из мульти
                            deletingProc.multi.processes.splice(deletingProc.multi.processes.indexOf(deletingProc),1);
                            if (deletingProc.multi.parent) {
                                let parentMulti = deletingProc.multi.parent;
                                //  структура родителя может быть разная, поэтому в зависимости от случая меняем путь к его детям
                                const pathToChild = (parentMulti.processes) ? parentMulti.processes : parentMulti;
                                // если есть родитель, убираем у родителя ребенка
                                pathToChild.splice (pathToChild.indexOf(deletingProc.multi),1);
                            }
                            if (deletingProc.multi.processes.length<2) {
                                // если это теперь не мульти узел, то у оставшегося проца убираем ссылку на мульти узел
                                let newMulti;
                                // выбираем куда вставить оставшийся проц
                                // если был записан предыдущий мульти, то туда
                                if (deletingProc.multi.prevMulti) newMulti = deletingProc.multi.prevMulti;
                                // если его не было, то в мульти уровнем выше
                                else if (deletingProc.multi.multi) newMulti = deletingProc.multi.multi;
                                if (newMulti) {
                                    deletingProc.multi.processes[0].multi = newMulti;
                                    // на всякий случай пост
                                    if (!newMulti.processes) {
                                        throw new Error('Верхний мульти с другой структурой. Нет .processes');
                                        debugger;
                                    }
                                    newMulti.processes.push(deletingProc.multi.processes[0]);
                                }
                                else if (deletingProc.multi.parent) deletingProc.multi.processes[0].multi = deletingProc.multi.parent;
                                else delete deletingProc.multi.processes[0].multi;
                                 // из коллектора мульти-узлов убираем этот мульти узел
                                myFactory.multi.multies.splice(myFactory.multi.multies.indexOf(deletingProc.multi),1);
                            }
                        }
                        
                        if(deletingProc.park.processes.length>1) {
                            //удаляем процесс из парка
                            deletingProc.park.processes.splice(deletingProc.park.processes.indexOf(deletingProc),1);
                        }
                        // если процесс единственный в парке, удаляем парк
                        else myFactory.parks.splice(myFactory.parks.indexOf(deletingProc.park), 1);
                        scope.clean();
                    }
                }
                else{
                    if (checkContains()) {
                        // если такой про уже был в парке, создаем новый парк
                        myFactory.process=Object.assign({},multi.processes[0]);
                        myFactory.multi.arrays.risk = multi.risk;
                        myFactory.multi.arrays.wrapping = multi.wrapping;
                        myFactory.addNewProcess();
                        // так как новый парк встает на первое место, то определяем новый рабочий проц
                        myFactory.process=myFactory.parks[0].processes[0].multi;
                        myFactory.finalCalc();
                        // делаем активным новый мульти, который создали
                        scope.matrix.loadMulti(myFactory.process.processes[0],param.model);
                    }
                    else {
                        // если такого проца нет, то можем менять старый
                        myFactory.addNewProcess("changing", multi);
                        myFactory.finalCalc();
                        myFactory.process=multi;
                        // если выделили последний элемент, то процесс выбора окончен
                        if (myFactory.multi.arrays[param.model].length===1) scope.clean();
                    }
                    debugger;
                    // проверяем, есть ли такой проц уже в парке
                    function checkContains() {
                        if (mode==='unclick') return false;
                        const procForCheck = Object.assign({},myFactory.process);
                        procForCheck[param.model] = value.name;
                        return procForCheck.park.contains([procForCheck]);
                    }
                }

            }
            return;
        }
        let multi=scope.myFactory.multi;
    // выбрать все
        if(value.action=="selectAll"){
            scope.myFactory.multiChangeMode(true);
            param.values.forEach(function(val){
                if(val!=value){
                    val.selected=true;
                    scope.myFactory.multi.mode=true; //включаем режим мульти
                    let multi=scope.myFactory.multi;
                    if(multi.arrays[param.model].indexOf(val.name)==-1){//если такой элемент не был выбран
                        val.selected=true;
                        multi.arrays[param.model].push(val.name);
                    }

                }
            });
            console.log(scope.myFactory.multi);
        }
        else if(multi.arrays[param.model].indexOf(value.name)==-1){//если такой элемент не был выбран
            value.selected=true;
            multi.arrays[param.model].push(value.name);
        }
        // если отжали в мульти 
        else if (multi.arrays[param.model].length===1) {
            delete value.selected;
            return false;
        }
        else {
            delete value.selected;
            multi.arrays[param.model].splice(multi.arrays[param.model].indexOf(value.name),1);
        }

        //здесь должно быть перестроение шаблона


        //работа с нижней частью каретки и непосредственно с создаваемым объектом
        if(multi.arrays[param.model].length>1){
            scope.addPropertyToProcess(param, "multi");
        }
        else if(multi.arrays[param.model].length==1){
            scope.addPropertyToProcess(param, multi.arrays[param.model][0]);
        }
        else{
            delete value.selected;
            delete param.selected;
            myFactory.process[param.model]="";
        }
        //*********
    };
    this.pipeAmount= function(value){
        if(isNaN(value)) return value;
        if(value%TRACTOR!==0) return value+" рейсов";
        else return value/24+" тягачей";
    };
    this.matrix={
        /**
         * копируем мультиузел
         * @param {multi} multi мульти который надо скопировать
         */
        copyMulti(multi) {
            scope.clean();
            console.log(multi);
            let array=[];
            //создаем массив с копиями объектов процессов 
            multi.processes.forEach(function (process) {
                let newProcess=new Process(process);
                array.push(newProcess);
            });
            //создаем копию объекта мульти
            let newMulti=new Multi(array);
            myFactory.multi.multies.push(newMulti);
            //проверить этот бред, вроде как не нужен
            for(let key in multi){
                if(key!="processes") newMulti[key]=multi[key];
            }
            const thisPark = multi.processes[0].park; 
            if (isMultiRisk(multi)) {
                copyMultiRisk();
            }
            else copyMultiWrap();
            function isMultiRisk(multi){
                let flag = true;
                if (multi.risk.length===1 && multi.wrapping.length > 1) flag = false;
                // если это пакет, то тоже копируем в новый парк
                if (multi.packName) flag=true;
                return flag;
            }
            function copyMultiRisk(){
                let newPark=new Park(array);
                    //добавляется новый парк
                myFactory.parks.splice(myFactory.parks.indexOf(thisPark)+1, 0, newPark);
            }
            function copyMultiWrap(){
                array.forEach((proc)=>{
                    thisPark.processes.push(proc);
                })
            }
                // переводим каретку в режим выбора рисков для скопированного мульти узла
            this.loadMulti(array[0],"risk");
            myFactory.finalCalc();

        },
       
        /**
         * удаляем мультиузел
         * @param {multi} multi 
         */
        deleteMulti(multi){
            myFactory.removeCellSelection();
            let park=multi.processes[0].park;
            multi.processes.forEach(function (process) {
                if(process.package){
                    park.processes.forEach(proc=>{
                        delete proc.package;
                    });
                }
                // удаляем процессы, которые были в нашем мульти из парка
                park.processes.splice(park.processes.indexOf(process), 1);
            });
            
            if(park.processes.length==0) {
                // удаляем парк если больше нет строк
                myFactory.parks.splice(myFactory.parks.indexOf(park), 1);
            }
            // удаляем мульти у родителя, если у него есть родитель
            if(multi.parent) this.deleteMultiFromParent(multi);
            myFactory.multi.multies.splice(myFactory.multi.multies.indexOf(multi), 1);
            scope.clean();
            console.log(myFactory.parks, myFactory.multi.multies);
        },
        // удаление мульти из всех родителей и их родителей, проверка всех родителей на наличие детей
        deleteMultiFromParent (multi) {
            // если есть родительский мульти узел то...
            let parentMulti=multi.parent;
            // ... удаляем у родителя его ребенка
            parentMulti.processes.splice(parentMulti.processes.indexOf(multi),1);
            // удаляем проц у родителя родителя 
            if (parentMulti.parent) {
                parentMulti.parent.forEach(child=>{
                    if (child.processes.includes(multi)) child.processes.splice(child.processes.indexOf(multi),1);
                })
            }
            // ...если в родительском мульти узле остался один ребенок, то удаляем родительский узел
            if (multi.parent.processes.length<2){
                parentMulti.processes.forEach(multik => {
                    if (multik.parent===multik.prevMulti) delete multik.prevMulti;
                    if (multik.parent===multik.multi) delete multik.multi;
                    delete multik.parent
                });
                myFactory.multi.multies.splice(myFactory.multi.multies.indexOf(parentMulti), 1);
            }
            if (multi.multi && multi.multi.length<2){
                delete multi.multi;
            }
        },
        /**
         * функция копирования парка
         * @param {park} oldPark  старый парк, который будем копировать
         */
        copyPark(oldPark) {
            scope.clean();
            let obj=oldPark.copyPark();
            let {mass, park}=obj;
            myFactory.parks.push(park);
            myFactory.choosePark(mass, park, 0);
            let array=mass.filter(process=>process.multi==="create");
            if(array.length>0) myFactory.multi.multies.push(new Multi(array));
            mass.forEach(process=>{
                if(process.package){
                    let multi=myFactory.multi.multies[myFactory.multi.multies.length-1];
                    multi.packName=process.package;
                    let packages=myFactory.packages.filter(pack=>pack.name==process.package);
                    multi.template=packages[0].values;
                    myFactory.finalCalc();
                    return false;
                }
            });
            myFactory.finalCalc();
        },
        /**
         * удаляем парк
         * @param {park} park 
         */
        deletePark(park) {
            scope.clean();
            park.processes.forEach(process=>{
                if(process.multi && process.multi!="deleted") deepRemoveMulti(process.multi);
            });
            myFactory.parks.splice(myFactory.parks.indexOf(park),1);
            myFactory.finalCalc();
        },
        /**
         * функция загрузки процесса из матрицы в каретку
         * @param {process} process новый процесс, который был создан при копировании
         * @param {string} prop значение процесса
         */
        loadProcess(process, prop) {
            myFactory.multi.multies.forEach(function (multi) {
                delete multi.changing;
            });
            myFactory.parks.forEach(function (park) {
                delete park.changing;
                park.processes.forEach(function (process) {
                    delete process.changing;
                })
            });
            process.changing=true;//для выделения строки которую меняем
            scope.karetka.mode="changing process";
            // делаем все прошлые выделенные ячейки невыделенными, т.е. убираем выделения
            for(let i=0;i<scope.currObj.length;i++) {
                for(let j=0;j<scope.currObj[i].values.length;j++) delete scope.currObj[i].values[j].selected;//selected параметр позволяет подсветить то значение, которое выбрано в процессе
            }

            scope.myFactory.document.currParam = transportProp.indexOf(prop);
            scope.myFactory.document.selectedParam = transportProp.indexOf(prop);
            // заменяем проц с которым работаем
            myFactory.process=process;
            // проходим по всем параметрам в проце
            for(let key in process){
                // если параметр входит в транспортные пропсы, а не является чем то вспомогательным для расчетов типа multi, baseRate и тд
                if(transportProp.indexOf(key)!=-1){
                    if(key=='cost'|| key=='amount'||key=='limit'||key=='franchise'){
                        // если это один из перечисленных, то выбираем выбираем его в скоупе
                        const karetkaParam=scope.currObj.find(obj => obj['model']==key);
                        // перебираем все возможные значения каретки, чтобы выделить подходящее
                        for(let i=0;i<karetkaParam.values.length;i++){
                            // если это инпут у количества груза и еще и тягачи, то пересчитываем рейсы в тягачи
                            if(karetkaParam.values[i].name=="input"){
                                if(key=='amount' && scope.myFactory.amountType=="Тягачей"){
                                    karetkaParam.selected=process[key] / TRACTOR;
                                }
                                // а если цена или рейсы, то просто вставляем цену проца
                                else karetkaParam.selected=process[key];
                            }
                            // если значение скоупа соответсвует значению в проце, то выбираем его
                            if(karetkaParam.values[i].name==process[key]){
                                karetkaParam.values[i].selected=true;
                                break;
                            }

                        }
                    }
                    else{
                        for(let i=0;i<scope.currObj.length;i++){
                            for(let j=0;j<scope.currObj[i].values.length;j++){
                                if(scope.currObj[i].values[j].name==process[key]){
                                    scope.currObj[i].selected=process[key];
                                    scope.currObj[i].values[j].selected=true;
                                    if(key==prop) scope.selectParam(i);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            // если это поле с инпутами и инпут был нестандартный, то при загрузке проца курсор сразу в инпут
            if (prop=='cost'|| prop=='amount'||prop=='limit'||prop=='franchise') {
                const clickedParam = scope.currObj.find(obj => obj['model']==prop);
                // является ли стандартным значением
                const isCommon = clickedParam.values.some(val=>val.name===process[prop]);
                // ставим фокус на конкретный инпут
                const name = `#inputForCurrency-${prop}`;
                // таймаут для того чтобы успела пройти анимация
                if (!isCommon) setTimeout(()=> document.querySelector(name).focus(),700);
            }
        },
        /**
         * функция загрузки мультиузла в каретку
         * @param {process} process сам мультиузел
         * @param {string} key параметр мультиузла который мы загружаем
         */
        loadMulti(process, key){
            scope.selectParam(transportProp.indexOf(key));
            let multi=process.multi;

            if( !isNumeric(multi[key]) && multi[key].indexOf("-")!=-1 ){
                return;
            }
            else{
                scope.clean();
                multi.changing=true;
                scope.karetka.mode="changing process";
                if( (key=="wrapping" || key=="risk") && multi[key].length>1 ){
                    myFactory.multi.mode=true;
                    scope.selectParam(transportProp.indexOf(key));
                    myFactory.process=multi;
                    for(let i=0;i<scope.currObj.length;i++){
                        for(let j=0;j<scope.currObj[i].values.length;j++){
                            if( multi[key].indexOf(scope.currObj[i].values[j].name)!=-1 ){
                                scope.currObj[i].values[j].selected=true;

                                //для того чтобы подсвечивать вложенности
                                if(scope.currObj[i].url){
                                    let url=scope.currObj[i].url;
                                    for(let a=0;a<scope.currObj.length; a++){
                                        for(let b=0; b<scope.currObj[a].values.length; b++){
                                            if(scope.currObj[a].values[b].urlTo==url) scope.currObj[a].values[b].selected=true;
                                        }
                                    }
                                }
                                //*********
                            }
                        }
                    }
                    return;
                }
                this.loadProcess(multi, key);
            }


        },
        /**
         * загружаем свернутый парк в каретку
         * @param {*} park 
         * @param {*} key 
         */
        loadPark(park, key) {
            console.log(scope.currObj);
            scope.clean();
            scope.selectParam(transportProp.indexOf(key));
            scope.karetka.mode="changing process";
            park.changing=true;
            myFactory.process=park;
            if(Array.isArray(park[key])){
                for(let i=0;i<scope.currObj.length;i++){
                    for(let j=0;j<scope.currObj[i].values.length;j++){
                        if( park[key].indexOf(scope.currObj[i].values[j].name)!=-1 ){
                            scope.currObj[i].values[j].selected=true;

                            //для того чтобы подсвечивать вложенности
                            if(scope.currObj[i].url){
                                let url=scope.currObj[i].url;
                                for(let a=0;a<scope.currObj.length; a++){
                                    for(let b=0; b<scope.currObj[a].values.length; b++){
                                        if(scope.currObj[a].values[b].urlTo==url) scope.currObj[a].values[b].selected=true;
                                    }
                                }
                            }
                            //*********
                        }
                    }
                }
            }
            else if(!isNumeric(park[key]) && park[key].indexOf("-")!=-1){
                let mass=[];
                park.processes.forEach(function (process) {
                    if(!process.package || process.package && process.risk=="Базовые риски") mass.push(process[key]);
                });
                if(mass.length>10) return false;


                let currObj=scope.currObj.filter(function (obj) {
                    return obj.model==key;
                });
                currObj=currObj[0];
                for(let i=0;i<mass.length;i++){
                    currObj.values.forEach(function (obj) {
                        if(obj.name==mass[i]){
                            obj.selected=true;
                            mass.splice(i,1);
                            i--;
                        }
                    });
                }
                mass.forEach(function (elem) {
                    let difference=null;
                    let match=null;
                    currObj.values.forEach(function (obj) {
                        if(isNumeric(obj.name)){
                            if(difference===null){
                                difference=Math.abs(obj.name-elem);
                                match=obj;
                            }
                            else if(difference!==null && difference>Math.abs(obj.name-elem)){
                                difference=Math.abs(obj.name-elem);
                                match=obj;
                            }
                        }
                    });
                    if(match.oldVal===undefined && match.selected===undefined){
                        match.oldVal=match.name;
                        match.name=elem;
                        match.selected=true;
                    }
                    else{
                        let obj={};
                        obj.name=elem;
                        if(key=="amount") obj.type="amount";
                        else obj.type="currency";
                        obj.temporarily=true;
                        obj.selected=true;
                        if(match.name>elem) currObj.values.splice(currObj.values.indexOf(match),0, obj);
                        else currObj.values.splice(currObj.values.indexOf(match)+1,0, obj);
                    }
                });

            }
            else{
                this.loadProcess(park, key);
            }

        }
    };
    this.karetka={
        mode:"listener",
        multiClicked: function (param) {
            console.log(param);
        },
        clicked: function(param, value){
            if(this.mode=="listener") this.mode="making new process";


            if(this.mode=="making new process"){
                //если мы выбираем не мульти значения или режим не мульти
                if(!scope.myFactory.multi.mode || (scope.myFactory.multi.mode && param.model!="wrapping" && param.model!="risk" ) ){
                    scope.addPropertyToProcess(param,value.name);
                    value.selected=true;
                    //выбрать все - отключение надо доделать
                    if(value.action=="selectAll"){
                        scope.clickedSelectAll(param, value);
                    }

                    //если выбран пакет
                    else if(value.action=="package"){
                        let multi=scope.myFactory.multi;
                        multi.template=value.values;
                    }

                    if(scope.selectNextParam()){//здесь мы имеем уже заполненный процесс, остается только добавить его в массив процессов и посчитать
                        console.log(myFactory.multi);
                        console.log(myFactory.process);
                        myFactory.addNewProcess();
                        myFactory.finalCalc();
                        scope.clean();
                    }
                }
                else{
                    scope.clickedOnMulti(param, value);
                }

            }
            if(this.mode=="changing process"){
                if(myFactory.process.constructor.name=="Park"){
                    let park=myFactory.process;
                    if(Array.isArray(park[param.model]) || !isNumeric(park[param.model]) && park[param.model].indexOf("-")!=-1){
                        console.log(param, value);
                        if(value.selected){
                            let mass=[];
                            park.processes.forEach(function (process) {
                                if(process[param.model]==value.name){
                                    if(mass.indexOf(process)==-1) mass.push(process);
                                }
                            });
                            myFactory.parkTemplate=mass;
                            myFactory.parkTemplateChangingValue=value.name;
                        }
                        else if(myFactory.parkTemplate.length>0){
                            value.selected=true;
                            //убрали старое подсвечивание
                            for(let i=0;i<scope.currObj.length;i++) {
                                for (let j = 0; j < scope.currObj[i].values.length; j++) {
                                    if (myFactory.parkTemplateChangingValue == scope.currObj[i].values[j].name) {
                                        delete scope.currObj[i].values[j].selected;
                                        if (scope.currObj[i].url) {
                                            let flag=false;
                                            scope.currObj[i].values.forEach(function (otherValue) {
                                                if(otherValue.selected) flag=true;
                                            });
                                            if(!flag){
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
                    else{
                        park.changeProperty(param.model, value.name);
                        myFactory.finalCalc();
                        scope.clean();
                    }
                }
                
                else if(myFactory.process.constructor.name=="Multi"||(myFactory.process.multi&&myFactory.multi.mode)){
                    // FIXME:
                    myFactory.finalCalc();
                    let multi=myFactory.process;
                    //если включен режим мульти
                    if(myFactory.multi.mode){
                        scope.clickedOnMulti(param, value);
                    }

                    //если режим мульти не включени мы выбираем либо числовые значения, либо меняем пакет
                    else if( isNumeric(multi[param.model]) || multi[param.model].length==1){
                        //param=param.model;
                        if(value.action=="package" || value.action=="selectAll"){
                            if(param.model=="risk"){
                                myFactory.multi.arrays.wrapping=multi.wrapping;
                                myFactory.process=multi.processes[0];
                                myFactory.process.risk=value.name;
                                if(value.action=="package"){
                                    myFactory.multi.arrays[param.model].push(value.name);
                                    if(multi.processes[0].package){
                                        multi.processes.forEach(function(proc, i){
                                            if(proc.package && i!=0){
                                                proc.park.processes.splice(proc.park.processes.indexOf(proc), 1);
                                            }
                                        })
                                    }
                                }
                                else if(value.action=="selectAll"){
                                    let key=param.model;
                                    param.values.forEach(function (param) {
                                        if(param.name!=value.name && myFactory.multi.arrays[key].indexOf(param.name)==-1) {
                                            myFactory.multi.arrays[key].push(param.name);
                                            param.selected=true;
                                        }
                                    })
                                }
                                myFactory.addNewProcess("changing", multi);
                                delete scope.myFactory.process.changing;//убираем выделение строки которую меняли
                                scope.clean();
                                console.log(myFactory.parks);
                            }
                        }
                        else if(multi[param.model][0]==multi.packName && param.model=="risk"){//если меняется риск с пакетом в мультистроке
                            let process=multi.processes[0];
                            if(multi.wrapping.length>1){//если кроме пакета есть еще узлы в этом комплексе
                                myFactory.multi.arrays.wrapping=multi.wrapping;
                                process[param.model]=value.name;
                                myFactory.process=process;
                                myFactory.addNewProcess("changing", multi);
                            }
                            else{//если мы просто делаем обычную строку

                                delete process.multi;
                                multi.processes.forEach(function (process, i) {
                                    if(i!=0){
                                        let park=process.park;
                                        park.processes.splice(park.processes.indexOf(process), 1);
                                    }
                                });
                                multi.processes=[];
                                myFactory.multi.multies.splice(myFactory.multi.multies.indexOf(multi), 1);
                                myFactory.process=process;
                                if(myFactory.process.package!==undefined) delete myFactory.process.package;
                                scope.addPropertyToProcess(param, value.name);
                                delete scope.myFactory.process.changing;//убираем выделение строки которую меняли
                            }
                            console.log(myFactory.parks, myFactory.multi.multies);
                            scope.clean();
                            console.log(myFactory.parks, myFactory.multi.multies);

                        }
                        else{//если числовое значение       здесь нужно прикрутить изменение пакета
                            multi.changeProperty(param.model, value.name);
                            delete scope.myFactory.process.changing;//убираем выделение строки которую меняли
                            scope.clean();
                        }
                    }



                }
                else if(!scope.myFactory.multi.mode) {
                    if(value.action=="selectAll"){
                        scope.clickedSelectAll(param, value);
                        let process=myFactory.process;
                        if(myFactory.process.wrapping!="" && myFactory.process.wrapping!="multi" && myFactory.multi.arrays.wrapping.indexOf(myFactory.process.wrapping)) myFactory.multi.arrays.wrapping.push(myFactory.process.wrapping);
                        if(myFactory.process.risk!="" && myFactory.process.risk!="multi" && myFactory.multi.arrays.risk.indexOf(myFactory.process.risk)) myFactory.multi.arrays.risk.push(myFactory.process.risk);
                        myFactory.addNewProcess("changing");
                        scope.clean();
                        process=myFactory.multi.multies[myFactory.multi.multies.length-1].processes[0];
                        scope.matrix.loadMulti(process, param.model);
                    }

                    //если выбран пакет
                    else if(value.action=="package"){
                        let multi=scope.myFactory.multi;

                        multi.template=value.values;

                        myFactory.process[param.model]=value.name;
                        myFactory.addNewProcess("changing");
                        delete scope.myFactory.process.changing;//убираем выделение строки которую меняли
                        scope.clean();
                    }
                    else{
                        scope.addPropertyToProcess(param, value.name);
                        let myVar=myFactory.process[param.model];

                        let myEl = angular.element(document.querySelector('td.mi_selected'));
                        myEl.addClass('alreadySelected');

                        if(myFactory.process.package && myFactory.process.multi && myFactory.process.multi!="deleted"){
                            delete myFactory.process.multi.template;
                            delete myFactory.process.multi.packName;
                            let pack=myFactory.process.package;
                            myFactory.process.multi.processes.forEach(function (process) {
                                if(process.package && process.package==pack) delete process.package;
                            });
                            delete myFactory.process.package;
                            console.log(myFactory.process.multi);
                        }
                        delete scope.myFactory.process.changing;//убираем выделение строки которую меняли
                        scope.clean();
                    }
                }
                else{
                    //  меняем проц на мульти
                    if (param.selected===value.name) return;
                    myFactory.removeCellSelection();
                    let process=myFactory.process;
                    myFactory.multi.arrays.wrapping=[process.wrapping];
                    myFactory.multi.arrays.risk=[process.risk];
                    if(myFactory.multi.arrays[param.model].indexOf(value.name)==-1) myFactory.multi.arrays[param.model].push(value.name);
                    myFactory.addNewProcess("changing");
                    scope.clean();
                    process=myFactory.multi.multies[myFactory.multi.multies.length-1].processes[0];
                    scope.matrix.loadMulti(process, param.model);
                }
            }
        },
    };
    /**
     * сохраняем расчет в БД
     */
    this.saveCalculation=function () {
        if(this.nameOfCalculation=="" || this.nameOfCalculation===undefined) return false;
        let parks=[];
        myFactory.parks.forEach(function(park){
            let newPark={};
            for(let key in park){
                if(key!="processes") newPark[key]=park[key];
                else{
                    newPark[key]=[];
                    park.processes.forEach(function (process) {
                        let newProcess={};
                        for(let prop in process){
                            if(prop!="multi" && prop!="park"){
                                newProcess[prop]=process[prop];
                            }
                            else if(prop=="multi"){
                                newProcess[prop]=myFactory.multi.multies.indexOf(process.multi);
                            }
                        }
                        newPark[key].push(newProcess);
                    })
                }
            }
            parks.push(newPark);
        });
        let multies=[];
        if(myFactory.multi.multies.length>0){
            myFactory.multi.multies.forEach(function (multi) {
                let newMulti={};
                for(let key in multi){
                    if(key!="processes") newMulti[key]=multi[key];
                }
                multies.push(newMulti);
            })
        }
        console.log(parks, multies);
        let save={};
        save.type="addNewCalculationToDB";
        save.name=this.nameOfCalculation;
        try{
            save.parks=JSON.stringify(parks);
        }
        catch {
            let CircularJSON = window.CircularJSON;
            save.parks = CircularJSON.stringify(parks);
        }
        try {
            save.mass=JSON.stringify(multies);
        }
        catch {
            let CircularJSON = window.CircularJSON;
            save.mass = CircularJSON.stringify(multies);
        }
        save.payment=myFactory.payment.val;
        save.agents=myFactory.agents.val+";"+myFactory.agents.mode;
        save.practicalPrice=myFactory.practicalPrice.val+";"+myFactory.practicalPrice.koef;
        save.a_limit=myFactory.a_limit.value;
        save.a_limitType=myFactory.a_limit.type;
        console.log(save.a_limit, myFactory.a_limit.type);
        save.totalAmount=myFactory.totalAmount;
        save.totalPrice=myFactory.totalPrice;
        $http.post("search.php", save).then(function success (response) {
                alert("Успешно сохранено");
            },function error (response){
                console.log(response);
            }
        );
    };
    function deepRemoveMulti(multi){
        multi.processes.forEach(process=>{
            if(process.constructor.name==="Process") delete process.multi;
        });
        if(multi.parent) deepRemoveMulti(multi.parent);
        myFactory.multi.multies.splice(myFactory.multi.multies.indexOf(multi), 1);
    }
    // myFactory.parks=[];
    // myFactory.parks.push(new Park(new Process({
    //     cost:2000000,
    //     amount:72,
    //     wrapping:"Автовоз",
    //     risk:"Базовые риски",
    //     limit:2000000,
    //     basePrice:26290.529691321786,
    //     baseRate:0.018257312285640127,   
    //     franchise:0,
    //     riskPrice:29287.591314347355,
    //     riskRate:0.020338605079407886,
    //     totalPrice:29287.591314347355,
    //     turnover:144000000,
    //     cars: ["А123ОО", "О123АА", "О123АО"]
        
    // })));
    // myFactory.parks[0].cars=[
    //     {
    //         number: "А123ОО"
    //     },
    //     {
    //         number: "О123АА"
    //     },
    //     {
    //         number: "О123АО"
    //     }
    // ];
    // let processes=[
    //     {
    //         cost:10000000,
    //         amount:72,
    //         wrapping:"Автовоз",
    //         risk:"Таможенные платежи",
    //         limit:10000000,
    //         basePrice:26290.529691321786,
    //         baseRate:0.018257312285640127,   
    //         franchise:0,
    //         riskPrice:29287.591314347355,
    //         riskRate:0.020338605079407886,
    //         totalPrice:29287.591314347355,
    //         turnover:144000000,
    //         cars: ["А123ОО", "О123АА", "О123АО"]
            
    //     },
    //     {
    //         cost:2000000,
    //         amount:48,
    //         wrapping:"Автовоз",
    //         risk:"Повреждение контейнера",
    //         limit:2000000,
    //         basePrice:26290.529691321786,
    //         baseRate:0.018257312285640127,
    //         franchise:0,
    //         riskPrice:29287.591314347355,
    //         riskRate:0.020338605079407886,
    //         totalPrice:29287.591314347355,
    //         turnover:144000000,
    //         cars: ["А123ОО", "О123АА"]
    //     },
    //     {
    //         cost:2000000,
    //         amount:48,
    //         wrapping:"Автовоз",
    //         risk:"Стихийные бедствия",
    //         limit:2000000,
    //         basePrice:26290.529691321786,
    //         baseRate:0.018257312285640127,           
    //         franchise:0,
    //         riskPrice:29287.591314347355,
    //         riskRate:0.020338605079407886,
    //         totalPrice:29287.591314347355,
    //         turnover:144000000,
    //         cars: ["А123ОО",  "О123АО"]
    //     }
    // ];
    // myFactory.choosePark(
    //     processes.map((process)=>
    //         new Process(process)
    //     )
    // )
    
    // setTimeout(myFactory.finalCalc.bind(myFactory), 1000);
    
});
