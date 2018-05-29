/**
 * Created by RoGGeR on 25.05.17.
 */
'use strict';
let app=angular.module('mainApp', ['ngRoute','ngCookies','ngAnimate', 'as.sortable']);
app.config(function($routeProvider){//с помощью .config мы определяем маршруты приложения. Для конфигурации маршрутов используется объект $routeProvider.
    /*
     Метод $routeProvider.when принимает два параметра: название маршрута и объект маршрута.
     Объект маршрута задает представление и обрабатывающий его контроллер с помощью параметров
     templateUrl и controller. Поэтому для представлений нам не надо определять контроллер с помощью директивы.
     */

    $routeProvider
        .when('/',{
            templateUrl: 'dashboard.html',
        })
        .when('/dashboard',{
            resolve:{
                "check": function($location,$cookies,$rootScope, $http){
                    const cookies=$cookies.getAll();
                    if($rootScope.loggedIn) $location.path('/dashboard');
                    else if(cookies.hasOwnProperty("login") && cookies.hasOwnProperty("pwd")){
                        let data={};
                        data.login=cookies.login;
                        data.pwd=cookies.pwd;
                        $http.post("authorization.php", data).then(function success (response) {
                            if (response.data['loggin'] === true) {
                                $rootScope.loggedIn = true;
                                $location.path('/dashboard');
                                $rootScope.name = response.data['name'];
                                $cookies.put('loggedIn', response.data['loggin']);
                                $cookies.put('username', response.data['name']);
                                $cookies.put('login', response.data['login']);
                                $cookies.put('pwd', response.data['pwd']);
                                console.log($cookies);
                            }
                        },function error (response){
                            console.log(response);
                        });
                    }
                    else $location.path('/login');
                }
            },
            templateUrl: 'dashboard.html',
            controller: 'dashboardCtrl as dashboard'
        })
        .when('/company',{

            templateUrl: 'templates/paths/company/index.html',
            controller: 'companyCtrl'

        })
        .when('/polis',{

            templateUrl: 'templates/paths/polis/index.html',
            controller: 'polisCtrl as polisCtrl'

        })
        .when('/calculation',{

            templateUrl: 'templates/paths/calculation/index.html',
            controller: 'calculationCtrl as calculation'

        })
        .when('/polisEditor',{

            templateUrl: './templates/paths/polisEditor/index.html',
            controller: 'polisEditorCtrl'

        })
        .when('/finance',{
            templateUrl: './templates/paths/finance/index.html',
            controller: 'financeCtrl'
        })
        .otherwise({
            redirectTo: '/login'
        });
});
app.directive('financeDashboard', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/finance/dashboard.html'
    };
});
app.directive('financeMatrix', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/finance/matrix.html'
    };
});
app.directive('financeReturn', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/finance/return.html'
    };
});
app.directive('financeView', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/views/finance.view.html'
    }
})
app.directive('polisEditorReturn', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/polisEditor/return.html'
    };
});
app.directive('polisEditorDashboard', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/polisEditor/dashboard.html'
    };
});
app.directive('polisEditorMatrix', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/polisEditor/matrix.html'
    };
});
app.directive('addition', function(){
    return{
     scope: {
       addition: "="
     },
     restrict: 'A',
     templateUrl: 'templates/views/addition.view.html'
    };
 });
app.directive('companyView', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/views/company.view.html'
    };
});
app.directive('calculationBottomView', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/calculation/bottom.view.html'
    }
});
app.directive('calculationBottom', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/calculation/bottom.html'
    }
});
app.directive('calculationMatrix', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/calculation/matrix.html'
    }
});
app.directive('calculationReturn', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/calculation/return.html'
    };
});
app.directive('calculationDashboard', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/calculation/dashboard.html'
    };
});
app.directive('calculationView', function () {
    return{
        restrict: 'A',
        templateUrl: 'templates/views/calculation.view.html'
    }
});
app.directive('polisDashboard', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/polis/dashboard.html'
    };
});
app.directive('polisMatrix', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/polis/matrix.html'
    };
});
app.directive('polisReturn', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/polis/return.html'
    };
});
app.directive('companyDashboard', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/company/dashboard.html'
    };
});
app.directive('companyReturn', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/company/return.html'
    };
});
app.directive('companyMatrix', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/paths/company/matrix.html'
    };
});
app.directive('karetka', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/dashboards/karetka.html'
    };
});
app.directive('return', function(){
    return{
        restrict: 'A',
        templateUrl: 'templates/return.html'
    };
});
app.directive('findCompany', function () {
    return{
        restrict: 'A',
        templateUrl: 'templates/matrix/find_company.html',
        link: function(scope, elements, attrs, ctrl){

        }
    }

});
app.directive('findCalculation', function () {
    return{
        restrict: 'A',
        templateUrl: 'templates/matrix/find_calculation.html'
    }
});
app.directive('findCalculationView', function () {
    return{
        restrict: 'A',
        templateUrl: 'templates/views/find_calculation_view.html'
    }
});


