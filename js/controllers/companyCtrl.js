import Company from '../protos/company.js';

/**
 * Created by RoGGeR on 30.11.2017.
 */
app.controller("companyCtrl", function (myFactory, $scope, $http, $location, $timeout) {
    //******    Инициализация   *******
    const scope = this;
    scope.myFactory = myFactory;
    $scope.clientCard = {};
    Object.assign($scope.clientCard, scope.myFactory.newClientCard);
    myFactory.document.selectedParam = "";
    myFactory.document.currParam = "";
    myFactory.config = "new_company.json";
    $scope.actions = false;
    $scope.cardNotEmpty = false;
    init();

    $scope.$on('$destroy', function () {
        let flag = false;
        for (let key in $scope.clientCard) {
            if ($scope.isntEmpty($scope.clientCard[key])) flag = true;
        }
        if (flag) {
            scope.myFactory.newClientCard = {};
            Object.assign(scope.myFactory.newClientCard, $scope.clientCard);
        }
    });
    function init () {
        if (!myFactory.loadCompany) {
            $http.post("src/new_company.json").then(function success(response) {
                const obj = response.data;
                // загрузка в каретку данных из карты клиента
                for (const key in obj) {
                    if (obj[key].name != "Контакты" && obj[key].name != "Связи" && !$scope.isntEmpty($scope.clientCard[obj[key].name])) {
                        $scope.clientCard[obj[key].name] = {};
                        for (const prop in obj[key].values) {
                            $scope.clientCard[obj[key].name][obj[key].values[prop].name] = "";
                        }
                    }
                    else if (obj[key].name == "Контакты") {
                        for (const prop in obj[key].values) {
                            $scope.contact[obj[key].values[prop].name] = "";
                        }
                    }
                }
                // удаляем ИД из отображения в матрице
                delete $scope.clientCard.ID;
                $scope.currObj = [];
                // делаем верхнюю каретку как образец из json
                $scope.currObj = response.data;
    
                if (myFactory.loadClient !== undefined) {
                    $scope.loadToDashboard(myFactory.loadClient);
                    delete myFactory.loadClient;
                }
                $scope.setEmptyCardParam();
            }, function error(response) {
                console.log(response);
                
            });
        }
    }
    //******    Инициализация   *****//
    $scope.newDashboard = {
        currentPage: 0,
        previousPage: -1,
        toLeft(index) {
            return this.previousPage < this.currentPage && this.previousPage == index;
        },
        toRight(index) {
            return this.previousPage > this.currentPage && this.previousPage == index;
        },
        fromLeft(index) {
            return this.previousPage > this.currentPage && this.currentPage == index;
        },
        fromRight(index) {
            return this.previousPage < this.currentPage && this.currentPage == index;
        },
        checkCurrentPage(index) {
            return index === this.currentPage;
        },
        setCurrentPage(index) {
            this.previousPage = this.currentPage;
            this.currentPage = index;
        },
        getIndex(param) {
            this.setCurrentPage($scope.clientCard.indexOf(param));
        }
    }
    $scope.keydownHandler = (event, param, val, cb) => {
        if ((event.keyCode === 'Enter' || event.keyCode === 9 || event.keyCode === 13 && param.name !== "Контакты")) {
            event.preventDefault();
            const sc = $scope.currObj;
            // ищем 
            let parentInd = sc.findIndex(v => v.name === param.name)
            let childInd = param.values.findIndex(v => v.name === val.name);
            if (childInd === param.values.length - 1) {
                parentInd++;
                childInd = 0;
            }
            else childInd++;
            if (parentInd > sc.length - 1) return;
            const clicking = sc[parentInd].values[childInd].name;
            $scope.loadToDashboard(clicking);
            $scope.setEmptyCardParam();
        }
    };

    //******    tooltip   *******
    $scope.returnMode = "changing";
    $scope.tooltip = "";
    $scope.clean = () => {
        myFactory.document.selectedParam = '';
        myFactory.document.currParam = '';
        $scope.returnMode = "listener";
    };
    $scope.confirm = () => {
        $scope.returnMode = "confirmRefresh";
        $timeout(() => {
            $scope.returnMode = "listener";
        }, 2000);
    };
    let previousReturnMode = "";
    $scope.appendTooltip = (key, id) => {
        previousReturnMode = $scope.returnMode;
        $scope.returnMode = "tooltip";
        $scope.tooltip = key;
    };
    $scope.removeTooltip = (id) => {
        $scope.tooltip = "";
        $scope.returnMode = previousReturnMode;
        previousReturnMode = "";
    };
    //******    tooltip   *******//



    //******    Contacts   **********
    
    $scope.contacts = [];
    $scope.contact = {
        clean() {
            for (const key in $scope.contact) {
                $scope.contact[key] = "";
            }
        },
        isFull() {
            for (const key in $scope.contact) {
                if ($scope.contact[key] == "") return false;
            }
            return true;
        }

    };
    $scope.chooseContactFromSearchResult = (contact) => {
        if (contact.FirstName) $scope.contact["Имя"] = contact.FirstName;
        if (contact.LastName) $scope.contact["Фамилия"] = contact.LastName;
        if (contact.PatronicName) $scope.contact["Отчество"] = contact.PatronicName;
        if (contact.email) $scope.contact["Почта"] = contact.email;
        if (contact.phones) $scope.contact["Телефон"] = contact.phones;
        $scope.searchResults = undefined;
    };
    //******    Contacts   *******//



    $scope.loadToDashboard = (key) => {//обратный переход для карточки клиента
        $scope.currObj.forEach((param, i) => {
            param.values.forEach(({ name }, j) => {
                if (name == key) {
                    Array.from(document.querySelectorAll(".company_dashboard_inputs")).forEach(item => {
                        item.classList.remove("selected");
                    });
                    Array.from(document.querySelectorAll("div.clientCard td")).forEach(node => {
                        node.classList.remove("mi_selected");
                        if (node.title == key) node.classList.add("mi_selected");
                    })
                    if ($scope.newDashboard.currentPage != i) $scope.newDashboard.setCurrentPage(i);
                    setTimeout(() => {
                        const elem = document.querySelector(".ul_current").firstElementChild.children[j].firstElementChild;
                        elem.classList.add("selected");
                        elem.focus();
                    }, 100);
                }
            })
        })
        $scope.setEmptyCardParam();
    };
    $scope.changeLocation = (path) => {
        $location.path(path);
    };
    $scope.inputHandler = (value) => {
    };
    $scope.swap = (param) => {
        $scope.actions = param;
    };
    //***************    View   ************
    $scope.isNavLightRed = (name) => {
        const param = $scope.clientCard[name];

        return $scope.isntEmpty(param) && !contact.isFull(param);
    };
    $scope.isntEmpty = (obj) => {
        for (let key in obj) {
            if (obj[key] != "" && obj[key] != "Форма организации" && obj[key] != undefined) return true;
        }
        return false;
    };
    //***************    View   ************//
    $scope.consolelog = (val) => {
        console.log(val);
    };
    $scope.checkCardIsEmpty = ()=>{
       const filled = document.querySelectorAll('.company_matrix_header:not(.company_matrix_header--red)');
       return !filled.length;
    }
    $scope.setEmptyCardParam = ()=> {
        $scope.cardNotEmpty = !$scope.checkCardIsEmpty ();
    }
    $scope.reload = () => {
        scope.myFactory.removeCellSelection ('dashboard_container');
        $scope.clientCard = {};
        init();
    }
    $scope.saveCompany = () => {
        if ($scope.checkCardIsEmpty()) return false; // не сохраняем пустую карту
        if (scope.myFactory.companyObj&&scope.myFactory.companyObj.isSaved) {
            // проверка сохраненная ли это компания
            alert('Компания уже сохранена');
            return false;
        }
        const card = $scope.clientCard;
        if (card['Данные компании']["Наименование организации"]==='') {
            // проверка на наличие названия компании
            alert('Перед сохранением необходимо заполнить поле "Наименование организации"');
            return false;
        }
        const saveObj = generateSaveCompanyObj(card);
        saveObj.type = 'save_company';

        function generateSaveCompanyObj(card) {
            return {
                Communications: "",
                INN: getInnKpp('INN',card["Реквизиты компании"]["ИНН/КПП"]),
                KPP: getInnKpp('KPP',card["Реквизиты компании"]["ИНН/КПП"]),
                Legal_address: "",
                OGRN: card["Реквизиты компании"]["ОГРН"],
                OKPO: card["Реквизиты компании"]['ОКПО'],
                OKVED: card["Реквизиты компании"]['ОКВЭД'],
                OrganizationFormID: getOrgForm(card['Данные компании']["Форма организации"]),
                Real_address: "",
                bank: card["Банковские реквизиты"]["Банк"],
                bik: card["Банковские реквизиты"]["БИК"],
                company_group: "",
                company_mail: "",
                company_phone: "",
                company_url: "",
                general_director_passport: card["Генеральный директор"]["Серия и номер паспорта"],
                director_name:card["Генеральный директор"]['ФИО директора'],
                give_date:card["Генеральный директор"]['Когда выдан'],
                director_authority:card["Генеральный директор"]['Кем выдан'],
                id: "",
                k_account: card["Банковские реквизиты"]["к/счет"],
                name: card['Данные компании']["Наименование организации"],
                r_account: card["Банковские реквизиты"]["р/счет"],
                registration_date: card['Данные компании']["Дата регистрации"],
                status: "",
                who_registrate: card['Данные компании']["Наименование рег. органа"],
            }
        }
        function getInnKpp (type,data) {
            if (data===''||data===undefined) return '';
            const arr = data.split('/');
            switch (type) {
                case 'INN':
                    return arr[0].trim();
                case 'KPP':
                    if (arr.length===1) return '';
                    return arr[1].trim();
            }
        }
        function getOrgForm (data) {
            if (data==='') return 0;
            const forms = {
                "ЗАО": "1",
                "ООО": "2",
                "ОАО": "3",
                "ИП": "4"
            }
            return Number(forms[data]);
        }
        // сохраняем компанию
        $http.post('php/save.php',saveObj).then((resp)=>{
            if (isNaN(Number(resp.data))) {
                // если вернулся не id значит ошибка
                console.error(`Problem with saving: ${resp.data}`);
                alert('При сохранении возникли неполадки. Обратитесь пожалуйста к разработчику');
                return undefined;
            }
            else {
                console.log(`saved company id ${resp.data}`);
                alert('Карточка компании сохранена');
                return resp.data;
            }
        },(err)=>{
            console.log(err);
        }).then((id)=>{
            if (id===undefined) return false;
            // добавляем информацию в фактори
            const compObj = new Company();
            compObj.savedAs({'id':id,'card':card});
            scope.myFactory.companyObj = compObj;
            compObj.factory = scope.myFactory;
            // $scope.addNewConnection('company_id',id);
        })
    }
    /** 
     * создание новой связи в базу Connections
     * @param {strinf} key - company_id etc
     * @param {string} val - id
     */
    $scope.addNewConnection = (key,val) => {
        const data ={
            company_id: 0,
            contact_id: 0,
            status: '',
            email: '',
            phone: '',
            end_date: '0000-00-00',
        };
        data[key] = val;
        data.type = 'new_connection';
        $http.post('php/save.php',data).then((resp)=>{
            if (isNaN(Number(resp.data))) {
                // если вернулся не id значит ошибка
                console.error(`Problem with saving: ${resp.data}`);
                alert('При сохранении связи возникли неполадки. Обратитесь пожалуйста к разработчику');
                return undefined;
            }
            else {
                console.log(`connection id ${resp.data}`);
                alert('Связь сохранена');
                return resp.data;
            }
        },(err)=>{
            console.error(err);
        }).then((id)=>{
            if (id===undefined) return false;
            // добавляем информацию в фактори
            scope.myFactory.companyObj.connectionID = id;
        })
    } 
    $scope.updateCompany = () => {
        const updateObj = {};
        return false;
        //FIXME: функция не сделана, оставлена на потом
        //1 взять старую карточку из последней загрузки 2 найти различия 3 записать в базу данных все отличающиеся параметры
        if ($scope.checkCardIsEmpty()) return false; // не сохраняем пустую карту
        $http.post('php/save.php',updateObj).then((resp)=>{

        },(err)=>{
            console.error(err);
        })
    }
});