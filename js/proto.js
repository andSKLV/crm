/**
 * Created by RoGGeR on 08.08.17.
 */
"use strict";
const transportProp=["cost","amount","wrapping","risk","limit","franchise"];
const qwerty=["Q","W","E","R","T","Y","U","I","O","P"];
const TRACTOR=24;
let LimKoef=1;
let totalAmount=0;

class Multi{
    constructor(array, packName, template){
        let mult=this;
        this.show=false;
        this.processes=[];
        array.forEach(function (proc) {
            mult.processes.push(proc);
            proc.multi=mult;
        });
        if(packName){
            this.packName=packName;
            this.template=template;
        }
        this.getValues();
    }
    removePackage(){
        if(this.packName){
            let mass=this.processes.filter(process=>process.package==this.packName);
            mass.forEach(function (process) {
                process.remove();
            })
        }
    }
    prepareForPackage(){
        this.processes.forEach(process=>{if(process.risk=="Базовые риски") process.remove();});
        let mass=[];
        this.template.forEach(obj=>mass.push(obj.risk));
        let array=this.processes.filter(process=>mass.indexOf(process.risk)!=-1);
        array.forEach(process=>process.remove());
    }
    getValues(){
        let wrapping=[];
        let risk=[];
        let limit=[];
        let franchise=[];
        let cost=[];
        let amount=[];
        this.processes.forEach(function (proc, i) {

                if(wrapping.indexOf(proc.wrapping)==-1) wrapping.push(proc.wrapping);
                if(risk.indexOf(proc.risk)==-1) risk.push(proc.risk);
                if(!proc.package || proc.package && i==0){
                    limit.push(proc.limit);
                    franchise.push(proc.franchise);
                    cost.push(proc.cost);
                    amount.push(proc.amount);
                }

        });
        if(cost.length==1) this.cost=cost[0];
        else{
            let min=cost[0];
            let max=cost[0];
            for(let i=0;i<cost.length;i++){
                if(cost[i]>max) max=cost[i];
                if(cost[i]<min) min=cost[i];
            }
            if(min==max) this.cost=min;
            else this.cost=min+"-"+max;
        }
        if(amount.length==1) this.amount=amount[0];
        else{
            let min=amount[0];
            let max=amount[0];
            for(let i=0;i<amount.length;i++){
                if(amount[i]>max) max=amount[i];
                if(amount[i]<min) min=amount[i];
            }
            if(min==max) this.amount=min;
            else this.amount=min+"-"+max;
        }
        this.wrapping=wrapping;
        this.risk=risk;
        if(limit.length==1) this.limit=limit[0];
        else{
            let min=limit[0];
            let max=limit[0];
            for(let i=0;i<limit.length;i++){
                if(limit[i]>max) max=limit[i];
                if(limit[i]<min) min=limit[i];
            }
            if(min==max) this.limit=min;
            else this.limit=min+"-"+max;
        }
        if(franchise.length==1) this.franchise=franchise[0];
        else{
            let min=franchise[0];
            let max=franchise[0];
            for(let i=0;i<franchise.length;i++){
                if(franchise[i]>max) max=franchise[i];
                if(franchise[i]<min) min=franchise[i];
            }
            if(min==max) this.franchise=min;
            else this.franchise=min+"-"+max;
        }
        if(this.packName){
            let risks=["Базовые риски"];
            this.template.forEach(function (process) {
                risks.push(process.risk);
            });
            for(let i=0;i<risks.length; i++){
                this.risk.splice(this.risk.indexOf(risks[i]),1);
            }
            this.risk.push(this.packName)
        }
    }
    calculatePrice(){
        this.getValues();
        let total=0;
        this.processes.forEach(function (proc) {
            total+=proc.totalPrice;
        });
        this.price=total;
    }
    // функция разворачивания мульти узла на строчки
    open(multies, key) {
        removeCellSelection();
        const isDestructed = destructuringPairs.call(this, key);
        if (!isDestructed) destructuringOldMulties.call(this);
        this.show = true;
        multies.forEach(multi => multi.getValues());

        /**
         * удаляем выделенные ячейки, так как из-за них скачет анимация, все равно по логике эти выделения не нужны
         */
        function removeCellSelection() {
            const selectedCell = document.querySelector('.matrix_table .mi_selected');
            if (selectedCell!== null) selectedCell.classList.toggle('mi_selected');
            const alreadySelectedCells = document.querySelectorAll('.matrix_table .alreadySelected');
            alreadySelectedCells.forEach(cell=>cell.classList.toggle("alreadySelected"));
        }

        // если раньше процы были распределены по мулььи узлам то их нужно распределить опять
        function destructuringOldMulties() {
            // архив для удаления проца
            const arr = [];
            // смотрим есть ли внутри мульти узла процы, которые до сворачивания были мультиузлами
            this.processes.forEach(pr => {
                if (pr.oldMulti) {
                    pr.oldMulti.processes.push(pr);
                    arr.push(pr);
                    pr.multi = pr.oldMulti;
                    delete pr.oldMulti;
                }
            })
            // удаляем процы которые превратились в мульти узлы, добавляем их мульти узлы
            arr.forEach(pr => {
                const ind = this.processes.indexOf(pr);
                this.processes.splice(ind, 1);
                if (!this.processes.includes(pr.multi)) this.processes.splice(ind, 0, pr.multi);
            })
        }
        // если новый мульти-в-мульти узел то структурируем его сами
        function destructuringPairs(key) {
            const isPairs = () => {
                let flag = true;
                if (this.risk.length===1 && this.wrapping.length > 1 && (this.risk[0]==='Международные'||this.risk[0]==='Внутренние'||this.risk[0]==='Автомотив')) return true;
                if (!(this.risk.length > 1 && this.wrapping.length > 1 && this.processes.length===this.risk.length*this.wrapping.length)) flag = false;
                this.risk.forEach(risk=> {
                    if ((typeof risk)!=='string') flag = false;
                    const counter = this.processes.filter(pr=>pr[key]===risk);
                    if (counter.lenght!==this.risk.lenght) flag = false;
                });
                this.wrapping.forEach(wrap=> {
                    if ((typeof wrap)!=='string') flag = false;
                    const counter = this.processes.filter(pr=>pr[key]===wrap);
                    if (counter.lenght!==this.wrapping.lenght) flag = false;
                });
                // проверяем, были ли они уже разбиты на пары по этому ключу
                this.processes.forEach(pr => {
                    if (pr.oldMulti && pr.oldMulti.distructedByKey === key) flag = false;
                }); 
                return flag;
            } 
            if (isPairs()) {
                const keysInMulti = [];
                this.processes.forEach(pr => {
                    if (!keysInMulti.includes(pr[key])) keysInMulti.push(pr[key]);
                })
                // сортировка 
                const sortedProcesses = [];
                keysInMulti.forEach(k=>{
                    this.processes.forEach(pr=>{
                        if (pr[key]===k) sortedProcesses.push(pr);
                    })
                })
                const sortingPark = this.processes[0].park.processes;
                const placesOfProcs = [];
                    // находим  места процев в парке, соответствующие отсортированным процам, чтобы их потом заменить
                sortingPark.forEach((pr,ind)=>{
                    if (sortedProcesses.includes(pr)) placesOfProcs.push(ind);
                })
                    // заменяем процы в парке, на отсортированные процы
                sortedProcesses.forEach((pr,ind)=>{
                    sortingPark.splice(placesOfProcs[ind],1,pr);
                })
                this.processes = sortedProcesses;
                // конец сортировки
                keysInMulti.forEach(k => {
                    // собираем процессы с одинаковым ключем, чтобы создать из них мульти
                    const creatingMulti = this.processes.filter(pr => pr[key] === k);
                    creatingMulti.forEach(pr=>{
                        // если он уже был деструктурирован на другие пары, то убираем старые мульти
                        if (pr.oldMulti && pr.oldMulti.distructedByKey!==key) {
                            if (multies.includes(pr.oldMulti)) multies.splice(multies.indexOf(pr.oldMulti),1);
                            delete pr.oldMulti;
                        }
                    })
                    const newMulti = new Multi(creatingMulti);
                    // сохраняем индекс первого проца, чтобы потом на его место поставить мульти
                    let ind = this.processes.indexOf(creatingMulti[0]);
                    creatingMulti.forEach(pr => {
                        this.processes.splice(this.processes.indexOf(pr), 1);
                    })
                    newMulti.multi = this;
                    newMulti.parent = this;
                    newMulti.show = false;
                    newMulti.distructedByKey = key;
                    this.processes.splice(ind,0,newMulti);
                    // this.processes.push(newMulti);
                    multies.push(newMulti);
                })
                return true;
            }
            return false;
        }
    }
    // функция сворачивания мультиузла в одну строку
    close(multies, toParent, process, myFactory) {
        myFactory.removeCellSelection();
        // определяем есть ли родитель, потому что то что в параметре не всегда правда
        this.processes.forEach(pr => {
            if (pr.constructor.name === 'Multi') toParent = true;
        })
        // если закрываем родителя , то переносим все процы в него и свертываем
        if (toParent) {
            const newProcesses = [];
            this.processes.forEach((multi, i) => {
                if (multi.constructor.name === 'Multi') {
                    multi.show = false;
                    multi.processes.map((pr, i) => {
                        pr.oldMulti = multi;
                        pr.multi = this;
                        newProcesses.push(pr);
                    })
                    multi.processes.splice(0, multi.processes.length);
                }
                else newProcesses.push(multi);
            })
            this.processes = newProcesses;
        }
        this.show = false;
        this.calculatePrice();
    }
    changeProperty(key, value){
        let multi=this;
        this.processes.forEach(function (process) {
            if(process.package){
                if(multi.parent===undefined){
                    if (!multi.template) {
                        process[key]=value;
                        return true;
                    }
                    let template=multi.template.filter(function (proc) {
                        return proc.risk==process.risk;
                    });
                    template=template[0];
                    let flag=false;
                    for(let prop in template){
                        if(prop==key) {
                            process[key]=template[prop]*value;
                            flag=true;
                        }
                    }
                    if(!flag) process[key]=value;
                }
                else{
                    const mainMulti=multi.parent;
                    delete mainMulti.packName;
                    delete mainMulti.template;
                    mainMulti.processes.forEach((multik)=>{
                        multik.processes.forEach(process=>delete process.package)
                    });
                    multi.processes.forEach(process=>process[key]=value);
                }

            }
            else process[key]=value;
        })
    }

}
class Process{
    constructor(process, multi){
        for(let key in process){
            if (key!=='practicalPriceKoef') this[key]=process[key];
            else {
                this[key]=0;
            }
            if (key==='multi') this[key]=undefined;
        }
        if(multi) this.multi=multi;
    }
    calculateBase(){
        this.totalPrice=0;
        for(let i=0;i<transportProp.length;i++){
            if(typeof this[transportProp[i]]  == "undefined"){
                console.log("Объект не полный, не хватает свойства "+ transportProp[i]);
                return false;
            }
        }
        //SKLV 14.05.2018: этот блок нужен в случае, если объем перевозок в базовых рисках меньше чем в других рисках. Базовые риски должны считаться по наибольшему из объемов перевозок, поэтому перезаписываем amount на наибольшее. сохраняем значение, чтобы поменять его обратно после расчетов, чтобы в интерфейсе выводилось первоначальное число
        const maxAmount = this.park.calculateAmount();
        let writtenAmount;
        if (this.risk==="Базовые риски" && maxAmount!=this.amount) {
            // если у базовых рисков не самое большое кол-во груза в парке, то запоминаем самое большое кол-во для учета в расчетах базового риска
            writtenAmount = this.amount;
            this.amount = maxAmount;
        }
        //грузооборот = цена груза х кол-во груза
        this.turnover=this.cost*this.amount;
        let spline = Spline(this.cost, Points.cost, 1);
        let spline1 = Spline(totalAmount, Points.amount, 0);
        // базовая ставка price
        let price = spline*(1+spline1/100);
        // учет франшизы
        price *= Franchise(this.cost, this.franchise);

        /**
         * влияние лимита по случаю на данный риск
         * 05.03.2018 поменяли totalAmount на this.park.amount(поменяли в формуле общее число траков на число траков в данном парке)
         */
        if(this.cost>=this.limit){
            price*=Limit(this.limit*this.park.amount*(1+((this.cost-this.limit)/this.limit)), this.limit);
        }
        else price*=Limit(this.cost*this.park.amount*(1+((this.limit-this.cost)/this.limit)), this.limit);
        this.baseRate=price;
        this.basePrice=this.turnover*price/100;
        //******************до сюда мы посчитали стоимость без вычетов и надбавок за риск

        //************  проверяем учли ли мы надбавку за прицеп базовых рисков для данного типа прицепа
        if(this.park.wrappings.indexOf(this.wrapping)!=-1){
            this.park.wrappings.splice(this.park.wrappings.indexOf(this.wrapping),1);
            if(this.risk!="Базовые риски"){
                //this.park.riskSum+=risks[this.wrapping];
                let spline2 = Spline(risks[this.wrapping]*this.park.riskKoef/2, Points.risk, 2);
                this.totalPrice+=this.turnover*(this.baseRate*spline2/100)/100;
            }
        }
        //************** метод определения значимости доли этого процесса во всем парке, то есть если у него меньший лимит, то и по распределению на него должно приходиться меньше нагрузка 
        const calcKoef = ()=> {
            const numOfProccesses = this.park.processes.length;
            // если процесс в парке один, то нечего считать, распределение в парке приходится только на него
            if (this.park.processes.length===1) return 1;
            
            const wrapKoefCalc = () => {
                const sumParWrapKoef = this.park.processes.reduce ((sum, val)=>{
                    // "контейнеру" присвоена 1 с целью придать ему весомости в доле
                    const wRisk = (risks[val.wrapping]===0) ? 0 : risks[val.wrapping];
                    return sum+wRisk;
                },0);
                // если сумма=0, значит у всех Контейнеры, значит мы можем вернуть всем коэф. =1 
                if (sumParWrapKoef===0) return 1;
                return numOfProccesses*risks[this.wrapping]/sumParWrapKoef;
            }
            const limitKoefCalc = () => {
                const sumParkLimits = this.park.processes.reduce ((sum, val)=>{return sum+val.limit;},0);
                const procLimitKoef = numOfProccesses*(this.limit/sumParkLimits);
                return procLimitKoef;
            }
            const turnoverKoefCalc = () => {
                const sumParkTurnover = this.park.processes.reduce ((sum, val)=>{return sum+(val.amount*val.cost);},0);
                return numOfProccesses*(this.turnover/sumParkTurnover);
            }
            //  рассчет коэф. за франшизу
            //  зависимость от франшизы обратная, чем больше франшиза у процесса, тем меньшую долю он должен занимать в общем распределнии
            // знаменатель (1-франшиза/сумму франшиз парка)
            // числитель сумма по всем процессам в парке (1-франшиза/сумму франшиз парка) 
            const franchKoefCalc = () => {
                // если есть нет ни одной не нулевой франшизы, другими словами если все равны 0 тогда коэф одинаковый 
                let flag = true;
                this.park.processes.forEach(proc=>{if (proc.franchise!==this.park.processes[0].franchise) flag=false})
                if (flag) return 1;
                // суммируем все франшизы в парке
                const sumParkFranch = this.park.processes.reduce ((sum, val)=>{
                    return sum+val.franchise;
                },0);
                const upper = 1-(this.franchise/sumParkFranch);
                const lower =  this.park.processes.reduce ((sum, val)=>{
                    return sum+(1-val.franchise/sumParkFranch);
                },0);
                return numOfProccesses*upper/lower;
            }
            const limK = limitKoefCalc();
            const limF = franchKoefCalc();
            if (limK===1||limF===1) return limK*limF;
            else return (limK*limF)/2;
        }
        //*******************считаем надбавку за риск
            // считаем коэф. надбавки по типу отсека для этого процесса 
            // calcKoef() - метод определения значимости доли этого процесса во всем парке, то есть если у него меньший лимит, то и по распределению на него должно приходиться меньше нагрузка
        const wrapRisk = risks[this.wrapping]*this.park.riskKoef*calcKoef();
            // ищем по груфику соответствующее значение по среднему между риском и надбавкой за тип отсека
        const spline2 = Spline((wrapRisk+risks[this.risk])/2, Points.risk, 2);//риски надо еще обработать
        price *= 1 + spline2 / 100;
        this.riskRate=price;
        this.riskPrice=this.turnover*price/100;
        if(this.basePrice>this.park.base){
            this.totalPrice+=this.riskPrice-this.park.base;
            this.park.base=this.basePrice;
        }
        else{
            this.totalPrice+=this.riskPrice-this.basePrice;
        }
        // SKLV 14.05.2018: change back amount if it's базовые риски
        if (writtenAmount) {
            this.amount = writtenAmount;
        }
        // найти коэф. по объему перевозок, лимитам и франшизам,по типу груза
        
    }
    remove(){
        if(this.multi && this.multi!=="deleted"){
            this.multi.processes.splice(this.multi.processes.indexOf(this),1);
        }
        // SKLV 01.06.18: delete process if it is in main object of park
        if (this.park.processes.indexOf(this)!==-1){
            this.park.processes.splice(this.park.processes.indexOf(this),1);
        }
    }
}
class Park{
    constructor(process){
        if(Array.isArray(process)){
            this.processes=process;
            process=process[0];
            this.processes.forEach((process, i)=>{
                if(i!==0) process.park=this;
            })
        }
        else this.processes=[process];
        if(process.constructor.name=="Process"){
            this.cost=process.cost;
            this.amount=process.amount;
            this.wrappings=[process.wrapping];
            this.risks=[process.risk];
            this.limit=process.limit;
            this.franchise=process.franchise;
            this.base=process.basePrice;
            this.show=true;
            process.park=this;
        }
    }
    copyPark(){
        let mass=deepCopyMultiProcess(this.processes);
        let park=new Park(mass[0]);
        return {mass, park}
    }
    changeProperty(key, value, mass){
        if(mass===undefined) mass=this.processes;
        mass.forEach(function (process) {
            process[key]=value;
            if(process.package){
                if(key!='wrapping' && key!='risk'){
                    let template=process.multi.template.filter(function (proc) {
                        return proc.risk==process.risk;
                    });
                    template=template[0];
                    let flag=false;
                    for(let prop in template){
                        if(prop==key) {
                            process[key]=template[prop]*value;
                            flag=true;
                        }
                    }
                    if(!flag) process[key]=value;
                }
                else{
                    if(key=="risk"){
                        let array=process.multi.processes.filter(function (proc) {
                            return proc.package==process.package;
                        });
                        array.forEach(function (proc) {
                            delete proc.package;
                        });
                        let multi=process.multi;
                        multi.processes.forEach(function(proc){
                            proc.multi="deleted";
                        });
                        multi.processes=[];

                    }
                }
            }
        })


    }
    getValues(){
        let wrapping=[];
        let risk=[];
        let limit=[];
        let franchise=[];
        let cost=[];
        let amount=[];
        let total=0;
        this.processes.forEach(function (proc, i) {
            total+=proc.totalPrice;
            if(wrapping.indexOf(proc.wrapping)==-1) wrapping.push(proc.wrapping);
            if(risk.indexOf(proc.risk)==-1) risk.push(proc.risk);
            if(!proc.package || proc.package && i==0){
                limit.push(proc.limit);
                franchise.push(proc.franchise);
                cost.push(proc.cost);
                amount.push(proc.amount);
            }

        });
        if(cost.length==1) this.cost=cost[0];
        else{
            let min=cost[0];
            let max=cost[0];
            for(let i=0;i<cost.length;i++){
                if(cost[i]>max) max=cost[i];
                if(cost[i]<min) min=cost[i];
            }
            if(min==max) this.cost=min;
            else this.cost=min+"-"+max;
        }
        if(amount.length==1) this.amount=amount[0];
        else{
            let min=amount[0];
            let max=amount[0];
            for(let i=0;i<amount.length;i++){
                if(amount[i]>max) max=amount[i];
                if(amount[i]<min) min=amount[i];
            }
            if(min==max) this.amount=min;
            else this.amount=min+"-"+max;
        }
        this.wrapping=wrapping;
        this.risk=risk;
        if(limit.length==1) this.limit=limit[0];
        else{
            let min=limit[0];
            let max=limit[0];
            for(let i=0;i<limit.length;i++){
                if(limit[i]>max) max=limit[i];
                if(limit[i]<min) min=limit[i];
            }
            if(min==max) this.limit=min;
            else this.limit=min+"-"+max;
        }
        if(franchise.length==1) this.franchise=franchise[0];
        else{
            let min=franchise[0];
            let max=franchise[0];
            for(let i=0;i<franchise.length;i++){
                if(franchise[i]>max) max=franchise[i];
                if(franchise[i]<min) min=franchise[i];
            }
            if(min==max) this.franchise=min;
            else this.franchise=min+"-"+max;
        }
        this.price=total;
    }
    findMaxLimit(){
        let max=0;
        this.processes.forEach(function (process){
            max=Math.max(process.limit, max);
        });
        return max;
    }
    calculateAmount(){
        let max=0;
        this.processes.forEach(function (process){
            max=Math.max(process.amount, max);
        });
        this.amount=max;
        return max;
    }
    clear(){
        this.risks=[];
        this.wrappings=[];
        this.base=0;
        this.riskKoef=0;
    }
    replaceBase(){
        if(this.processes.length==0) return false;
        let base;
        if(this.processes[0].risk=="Базовые риски") return;

        for(let i=0; i<this.processes.length; i++){
            let process=this.processes[i];
            if(process.risk=="Базовые риски"){
                base=this.processes.splice(i,1);
                this.processes.splice(0,0,base[0]);
                return false;
            }
        }
    }
    check(NO){
        this.clear();
        let wraps={};
        let mass=[];
        let sum=0,amount=0,risksum=0;
        let array=this.processes.filter(function(process){
            return process.multi!==undefined
        });
        let park=this;
        const maxAmount = park.calculateAmount();
        const amountOfBaseToMax = () => {
            park.processes.map(proc=>{
                if (proc.risk==="Базовые риски") {
                    proc.writtenAmount = proc.amount;
                    proc.amount = maxAmount;
                }
            })
        }
        const amountOfBaseChangeBack = () => {
            park.processes.map(proc=>{
                if (proc.risk==="Базовые риски") {
                    proc.amount = proc.writtenAmount;
                    delete proc.writtenAmount;
                }
            })
        }
        amountOfBaseToMax();

        array.forEach(function(process){
            //добавляем название риска процесса в массив "риски" у парка
            if(park.risks.indexOf(process.risk)==-1) park.risks.push(process.risk);
            if(!wraps.hasOwnProperty(process.wrapping)) wraps[process.wrapping]=process.amount;
            // создаем массив wraps: тип отсека - количество
            else if(wraps.hasOwnProperty(process.wrapping) && wraps[process.wrapping]<process.amount) wraps[process.wrapping]=process.amount;
            // сумма = кол-во грузов * коэф. отсека
            sum+=process.amount*risks[process.wrapping];
            amount+=process.amount;
            // сумма коэф. отсека ЗАЧЕМ?
            risksum+=risks[process.wrapping];
            // добавляем в типы отсека парка тип отсека данного процесса
            if(park.wrappings.indexOf(process.wrapping)==-1) park.wrappings.push(process.wrapping);
        });

        for(let i=0;i<this.processes.length;i++){
            delete this.processes[i].changing;//на всякий случай убираем выделение строки
            if(this.processes[i].multi===undefined) {
                if (this.risks.indexOf(this.processes[i].risk) == -1) {
                    this.risks.push(this.processes[i].risk);
                    if (!wraps.hasOwnProperty(this.processes[i].wrapping)) wraps[this.processes[i].wrapping] = this.processes[i].amount;
                    else if (wraps.hasOwnProperty(this.processes[i].wrapping) && wraps[this.processes[i].wrapping] < this.processes[i].amount) wraps[this.processes[i].wrapping] = this.processes[i].amount;


                    sum += this.processes[i].amount * risks[this.processes[i].wrapping];
                    amount += this.processes[i].amount;
                    risksum += risks[this.processes[i].wrapping];


                }
                else {
                    mass.push(new Process(this.processes.splice(i, 1)[0]));
                    if(i>0) i--;
                }
                if (this.wrappings.indexOf(this.processes[i].wrapping) == -1) this.wrappings.push(this.processes[i].wrapping);
            }

        }
        
        for(let key in wraps){
            let flag=true;
            // если в парке нет мульти узла, то надо посчитать и за него учет коэф.
            this.processes.forEach(function(process){
                if(process.wrapping==key && process.risk=="Базовые риски") flag=false;
            });
            if(flag){
                risksum+=risks[key];
                amount+=wraps[key];
                sum+=risks[key]*wraps[key];
            }
        }
        if(amount==0 || risksum==0) this.riskKoef=0;
        else this.riskKoef=sum/(amount*risksum);
        // эксперементальная функция расчета средневзвешенного коэф. по правильному, пока коэф нигде не используется
        const newAmount = this.processes.reduce((sum,proc)=>sum+proc.amount,0);
        const newWrapRisk = this.processes.reduce((sum,proc)=>{
            const wrapRisk = risks[proc.wrapping];
            return sum+wrapRisk;
        },0);
        const newSum = this.processes.reduce((sum,proc)=>{
            const wrapRisk = risks[proc.wrapping];
            return sum+(proc.amount*wrapRisk);
        },0);
        this.newRiskKoef = (newWrapRisk===0) ? 0 : (newSum)/(newAmount*this.risks.length);

        //this.riskSum=risksum;
        if(NO===undefined && this.risks.indexOf("Базовые риски")==-1 && this.processes.length==1){
            mass=this.processes;
            this.processes=[];
        }
        amountOfBaseChangeBack ();
        return mass;
    }
    cutDownLimits(a_limit){
        this.processes.forEach(function (process) {
            if(process.limit>a_limit){
                process.limit=a_limit;
                if(process.package){
                    let array=process.multi.processes.filter(function (proc) {
                        return proc.package==process.package;
                    });
                    array.forEach(function (proc) {
                        delete proc.package;
                    });
                    delete process.multi.packName;
                    delete process.multi.template;
                }
            }
        })
    }
    calculateMatrixWithAlimit(a_limit, events){//считаем сколько была бы общая премия если вместо лимита и стоимости поставить агрегатный лимит
        let overall=0;
        this.processes.forEach(function (process) {
            let cost=process.cost;
            let limit=process.limit;
            if(events){
                process.limit*=a_limit*0.33;
            }
            else{
                if(process.cost<a_limit) process.cost=a_limit;
                process.limit=a_limit;
            }
            process.calculateBase();
            overall+=process.totalPrice*1;
            process.cost=cost;
            process.limit=limit;
            process.calculateBase();
        });
        return overall;
    }
    //Сюда может передаваться коэффициент за агента, коэффициент из-за лимита и коэффициент из-за этапов
    applyKoef(koef){
        this.processes.forEach(function(process){
            process.totalPrice*=koef;
        })
    }
    applyPracticalPriceKoef(mode){
        this.processes.forEach(function(process){
            // если расчеты были загружены из БД с назначенной фактической премией, то назначаем старую цену и удаляем ее из памяти
            if (typeof (process.loadedPrice) === "number" && mode==="load") {
                if (process.loadedPrice!==0) process.practicalPriceKoef = process.loadedPrice/process.totalPrice;
                else process.practicalPriceKoef = 0;
                delete process.loadedPrice;
            }
            if(process.practicalPriceKoef!==undefined) process.totalPrice*=process.practicalPriceKoef;
            
        })
    }
    calculate(){
        this.processes.forEach(function (process) {
            process.calculateBase();
            if(process.multi && process.multi!="deleted"){
                if(process.multi.processes.length==1){
                    delete process.multi;
                }
            }
        })
    }
    getTotal(){
        let sum=0;
        this.processes.forEach(function(process){
            sum+=process.totalPrice;
        });
        return sum;
    }
    /**
     * Функция проверки наличия таких процев в парке
     * @param {array} checkProcs - проц или список процев, если это создаваемый мульти узел
     * @returns {boolean}  -  true - содержит, false - не содержит
     */
    contains(checkProcs) {
        let isContain = false;
        const pairsInPark = []; 
        this.processes.map(pr=>{
            // формируем строку с названием риска и типом отсека
            // бывают случаи, когда проц уже добавлен в парк, эти процы мы не должны учитывать
            if (!checkProcs.includes(pr)) pairsInPark.push(`${pr.risk}-${pr.wrapping}`);
        });
        checkProcs.map(pr=>{
            const pair = `${pr.risk}-${pr.wrapping}`;
            if (pairsInPark.includes(pair)) isContain = true;
        })
        return isContain;
    }
}

function replaceProcessesInParkForMulti(array){
    for(let i=1;i<array.length; i++){
        let park=array[i].park.processes;
        let previousProcess=array[i-1];
        let currentProcess=array[i];
        if( Math.abs(park.indexOf(previousProcess)-park.indexOf(currentProcess))!==1 ){
            park.splice(park.indexOf(previousProcess), 0, ...park.splice(park.indexOf(currentProcess), 1));
        }
    }
}
function deepCopyMultiProcess(array){
    let mass=[];
    array.forEach(process=>{
        if(process.constructor.name!=="Multi") mass.push(process);
        else deepCopyMultiProcess(process.processes);
    });
    let processes=[];
    mass.forEach(process=>{
        if(process.multi && process.multi!=="deleted"){
            let newProcess=new Process(process);
            newProcess.multi="create";
            processes.push(newProcess);
        }
        else processes.push(new Process(process));
    });
    return processes;
}