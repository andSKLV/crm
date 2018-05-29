/**
 * Created by RoGGeR on 14.06.17.
 */
app.controller('searchCtrl', function($rootScope,$http,$q,$location,myFactory){
    this.myFactory=myFactory;

    $rootScope.cacheTemplate={};
    let scope=this;

    this.makeSearch=(param)=>{
        this.isEmptyQuery(param.values) ? this.isEmptyObject(this.template) ? this.search(param.values, param.url) : this.checkTemplate(param.values) ? this.searchFilter(param.values) : this.search(param.values, param.url) : this.clean();
    }
    this.searchForPolis= ({type, value}) => {
        if(value=="" || value.length<=2) this.clean();
        if($rootScope.search_result.length==0) scope.template={};
        
        if(this.isEmptyObject(this.template)){
            this.search(
                [{
                    model:"name",
                    name:"Название",
                    val: value
                }]
                , type
            );
        }
        else{
            if(this.checkTemplate([{
                model:"name",
                name:"Название",
                val: value
            }])){
                this.searchFilter([{
                    model:"name",
                    name:"Название",
                    val: value
                }])
            }
            else{
                this.search(
                    [{
                        model:"name",
                        name:"Название",
                        val: value
                    }]
                    , type
                );
            }
        }
        

    }
    this.isEmptyObject = (obj) => {//функция проверки объекта на пустоту
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                return false;
            }
        }
        return true;
    };

    this.searchFilter=function(values){
        for(let i=0; i<values.length; i++){
            let obj=values[i];
            if(obj.val=="") $rootScope.cacheTemplate[obj.model]=undefined;
            else if(obj.model=="contact"){
                $rootScope.cacheTemplate.contact={};
                if(isNaN(obj.val)) $rootScope.cacheTemplate.contact["name"]=obj.val;
                else $rootScope.cacheTemplate.contact["phone"]=obj.val;
            }
            else $rootScope.cacheTemplate[obj.model]=obj.val;
        }

    };
    this.template={};//объект шаблон, необходимый для запроса к бд и дальнейшему решению искать ли в кэше или заново обращаться к бд
    this.checkTemplate=function(values){//проверка шаблона
        let obj;
        for(let i=0;i<values.length;i++){
            if(values[i].model===scope.template.model){

                obj=values[i];
                i=values.length;
            }

        }
        if(obj) return obj.val.search(scope.template.txt)==0;
        else return false;
    };
    this.search = function( values , type) {
        let data={};
        if(type=="Компания"){
            data.type="find_company";
            values[0].db="companies";
        } 
        if(type=="calculationActions") data.type="find_calculation";
        else data.type=type;

        if(scope.abort){
            scope.abort.resolve();
        }
        scope.abort = $q.defer();
        let flag=this.isEmptyQuery(values);
        data.value=flag;

        scope.template.txt=flag.val;
        scope.template.model=flag.model;

        $http.post("search.php", data,{timeout:scope.abort.promise}).then(function success (response) {



                scope.myFactory.matrixType=type;

                $rootScope.cacheTemplate={};

                $rootScope.search_result=response.data;
                if(type!=="Компания"){
                    $rootScope.search_result.forEach(row=>{
                        if(row.fact_premia.indexOf(" ")!==-1){
                            let fact_price=row.fact_premia.split(" ");
                            if(fact_price[0]=="undefined" || fact_price[0]==0) delete row.fact_premia;
                            else row.fact_premia=fact_price[0];
                        }
                        else if(row.fact_premia.indexOf(";")!==-1){
                            let fact_price=row.fact_premia.split(";");
                            if(fact_price[0]=="" || fact_price[0]==0) delete row.fact_premia;
                            else row.fact_premia=fact_price[0];
                        }

                    });
                }   
            },function error (response){
                console.log(response);
            }
        );
    };
    this.clean=function(){//очищаем все результаты поиска
        $rootScope.search_result=[];//<==== обнуляется массив
        scope.template={};
    };
    this.isEmptyQuery=function(values){

        let data={};
        data.values=values;
        let flag = data.values.find(function(element){// функция проверяет введено ли хоть в одно поле поиска значение, если нет - обнуляется массив
            return element.val != '' && element.val!=undefined && element.val.length>1
        });
        return flag;
    };
    


});