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
let risks=[];
let koef_pow;
let xhr = new XMLHttpRequest();
xhr.open("GET","loadPoints.php",true);
xhr.send();
/**
 * загружаем точки из БД
 */
xhr.onload = function() {
    let ar=JSON.parse(this.responseText);
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
let MB= [[],[]];
let MC= [[],[]];
let MD= [[],[]];
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