app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        let fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

app.directive('currencyInput', function ($filter, myFactory) {
    return {
        require: '?ngModel',
        link: function ($scope, $element, $attrs, ctrl) {
            if (!ctrl) {
                return;
            }

            ctrl.$formatters.unshift(function () {
                return $filter('number')(ctrl.$modelValue);

            });

            ctrl.$parsers.unshift(function (viewValue) {
                let plainNumber = viewValue.replace(/[\,\.\s]/g, ''),
                    b = $filter('number')(plainNumber);

                $element.val(b);

                return plainNumber;
            });
            $element.bind('click', ($event)=>{
                console.log($element);
                $event.target.select();
                console.log($event.target);
            });
            $element.bind('keydown keypress', ($event) => {

                let key = $event.which;
                // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                // This lets us support copy and paste too
                if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) return;
                if($attrs['currencyInput']=="a_limit"){
                    let val=$element.val().replace(/[\s\,]/g, '')*1;
                    if(key==13){
                        LimKoef=1;
                        let a_limit=myFactory.a_limit;
                        a_limit.hand=true;
                        myFactory.finalCalc();


                        a_limit.value=$element.val().replace(/[\s\,]/g, '')*1;

                        if(a_limit.value=="" || a_limit.value==0){
                            a_limit.type="Агр. лимит";
                            a_limit.value=a_limit.max_limit;
                            myFactory.a_limit.value=a_limit.max_limit;
                            a_limit.hand=false;
                            LimKoef=1;

                        }
                        else if(a_limit.value==a_limit.max_limit){
                            a_limit.hand=false;
                            LimKoef=1;
                        }
                        myFactory.applyAlimit();
                        myFactory.finalCalc();
                        console.log(myFactory.a_limit.value);
                        $scope.$apply()
                    }
                }
                else if($attrs.currencyInput=="payment"){
                    if(key==13){
                        if($element.val()<=0 || $element.val()==""){
                            $element.val(1);
                            myFactory.payment.hand=false;
                        }
                        else{
                            if($element.val()>12) $element.val(12);
                            myFactory.payment.hand=true;
                        }
                        myFactory.payment.val=$element.val();
                        myFactory.finalCalc();
                        $scope.$apply()


                    }
                }
                else if($attrs.currencyInput=="practicalPrice"){
                    if(key==13){
                        console.log(myFactory.totalPrice-myFactory.totalPrice%1);
                        if($element.val()==0 || $element.val()=="" || myFactory.practicalPrice.val==myFactory.totalPrice-myFactory.totalPrice%1){
                            //если мы очистили форму для фактической премии
                            myFactory.checkPracticalPriceKoef(false);
                            if(myFactory.practicalPrice.val==myFactory.totalPrice-myFactory.totalPrice%1) $element.val("");
                            myFactory.bottom.priceMode="price";
                        }
                        else{
                            //если мы что-то ввели в фактическую премию
                            if(myFactory.bottom.singleAmount){
                                myFactory.practicalPrice.val*=(myFactory.totalAmount/myFactory.totalAmountForSingle);
                            }
                            myFactory.practicalPrice.koef=myFactory.practicalPrice.val/myFactory.totalPrice;
                            myFactory.checkPracticalPriceKoef(true);
                        }
                        myFactory.finalCalc();
                        $scope.$apply()
                    }
                }
                else if($attrs.currencyInput=="agents"){
                    if(key==13){
                        myFactory.finalCalc();
                        $scope.$apply()
                    }
                }
                else{
                    if($scope.calculation.karetka.mode=="listener") $scope.calculation.karetka.mode="making new process";
                    console.log(myFactory.process);
                    if(key==13){
                        let val=$element.val().replace(/[\s\,]/g, '')*1;
                        if(myFactory.process.constructor.name=="Park"){
                            if($attrs['param']=="amount" && myFactory.amountType=="Тягачей") val*=24;
                            let park=myFactory.process;
                            if(Array.isArray(park[ $attrs['param'] ])){
                                if(myFactory.parkTemplate.length>0){

                                }
                            }
                            else{
                                park.changeProperty($attrs['param'], val);
                                myFactory.finalCalc();
                                $scope.$apply();
                            }

                        }
                        else if(myFactory.process.constructor.name=="Multi"){
                            if($attrs['param']=="amount" && myFactory.amountType=="Тягачей") myFactory.process.changeProperty($attrs['param'], val*24);
                            else myFactory.process.changeProperty($attrs['param'], val);
                        }
                        else{
                            if($attrs['param']=="amount" && myFactory.amountType=="Тягачей") myFactory.process[$attrs['param']]=val*24;
                            else myFactory.process[$attrs['param']]=val;
                        }
                        if($scope.calculation.karetka.mode=="making new process"){
                            let i=0;
                            for(let key in myFactory.process){
                                if(myFactory.process[key]===""){
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
                            $scope.$apply()
                        }
                        if($scope.calculation.karetka.mode=="changing process") delete myFactory.process.changing;
                        $scope.calculation.clean();
                        let target = $event.target;
                        target.blur();
                    }
                }
            });
        }
    };
});

app.factory('myFactory', function(){
    return{
        makingPolis: false,
        addNewPolisProperty:function(){
            this.polis.push({
                name:"",
                values:[],
            });
            this.polisCurrent=this.polis[this.polis.length-1];
        },
        polisCurrent:"",
        polis:[
            {
                name:"Базовые риски",
                included: true,
                values:[
                    {
                        text:"Гибель или повреждение всего или части груза в результате дорожно-транспортного происшествия, произошедшего вследствие нарушения Страхователем правил дорожного движения, - согласно п. 4.4.1. Правил.",
                        checked: true
                    },
                    {
                        text:"Гибель или повреждение всего или части груза в результате дорожно-транспортного происшествия (транспортного происшествия), произошедшего вследствие действий третьих лиц, - согласно п. 4.5.1. Правил.",
                        checked: true
                    },
                    {
                        text:"Гибель или повреждение всего или части груза в результате перевозки груза с использованием транспортного средства или грузового отсека, имеющего скрытые дефекты, - согласно п. 4.4.2. Правил.",
                        checked: true
                    },
                    {
                        text:"Утрата всего или части груза в результате кражи, - согласно п. 4.4.3. Правил.",
                        checked: true
                    },
                    {
                        text:"Утрата всего или части груза в результате грабежа, - согласно п. 4.4.4. Правил.",
                        checked: true
                    },
                    {
                        text:"Утрата всего или части груза в результате разбойного нападения, - согласно п. 4.5.2. Правил.",
                        checked: true
                    },
                    {
                        text:"Расходы по подъему и вытаскиванию транспортного средства с перевозимым на нем грузом, по буксировке до ближайшего места ремонта, - согласно п. 4.5.9. Правил.",
                        checked: true
                    },
                    {
                        text:"Расходы по удалению, освещению, обозначению остатков груза после ДТП на месте происшествия, - согласно п. 4.5.10. Правил.",
                        checked: true
                    }
                ]
            },
            {
                name: "Страхование по полису не распространяется на следующие грузы",
                included: true,
                values:[
                    {
                        text:"грузы, принятых к перевозке в поврежденном состоянии",
                        checked: true
                    },
                    {
                        text:"наливных и насыпных грузов",
                        checked: true
                    },
                    {
                        text:"взрывчатых веществ",
                        checked: true
                    },
                    {
                        text:"кинопленки и киноленты",
                        checked: true
                    },
                    {
                        text:"стекло и стеклянно-фарфоровых изделий без специальной упаковки",
                        checked: true
                    },
                    {
                        text:"банкнот и монет",
                        checked: true
                    },
                    {
                        text:"драгоценных камней, драгоценных металлов и изделий из них",
                        checked: true
                    },
                    {
                        text:"ювелирных изделий",
                        checked: true
                    },
                    {
                        text:"художественных изделий и антиквариата",
                        checked: true
                    },
                    {
                        text:"предметов искусства",
                        checked: true
                    },
                    {
                        text:"живых организмов любых видов",
                        checked: true
                    },
                    {
                        text:"товаров военного и двойного назначения",
                        checked: true
                    }
                ]
            }
        ],
        multi:{
            multies:[],
            mode:false,
            count:0,
            template:[],
            arrays:{
                risk:[],
                wrapping:[]
            },
            clean: function () {
                this.arrays.risk=[];
                this.arrays.wrapping=[];
                this.mode=false;
                this.template=[];
            }

        },
        /**
         * function multiChangeMode функция меняет состояние мульти 
         * @param {boolean} mode режим мульти
         */
        multiChangeMode: function (mode) {
            if(mode===undefined){
                if(this.multi.mode==false){
                    if(this.process.wrapping!="" && this.process.wrapping!="multi" && this.multi.arrays.wrapping.indexOf(this.process.wrapping)) this.multi.arrays.wrapping.push(this.process.wrapping);
                    if(this.process.risk!="" && this.process.risk!="multi" && this.multi.arrays.risk.indexOf(this.process.risk)) this.multi.arrays.risk.push(this.process.risk);
                    this.multi.mode=true;
                }
                else this.multi.mode=false;
            }
            else this.multi.mode=mode;
            console.log(this.multi.mode);
        },
        /**
         * этот раздел с keyCodes можно удалить
         */
        keyCodes:{
            qwerty:{
                mass:[113,119,101,114,116,121,117,105,111,112],
                length:0
            },
            number:{
                mass:[49,50,51,52,53,54,55,56,57,48],//длину придется пока задавать
                length:7
            },
            tab:{
                mass:[60,62,167,177]
            }
        },
        document:{
            model:"Расчет",
            currParam: 0,
            selectedParam:0,
            clean:function(){
                this.currParam="";
                this.selectedParam="";
            },
            currency: "Р"
        },
        bottom:{
            singleAmount:false,
            priceMode:"price",
        },
        matrixType: "find",

        a_limit:{
            max_limit:0,
            value:0,
            type:"Агр. лимит",
            hand: false,
        },
        /**
         * ручной ввод агрегатного лимита
         */
        changeAlimit(){
            let a_limit=this.a_limit;
            if(a_limit.type=="Агр. лимит"){
                a_limit.type="Кол-во случаев";
                a_limit.value=1;
                a_limit.hand=true;
                this.applyAlimit();
            }
            else{
                a_limit.hand=false;
                a_limit.type="Агр. лимит";
                if(!a_limit.hand) a_limit.value=a_limit.max_limit;
            }
        },
        /**
         * применение агрегатного лимита
         */
        applyAlimit:function(){
            let a_limit=this.a_limit;
            if(a_limit.value<a_limit.max_limit && a_limit.type=="Агр. лимит"){
                this.parks.forEach(function (park) {
                    park.cutDownLimits(a_limit.value);
                });
                a_limit.hand=false;
                LimKoef=1;
            }
            else{
                let overall=0;
                this.cleanUpProcessesInParks();
                if(a_limit.type=="Кол-во случаев"){
                    this.parks.forEach(function (park) {
                        overall+=park.calculateMatrixWithAlimit(a_limit.value,true)*1;
                    });
                    LimKoef=overall/this.totalPrice;
                }
                else{
                    this.parks.forEach(function (park) {
                        overall+=park.calculateMatrixWithAlimit(a_limit.value,false)*1;
                    });
                    overall=Math.abs(overall-this.totalPriceWithoutPayments);
                    overall*=a_limit.max_limit/a_limit.value;
                    overall+=this.totalPrice;
                    overall=overall/this.totalPrice;
                    LimKoef=overall;
                }
            }
        },
        /**
         * все что касается этапов платежей
         */
        payment:{
            val:0,
            hand:false,
            mode:"ON",
            changeMode:function(){
                if(this.mode=="ON"){
                    this.mode="OFF";
                    this.val=1;
                    this.hand=false;
                }
                else this.mode="ON";
            },
            /**
             * функция создает массив из этапов платежей, необходимо для дальнейшего управления финансами полиса
             * @param {number} price 
             */
            makeArray(price){
                const getCurrentDate=(date)=>{
                    let day=date.getDay();
                    let month=date.getMonth()+1;
                    let year=date.getFullYear();
                    if(day<10) day=`0${day}`;
                    if(month<10) month=`0${month}`;
                    return `${day}.${month}.${year}`
                }
                let array=[];
                let payment=addSpaces(Math.round(price / this.val));
                for(let i=0; i<this.val; i++){
                    let date=new Date();
                    
                    date.setMonth(date.getMonth() + i * (12/this.val));
                    date=getCurrentDate(date);
                    array.push({
                        price: payment,
                        date,
                        debt: payment,
                        debtDate: date,
                        payments: []
                    })
                }
                this.array=array;
            }
        },
        agents:{
            val:"",
            getKoef: function(totalPrice){
                this.val*=1;
                if(this.mode=="%"){
                    let newPrice=totalPrice/(1-this.val/100);
                    return newPrice/totalPrice;
                }
                else{
                    let newPrice=totalPrice+this.val;
                    return newPrice/totalPrice;
                }
            },
            mode:"Р",
            changeMode: function(){
                if(this.mode=="Р") this.mode="%";
                else this.mode="Р";
            }
        },
        practicalPrice:{
            val:"",
            koef:1
        },
        process: {
            cost:"",
            amount:"",
            wrapping:"",
            risk:"",
            limit:"",
            franchise:""
        },
        cleanProcess: function(){// очищаем каретку от заполненного процесса
            this.process={};
            for(let i=0;i<transportProp.length;i++) this.process[transportProp[i]]=""

        },
        amountType: "Тягачей",// для фильтра тягачей
        changeAmountType: function(){//для фильтра тягачей
            if(this.amountType=="Тягачей") this.amountType="Рейсов";
            else this.amountType="Тягачей";
        },
        parks: [],
        parkTemplate:[],
        /**
         * функция распределения процессов по паркам
         * @param {array} array массив процессов
         * @param {park} park если данный агрумент есть - значит процессы нужно вставить именно в этот парк
         * @param {number} index если index получен, то процессы нужно вставить после данного номера в парке
         * @param {park} oldPark
         */
        choosePark(array, park, index, oldPark) {
            for(let j=0;j<array.length; j++){
                let process=array[j];
                if(process.constructor.name=="Multi"){
                    let multi=process;
                    array.splice(j, 1);
                    for(let i=0; i<multi.processes.length; i++){
                        array.splice(j+i, 0, multi.processes[i]);
                    }
                }
            }
            if(park){
                park.check();
                array.forEach(function (process) {
                    process.park=park;
                    if(park.processes.indexOf(process)===-1) park.processes.splice(index, 0,process);
                });
            }
            else{
                let newParkFlag=false;
                let myFactory=this;
                if(this.parks.length==0) newParkFlag=true;
                else{
                    array.forEach(function (process) {
                        if(myFactory.parks[0].risks.indexOf(process.risk)!=-1) newParkFlag=true;
                    });
                }
                if(newParkFlag){
                    if(oldPark){
                        for(let i=0;i<array.length;i++) {
                            if (i == 0) {
                                this.parks.push(new Park(array[i]));
                            }
                            else {
                                array[i].park = this.parks[this.parks.length-1];
                                this.parks[this.parks.length-1].processes.splice(i, 0, array[i]);
                            }
                        }
                    }
                    else{
                        for(let i=0;i<array.length;i++){
                            if(i==0){
                                this.parks.splice(i,0,new Park(array[i]));
                            }
                            else{
                                array[i].park=this.parks[0];
                                this.parks[0].processes.splice(i, 0, array[i]);
                            }
                        }
                    }

                }
                else{ //если таких рисков в первом парке нету
                    for(let i=0;i<array.length;i++){
                        array[i].park=this.parks[0];
                        this.parks[0].processes.splice(i, 0, array[i]);
                    }
                }
            }
        },
        /**
         * функция меняет коэффициент фактической премии
         * @param {boolean} mode фактическая премия либо есть либо нет
         * 
         */
        checkPracticalPriceKoef: function(mode){
            let myFactory=this;
            if(mode){
                this.parks.forEach(function(park){
                    park.processes.forEach(function(process){
                        process.practicalPriceKoef=myFactory.practicalPrice.koef;
                        console.log(process);
                    })
                })
            }
            else{
                this.parks.forEach(function(park){
                    park.processes.forEach(function(process){
                        delete process.practicalPriceKoef;
                    })
                })
            }
        },
        /**
         * функция считает количество траков по всем паркам
         */
        calculateParksAmount(){
            let sum=0;
            this.parks.forEach(function(park){
                sum+=park.calculateAmount();
            });
            totalAmount=sum;
            this.totalAmount=totalAmount;
        },
        /**
         * функция ищет максимальный лимит по случаю
         */
        findMaxLimit(){
            let max=0;
            this.parks.forEach(function(park){
                max=Math.max(park.findMaxLimit(), max);
            });
            this.a_limit.max_limit=max;
            //if(!this.a_limit.hand) this.a_limit.value=max;
        },
        makePackage(){//ебучие пакеты
            let array=[];
            let obj={};
            obj.packName=this.process.risk;
            obj.template=this.multi.template;
            this.process.risk="Базовые риски";
            this.process["package"]=obj.packName;
            //this.process.multi=this.multi.count;
            array.push(new Process(this.process));
            let myFactory=this;

            this.multi.template.forEach(function (proc) {
                let newProcess={};
                for(let key in myFactory.process) newProcess[key]=myFactory.process[key];
                for(let key in proc){
                    if(key=="limit" || key=="franchise") newProcess[key]=proc[key]*myFactory.process[key];
                    else newProcess[key]=proc[key];

                }

                array.push(new Process(newProcess));
            });
            obj.array=array;
            delete this.process["package"];
            return obj;

        },
        bindMulti:function(array, multi){
            if(multi.packName) delete multi.packName;
            if(multi.template) delete multi.template;
            let myFactory=this;
            let mass=[];
            multi.processes.forEach(proc=>mass.push(proc));
            //mass.forEach(process=>process.remove());
            for(let i=0;i<mass.length;i++){
                let process=mass[i];
                process.remove();
            }
            multi.processes=array;
            multi.processes.forEach(function (process) {
                process.multi=multi;
            });
            return multi;
        },
        /**
         * @function функция для создания мультиузлов
         * @param {array} bindMulti массив с процессами, для которым мы создаем мультиузел 
         * @return {object} возвращает массив с процессами
         */
        makeMulti(bindMulti) {
            if(this.multi.arrays.risk.length==0){
                this.multi.arrays.risk.push(this.process.risk);
            }
            if(this.multi.arrays.wrapping.length==0){
                this.multi.arrays.wrapping.push(this.process.wrapping);
            }
            if(this.multi.arrays.wrapping.length==1 && this.multi.arrays.risk.length==1){
                this.process.risk=this.multi.arrays.risk[0];
                this.process.wrapping=this.multi.arrays.wrapping[0];
                let risk=this.multi.arrays.risk[0];
                let packages=this.packages.filter(function (pack) {//ебучие пакеты
                    return pack.name==risk;
                });
                if(packages.length>0){
                    this.multi.template=packages[0].values;
                    let obj=this.makePackage();
                    if(bindMulti){
                        this.bindMulti(obj.array, bindMulti);
                        bindMulti.packName=obj.packName;
                        bindMulti.template=obj.template;
                    }
                    else this.multi.multies.push(new Multi(obj.array, obj.packName, obj.template));
                    return obj.array;
                }
                else{
                    if(bindMulti){
                        let myFactory=this;
                        bindMulti.processes.forEach(function (process) {
                            if( myFactory.multi.arrays.risk.indexOf(process.risk)==-1 || myFactory.multi.arrays.wrapping.indexOf(process.wrapping)==-1 )
                                bindMulti.processes.splice(bindMulti.processes.indexOf(process), 1);
                        });
                    }
                    else return [new Process(this.process)];
                }
            }

            let array=[];
            let obj;
            for(let i=0; i<this.multi.arrays.wrapping.length; i++){
                for(let j=0; j<this.multi.arrays.risk.length; j++){
                    this.process.wrapping=this.multi.arrays.wrapping[i];
                    this.process.risk=this.multi.arrays.risk[j];
                    let risk=this.process.risk;
                    let packages=this.packages.filter(function (pack) {//ебучие пакеты
                        return pack.name==risk;
                    });
                    if(packages.length>0){
                        this.multi.template=packages[0].values;
                        obj=this.makePackage();
                        obj.array.forEach(function (proc) {
                            array.push(proc);
                        })
                    }
                    else{
                        array.push(new Process(this.process));
                    }
                }
            }
            let flag=false;
            array.forEach(process=>{
                if(process.risk=="Базовые риски") flag=true;
            });
            if(flag){
                while(array[0].risk!="Базовые риски"){
                    array.push(array.splice(0,1)[0]);

                }
            }
            let multi;
            if(bindMulti){
                multi=this.bindMulti(array, bindMulti);
            }
            else{
                multi=new Multi(array);
                this.multi.multies.push(multi);
            }


            if(obj){
                multi.packName=obj.packName;
                multi.template=obj.template;
            }
            return array;
        },
        /**
         * @function функция добавления нового процесса/процессов
         * @param {string} mode режим
         * @param {array} multiChanging массив с процессами для мультиузла
         */
        addNewProcess(mode, multiChanging){
            //если мульти
            if(mode=="changing"){
                let park=this.process.park;
                let process=this.process;//проверить эту хуйню, здесь помойму ссылка на объект, нахуй такая сложность!?!?!??!
                this.cleanProcess();
                for(let key in process){
                    if(transportProp.indexOf(key)!=-1) this.process[key]=process[key];
                }
                let index=park.processes.indexOf(process);
                park.processes.splice(park.processes.indexOf(process), 1);
                if(this.multi.template.length>0){//если меняем на пакет
                    let obj=this.makePackage();
                    let array=obj.array;
                    this.multi.multies.push(new Multi(array, obj.packName, obj.template));
                    this.choosePark(array, park, index);
                }
                else if(this.multi.arrays.risk.length>0 || this.multi.arrays.wrapping.length>0){//если меняем на комплекс
                    let array=this.makeMulti(multiChanging);
                    this.choosePark(array, park, index);
                    this.multi.template=[];
                }
            }

            else if(this.multi.arrays.risk.length>0 || this.multi.arrays.wrapping.length>0){
                let array=this.makeMulti();
                this.choosePark(array);
            }
            else if(this.multi.template.length>0){//ебучие пакеты
                let obj=this.makePackage();
                let array=obj.array;
                this.multi.multies.push(new Multi(array, obj.packName, obj.template));
                this.choosePark(array);

            }
            //если не мульти
            else{
                this.choosePark([new Process(this.process)],undefined,undefined,mode);
            }
            this.cleanProcess();

        },
        /**
         * функция получения итоговой премии
         */
        getTotal: function(){
            let sum=0;
            this.parks.forEach(function (park) {
                sum+=park.getTotal();
            });
            return sum;
        },
        /**
         * функция для очистки мусора
         */
        cleanUpProcessesInParks(){
            let mass=[];
            let myFactory=this;
            this.parks.forEach(function (park,i) {
                let arr=park.check();//обнуляем все значения для парка(риски, базовая премия, коэфф риска)
                arr.forEach(function(process){
                    delete process.park;
                    mass.push(new Process(process));
                });
                if(park.processes.length>0) park.replaceBase();//Базовый риск ставим на первое место
            });
            this.parks.forEach(function(park){//
                if(park.processes.length==0) myFactory.parks.splice(myFactory.parks.indexOf(park), 1);

            });
            for(let i=0;i<mass.length;i++){
                this.process=mass[i];
                this.addNewProcess("replacing");
            }

            this.parks.forEach(function (park) {
                let mass=park.check(false);
                park.replaceBase();
            })

        },
        /**
         * основная функция для расчета, в которую входят все остальные 
         */
        finalCalc(){
            this.parkTemplate=[];

            //**************************при загрузке расчета из БД**************************
            if(risks.length==0 && this.currObj!==undefined){
                for(let i=0;i<this.currObj.length; i++){
                    let currObj=this.currObj;
                    for(let j=0; j<currObj[i].values.length;j++){
                        if(currObj[i].values[j].type=="risk") risks[currObj[i].values[j].name]=currObj[i].values[j].value;
                    }
                }
            }

            //******************************************************************************



            this.cleanUpProcessesInParks();//обнуляем все значения, необходимые для парка:     +//смотрим есть ли повторяющиеся риски                   +
            this.calculateParksAmount();
            this.findMaxLimit();
            let myFactory=this;
            this.parks.forEach(park=>{
                park.processes.forEach(process=>{
                    delete process.showRows;
                })
            });
            this.multi.multies.forEach(function (multi) {
                if(multi.processes.length==1){
                    delete multi.processes[0].multi;
                    myFactory.multi.multies.splice(myFactory.multi.multies.indexOf(multi), 1);
                }
            });
            this.parks.forEach(function(park,i){//
                if(park.processes.length==0) myFactory.parks.splice(myFactory.parks.indexOf(park), 1);
                else park.calculate();//считаем каждую строку парка
            });
            //подсчет премии с агрегатным лимитом, отличным от обычного


            //***************** считаем Агр. лимит
            if(this.a_limit.hand && (this.a_limit.type=="Агр. лимит" && this.a_limit.value>this.a_limit.max_limit || this.a_limit.type=="Кол-во случаев")){

                this.parks.forEach(function(park){
                    park.applyKoef(LimKoef);
                })
            }
            else{
                this.a_limit.hand=false;
                this.a_limit.value=this.a_limit.max_limit;
                this.a_limit.type="Агр. лимит";
            }
            this.totalPrice=this.getTotal();
            //****************

            if(isNaN(this.totalPrice)) return;


            //****************считаем этапы платежей
            if(this.payment.mode=="ON"){
                if(!this.payment.hand){
                    let a=this.totalPrice/30000;
                    a-=a%1;
                    if(a==0) a=1;
                    else if(a>12) a=12;
                    else{
                        while(a!=1 && a!=2 && a!=4 && a!=6 && a!=12){
                            a--;
                        }
                    }

                    this.payment.val=a;
                }
                let spline=Spline(this.totalPrice, Points.payment, 3);
                spline/=100*(12-1);
                spline=spline*this.payment.val-spline;
                this.payment.koef=1+spline;
                this.parks.forEach(function(park){
                    park.applyKoef(1+spline);
                });
                this.totalPriceWithoutPayments=this.totalPrice;
                this.totalPrice=this.getTotal();
                
            }
            //****************

            //****************Агентские
            if(this.agents.val!=0){
                let koef=this.agents.getKoef(this.totalPrice);
                this.parks.forEach(function(park){
                    park.applyKoef(koef);
                });
            }
            //****************

            //****************Для одного тягача
            this.totalPrice=this.getTotal();

            if(this.amountType=="Тягачей"){
                this.totalAmountForSingle=24;


            }
            else{
                this.totalAmountForSingle=1;

            }
            this.totalPriceForSingle=this.totalPrice/(this.totalAmount/this.totalAmountForSingle);
            //****************

            //****************Фактическая премия
            if(this.practicalPrice.val!=0 && this.practicalPrice.val!=""){
                this.parks.forEach(function(park){
                    park.applyPracticalPriceKoef();
                });
                let val=this.getTotal();
                this.practicalPrice.val=val-(val%1);
                if(this.bottom.singleAmount) this.practicalPrice.val/=(this.totalAmount/this.totalAmountForSingle);
            }
            //****************
            this.multi.multies.forEach(function (multi) {
                multi.calculatePrice();
            });
            this.parks.forEach(function (park) {
                park.getValues();
            });
            this.payment.makeArray(this.totalPrice);
            console.log(this.parks, this.multi.multies);
            console.log(myFactory.totalPrice);
            //риски
            //базовую премию
            //коэффициент риска

            //заполняем массив с рисками и отключаем повторяющиеся     +
            //если риск не повторяющийся - считаем коэффициент     +




        }


    }
});
