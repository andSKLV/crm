/**
 * Created by RoGGeR on 17.07.17.
 */
"use strict";
app.controller("HIP", function ($http, myFactory, $rootScope, $scope) {
    $rootScope.cacheTemplate={};

    this.myFactory=myFactory;
    this.delete=function(process){
        if(process.multi) {
            if (process.multi.parent) {
                let parentMulti = process.multi.parent;
                // если есть родитель, убираем у родителя ребенка
                parentMulti.processes.splice (parentMulti.processes.indexOf(process.multi),1);
                if (parentMulti.processes.length<2)
                // если у родителя остался один ребенок, то убираем родителя
                    parentMulti.processes.forEach(function (multik) {
                    delete multik.parent;
                });
            }
            //удаляем процесс из мульти
            process.multi.processes.splice(process.multi.processes.indexOf(process),1); 
        }
        if(process.park.processes.length>1) {
            //удаляем процесс из парка
            process.park.processes.splice(process.park.processes.indexOf(process),1);
        }
        // если процесс единственный в парке, удаляем парк
        else myFactory.parks.splice(myFactory.parks.indexOf(process.park), 1);
        myFactory.finalCalc();
    };
    this.copy=function(process){
        let proc=new Process(process);
        process.park.processes.splice(process.park.processes.indexOf(process)+1,0,proc);
        for(let key in proc){
            if(transportProp.indexOf(key)==-1 && key!="park" && key!="totalPrice") delete proc[key];
        }
        myFactory.fixHeight();
        return proc;
    };
    if (this.myFactory.currObj) {
        for(let i=0;i<this.myFactory.currObj.length; i++){
            let currObj=myFactory.currObj;
            for(let j=0; j<currObj[i].values.length;j++){
                if(currObj[i].values[j].type=="risk") risks[currObj[i].values[j].name]=currObj[i].values[j].value;
            }
        }
    }
    $scope.$on('$destroy', function() {
        myFactory.cleanProcess();
        $rootScope.mode="";
    });
    this.consolelog=function (val) {
        console.log(val);
    };

    $rootScope.mode="calc";
    let scope=this;

});
