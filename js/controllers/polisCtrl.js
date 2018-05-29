app.controller("polisCtrl",function(myFactory, $http, $location, $scope, $rootScope){
    
    
    myFactory.newClientCard={"Данные компании":{"Форма организации":"OAO","Наименование организации":"Рога и Копыта","Дата регистрации":"0123-03-21","Наименование рег. органа":"123123123"},"Генеральный директор":{"ФИО":"12312321","Серия и номер паспорта":"123123123","Когда выдан":"0123-03-12","Кем выдан":"123123123"},"Реквизиты компании":{"ОГРН":"123123213","ИНН/КПП":"23123213","ОКПО":"123123123","ОКВЭД":"123123"},"Банковские реквизиты":{"р/счет":"123123123","к/счет":"123123123","банк":"123123123","бик":"123123123"}};
    myFactory.parks.forEach((park)=>{
        park.processes.forEach((process)=>{
            process.showCars=false;
        })
    })
    // $http.post("polis.json").then(function success (response) {
    //     $scope.currObj=[];
    //     $scope.currObj=response.data;
    // },function error (response){
    //     console.log(response);
    // });
    $scope.currObj=[
        {
            "name": "Компания",
            "type": "search/create",
            "values": [
                {
                    "name": ""
                }
            ]
        },
        {
            "name": "Расчет",
            "type": "search/create",
            "values": [
                {
                    "name": ""
                }
            ]
        },
        {
            "name": "Оговорки и условия",
            "type": "lists",
            "values":[
                {
                    "name": "Базовые риски застрахованы",
                    "type": "multi_button"
                },
                {
                    "name": "За исключением",
                    "type": "multi_button"
                },
                {
                    "name": "Новый список",
                    "type": "button"
                }
            ]
        },
        {
            "name": "Финансы",
            "type": "finance",
            "values": [
                {
                    "name": "something"
                },
                {
                    "name": "anything"
                }
            ]
        },
        {
            "name": "Даты",
            "type": "dates",
            "values":[]
        }
    ];



    $scope.itemsList = {
        items1: [],
        items2: []
    };

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items1.push({'Id': i, 'Label': 'Item A_' + i});
    }

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items2.push({'Id': i, 'Label': 'Item B_' + i});
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




    $scope.returnToDashboard=()=>{
        $location.path('/dashboard');
    };
    $scope.clicking=(event, process)=>{
        event.stopImmediatePropagation();
        myFactory.parks.forEach((park)=>{
            park.processes.forEach((process)=>{
                process.showCars=false;
            })
        })
        process.showCars=!process.showCars;
    }
    $scope.console=(param)=>{
        console.dir($scope.itemsList.items1);
    }

    $scope.changeLocation = (value) => {
        switch(value){
            case "Компания":
                $location.path(`/company`);
                break;
            case "Расчет":
                $location.path(`/calculation`);
                break;
        }
    }
    $scope.newDashboard={
        currentPage:0,
        previousPage: -1,
        toLeft(index){
            return this.previousPage<this.currentPage && this.previousPage==index;
        },
        toRight(index){
            return this.previousPage>this.currentPage && this.previousPage==index;
        },
        fromLeft(index){
            return this.previousPage>this.currentPage && this.currentPage==index;
        },
        fromRight(index){
            return this.previousPage<this.currentPage && this.currentPage==index;
        },
        checkCurrentPage(index){
            return index===this.currentPage;
        },
        setCurrentPage(index){
            this.previousPage=this.currentPage;
            this.currentPage=index;
            $rootScope.search_result=[];
            $scope.currObj.forEach( param=>{
                if(param.type=='search/create'){
                    param.values[0].name="";
                }
            })
        },
    }
    if(myFactory.makingPolis!==false){
        switch(myFactory.makingPolis){
            case "Расчет":
                $scope.newDashboard.setCurrentPage(1);
                break;
            case "Компания":
                $scope.newDashboard.setCurrentPage(0);
                break;
        }
    }  
    myFactory.makingPolis=true;
    $scope.loadProcess=(process, key)=>{
        myFactory.loadProcess={
            process,
            key
        }
        $location.path(`/calculation`);
    }
    $scope.loadClient=(key)=>{
        myFactory.loadClient=key;
    }
    this.makePDF=()=>{
        const getRisks=()=>{
            return new Promise((resolve, reject)=>{
                const xhr = new XMLHttpRequest();
                xhr.addEventListener('readystatechange', ()=>{
                    if(xhr.readyState==4){
                        resolve(JSON.parse(xhr.responseText));
                        
                    }
                })
                xhr.open("GET", "HIP.json", true);
                xhr.send();
            })
        };
        getRisks().then((data)=>{
            let risks=[];
            data.forEach(({model, values})=>{
                if(model=="risk"){
                    values.forEach((value)=>{
                        if(value.action===undefined && value.type==="risk") risks.push(value);
                    })
                }
            })
            console.log(risks);
            
            polis.makePDF(myFactory, risks);
            return null;
        },function error (response){
            console.log(response);

        })
    }
})