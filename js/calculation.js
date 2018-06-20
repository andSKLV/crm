/**
 * Created by RoGGeR on 17.07.17.
 */
"use strict";
let Points={
    cost:[],
    amount:[],
    risk:[],
    payment: []
};
let MB= [[],[]];
let MC= [[],[]];
let MD= [[],[]];
let risks=[];
let koef_pow;

//FIXME: Удалить после починки пхп
let response = `[{"id":"34","x":"-4","y":"-75","number":"3"},{"id":"1030","x":"-2","y":"-37","number":"3"},{"id":"1029","x":"0","y":"0","number":"3"},{"id":"1026","x":"0.5","y":"10","number":"3"},{"id":"35","x":"1","y":"18","number":"3"},{"id":"79","x":"1","y":"100","number":"1"},{"id":"1024","x":"1.6","y":"30","number":"3"},{"id":"1025","x":"2","y":"37","number":"3"},{"id":"1002","x":"2.5","y":"43","number":"3"},{"id":"999","x":"2.652","y":"2.65","number":"999"},{"id":"1028","x":"3","y":"50","number":"3"},{"id":"1027","x":"4","y":"73","number":"3"},{"id":"37","x":"5","y":"100","number":"3"},{"id":"85","x":"25","y":"85","number":"1"},{"id":"88","x":"33","y":"80","number":"1"},{"id":"87","x":"70","y":"67","number":"1"},{"id":"86","x":"160","y":"60","number":"1"},{"id":"90","x":"200","y":"58","number":"1"},{"id":"84","x":"1000","y":"25","number":"1"},{"id":"91","x":"1500","y":"19","number":"1"},{"id":"92","x":"3500","y":"13","number":"1"},{"id":"80","x":"20000","y":"5","number":"1"},{"id":"89","x":"50000","y":"4","number":"1"},{"id":"1034","x":"70000","y":"100","number":"4"},{"id":"81","x":"80000","y":"1","number":"1"},{"id":"69","x":"100000","y":"0.035","number":"2"},{"id":"83","x":"100000","y":"0","number":"1"},{"id":"1038","x":"115000","y":"75","number":"4"},{"id":"1047","x":"160000","y":"50","number":"4"},{"id":"1036","x":"215000","y":"25","number":"4"},{"id":"1042","x":"250000","y":"18","number":"4"},{"id":"1044","x":"300000","y":"13","number":"4"},{"id":"1040","x":"350000","y":"9","number":"4"},{"id":"1045","x":"500000","y":"5","number":"4"},{"id":"16","x":"500000","y":"0.041","number":"2"},{"id":"1046","x":"700000","y":"2","number":"4"},{"id":"1037","x":"1000000","y":"0","number":"4"},{"id":"18","x":"1700000","y":"0.053","number":"2"},{"id":"1049","x":"2000000","y":"0","number":"4"},{"id":"1050","x":"3000000","y":"0","number":"4"},{"id":"19","x":"4000000","y":"0.0614","number":"2"},{"id":"1051","x":"4000000","y":"0","number":"4"},{"id":"1048","x":"5000000","y":"0","number":"4"},{"id":"20","x":"5000000","y":"0.062","number":"2"},{"id":"1043","x":"8000000","y":"0","number":"4"},{"id":"1033","x":"14000000","y":"0.0621","number":"2"},{"id":"56","x":"21500000","y":"0.0623","number":"2"},{"id":"23","x":"31000000","y":"0.06235","number":"2"},{"id":"24","x":"50000000","y":"0.0624","number":"2"},{"id":"46","x":"100000000","y":"0.065","number":"2"},{"id":"57","x":"150000000","y":"0.0685","number":"2"},{"id":"55","x":"220000000","y":"0.075","number":"2"},{"id":"54","x":"300000000","y":"0.0815","number":"2"}]`;

init();

function init() {
    loadDB();
    loadRisks();
}

async function loadRisks () {
    try {
        let currObj=[];
        const resp = await fetch("HIP.json");
        try {
            let data = await resp.json();
            currObj=data;
            if(risks.length==0){
                for(let i=0;i<currObj.length; i++){
                    for(let j=0; j<currObj[i].values.length;j++){
                        if(currObj[i].values[j].type=="risk") risks[currObj[i].values[j].name]=currObj[i].values[j].value;
                    }
                }
            }
        } catch (error) {
            console.error(`Parsing risks json failed: ${error}`);
        }   
    } catch (error){
        console.error(`Risks loading failed: ${error}`);
    }
}

