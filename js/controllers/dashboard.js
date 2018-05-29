/**
 * Created by RoGGeR on 30.05.17.
 */

"use strict";
app.controller('dashboardCtrl',function($rootScope,$http,$cookies, myFactory, $filter, $timeout, $location){
    console.log(this);
    this.span=1;
    this.myFactory=myFactory;
    let scope=this;
    this.search_params=[];
    this.isArray = angular.isArray;
    this.deleteProperty=function(obj, key){
        delete obj[key];
    };
    this.clickedOnTopOfDashboard=(value, param)=>{
        const type=value.type;
        switch(type){
            case "relocate_here":
                this.relocateHere(value.urlTo);
                break;
            case "relocatePage":
                this.relocatePage(value);
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

    this.tooltip={
        title:"",
        fadeIn(title){

            let isTitle=false;
            if(typeof title === "object"){
                this.title=title;
                isTitle=true;
            }
            else if(risks[title]!==undefined){
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
    
    
    //*************//*************//*************

    



    let timer;
    this.Confirm=function(){
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
            console.log(myFactory.parks);
            },function error (response){
                console.log(response);

            }
        );

    };
    this.config="dashboard.json";
    $http.post("dashboard.json").then(function success (response) {//устанавливаем каретку управления и заполняем ее из файла dashboard.json
            scope.currObj=response.data;
            scope.myFactory.keyCodes.qwerty.length=scope.currObj.filter(function (obj) {
                return obj["name"]!=undefined;
            }).length;
            if($cookies.get('currentObj')){
                scope.currObj=$cookies.get('currentObj');
                $cookies.remove('currentObj');

            }


        },function error (response){
            console.log(response);
        }
    );

    this.relocatePage=function(value){//переход на другую страницу(как в случае с калькулятором который не написан)
        $location.path(`/${value.urlTo}`);

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

    this.alreadySelected = function(model){
        if($rootScope.mode=="calc") return !(myFactory.process[model]==="");
        else return false;
    };
    

});