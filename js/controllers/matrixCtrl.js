/**
 * Created by RoGGeR on 14.06.17.
 */
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
        $http.post("search.php", data).then(function success(response){
            console.log(response, "success");
        },function error(response){
            console.log(response)
        });
    };
    /**
     * Загружаем расчет из БД
     * здесь надо добавить, что расчеты загружаются по разному, в зависимости от того 
     * в какой период времени они сделаны. Происходит это из-за того что в какой-то момент
     * времени структура сохраненных расчетов была видоизменена
     * @param {number} id 
     */
    this.loadCalculation= function(id){ //нажимаем на строку расчета в результате поиска
        $timeout(function () {
            console.log(id);
            if($location.path!=="/calculation"){
                $location.path('/calculation');
            }
            let data ={};
            data.type="load_calculation";
            data.id=id;
            let scope=this;
            myFactory.urlJSON="transortation_cals.json";
            $http.post("search.php", data).then(function success(response){
                console.log(response.data);
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
                            array.push(proc);
                            if(process.multi!==undefined && multi.indexOf(process.multi)==-1) multi.push(process.multi);
                        });
                        let newPark=new Park(array[0]);//создаем парк с помощью первого процесса new Park
                        
                        if(array.length>1) array.splice(0,1);//choosePark()
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
                    if(multies.length>0){
                        for(let i=0;i<multies.length;i++){
                            let multi=multies[i];
                            for(let key in multi){
                                myFactory.multi.multies[i][key]=multi[key];
                            }
                        }
                    }
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
                            park.applyPracticalPriceKoef();
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
                    //лимиты/платежи/хуета остальная
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

            },function error(response){
                console.log(response)
            });
        }, 0);



    };
});