/**
 * Created by RoGGeR on 17.07.17.
 */
"use strict";
app.controller("HIP", function ($http, myFactory, $rootScope, $scope) {
    $rootScope.cacheTemplate={};

    this.myFactory=myFactory;
    this.delete=function(process){
        if(process.multi && process.multi!="deleted"){
            myFactory.multi.multies.splice(myFactory.multi.multies.indexOf(process.multi), 1);
            process.multi.processes.forEach(function (proc) {
                if(process.multi.packName) delete proc.package; 
                if(proc!==process) proc.multi="deleted";
            });
            
        }
        if(process.park.processes.length>1) process.park.processes.splice(process.park.processes.indexOf(process),1);
        else myFactory.parks.splice(myFactory.parks.indexOf(process.park), 1);
        myFactory.finalCalc();
    };
    this.copy=function(process){
        let proc=new Process(process);
        process.park.processes.splice(process.park.processes.indexOf(process)+1,0,proc);
        for(let key in proc){
            if(transportProp.indexOf(key)==-1 && key!="park" && key!="totalPrice") delete proc[key];
        }
        return proc;
    };
    for(let i=0;i<this.myFactory.currObj.length; i++){
        let currObj=myFactory.currObj;
        for(let j=0; j<currObj[i].values.length;j++){
            if(currObj[i].values[j].type=="risk") risks[currObj[i].values[j].name]=currObj[i].values[j].value;
        }
    }
    $scope.$on('$destroy', function() {
        myFactory.cleanProcess();
        $rootScope.mode="";
    });
    this.consolelog=function (val) {
        console.log(val);
    };



        //let proc1=new Process({cost:5000000,amount:120, wrapping: 0, risk: 0, limit:5000000,franchise:0});
        //proc1.calculateBase();
        //console.log(proc1);


    $rootScope.mode="calc";
    let scope=this;





});
