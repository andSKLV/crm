app.controller("polisEditorCtrl", function($scope, myFactory, $location,$http){
    if(myFactory.polisCurrent==="" || myFactory.polisCurrent===undefined) {
        $location.path('/dashboard');
        return;
    };
    $scope.myFactory = myFactory;
    $scope.currObj=myFactory.polisCurrent.values;
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
    $scope.inputHandler = (e,i) => {
        if (e.keyCode===13) {
            $scope.newDashboard.setCurrentPage($scope.newDashboard.next(i));
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
    $scope.returnToDashboard = async () => {
        const mf = $scope.myFactory;
        const curr = mf.polisCurrent;
        const i = mf.polisObj.conditions.findIndex(val => val.$$hashKey === curr.$$hashKey);
        if (curr.name === "" || curr.values.length === 0) {
            // если объект пуст, то удаляем его или без имени
            if (i >= 0) mf.polisObj.conditions.splice(i, 1);
        }
        $scope.saveAddition(i);
        $scope.myFactory.cameFrom = {
            name: 'Редактор полиса',
            path: $location.$$path,
        };
        $location.path('/polis');
    };
    $scope.saveAddition = (ind) => {
        const pc = $scope.myFactory.polisCurrent;
        if (!pc.isNew) return false;
        else if (pc.name === ''||pc.values.length===0) return false;
        else if (pc.startName===pc.name) return false;
        // создаем строку для сохранения в базу данных с разделителем /CBL/
        const text = pc.values.reduce((acc,val,i)=>{
            return `${acc}${val.text}/CBL/`;
        },'');
        if (text.length===0) return false;
        
        const query = {};
        query.type = 'addition_save';
        query.name = pc.name;
        query.text = text;
        pc.isNew = false;
        $http.post('./php/save.php',query).then(resp=>{
            const id = resp.data;
            if (Number.isNaN(Number(id))===NaN) console.error('ошибка сохранения оговорок ' + resp.data);
            else $scope.myFactory.polisObj.conditions[ind].id = resp.data;
        },err=>{

        })
        debugger;
    }
    $scope.newDashboard={
        TITLE_INDEX:-1,
        ADD_INDEX: ()=>{return $scope.currObj.length},
        currentPage: null,
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
        next(ind){
            const nextI = ind + 1;
            if (nextI>$scope.currObj.length) return ind;
            if (nextI===$scope.currObj.length) return this.ADD_INDEX;
            else return nextI;
        },
        checkCurrentPage(index){
            if (index === 'add') index = this.ADD_INDEX;
            if (index === 'title') index = this.TITLE_INDEX;
            return index===this.currentPage;
        },
        setCurrentPage(index){
            if ($scope.myFactory.polisCurrent.name.trim() === '') index = 'title'; // если имя не задано, то нельзя переключиться
            // если оговорки из загруженных, то нельзя менять их структуру, поэтому при очистке поля нельзя переключиться, пока оно не будет заполнено
            if (!$scope.myFactory.polisCurrent.isNew &&
                this.currentPage!==null && Number(this.currentPage)>this.TITLE_INDEX && Number(this.currentPage)<this.ADD_INDEX() &&
                $scope.myFactory.polisCurrent.values[this.currentPage].text==='') index=this.currentPage; 
            if (index === 'add') index = this.ADD_INDEX;
            if (index === 'title') index = this.TITLE_INDEX;
            this.previousPage=this.currentPage;
            this.currentPage=index;
            setTimeout(()=> document.querySelector('.input_polisEditor').focus(),400);
        },
        alreadySelected(index) {
            switch (index) {
                case 0:
                    return (myFactory.companyObj.isFull);
                    break;
                case 1:
                    return myFactory.parks.length>0;
                    break;
                default:
                    return false;
                break;
            }
        }
    }
    $scope.init = () => {
        $scope.newDashboard.setCurrentPage('title');
        if (!$scope.myFactory.polisCurrent.isNew) $scope.myFactory.polisCurrent.startName = $scope.myFactory.polisCurrent.name;
    }
    $scope.getCheckedConditions = () => {
        return $scope.currObj.filter(val=>val.checked).length;
    }
    $scope.init();
});