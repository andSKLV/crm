app.controller("polisEditorCtrl", function($scope, myFactory, $location){
    if(myFactory.polisCurrent==="" || myFactory.polisCurrent===undefined) {
        $location.path('/dashboard');
        return;
    };
    $scope.myFactory = myFactory;
    $scope.currObj=myFactory.polisCurrent.values;
    console.log($scope.currObj);
    $scope.delete=(value)=>{
        if(value.text==="") $scope.currObj.splice($scope.currObj.indexOf(value), 1);
        else value.checked=false;
    }
    $scope.newValue="";
    $scope.addNewValue=(event)=>{
        if(event.keyCode==13 && $scope.newValue!==""){
            myFactory.polisCurrent.values.push({
                text: $scope.newValue,
                checked: true
            });
            $scope.newValue="";
        } 
    }
    $scope.$on("$destroy",()=>{
        const mass=[];
        $scope.currObj.forEach((val)=>{
            if(val.text==="") mass.push(val);
        })
        if(mass.length>0){
            mass.forEach((value)=>{
                $scope.currObj.splice($scope.currObj.indexOf(value), 1);
            })
        }


    })
    let paramNumbers=1;
    $scope.addNew=(value)=>{
        $scope.currObj.splice($scope.currObj.indexOf(value)+1, 0, {
            text: "",
            checked: true,
            name: `Доп. пункт ${paramNumbers}`
        });
        paramNumbers++;
    }
    $scope.returnToDashboard=()=>{
        const mf = $scope.myFactory;
        const curr = mf.polisCurrent;
        if (curr.name===""&&curr.values.length===0) {
            // если объект пуст, то удаляем его
            const i = mf.polisObj.conditions.findIndex(val=>val.$$hashKey===curr.$$hashKey);
            if (i>=0) mf.polisObj.conditions.splice(i,1);
        }
        $scope.myFactory.cameFrom = {
            name: 'Редактор полиса',
            path: $location.$$path,
        };
        $location.path('/polis');
    };
});