function loadDB () {
    const xhr = new XMLHttpRequest();
    xhr.open("GET","loadPoints.php",true);
    xhr.send();
    xhr.onload = initDB;
}
/**
 * загружаем точки из БД
 */
function initDB() {
    //FIXME: Удалить после починки пхп
    if (this.responseText.startsWith("<")) alert ('Проблемы с php и mySQL. Работа в тестовом режиме. Обратитесь к разработчику');
    let ar = (this.responseText.startsWith("<")) ? JSON.parse(response) : JSON.parse(this.responseText);
        for(let i=0;i<ar.length;i++){
        if(ar[i]['number']*1==1) Points.amount.push([ar[i]['x']*1,ar[i]['y']*1]);
        else if(ar[i]['number']*1==2) Points.cost.push([ar[i]['x']*1,ar[i]['y']*1]);
        else if(ar[i]['number']*1==3) Points.risk.push([ar[i]['x']*1,ar[i]['y']*1]);
        else if(ar[i]['number']*1==4) Points.payment.push([ar[i]['x']*1,ar[i]['y']*1]);
        else if(ar[i]['number']*1==999) koef_pow=ar[i]['x']*1;
    }
    SplineKoeff(0, Points.amount);
    SplineKoeff(1, Points.cost); //интерполируем как жОские пацаны
    SplineKoeff(2, Points.risk); //продолжаем интерполировать как жОские пацаны
    SplineKoeff(3, Points.payment);
};

/**
 * функция получения массива значений для возможности обращения к ним через график
 * @param {number} index 
 * @param {array} mass 
 */
function SplineKoeff(index, mass)
{

    let C=[];
    let B=[];
    let D=[];
    let num=mass.length;
    let n=num-1;
    let NM1=n-1;

    if(num<2) return false;
    if(num<3){
        B[0]=(mass[1][1]-mass[0][1])/(mass[1][0]-mass[0][0]);
        C[0] = 0;
        D[0] = 0;
        B[1] = B[0];
        C[1] = 0;
        D[1] = 0;
        MB[index] = B;
        MC[index] = C;
        MD[index] = D;
        return;
    }
    else
    {
        D[0]=mass[1][0]-mass[0][0];
        C[1] = (mass[1][1] - mass[0][1]) / D[0];
        for (let i = 1; i < NM1+1; i++) {//цикл ебашит на ура
            D[i] = mass[i + 1][0] - mass[i][0]; //охуенно работает
            B[i]=2*(D[i-1]+D[i]);//охуенно работает
            C[i + 1] = (mass[i + 1][1] - mass[i][1]) / D[i];
            C[i] = C[i + 1] - C[i];
        };
        B[0] = -D[0];
        B[n] = -D[n - 1];
        C[0] = 0;
        C[n] = 0;
        if(num==3){
            for (let i = 1; i < n+1; i++) {
                let T = D[i-1] / B[i-1];
                B[i] = B[i] - T * D[i-1];
                C[i] = C[i] - T * C[i-1];
            };
            C[n] = C[n] / B[n];
            for (let IB = 1; IB < n+1; i++) {
                let i = n - IB;
                C[i] = (C[i] - D[i] * C[i + 1]) / B[i];
            };

            B[n] = (mass[n][1] - mass[NM1][1]) / D[NM1] + D[NM1] * (C[NM1] + 2 * C[n]);
            for (let i = 0; i < NM1+1; i++) {
                B[i] = (mass[i + 1][1] - mass[i][1]) / D[i] - D[i] * (C[i + 1] + 2 * C[i]);
                D[i] = (C[i + 1] - C[i]) / D[i];
                C[i] = 3 * C[i];
            };

            C[n] = 3 * C[n];
            D[n] = D[n - 1];
            MB[index] = B;
            MC[index] = C;
            MD[index] = D;
        }
        else{
            C[0] = C[2] / (mass[3][0] - mass[1][0]) - C[1] / (mass[2][0] - mass[0][0]);


            C[n] = C[n - 1] / (mass[n][0] - mass[n - 2][0]) - C[n - 2] / (mass[n - 1][0] - mass[n - 3][0]);
            C[0] = C[0] * Math.pow(D[0], 2) / (mass[3][0] - mass[0][0]);
            C[n] = -C[n] * Math.pow(D[n-1], 2) / (mass[n][0] - mass[n - 3][0]);
            for (let i = 1; i < n+1; i++) {

                let T = D[i-1] / B[i-1];
                B[i] = B[i] - T * D[i-1];
                C[i] = C[i] - T * C[i-1];
            };
            C[n] = C[n] / B[n];
            for (let IB = 1; IB < n+1; IB++) {
                let i = n - IB;
                C[i] = (C[i] - D[i] * C[i + 1]) / B[i];
            };
            B[n] = (mass[n][1] - mass[NM1][1]) / D[NM1] + D[NM1] * (C[NM1] + 2 * C[n]);
            for (let i = 0; i < NM1+1; i++) {
                B[i] = (mass[i + 1][1] - mass[i][1]) / D[i] - D[i] * (C[i + 1] + 2 * C[i]);
                D[i] = (C[i + 1] - C[i]) / D[i];

                C[i] = 3 * C[i];
            };
            C[n] = 3 * C[n];
            D[n] = D[n - 1];
            MB[index] = B;
            MC[index] = C;
            MD[index] = D;
        }

    }
}
/**
 * функция получение значения из графика
 * @param {number} U значение
 * @param {array} mass массив с точкаии
 * @param {number} index к какому из массивов обращаемся
 */
