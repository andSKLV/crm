import Calculation from '../protos/calc.js';
import Company from "../protos/company.js";
import Loading from '../protos/loading.js';

app.controller('matrixCtrl', function($rootScope,$http, myFactory, $timeout, $location){
    let scope=this;
    /**
     * удаляем расчет из БД
     * @param {object} row строка которую надо удалить из БД
     */
    this.deleteCalculation=function(row){
        let id=row.id;
        $rootScope.search_result.splice($rootScope.search_result.indexOf(row), 1);
        let data={};
        data.type="delete_calculation";
        data.id=id;
        return $http.post("php/save.php", data).then(function success(response){
           if (response.data==="Успешно удалено") console.log('calculation successfully deleted');
           else console.error('problem with deleting', response);
        },function error(response){
            console.log(response)
        });
    };
    /**
     * Удаляем строчку из UI
     * @param {event} ev 
     */
    this.deleteRow = ev => {
        let row = ev.currentTarget;
        while (!row.classList.contains('row-flex')) {
            row = row.parentNode;
        }
        row.parentNode.removeChild(row);
    }
    /**
     * Удаление привязки расчета к компании. Если у расчета нет имени, значит он создавался только с привязкой к этой компании,
     * значит при удалении связи можно удалить и сам расчет
     * @param {obj} calc - объект с информацией о привязанном расчете
     */
    this.deleteLink = calc => {
        const query = {
            id: calc.id,
        };
        if (calc.name==='') {
            this.deleteCalculation (calc);
            query.type = 'delete_link';
        } else {
            query.type = 'delete_link_company';
        }
        myFactory.profileObj.deleteCalc(calc.id); //удаляем из локального объекта
        return $http.post('php/save.php',query).then(resp=>{
            if (resp.data!=='OK') console.error(resp.data);
        },err=>{
            console.error(err);
        })
    }
    /**
     * Загружаем расчет из БД
     * здесь надо добавить, что расчеты загружаются по разному, в зависимости от того 
     * в какой период времени они сделаны. Происходит это из-за того что в какой-то момент
     * времени структура сохраненных расчетов была видоизменена
     * @param {number} id 
     */
    this.loadCalculation=function(id){ //нажимаем на строку расчета в результате поиска
        $timeout(async function () {
            $rootScope.cacheTemplate = {};
            if($location.path!=="/calculation"){
                myFactory.cameFrom = {
                    path: $location.$$path,
                    name: getPathName($location.$$path)
                }
                $location.path('/calculation');
                await delay(200);
            }
            const loading = new Loading(true);
            myFactory.isLoading = loading;
            let data ={};
            data.type="load_calculation";
            data.id=id;
            let scope=this;
            myFactory.urlJSON="transortation_cals.json";
            $http.post("php/search.php", data).then(async function success(response){
                myFactory.matrixType="HIP";
                myFactory.parks=[];
                let mass=JSON.parse(response.data.processes);
                if(response.data.user_name==123){
                    mass.forEach(function (park) {
                        let multi=[];
                        let array=[];//создаем массив из процессов new Process
                        park.processes.forEach(function (process) {
                            let proc=new Process(process);
                            for(let key in process){
                                proc[key]=process[key];
                            }
                            // сохраняем загруженную цену
                            proc.loadedPrice = proc.totalPrice;
                            array.push(proc);
                            if(process.multi!==undefined && multi.indexOf(process.multi)==-1) multi.push(process.multi);
                        });
                        let newPark=new Park(array[0]);//создаем парк с помощью первого процесса new Park
                        
                        // if(array.length>1) array.splice(0,1);//choosePark()
                        if(array.length>1) newPark.processes.splice(0,1);
                        myFactory.choosePark(array, newPark, 0); 

                        for(let key in park){//копируем все свойства парка в созданный парк
                            if(key!="processes") newPark[key]=park[key];
                        }
                        myFactory.parks.push(newPark);//засовываем новый парк в массив
                        if(multi.length>0){
                            for(let i=0;i<multi.length;i++){
                                let array=newPark.processes.filter(function (process) {
                                    return process.multi==multi[i];
                                });
                                myFactory.multi.multies.push(new Multi(array));
                            }

                        }
                    });
                    let multies=JSON.parse(response.data.mass);
                    if(multies.length>0 && myFactory.multi.multies.length===multies.length){
                        for(let i=0;i<multies.length;i++){
                            let multi=multies[i];
                            // if (myFactory.multi.multies[i]===undefined) myFactory.multi.multies.push(multi); 
                            for(let key in multi){
                                myFactory.multi.multies[i][key]=multi[key];
                            }
                        }
                    }
                    // если сохраненный расчет был не перевозчиком
                    if (response.data.HIPname!==''&&response.data!=='Перевозчики') {
                        const HIP_name = myFactory.karetkaTypes[response.data.HIPname]; //достаем название файла конфигурации каретки
                        await loadRisks(HIP_name); //загрузка новых рисков
                        myFactory.HIPname = response.data.HIPname;
                        myFactory.scop.loadMatrix();// перезагружаем матрицу
                    }
                    myFactory.calculationName = response.data.name;
                    myFactory.finalCalc();
                    //проходимся по мульти

                    if(response.data.a_limit!=0 && response.data.a_limit!=myFactory.a_limit.max_limit){//агрегатный лимит
                        myFactory.a_limit.hand=true;
                        myFactory.a_limit.value=response.data.a_limit*1;
                        myFactory.a_limit.type=response.data.a_limitType;
                        myFactory.applyAlimit();
                        myFactory.finalCalc();
                    }
                    if(response.data.agents!=";Р" && response.data.agents!=";%"){
                        let agents=response.data.agents.split(";");
                        myFactory.agents.mode=agents[1];
                        myFactory.agents.val=agents[0]*1;
                        myFactory.finalCalc();
                    }

                    if(response.data.payment!=0 && response.data.payment!=myFactory.payment.val){//этапы платежей
                        myFactory.payment.hand=true;
                        myFactory.payment.val=response.data.payment*1;
                        myFactory.finalCalc();
                    }
                    
                    if(response.data.fact_premia!=";Р" && response.data.fact_premia!=";1"){
                        let price=response.data.fact_premia.split(";");
                        myFactory.practicalPrice.val=price[0]*1;
                        myFactory.practicalPrice.koef=price[1]*1;
                        myFactory.parks.forEach(function(park){
                            park.applyPracticalPriceKoef("load");
                        });
                        let val=myFactory.getTotal();
                        myFactory.practicalPrice.val=val-(val%1);
                        myFactory.bottom.priceMode="practicalPrice";
                        myFactory.finalCalc();
                    }
                    else if(response.data.total_price!=0 && Math.round(myFactory.totalPrice)!=response.data.total_price){
                        myFactory.practicalPrice.val=response.data.total_price*1;
                        myFactory.practicalPrice.koef=myFactory.practicalPrice.val/myFactory.totalPrice;
                        myFactory.checkPracticalPriceKoef(true);
                        myFactory.bottom.priceMode="practicalPrice";
                        myFactory.finalCalc();
                    }
                    //лимиты/платежи/остальное
                }
                else{
                    let processes={};
                    for(let key in mass){
                        processes[key]=mass[key];
                    }
                    let parks=[];
                    for(let key in processes){
                        let process=processes[key];
                        if(parks.indexOf(process.park)==-1) parks.push(process.park);
                        process.cost=process[1].split(" Р");
                        process.cost=process.cost[0]*1;
                        delete process[1];
                        process.amount=process[2].split(" ");
                        if(process.amount[1]=="Тягачей") process.amount=process.amount[0]*24;
                        else process.amount=process.amount[0]*1;
                        delete process[2];
                        process.wrapping=process[3];
                        delete process[3];
                        process.risk=process[4];
                        delete process[4];
                        process.limit=process[5].split(" Р");
                        process.limit=process.limit[0]*1;
                        delete process[5];
                        process.franchise=process[6].split(" Р");
                        process.franchise=process.franchise[0]*1;
                        delete process[6];
                        if(process.koef){
                            process.practicalPriceKoef=process.koef;
                            delete process.koef;
                        }
                        delete process.stavka;

                    }
                    mass=JSON.parse(response.data.mass);
                    let multiMass={};
                    let packageMass=[];
                    mass.forEach(function (multi) {
                        if(multi.trs!=""){
                            multi.trs=multi.trs.split(";");
                            for(let i=0;i<multi.trs.length; i++){
                                if(multi.trs[i]=="") multi.trs.splice(multi.trs.indexOf(multi.trs[i]),1);
                            }
                            if(multi.multi && multiMass[multi.multi]===undefined){
                                multiMass[multi.multi]={};
                                multiMass[multi.multi].processes=[];
                            }
                            if(multi.package_name){
                                if(multi.multi===undefined){
                                    packageMass.push({"processes":[]});
                                }
                                multi.trs.forEach(function (tr) {
                                    tr=tr.split("tr_");
                                    tr=tr[1];
                                    processes[tr]["package"]=multi.package_name;
                                    if(multi.multi && multiMass[multi.multi].processes.indexOf(tr)==-1){
                                        multiMass[multi.multi].processes.push(tr);
                                        processes[tr].multi=multi.multi;
                                    }
                                    else{
                                        packageMass[packageMass.length-1]["processes"].push(tr);
                                        processes[tr]["packageNum"]=packageMass.length-1;
                                    }
                                });
                                if(multi.multi) multiMass[multi.multi].package=multi.package_name;
                            }
                            else{
                                multi.trs.forEach(function (tr) {
                                    if(tr.indexOf("packageRow")==-1){
                                        tr=tr.split("tr_");
                                        tr=tr[1];
                                        if(multiMass[multi.multi].processes.indexOf(tr)==-1) {
                                            multiMass[multi.multi].processes.push(tr);
                                            processes[tr].multi=multi.multi;
                                        }
                                    }
                                });
                            }
                        }


                    });
                    myFactory.parks=[];
                    for(let i=0;i<parks.length;i++){
                        let mass=[];
                        for(let key in processes){
                            let process=processes[key];
                            if(process.park==parks[i]) mass.push(process);
                        }
                        let array=[];
                        mass.forEach(function(process){
                            let proc=new Process(process);
                            if(process.packageNum!==undefined) proc.packageNum=process.packageNum;
                            if(process.multi!==undefined) proc.multi=process.multi;
                            if(process.package!==undefined) proc.package=process.package;
                            if(process.koef!==undefined) proc.practicalPriceKoef=process.koef;
                            array.push(proc);
                        });

                        let park=new Park(array[0]);
                        myFactory.parks.push(park);
                        array.splice(0,1);
                        myFactory.choosePark(array,park, 0);
                        console.log(myFactory.parks);
                    }
                    if (myFactory.packages===undefined) {
                        let resp = await fetch('./src/HIP.json');
                        resp = await resp.json();
                        resp = resp.filter(r=>r.url=='Пакеты');
                        resp = resp[0].values;
                        myFactory.packages = resp;
                        console.warn('myFactory.packages загружен отдельно');
                    }
                    myFactory.parks.forEach(function (park) {
                        park.processes.forEach(function (process) {
                            if(process.packageNum!==undefined){
                                let packageNum=process.packageNum;
                                let mass=park.processes.filter(function (proc) {
                                    return proc.packageNum==packageNum;
                                });
                                let pckName=process['package'];
                                let template=myFactory.packages.filter(function (pack) {
                                    return pack.name==pckName;
                                });
                                template=template[0].values;
                                mass.forEach(function (proc) {
                                    delete proc.packageNum;
                                });
                                let multi=new Multi(mass, pckName, template);
                                myFactory.multi.multies.push(multi);
                            }
                            if(process.multi!==undefined){
                                let multik=process.multi;
                                let mass=park.processes.filter(function (proc) {
                                    return proc.multi==multik;
                                });
                                let pckName=0;
                                mass.forEach(function (proc) {
                                    if(proc.package) pckName=proc.package;
                                });
                                if(pckName){
                                    let template=myFactory.packages.filter(function (pack) {
                                        return pack.name==pckName;
                                    });
                                    template=template[0].values;
                                    let multi=new Multi(mass, pckName, template);
                                    myFactory.multi.multies.push(multi);
                                }
                                else{
                                    let multi=new Multi(mass);
                                    myFactory.multi.multies.push(multi);
                                }
                            }
                        })
                    });
                    // если сохраненный расчет был не перевозчиком
                    if (response.data.HIPname!==''&&response.data!=='Перевозчики') {
                        const HIP_name = myFactory.karetkaTypes[response.data.HIPname]; //достаем название файла конфигурации каретки
                        await loadRisks(HIP_name); //загрузка новых рисков
                        myFactory.HIPname = response.data.HIPname;
                        myFactory.scop.loadMatrix();// перезагружаем матрицу
                    }
                    // сохраняем имя загруженного расчета в верхней части матрицы
                    myFactory.calculationName = response.data.name;
                    myFactory.finalCalc();

                    if(response.data.a_limit!=0 && response.data.a_limit!=myFactory.a_limit.max_limit){//агрегатный лимит
                        myFactory.a_limit.hand=true;
                        myFactory.a_limit.value=response.data.a_limit*1;
                        if(response.data.a_limit>10){
                            myFactory.a_limit.type="Агр. лимит";
                        }
                        else{
                            myFactory.a_limit.type="Кол-во случаев";
                        }
                        myFactory.applyAlimit();
                        myFactory.finalCalc();
                    }

                    if(response.data.agents!="0 %" && response.data.agents!="0 Р"){
                        let agents=response.data.agents.split(" ");
                        myFactory.agents.mode=agents[1];
                        myFactory.agents.val=agents[0]*1;
                        myFactory.finalCalc();
                    }

                    if(response.data.payment!=0 && response.data.payment!=myFactory.payment.val){//этапы платежей
                        myFactory.payment.hand=true;
                        myFactory.payment.val=response.data.payment*1;
                        myFactory.finalCalc();
                    }

                    let practicalPrice=response.data.fact_premia.split(" Р");
                    if(practicalPrice[0]!="undefined"){//фактическая премия
                        myFactory.practicalPrice.val=practicalPrice[0]*1;
                        myFactory.practicalPrice.koef=myFactory.practicalPrice.val/myFactory.totalPrice;
                        myFactory.checkPracticalPriceKoef(true);
                        myFactory.bottom.priceMode="practicalPrice";
                        myFactory.finalCalc();
                    }
                    else if(response.data.total_price!=0 && myFactory.totalPrice!=response.data.total_price){
                        myFactory.practicalPrice.val=response.data.total_price*1;
                        myFactory.practicalPrice.koef=myFactory.practicalPrice.val/myFactory.totalPrice;
                        myFactory.checkPracticalPriceKoef(true);
                        myFactory.bottom.priceMode="practicalPrice";
                        myFactory.finalCalc();
                    }
                }
                myFactory.document.currParam="";
                clearSearch();
                // инициализируем calcObj и добавляем в него всю информацию
                const calcObj = new Calculation();
                calcObj.parseFromMyFactory(myFactory);
                calcObj.parseFromResponse(response.data);
                calcObj.markAsLoaded();
                await calcObj.loadLink();
                myFactory.isLoading.hide();
                delete myFactory.isLoading;
            },function error(response){
                console.log(response)
            });
        }, 0);
    };
    this.loadCompanyProfile = async function (id){
        myFactory.cameFrom = {
            name: getPathName($location.$$path),
            path: $location.$$path,
        }
        myFactory.companyObj.id = id;
        $location.path('/profile');
    }
    /**
     * Фукнция загрузки компании из БД в матрицу
     * @param {number} id - id компании
     */
    this.loadCompany = function (id, noRelocation) {
        const data = {};
        data.type = 'load_company';
        data.id=id;
        return $http.post('php/search.php', data).then(async (resp) => {
            const loadAddresses = () => {
                const check = str => {
                    return (isNumeric(str)) ? str : '1';
                  }
                const query = {
                legal_id: check(myFactory.companyObj.responses.card.Legal_address),
                real_id: check(myFactory.companyObj.responses.card.Real_address),
                }
                const formatAddress = adr => {
                  return Object.values(adr).slice(1).filter(v=>v!=='').map(v=>v.trim());
                }
                query.type = 'addresses';
                if (query.legal_id==='1'&&query.real_id==='1') return false;
                return $http.post('php/load.php',query).then(resp=>{
                    if (!Array.isArray(resp.data)) {
                        console.error(resp.data);
                        return false;
                    }
                  const data = resp.data;
                  myFactory.companyObj.responses.adresses = data;
                  if (data[0].id!=='1') {
                    if (data[0].PostalCode==='0') delete data[0].PostalCode;
                    const legal = formatAddress(data[0]).join(', ');
                    myFactory.newClientCard['Доп. информация']['Юридический адрес'] = legal;
                  }
                  if (data[1].id!=='1') {
                    if (data[1].PostalCode==='0') delete data[1].PostalCode;
                    const fakt = formatAddress(data[1]).join(', ');
                    myFactory.newClientCard['Доп. информация']['Фактический адрес'] = fakt;
                  }
                },err=>{
                  console.error(err);
                })
            }
            const data = resp.data;
            myFactory.newClientCard = generateClientCard(data);
            const companyObj = new Company();
            myFactory.companyObj = companyObj;
            companyObj.parseFromCompaniesResponse(data) //создаем объект с  id  из ответа и сохраняем ответ внутри
            companyObj.card = myFactory.newClientCard;
            companyObj.markAsLoaded();
            await loadAddresses();
            if (!noRelocation) {
                myFactory.loadClient = 'Форма собственности'; //какую ячейку открыть при старте
                $location.path('/company');
            }
            clearSearch();

            /**
             *  Функция генерации объекта карточки клиента из данных из БД
             * @param {obj} data - ответ из БД
             * @returns {obj} - объект карточки клиента
             */
            function generateClientCard (data) {
                return {
                    'Данные компании':
                    {
                       "Форма организации": getOrgForm(data.OrganizationFormID),
                       "Наименование организации": data.name,
                       "Дата регистрации": getDate(data.registration_date),
                       "Наименование рег. органа": data.who_registrate,
                     },
                     "Генеральный директор":
                     {
                       "ФИО директора":data.director_name,
                       "Серия и номер паспорта":data.general_director_passport,
                       "Когда выдан":getDate(data.give_date),
                       "Кем выдан":data.director_authority,
                     },
                     "Продолжение": 
                     {
                        "Место рождения": "",
                        "Адрес регистрации": "",
                     },
                     "Реквизиты компании":
                     {
                       "ОГРН":data.OGRN,
                       "ИНН": data.INN,
                       "КПП": data.KPP,
                       "ОКПО":data.OKPO,
                       "ОКВЭД":data.OKVED,
                     },
                     "Банковские реквизиты":
                     {
                       "р/счет":data.r_account,
                       "к/счет":data.k_account,
                       "Банк":data.bank,
                       "БИК":data.bik,
                     },
                     "Доп. информация":
                     {
                        "Телефон":data.company_phone,
                        "Эл. почта":data.company_mail,
                        "Юридический адрес":data.Legal_address,
                        "Фактический адрес":data.Real_address,
                     }
                   }
            }
            /**
             * Функция возвращает наименование формы компании 
             * @param {number} id 
             */
            function getOrgForm (id) {
                if (id==='0') return '';
                const forms = {
                    1: "ЗАО",
                    2: "ООО",
                    3: "ОАО",
                    4: "ИП"
                }
                return forms[+id];
            }
            function getDate (date) {
                return (date==='0000-00-00') ? '' : date; 
            } 
        },function error(resp){
            console.error(resp);
        })
    }
    this.updateCalculation=function (id,name) {
        let parks=[];
        myFactory.parks.forEach(function (park) {
            let newPark = {};
            for (let key in park) {
                if (key != "processes") newPark[key] = park[key];
                else {
                    newPark[key] = [];
                    park.processes.forEach(function (process) {
                        let newProcess = {};
                        for (let prop in process) {
                            if (prop != "multi" && prop != "park") {
                                newProcess[prop] = process[prop];
                            }
                            else if (prop == "multi") {
                                newProcess[prop] = myFactory.multi.multies.indexOf(process.multi);
                            }
                        }
                        newPark[key].push(newProcess);
                    })
                }
            }
            parks.push(newPark);
        });
        const multies = [];
        if (myFactory.multi.multies.length > 0) {
            myFactory.multi.multies.forEach(function (multi) {
                let newMulti = {};
                for (let key in multi) {
                    if (key != "processes") newMulti[key] = multi[key];
                }
                multies.push(newMulti);
            })
        }
        const save = {};
        try {
            save.parks = JSON.stringify(parks);
        }
        catch {
            let CircularJSON = window.CircularJSON;
            save.parks = CircularJSON.stringify(parks);
        }
        try {
            save.mass = JSON.stringify(multies);
        }
        catch {
            let CircularJSON = window.CircularJSON;
            save.mass = CircularJSON.stringify(multies);
        }
        save.payment = myFactory.payment.val;
        save.agents = myFactory.agents.val + ";" + myFactory.agents.mode;
        save.practicalPrice = myFactory.practicalPrice.val + ";" + myFactory.practicalPrice.koef;
        save.a_limit = myFactory.a_limit.value;
        save.a_limitType = myFactory.a_limit.type;
        save.totalAmount = myFactory.totalAmount;
        save.totalPrice = myFactory.totalPrice;
        save.HIPname = myFactory.HIPname;
        save.type = "update_calc";
        save.name = name;
        save.id = id;

        return $http.post("php/save.php", save).then(async function success(response) {
            if (isNaN(Number(response.data))) {
                alert('Ошибка при пересохранении расчета. Пожалуйста, по возможности не закрывайте окно и обратитесь к разработчику');
                console.error(response.data);
                return false;
            }
            const calcObj = new Calculation(myFactory);
            calcObj.parseFromResponse (save);
            calcObj.isSaved = true;
            myFactory.calcObj = calcObj;
            await calcObj.loadLink();
            myFactory.calculationName = calcObj.name;
            alert('Успешно пересохранено');
        }, function error(response) {
            console.log(response);
            }
        );
    };
    /**
     * Функция вставки названия выбранного названия в новый расчет
     * @param {string} name - название старого расчета 
     */
    this.setCalculationNameAs= (name) => {
        const date = new Date();
        let hh = date.getHours();
        hh = (hh<10) ? `0${hh}` : `${hh}`;
        let min = date.getMinutes();
        min = (min<10) ? `0${min}` : `${min}`;
        document.querySelector('#inputSaveCalc').value = `${name} ${hh}:${min}`;
    }
    /**
     * Deleting serach result after choosing one of the results
     */
    function clearSearch () {
        try {
            $rootScope.search_result = [];
        }
        catch (err) {
            console.error (`Clear search results problem: ${err}`);
        }
    }
});