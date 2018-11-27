import Company from '../protos/company.js';

/**
 * Created by RoGGeR on 30.11.2017.
 */
app.controller("companyCtrl", function (myFactory, $scope, $http, $location, $timeout) {
    //******    Инициализация   *******
    if ($location.$$path!=='/company') return false; //если вызывается контроллер в профайле, так не должно быть
    const scope = this;
    $scope.myFactory = myFactory;
    $scope.clientCard = {};
    Object.assign($scope.clientCard, $scope.myFactory.newClientCard);
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
            $scope.myFactory.newClientCard = {};
            Object.assign($scope.myFactory.newClientCard, $scope.clientCard);
        }
    });
    function init () {
        if (!myFactory.loadCompany) {
            $http.post("./src/new_company.json").then(async function success(response) {
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
                $scope.setEmptyCardParam();
                // делаем верхнюю каретку как образец из json
                $scope.currObj = response.data;
                await delay(50);
                if (myFactory.loadClient !== undefined) {
                    $scope.loadToDashboard(myFactory.loadClient);
                    delete myFactory.loadClient;
                } else {
                    $scope.newDashboard.setCurrentPage(0);
                }
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
            $scope.loadToDashboard($scope.currObj[index].values[0].name);
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
                    if ($scope.newDashboard.currentPage != i) $scope.newDashboard.setCurrentPage(i);
                    Array.from(document.querySelectorAll(".company_dashboard_inputs")).forEach(item => {
                        item.classList.remove("selected");
                    });
                    Array.from(document.querySelectorAll("div.clientCard td")).forEach(node => {
                        node.classList.remove("mi_selected");
                        if (node.title == key) node.classList.add("mi_selected");
                    })
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
        $scope.myFactory.cameFrom = {
            name: 'Редактор карты клиента',
            path: $location.$$path,
        }
        if (!$scope.myFactory.companyObj.id) {
            // если расчет не сохранен, то записываем его в хранилище объекта при выходе
            $scope.myFactory.companyObj = new Company();
        } 
        $scope.myFactory.companyObj.card = $scope.clientCard;
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
        $scope.myFactory.removeCellSelection ('dashboard_container');
        $scope.clientCard = {};
        $scope.myFactory.companyObj = new Company();
        delete $scope.myFactory.newClientCard;
        init();
    }
    $scope.saveCompany = () => {
        if ($scope.checkCardIsEmpty()) return false; // не сохраняем пустую карту
        if ($scope.myFactory.companyObj&&$scope.myFactory.companyObj.isSaved) {
            // проверка сохраненная ли это компания
            $scope.updateCompany();
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
            compObj.savedAs({'id':id,'card':card,'savedObj':saveObj});
            $scope.myFactory.companyObj = compObj;
            compObj.factory = $scope.myFactory;
            $scope.addNewConnection('company_id',id);
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
                console.log(`connection saved with id ${resp.data}`);
                return resp.data;
            }
        },(err)=>{
            console.error(err);
        }).then((id)=>{
            if (id===undefined) return false;
            // добавляем информацию в фактори
            $scope.myFactory.companyObj.connectionID = id;
        })
    } 
    $scope.updateCompany = async () => {
        const updateObj = {};
        const oldCard = Object.assign({},$scope.myFactory.companyObj.responses.card);
        const newCard = generateSaveCompanyObj($scope.clientCard);
        const prevValues = findChanges(oldCard,newCard);
        const companyId = $scope.myFactory.companyObj.id;
        const isEmpty = !Object.keys(prevValues).length;
        if (isEmpty) {
            alert ('В карточке нет изменений');
        }
        else {
            await updateCard (Object.assign({},newCard),companyId);
            await saveChanges (prevValues,companyId);
        }
        /**
         * Updating company card in DB to the newest
         * @param {object} card - object of new card
         * @param {string} id  - id of company 
         */
        function updateCard (card,id) {
            const query = {};
            query.type = 'update_company';
            query.card = card;
            query.id = id;
            // сохраняем новую карточку в базу данных
            return $http.post('php/save.php',query).then((resp)=>{
                if (resp.data=='1') {
                    alert('Изменения сохранены')
                    console.log(`company updated; id ${resp.config.data.id}`);
                    // сохраняем новую карточку для отслеживания изменений
                    $scope.myFactory.companyObj.responses.card = Object.assign({},resp.config.data.card);
                }
                else {
                    alert ('Проблемы с обновлением данных карточки компании. Пожалуйста, по возможности не закрывайте окно и обратитесь к разработчику');
                    debugger;
                    console.error(resp.data);
                }
            },(err)=>{
                console.error(err);
            })
        }
        function saveChanges(prev,companyId) {
            const query = {};
            query.type = 'save_company_changes';
            query.company_id = companyId;
            query.prev = prev;
            // сохраняем изменения в базу данных
            return $http.post('php/save.php',query).then((resp)=>{
                if (resp.data=='1') {
                    console.log(`changes saved; id ${resp.config.data.company_id}`);
                }
                else {
                    alert ('Проблемы с обновлением данных карточки компании. Пожалуйста, по возможности не закрывайте окно и обратитесь к разработчику');
                    console.error(resp.data);
                }
            },(err)=>{
                console.error(err);
            });
        }
        /**
         * finding differences in old and new card 
         * @param {object} oldC объект старой карточки
         * @param {object} newC объект новой карточки
         * @returns {object} объект со старыми значениями, которые были изменены
         */
        function findChanges(oldC,newC) {
            const skip = ['id','date','type','Communications','company_group','company_url'];
            // если даты не заданы в новом и старом, то убираем их из списка сравнения
            if ((oldC['give_date']===''||oldC['give_date']==='0000-00-00')&&(newC['give_date']===''||newC['give_date']==='0000-00-00')) skip.push('give_date');
            if ((oldC['registration_date']===''||oldC['registration_date']==='0000-00-00')&&(newC['registration_date']===''||newC['registration_date']==='0000-00-00')) skip.push('registration_date');
            //удаляем поля, которые не нужно сравнивать
            skip.forEach(key=>{
                if (oldC[key]) delete oldC[key];
                if (newC[key]) delete newC[key];
            })
            const changed = {};
            // сравниваем старые и новые значения, записываем старые
            for (const key in oldC) {
                if (oldC.hasOwnProperty(key)) {
                    const oldEl = oldC[key];
                    const newEl = newC[key];
                    if (oldEl!=newEl) changed[key] = oldEl || '';
                }
            }
            return changed;
        }
    }
    function generateSaveCompanyObj(card) {
        return {
            Communications: "",
            INN: card["Реквизиты компании"]["ИНН"],
            KPP: card["Реквизиты компании"]["КПП"],
            Legal_address: card['Доп. информация']['Юридический адрес'],
            OGRN: card["Реквизиты компании"]["ОГРН"],
            OKPO: card["Реквизиты компании"]['ОКПО'],
            OKVED: card["Реквизиты компании"]['ОКВЭД'],
            OrganizationFormID: getOrgForm(card['Данные компании']["Форма организации"]),
            Real_address: card['Доп. информация']['Фактический адрес'],
            bank: card["Банковские реквизиты"]["Банк"],
            bik: card["Банковские реквизиты"]["БИК"],
            company_group: "",
            company_mail: card['Доп. информация']['Эл. почта'],
            company_phone: card['Доп. информация']['Телефон'],
            company_url: "",
            general_director_passport: card["Генеральный директор"]["Серия и номер паспорта"],
            director_name:card["Генеральный директор"]['ФИО директора'],
            give_date:card["Генеральный директор"]['Когда выдан'],
            director_authority:card["Генеральный директор"]['Кем выдан'],
            director_birth_place: card['Продолжение']['Место рождения'],
            director_address: card['Продолжение']['Адрес регистрации'],
            id: "",
            k_account: card["Банковские реквизиты"]["к/счет"],
            name: card['Данные компании']["Наименование организации"],
            r_account: card["Банковские реквизиты"]["р/счет"],
            registration_date: card['Данные компании']["Дата регистрации"],
            status: "",
            who_registrate: card['Данные компании']["Наименование рег. органа"],
        }
        function getOrgForm (data) {
            if (data===''||data===undefined) return '';
            const forms = {
                "ЗАО": "1",
                "ООО": "2",
                "ОАО": "3",
                "ИП": "4"
            }
            return Number(forms[data]);
        }
    }
});