function Spline(U, mass, index){
    if (isNaN(U) || U===undefined){
        console.log("Ошибка в вычислениях, необходимо обратиться к разработчику");

        return 1;
    }
    let n=mass.length-1;
    let i=0;
    if(i>=n+1){
        i=0;
    }

    if(mass[i][0]>U){
        i=0;
        let J = n+1;//24
        let k;
        do{
            k=Math.round((i+J)/2);

            if(U<mass[k][0]){
                J=k;
            }
            if(U>=mass[k][0]){
                i=k;
            };
        }while(J>i+1);
        let dx=U-mass[i][0];
        let Spline1=mass[i][1]+dx*(MB[index][i]+dx*(MC[index][i]+dx*MD[index][i]));
        return Spline1;
    }

    if(U<=mass[i+1][0])
    {
        let dx=U-mass[i][0];
        let Spline1=mass[i][1]+dx*(MB[index][i]+dx*(MC[index][i]+dx*MD[index][i]));
        return Spline1;
    }
    else{
        i=0;
        let J = n+1;//24
        let k;
        do{
            k=Math.round((i+J)/2);//12
            if(U<mass[k][0]){
                J=k;
            }
            if(U>=mass[k][0]){
                i=k;
            };
            let g=i+1;

        }while(J>i+1);
        let dx=U-mass[i][0];
        let Spline1=mass[i][1]+dx*(MB[index][i]+dx*(MC[index][i]+dx*MD[index][i]));
        return Spline1;

    }

}
/**
 * функция получения франшизы, единица минус корень квадратный из франшизы деленной на стоимость
 * @param {number} cost 
 * @param {number} franchise 
 */
function Franchise(cost, franchise){
    if(franchise<cost){

        return 1-Math.pow(franchise/cost, 0.5);
    }
    else if(franchise>=cost) return 0;
}




function BubbleSort(mass)       // A - массив, который нужно
{
    let A=[];
    for(let key in mass){
        A.push(mass[key]);
    }

                   // отсортировать по возрастанию.
    let n = A.length;
    for (let i = 0; i < n-1; i++){
        for (let j = 0; j < n-1-i; j++){
            if (A[j+1][0] < A[j][0]){
                let t = A[j+1]; A[j+1] = A[j]; A[j] = t;
            }
        }
    }
    return A;    // На выходе сортированный по возрастанию массив A.
}
function Limit(cost, limit){
    return Math.pow(limit/cost, 1/koef_pow)
};

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function addSpaces(nStr) {
    nStr += '';
    let x = nStr.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    return x1 + x2;
}