/**
 * Created by RoGGeR on 30.11.2017.
 */
app.controller("companyCtrl", function(myFactory,$scope, $http, $location, $timeout){
    //******    Инициализация   *******
    const scope=this;
    scope.myFactory=myFactory;
    $scope.clientCard={};
    Object.assign($scope.clientCard, scope.myFactory.newClientCard);
    myFactory.document.selectedParam="";
    myFactory.document.currParam="";
    myFactory.config="new_company.json";
    $scope.actions=false;

    $scope.$on('$destroy', function() {
        let flag=false;
        for(let key in $scope.clientCard){
            if($scope.isntEmpty($scope.clientCard[key])) flag=true;
        }
        if(flag){
            scope.myFactory.newClientCard={};
            Object.assign(scope.myFactory.newClientCard,$scope.clientCard);
        }
    });
    if(!myFactory.loadCompany){
        $http.post("new_company.json").then(function success (response) {
                const obj=response.data;
                // загрузка в каретку данных из карты клиента
                for(const key in obj){
                    if(obj[key].name!="Контакты" && obj[key].name!="Связи" && !$scope.isntEmpty($scope.clientCard[obj[key].name])){
                        $scope.clientCard[obj[key].name]={};
                        for(const prop in obj[key].values){
                            $scope.clientCard[obj[key].name][obj[key].values[prop].name]="";
                        }
                    }
                    else if(obj[key].name=="Контакты"){
                        for(const prop in obj[key].values){
                            $scope.contact[obj[key].values[prop].name]="";
                        }
                    }

                }
                // удаляем ИД из отображения в матрице
                delete $scope.clientCard.ID;
                $scope.currObj=[];
                // делаем верхнюю каретку как образец из json
                $scope.currObj=response.data;

                // не используется, как я понимаю
                if(scope.myFactory.clientCard!==undefined){
                    console.log(scope.myFactory.clientCard["r_account"]);
                    $scope.clientCard["Банковские реквизиты"]["Р/счет"]=scope.myFactory.clientCard["r_account"];
                    $scope.clientCard["Банковские реквизиты"]["К/счет"]=scope.myFactory.clientCard["k_account"];
                    $scope.clientCard["Банковские реквизиты"]["Банк"]=scope.myFactory.clientCard["bank"];
                    $scope.clientCard["Банковские реквизиты"]["Бик"]=scope.myFactory.clientCard["bik"];

                    // $scope.clientCard["Генеральный директор"]["ФИО"]="";
                    // $scope.clientCard["Генеральный директор"]["Серия и номер паспорта"]=scope.myFactory.clientCard[""];
                    // $scope.clientCard["Генеральный директор"]["Когда выдан"]=scope.myFactory.clientCard[""];
                    // $scope.clientCard["Генеральный директор"]["Кем выдан"]=scope.myFactory.clientCard[""];

                    //$scope.clientCard["Данные компании"]["Форма организации"]=scope.myFactory.clientCard["organizationFormID"];
                    let bitch=scope.myFactory.clientCard.OrganizationFormID;
                    switch(bitch){
                        case "1":
                            $scope.clientCard["Данные компании"]["Форма организации"]="ЗАО";
                            break;
                        case "2":
                            $scope.clientCard["Данные компании"]["Форма организации"]="ООО";
                            break;
                        case "3":
                            $scope.clientCard["Данные компании"]["Форма организации"]="ОАО";
                            break;
                        case "4":
                            $scope.clientCard["Данные компании"]["Форма организации"]="ИП";
                            break
                    }

                    $scope.clientCard["Данные компании"]["Наименование организации"]=scope.myFactory.clientCard["name"];
                    $scope.clientCard["Данные компании"]["Дата регистрации"]=scope.myFactory.clientCard["registration_date"];
                    $scope.clientCard["Данные компании"]["Наименование рег. органа"]=scope.myFactory.clientCard["who_registate"];

                    $scope.clientCard["Реквизиты компании"]["ОГРН"]=scope.myFactory.clientCard["OGRN"];
                    $scope.clientCard["Реквизиты компании"]["ИНН/КПП"]=scope.myFactory.clientCard["INN"];
                    $scope.clientCard["Реквизиты компании"]["ОКПО"]=scope.myFactory.clientCard["OKPO"];
                    $scope.clientCard["Реквизиты компании"]["ОКВЭД"]=scope.myFactory.clientCard["OKVED"];
                }

                if(myFactory.loadClient!==undefined){
                    $scope.loadToDashboard(myFactory.loadClient);
                    delete myFactory.loadClient;
                }
            },function error (response){
                console.log(response);
            }
        );
        // $http.post("companyActions.json").then(
        //     function success(response){
        //         $scope.currObjActions=[];
        //         $scope.currObjActions=response.data;
        //         },
        //     function error(response){}
        // );

    }
    //******    Инициализация   *****//
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
        },
        getIndex(param){
            this.setCurrentPage($scope.clientCard.indexOf(param));
        }
    }
    $scope.keydownHandler=(event, param, val,cb)=>{
        if((event.keyCode==='Enter'||event.keyCode===9 || event.keyCode===13 && param.name!=="Контакты")){
            event.preventDefault();
                const sc = $scope.currObj;
                // ищем 
                let parentInd = sc.findIndex(v=>v.name===param.name)
                let childInd = param.values.findIndex(v=>v.name===val.name);
                if (childInd===param.values.length-1) {
                    parentInd++;
                    childInd = 0;
                }
                else childInd++;
                if (parentInd>sc.length-1) return;
                const clicking = sc[parentInd].values[childInd].name;
                $scope.loadToDashboard(clicking);
        }
    };

    //******    tooltip   *******
    $scope.returnMode="changing";
    $scope.tooltip="";
    $scope.clean=()=>{
        myFactory.document.selectedParam='';
        myFactory.document.currParam='';
        $scope.returnMode="listener";
    };
    $scope.confirm=()=>{
        $scope.returnMode="confirmRefresh";
        $timeout(()=>{
            $scope.returnMode="listener";
        },2000);
    };
    let previousReturnMode="";
    $scope.appendTooltip=(key,id)=>{
        previousReturnMode=$scope.returnMode;
        $scope.returnMode="tooltip";
        $scope.tooltip=key;
    };
    $scope.removeTooltip = (id)=>{
        $scope.tooltip="";
        $scope.returnMode=previousReturnMode;
        previousReturnMode="";
    };
    //******    tooltip   *******//



    //******    Contacts   **********
    $scope.contact={};
    $scope.contacts=[];
    contact={
        clean(){
            for(const key in $scope.contact){
                $scope.contact[key]="";
            }
        },
        isFull(){
            for(const key in $scope.contact){
                if($scope.contact[key]=="") return false;
            }
            return true;
        }

    };
    $scope.chooseContactFromSearchResult=(contact)=>{
        if(contact.FirstName) $scope.contact["Имя"]=contact.FirstName;
        if(contact.LastName) $scope.contact["Фамилия"]=contact.LastName;
        if(contact.PatronicName) $scope.contact["Отчество"]=contact.PatronicName;
        if(contact.email) $scope.contact["Почта"]=contact.email;
        if(contact.phones) $scope.contact["Телефон"]=contact.phones;
        $scope.searchResults=undefined;
    };
    //******    Contacts   *******//



    $scope.loadToDashboard=(key)=>{//обратный переход для карточки клиента
        $scope.currObj.forEach((param, i)=>{
            param.values.forEach(({name}, j)=>{
                if(name==key){
                    Array.from(document.querySelectorAll(".company_dashboard_inputs")).forEach(item=>{
                        item.classList.remove("selected");
                    });
                    Array.from(document.querySelectorAll("div.clientCard td")).forEach(node=>{
                        node.classList.remove("mi_selected");
                        if(node.title==key) node.classList.add("mi_selected");
                    })
                    if($scope.newDashboard.currentPage!=i) $scope.newDashboard.setCurrentPage(i);
                    setTimeout(()=> {
                        const elem=document.querySelector(".ul_current").firstElementChild.children[j].firstElementChild;
                        elem.classList.add("selected");
                        elem.focus();
                    }, 500);
                }
            })
        })

    };
    $scope.changeLocation=( path )=>{
        $location.path(path);
    };
    $scope.inputHandler=(value)=>{

    };
    $scope.swap=(param)=>{
        $scope.actions=param;
    };


    //***************    View   ************
    $scope.isNavLightRed=(name)=>{
        const param=$scope.clientCard[name];

        return $scope.isntEmpty(param) && !contact.isFull(param);
    };

    

    $scope.isntEmpty=(obj)=>{
        for(let key in obj){
            if(obj[key]!="" && obj[key]!="Форма организации" && obj[key]!=undefined) return true;
        }
        return false;
    };
    //***************    View   ************//

    $scope.consolelog=(val)=>{
        console.log(val);
    };

});

