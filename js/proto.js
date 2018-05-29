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
    open(multies, key){
        if(this.risk.length>1 && this.wrapping.length>1 || this.wrapping.length>1 && this.packName || this.packName!==undefined && this.risk.length>1){
            let mass=this.processes;
            this.processes=[];
            let multi=this;
            let massive=[];
            if(key=="risk" && this[key].length==1 && this.packName){
                massive.push("Базовые риски");
                this.template.forEach(function (templateProcess) {
                    massive.push(templateProcess.risk);
                });
                massive.forEach(function (val) {
                    let array=mass.filter(process=>process[key]==val);
                    replaceProcessesInParkForMulti(array);
                    let newMulti=new Multi(array);
                    multies.push(newMulti);
                    multi.processes.push(newMulti);
                    array.forEach(function (process) {
                        process.multi=multi.processes[multi.processes.length-1];
                    });
                });
                this.processes.forEach(function (multik) {
                    multik.calculatePrice();
                    multik.parent=multi;
                })
            }
            else if(this.risk.length>1 && this.packName && this.wrapping.length==1){
                let array=mass.filter(process=>process.package==this.packName);
                replaceProcessesInParkForMulti(array);
                let newMulti=new Multi(array);
                multies.push(newMulti);
                multi.processes.push(newMulti);
                array.forEach(function (process) {
                    process.multi=newMulti;
                });
                newMulti.calculatePrice();
                newMulti.parent=this;
                newMulti.template=this.template;
                newMulti.packName=this.packName;
                newMulti.risk=[this.packName];
                mass.forEach(process=>{
                    if(process.package===undefined) this.processes.push(process);
                })

            }
            else {
                this[key].forEach(function (val) {
                    if(val==multi.packName){
                        let array=mass.filter(function (process) {
                            return process["package"]==val;
                        });
                        let newMulti=new Multi(array);
                        multies.push(newMulti);
                        multi.processes.push(newMulti);
                        array.forEach(function (process) {
                            process.multi=multi.processes[multi.processes.length-1];
                        });
                        multi.processes[multi.processes.length-1].packName=multi.packName;
                        multi.processes[multi.processes.length-1].template=multi.template;

                    }
                    else{

                        let pack=true;
                        let array=mass.filter(process=>process[key]==val);
                        replaceProcessesInParkForMulti(array);
                        let newMulti=new Multi(array);
                        multies.push(newMulti);
                        multi.processes.push(newMulti);
                        if(multi.packName){
                            let flag=false;
                            array.forEach(process=>process.package===multi.packName ? flag=true : flag=false);
                            if(flag){
                                newMulti.packName=multi.packName;
                                newMulti.template=multi.template;
                            }

                        }
                        array.forEach(process=>{
                            if(!process.package) pack=false;
                            process.multi=multi.processes[multi.processes.length-1];
                        });
                        if(pack){
                            multi.processes[multi.processes.length-1].packName=multi.packName;
                            multi.processes[multi.processes.length-1].template=multi.template;
                        }
                    }

                });
                this.processes.forEach(multik=>{
                    multik.calculatePrice();
                    multik.parent=multi;
                })
            }
        }
        else if(this.wrapping.length>1 && this.risk.length==1){
            replaceProcessesInParkForMulti(this.processes);
        }

        console.log(multies);
        this.show=true;
        multies.forEach(multi=>multi.getValues());
    }
    close(multies, toParent){
        if(toParent){
            let mass=[];
            let multi=this;
            this.processes.forEach(function (multik) {
                if(multik.constructor.name==="Process") mass.push(multik);
                else{
                    multik.processes.forEach(function (process) {
                        process.multi=multi;
                        mass.push(process);
                    });
                    multies.splice(multies.indexOf(multik), 1);
                }

            });
            this.processes=mass;
        }
        let mass=this.processes.filter(process=>process.constructor.name==="Multi");
        mass.forEach(multi=>{
            multi.processes.forEach(process=>{
                this.processes.push(process);
                process.multi=this;
            });
            this.processes.splice(this.processes.indexOf(multi),1);
            multies.splice(multies.indexOf(multi), 1);
        });
        this.show=false;
        this.calculatePrice();

    }
    changeProperty(key, value){
        let multi=this;
        this.processes.forEach(function (process) {
            if(process.package){
                if(multi.parent===undefined){
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
            this[key]=process[key];
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
        this.turnover=this.cost*this.amount;
        let spline = Spline(this.cost, Points.cost, 1);
        let spline1 = Spline(totalAmount, Points.amount, 0);
        let price = spline*(1+spline1/100);
        console.log(this.park);
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
        //**************

        //*******************считаем надбавку за риск
        let spline2 = Spline((risks[this.wrapping]*this.park.riskKoef+risks[this.risk])/2, Points.risk, 2);//риски надо еще обработать
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
    }
    remove(){
        if(this.multi && this.multi!=="deleted"){
            this.multi.processes.splice(this.multi.processes.indexOf(this),1);
        }
        this.park.processes.splice(this.park.processes.indexOf(this),1);
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
        array.forEach(function(process){
            if(park.risks.indexOf(process.risk)==-1) park.risks.push(process.risk);
            if(!wraps.hasOwnProperty(process.wrapping)) wraps[process.wrapping]=process.amount;
            else if(wraps.hasOwnProperty(process.wrapping) && wraps[process.wrapping]<process.amount) wraps[process.wrapping]=process.amount;
            sum+=process.amount*risks[process.wrapping];
            amount+=process.amount;
            risksum+=risks[process.wrapping];

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
         /*   risksum+=risks[key];
            amount+=wraps[key];
          sum+=risks[key]*wraps[key];
          */
            let flag=true;
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
        //this.riskSum=risksum;
        if(NO===undefined && this.risks.indexOf("Базовые риски")==-1 && this.processes.length==1){
            mass=this.processes;
            this.processes=[];
        }
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
    applyKoef(koef){
        this.processes.forEach(function(process){
            process.totalPrice*=koef;
        })
    }
    applyPracticalPriceKoef(){
        this.processes.forEach(function(process){
            if(process.practicalPriceKoef) process.totalPrice*=process.practicalPriceKoef;
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
        this.cars=[];
        const carsNumber=this.amount/24;
        for(let i=0; i<carsNumber; i++){
            this.cars.push({
                number: ""
            })
        }
        this.processes.forEach(process=>{
            if(process.amount===this.amount){
                process.cars=this.cars;
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