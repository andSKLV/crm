/**
 * Класс для работы с PDF
 */
class PolisMaker{
    constructor () {
        this.carsTables = [];
    }
    /**
     * Перераспределяем машины по спискам
     * @param {object} myFactory объект с практически всеми нужными данными
     * @return {array} массив со списками машин
     */
    makeCarLists(myFactory) {
        let lists=[];
        myFactory.parks.forEach((park, parkNumber)=>{    
            park.processes.forEach((process, i)=>{
                let wasIndex = null;
                for (let k=0;k<i;k++) {
                    if (this.areEquivalent(park.processes[i]["cars"],park.processes[k]["cars"])) {
                        wasIndex = k;
                        break;
                    }
                }
                if(i==0 || wasIndex===null){
                    lists.push(
                        {
                            cars: park.processes[i]["cars"],
                            processes: [park.processes[i]],
                            risks: [park.processes[i].risk]
                        }
                    )
                }
                else{
                    lists[wasIndex].processes.push(park.processes[i]);
                    lists[wasIndex].risks.push(park.processes[i].risk);
                }              
            });
        });
        return lists;
    }
    /**
     * Функция проверки двух соседних строк на идентичность машин, к которым относятся данные строки
     * @param  {array} mass1
     * @param  {array} mass2
     * @return {boolean} возвращает true, если машины идентичны
     */
    areEquivalent(mass1, mass2) {
        if (mass1.length!==mass2.length) return false;
        for(const car of mass1){
            if(!mass2.includes(car)) return false;
        }
        return true;
    }
    /**
     * Создаем массив, который представляет из себя таблицы с рисками и номерами машин
     * @param {object} myFactory объект с практически всеми нужными данными
     * @return {arrayOfTables}
     */
    makeTables(myFactory) {
        const emptyCell = {
            text: '',
            border: [false,false,false,false],
        }
        let body=[];
        const lists=this.makeCarLists(myFactory);
        const listContent=[];
        let listCount=1;
        let table={
            style: 'table',
            table: {
                headerRows: 1,
                widths:[40,61,65,60,97,60,60],
                body: [
                    [   {
                            text: 'Список ТС, №',
                            style: 'firstHeader',
                            border: [false, false, false, false],
                        },
                        {
                            text:'Страховая стоимость, руб.', 
                            style:"firstHeader",
                            border: [false, false, false, false],
                        },
                        {
                            text:`Количество ${myFactory.amountType}`,
                            style:"firstHeader", 
                            border: [false, false, false, false],
                        },
                        {
                            text:'Тип грузового отсека', 
                            style:"firstHeader",
                            border: [false, false, false, false],
                        },
                        {
                            text:'Застрахованные риски', 
                            style:"firstHeader",
                            border: [false, false, false, false],
                        },
                        {
                            text:'Лимит по случаю, руб.', 
                            style:"firstHeader",
                            border: [false, false, false, false],
                        },
                        {
                            text:'Франшиза по случаю, руб.',
                            style:"firstHeader",
                            border: [false, false, false, false],
                        }
                    ]
                ]
            },
            layout: {
                fillColor: function (i, node) {
                    return (i % 2 === 0) ? '#e6e6e6' : null;
                }
            }
        }
        lists.forEach((list) => {
            let tableContent = table.table.body;
            /**
             * Функция подсчета количества строк в наименовании риска
             */
            const countRows = (str) => {
                const arr = str.split(' ');
                if (arr.length === 1) return 1;
                let rows = 1;
                let len = arr[0].length;
                for (let i = 1; i < arr.length; i++) {
                    len = len + arr[i].length + 1;//1 это пробел между словами
                    if (len > 19) {
                        rows++;
                        len = arr[i].length;
                    }
                }
                return rows;
            }
            const getMargin = (rows) => {
                let rowMargin;
                switch (rows) {
                    case 1:
                        rowMargin = [0, 13, 0, 13]
                        break;
                    case 2:
                        rowMargin = [0, 5, 0, 5]
                        break;
                    case 3:
                        rowMargin = [0, 0, 0, 0]
                        break;
                    default:
                        rowMargin = [0, 0, 0, 0]
                        break;
                }
                return rowMargin;
            }
            
            list.processes.forEach((process, i) => {
                const row = [];
                const properties = ["cost", "amount", "wrapping", "risk", "limit", "franchise"];
                const rows = countRows(process.risk);
                const riskMargin = getMargin(rows);
                const bigMargin = [0,13,0,13];
                const listCountCell = {
                    text: `${listCount}`,
                    border: [false, false, false, false],
                    margin: bigMargin
                };
                
                row.push(listCountCell);
                properties.forEach((property) => {
                    if (property == "amount") {
                        if (myFactory.amountType == "Тягачей") {
                            row.push(
                                {
                                    text: `${process[property] / 24}`,
                                    border: [false, false, false, false],
                                    margin: bigMargin,
                                }
                            );
                        }
                        else {
                            row.push(
                                {
                                    text: `${process[property]}`,
                                    border: [false, false, false, false],
                                    margin: bigMargin,
                                }
                            );
                        }
                    }
                    else if (property == "cost" || property == "limit" || property == "franchise") {
                        row.push(
                            {
                                text: this.addSpaces(process[property]),
                                border: [false, false, false, false],
                                margin: bigMargin,
                                // alignment: 'right',
                            });
                    }
                    else if (property=='risk') {
                        row.push({
                            text: process[property],
                            border: [false, false, false, false],
                            margin: riskMargin,
                        });
                    }
                    else {
                        row.push({
                            text: process[property],
                            border: [false, false, false, false],
                            margin: bigMargin,
                        });
                    }
                })
                tableContent.push(row);
            })

            
            this.carsTables.push('\n');
            const tableCar={
                style: 'table',
                table: {
                    headerRows: 2,
                    widths:[29,73,141,58,159],
                    body: [
                        [
                            {
                                text:`Список ТС №${listCount}`,
                                border:[false,false,false,false],
                                colSpan:3,
                                alignment:'left'
                            },
                            emptyCell,
                            emptyCell,
                            emptyCell,
                            emptyCell
                        ],
                        [
                            {
                                text:'п/п',
                                style:"firstHeader" 
                            },
                            {
                                text:'Номер', 
                                style:"firstHeader",
                            },
                            {
                                text:`VIN`,
                                style:"firstHeader", 
                            },
                            {
                                text:'Год', 
                                style:"firstHeader",
                            },
                            {
                                text:'Марка', 
                                style:"firstHeader",
                            }
                        ]
                    ]
                },
            }
            const tableContentCar=tableCar.table.body;
            // данные по машинам
            list.cars.forEach((car,i)=>{
                tableContentCar.push(
                    [
                        {
                            text: i+1,
                            style: 'carInfo',
                        },
                        {
                            text: car.data.autNumber,
                            style: 'carInfo',
                        }
                        ,
                        {
                            text: car.data.VIN,
                            style: 'carInfo',
                        },
                        {
                            text: car.data.prodYear,
                            style: 'carInfo',
                        },
                        {
                            text: car.data.model,
                            style: 'carInfo',
                        }
                    ]
                )
            })
            this.carsTables.push(tableCar);
            listCount++;
        })
        listContent.push(table, "\n");
        return listContent;
    }
    /**
     * Преобразуем число из 1000000 в 1 000 000 (то есть добавляем пробелы между)
     * @param  {string} nStr 1000000
     * @return {string} 1 000 000
     */
    addSpaces(nStr) {
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
    /**
     * Преобразуем в нужный формат "оговорки и условия"
     * @param  {object} myFactory объект с практически всеми нужными данными
     * @return {array} возвращаем подготовленные для формата pdf данные
     */
    makeParagraphs(myFactory) {
        const paragraphs=[];
        let parIndex = 2;
        myFactory.polisObj.conditions.forEach(obj=>{
            if(obj.name==="Базовые риски"){
                return;
            }
            if (obj.const) return;
            let paragraph={};
            paragraph.widths=[30, 457];
            paragraph.keepWithHeaderRows=1;
            paragraph.body=[
                [       
                    { 
                        text: `${parIndex}. ${obj.name}:`,
                        style: "firstHeader",
                        colSpan:2,
                        border: [false,false,false,false],
                    },
                    {},
                ]
            ];
            let mass=obj.values.filter(({checked})=>checked);
            mass.forEach((param, num)=>{
                let arr=[];
                arr.push({
                    text:`${parIndex}.${num+1}`,
                    border: [false,false,false,false],
                },{
                    text:param.text,
                    border: [false,false,false,false],
                })
                paragraph.body.push(arr);
                paragraph.headerRows= 1;
            });
            let layout = {
                fillColor: function (i, node) {
                    return (i % 2 === 0) ? '#e6e6e6' : null;
                }
            }
            paragraphs.push({
                table:paragraph,
                layout
            },"\n");
            parIndex++;
        });
        return paragraphs;
        
    }
    /**
     * Создаем два списка
     * 1. Застрахованные риски
     * 2. Незастрахованные риски
     * @param  {object} myFactory объект с практически всеми нужными данными
     * @return {array} возвращаем подготовленные для формата pdf данные
     */
    makeRisksList(myFactory, risks) {
        /**
         * преобразуем массив данных в объект, который войдет в PDF файл в виде списка
         * @param  {array} list массив с рисками
         * @param  {boolean} included определяет какой именно это должен быть список, если true - значит застрахованные риски, 
         * @param  {object} baseRisk объект с данными о базовых рисках
         * @return {object}
         */
        const prepareListToPDF=({list, included, baseRisk})=>{
            const table={
                headerRows: 1,
                widths:[30, 457],
                body:[]
            };
            if(included){
                table.body.push([
                    {
                        text: '1.1 Определения застрахованных рисков:',
                        style: "firstHeader",
                        colSpan: 2,
                        border: [false,false,false,false],
                    },
                    {}
                ])
                let count=1;
                if(baseRisk.ToPDFinclude){
                    table.body.push([
                        {
                            text: `1.1.${count}`,
                            border: [false,false,false,false],
                        },
                        {
                            stack: baseRisk.ToPDFinclude,
                            border: [false,false,false,false]
                        }
                    ]);
                    count++;
                } 
                for(const risk of list){
                    table.body.push([
                        {
                            text: `1.1.${count}`,
                            border: [false,false,false,false],
                        },
                        {
                            text: `${risk.name} - ${risk.title.toLowerCase()}. `,
                            border: [false,false,false,false],
                        }
                        
                    ])
                    count++;
                }
            }
            else{
                table.body.push([
                    {
                        text: '1.2 Определения не заявленных на страхование рисков:',
                        style: "firstHeader",
                        colSpan: 2,
                        border: [false,false,false,false],
                    },
                    {}
                ])
                let count=1;
                if(baseRisk.ToPDFnotInclude){
                    table.body.push([
                        {
                            text: `1.2.${count}`,
                            border: [false,false,false,false],
                        },
                        {
                            stack: baseRisk.ToPDFnotInclude,
                            border: [false,false,false,false]
                        },
                    ]);
                    count++;
                } 
                for(const risk of list){
                    table.body.push([
                        {
                            text: `1.2.${count}`,
                            border: [false,false,false,false],
                        },
                        {
                            text: `${risk.name} - ${risk.title.toLowerCase()}. `,
                            border: [false,false,false,false],
                        }
                        
                    ])
                    count++;
                }
            }
            let layout = {
                fillColor: function (i, node) {
                    return (i % 2 === 0) ? '#e6e6e6' : null;
                }
            }
            return {
                table,
                layout,
            };
        }
        let content=[];
        /** 
         * После таблиц с номерами авто и рисками идет перечисление застрахованных и незастрахованных рисков 
         * Начинаем с базовых рисков
         * Если они включены(по умолчанию включены)
         */
        let baseRisk=Object.assign({},myFactory.polisObj.conditions.filter((paragraph)=>{
            return paragraph.name=="Базовые риски";
        })[0]);
        baseRisk.ToPDFinclude=["Базовые риски:"];
        baseRisk.ToPDFnotInclude = ['Базовые риски:'];
        if(baseRisk){
            /**
             * если базовые риски включены - значит они в этом массиве не нужны, удаляем их 
             */
            risks=risks.filter(({name})=>{
                return name!=="Базовые риски";
            })
            /**
             * Сначала отбираем те параметры базовых рисков, которые включены, а затем делаем из них массив строк
             */
            const baseInclude = [];
            const baseNotInlude = [];
            
            baseRisk.values.forEach((val)=>{
                if (val.checked) baseInclude.push(val.text) 
                else baseNotInlude.push(val.text);
            });
            baseRisk.ToPDFinclude.push(
                {
                    type: 'square',
                    ul: baseInclude,
                }
            )
            baseRisk.ToPDFnotInclude.push(
                {
                    type: 'square',
                    ul: baseNotInlude,
                }
            )
            if (baseInclude.length===0) delete baseRisk.ToPDFinclude;
            if (baseNotInlude.length===0) delete baseRisk.ToPDFnotInclude;
        }
        /**
         * Дальше перечисляем сначала те риски, которые застрахованы, а также к каким перечням(спискам) машин они относятся
         * Для начала раскидаем машины по спискам
         */
        let lists=this.makeCarLists(myFactory);
        /**
         * Затем определим, какие риски и куда входят
         */
        for(const risk of risks){
            risk.list=[];
            lists.forEach((list, i)=>{
                if (list.risks.includes(risk.name)) risk.list.push(i+1);
            });
        }
        /**
         * Остается лишь преобразовать профильтрованные данные в формат pdf
         */
        const includedRisks=risks.filter((risk)=>{
            return risk.list.length>0
        });
        content.push(prepareListToPDF(
            {
                list: includedRisks, 
                included: true,
                baseRisk
            }), "\n"
        );
        const notIncludedRisks=risks.filter((risk)=>{
            return risk.list.length==0
        })
        content.push(prepareListToPDF(
            {
                list: notIncludedRisks, 
                included: false,
                baseRisk
            }), "\n"
        );
        return content;
    }
    /**
     * Создаем строку с описанием территории страхования на основе оговорки 
     * @param {object}  myFactory
     */
    makeTerritory (myFactory) {
        const territoryVals = [];
        myFactory.polisObj.conditions.find(c=>c.type==='territory').values.forEach(v=>{
            if (v.checked) territoryVals.push(v.text.toUpperCase());
        });
        return territoryVals.join(', ');
    }
    /**
     * Основная функция, создает на основе данных расчета и компании файл PDF и скачивает его
     * @param  {object} myFactory объект с практически всеми нужными данными
     * @param  {array} risks Список рисков с описанием
     */
    makePDF(myFactory, risks){
        const emptyCell = {
            text: '',
            border: [false,false,false,false],
        }
        const oneRowMargin = [0,10,0,10];
        const twoRowMargin = [0,5,0,5]; 
        // собираем стоку с данными о территории страхования
        const territory = this.makeTerritory (myFactory);
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [ 50, 115, 50, 65 ],
            content: [
                {
                    table: {
                        headerRows: 1,
                        widths:[150, 150, 150],
                        body: [
                            [
                                { 
                                    text: [
                                        "ПОЛИС CMR/ТТН - СТРАХОВАНИЯ ПЕРЕВОЗЧИКА \n", 
                                        "№ HIP-0000000-00-17"
                                    ],
                                    colSpan: 3,
                                    style: 'firstHeader' ,
                                    fontSize: 20,
                                    fillColor: '#e6e6e6',
                                },
                                {},
                                {}
                            ],
                            [
                                {
                                    text: "Страхование действует в соответствии с Договором CMR/ТТН - страхования перевозчика № HIP-1000000-0-17.",
                                    colSpan: 3,
                                    fontSize: 10,
                                    alignment:'center'
                                },
                                {},
                                {}
                            ],
                            
                            
                        ],
                        style: 'table',
                    },
                    layout: {// цвет границы 
                        hLineColor: '#e6e6e6',
                        vLineColor: '#e6e6e6',
                    }
                },
                '\n',
                {
                    table: {
                        headerRows: 1,
                        widths:[150, 150, 150],
                        body: [
                            [
                                {
                                    text: "СТРАХОВЩИК",
                                    style: "leftCellFirstTable",
                                    margin: oneRowMargin,
                                },
                                {
                                    text:[
                                        { 
                                            text:"ООО «СК «КАПИТАЛ-ПОЛИС»\n",
                                            bold: true,
                                        },
                                        {
                                            text:"Московский пр., д.22, лит. 3, Санкт-Петербург, 190013\n",
                                            fontSize: 10
                                        }
                                    ],
                                    colSpan: 2,
                                    alignment:'center',
                                    margin: twoRowMargin,
                                },
                                {}
                            ],
                            [
                                {
                                    text: "ПЕРИОД СТРАХОВАНИЯ",
                                    style: "leftCellFirstTable",
                                    margin: oneRowMargin
                                },
                                {
                                    text:`${myFactory.polisObj.dates.start} - ${myFactory.polisObj.dates.end}`,
                                    alignment: 'center',
                                    bold: true,
                                    colSpan:2,
                                    margin: oneRowMargin
                                }
                            ]
                        ],
                        style: 'table',
                    },
                    layout: {// цвет границы 
                        hLineColor: '#e6e6e6',
                        vLineColor: '#e6e6e6',
                    }
                },
                "\n",
                {
                    table: {
                        headerRows: 1,
                        widths:[150, 150, 150],
                        body: [
                            [
                                {
                                    text: "СТРАХОВАТЕЛЬ",
                                    style: "leftCellFirstTable",
                                    margin: oneRowMargin
                                    
                                },
                                {
                                    text:[
                                        { 
                                            text:`${myFactory.newClientCard["Данные компании"]["Форма организации"]} ${myFactory.newClientCard["Данные компании"]["Наименование организации"].toUpperCase()}\n`,
                                            bold: true,
                                        },
                                        { 
                                            text:"**Здесь должен быть адрес компании**",
                                            fontSize: 10,
                                        }
                                        
                                    ],
                                    colSpan: 2,
                                    alignment:'center',
                                    margin: twoRowMargin
                                },
                            ],
                            [
                                {
                                    text: "КОЛИЧЕСТВО\n ТРАНСПОРТНЫХ СРЕДСТВ",
                                    style: "leftCellFirstTable",
                                    margin: twoRowMargin
                                },
                                {
                                    text:`${myFactory.totalAmount / 24 }`,
                                    margin:oneRowMargin,
                                    bold: true,
                                    colSpan: 2,
                                    alignment:'center'
                                },
                            ]
                        ]
                    },
                    layout: {// цвет границы 
                        hLineColor: '#e6e6e6',
                        vLineColor: '#e6e6e6',
                    }
                },
                "\n",
                {
                    table: {
                        headerRows: 1,
                        widths:[150, 150, 150],
                        
                        body: [
                            [
                                {
                                    text: "ТЕРРИТОРИЯ СТРАХОВАНИЯ",
                                    style: "leftCellFirstTable",
                                    margin: oneRowMargin.map((v,i)=>(i===1)?v+2:v)
                                },
                                {
                                    text:`${territory}`,
                                    colSpan: 2,
                                    alignment:'center',
                                    margin: (territory.length<65) ? oneRowMargin : twoRowMargin
                                },
                            ],
                            // [
                            //     {
                            //         text: "ЛИМИТ ОТВЕТСТВЕННОСТИ СТРАХОВЩИКА ПО СЛУЧАЮ",
                            //         style: "leftCellFirstTable"
                                    
                            //     },
                            //     {
                            //         text:`${this.addSpaces(myFactory.a_limit.value)}`,
                            //         margin:[0,5,0,0],
                            //         bold: true,
                            //         colSpan: 2,
                            //         alignment:'center'
                            //     },
                            // ],
                            [
                                {
                                    text: "АГРЕГАТНЫЙ ЛИМИТ ОТВЕТСТВЕННОСТИ СТРАХОВЩИКА ПО ПОЛИСУ",
                                    style: "leftCellFirstTable",
                                    margin: twoRowMargin
                                },
                                {
                                    text:`${this.addSpaces(myFactory.a_limit.value)}`,
                                    margin:oneRowMargin,
                                    bold: true,
                                    colSpan: 2,
                                    alignment:'center'
                                },
                            ],
                            // [
                            //     {
                            //         text: "БЕЗУСЛОВНАЯ ФРАНШИЗА",
                            //         style: "leftCellFirstTable"
                                    
                            //     },
                            //     {
                            //         text:"НЕ ПРИМЕНЯЕТСЯ",
                            //         colSpan: 2,
                            //         alignment:'center'
                            //     },
                            // ],
                            [
                                {
                                    text: "ДАТА ВЫДАЧИ",
                                    style: "leftCellFirstTable",
                                    margin: oneRowMargin
                                },
                                {
                                    text:`${parseDate(new Date())}`,
                                    bold: true,
                                    colSpan: 2,
                                    alignment:'center',
                                    margin: oneRowMargin
                                },
                            ]
                        ]
                    },
                    layout: {// цвет границы 
                        hLineColor: '#e6e6e6',
                        vLineColor: '#e6e6e6',
                    }
                },
                {
                    table: {
                        headerRows: 1,
                        widths:[468],
                        body: [
                            [                            
                                { 
                                    text: "Страхованием покрывается любой и каждый груз, с учетом исключений, предусмотренных полисом.",
                                    style: "leftCellFirstTable",
                                    alignment: 'center',
                                    bold: true
                                },                      
                            ],
                        ]
                    },
                    layout: {// цвет границы 
                        hLineColor: '#e6e6e6',
                        vLineColor: '#e6e6e6',
                    }
                },
                "\n",
                {
                    table: {
                        headerRows: 1,
                        widths:[100, 300, 50],
                        body: [
                            [
                                {
                                    text:[
                                        {
                                            text:"ООО «СК «КАПИТАЛ-ПОЛИС»\n",
                                            bold:true,
                                        },
                                        {
                                            text:"\n\n"
                                        },
                                        {
                                            text:"__________________________________________\n",
                                        },
                                        {
                                            text:"/Корпусов Д.В/\n",
                                            fontSize: 7
                                        },
                                        {
                                            text:"Доверенность №74/2018 от 10.03.2018\n",
                                            fontSize: 7
                                        },
                                        {
                                            text:"\n"
                                        }
                                    ],
                                    alignment:"center",
                                    colSpan:3
                                },
                                {},
                                {}
                            ]
                        ]
                    },
                    layout: {// цвет границы 
                        hLineColor: '#e6e6e6',
                        vLineColor: '#e6e6e6',
                    }
                },
                "\n",
                {
                    table: {
                        headerRows: 1,
                        widths:[100, 300, 50],
                        body: [
                            [
                                {
                                    text:[
                                        {
                                            text: 'ЦЕНТР СТРАХОВАНИЯ ТРАНСПОРТНЫХ РИСКОВ\n\n',
                                            bold:true,
                                            fontSize: 12,
                                        },
                                        {
                                            text:"Телефон: +7 (812) 322-63-51\n",
                                            fontSize: 10,
                                        },
                                        {
                                            text:"E-mail: cargo@capitalpolis.ru, claims@capitalpolis.ru\n",
                                            fontSize: 10,
                                        },
                                        {
                                            text:"Московский пр., д.22, лит. 3, Санкт-Петербург, 190013, Россия",
                                            fontSize: 10
                                        }
                                    ],
                                    alignment:"center",
                                    colSpan:3
                                },
                                {},
                                {}
                            ]
                        ]
                    },
                    layout: {// цвет границы 
                        hLineColor: '#e6e6e6',
                        vLineColor: '#e6e6e6',
                    }
                }
            ],
            footer: function(page, pages) { 
                if (page>1) return { 
                    table: {
                        headerRows: 0,
                        widths:[50,70,150,70,150,50],
                        body: [
                            [
                                {   
                                    // пустая строка для отступа
                                    text: '',
                                    fontSize: 12,
                                    border: [false,false,false,false]
                                },
                                emptyCell,
                                emptyCell,
                                emptyCell,
                                emptyCell,
                                emptyCell,
                            ],
                            [
                                emptyCell
                                ,
                                {
                                    text: 'Cтрахователь:',
                                    fontSize: 10,
                                    border: [false,false,false,false],
                                },
                                {
                                    text: '___________________________________',
                                    border: [false,false,false,false],
                                }
                                ,
                                {
                                    text: 'Cтраховщик:',
                                    fontSize: 10,
                                    border: [false,false,false,false],
                                },
                                {
                                    text: '___________________________________',
                                    border: [false,false,false,false],
                                }
                                ,
                                emptyCell
                            ],
                            [
                                emptyCell
                                ,
                                emptyCell,
                                {
                                    text: 'подпись и печать',
                                    fontSize: 7,
                                    alignment: 'center',
                                    border: [false,false,false,false],
                                },
                                emptyCell,
                                {
                                    text: 'подпись и печать',
                                    fontSize: 7,
                                    alignment: 'center',
                                    border: [false,false,false,false],
                                },
                                emptyCell
                            ],
                            [
                                {
                                    text: `Лист ${page.toString()}/${pages.toString()} Полиса № HIP-0000000-00-17`,
                                    colSpan:6,
                                    border: [false,false,false,false],
                                    alignment: 'center',
                                    fontSize: 7,
                                }
                            ]
                        ],
                        style: 'table'
                    },
                };
            },
            styles: {
                leftCellFirstTable: {
                    fillColor: '#e6e6e6',
                    fontSize: 10,
                },
                table: {
                    fontStyle:"PT Sans Narrow",
                    alignment: 'center'
                },
                firstHeader: {
                    bold: true,
                    fillColor: '#DBE5F1',
                    alignment: 'center',
                },
                carInfo: {
                    fontSize: 9,
                }
            }
    
        };
        
        docDefinition.content.push(
            {
                pageBreak: 'before',
                text:  ` Под действия настоящего  Полиса подпадаю следующие списки транспортных средств (см.\u00A0Приложение 1) на закрепленных ниже условиях:`,
                alignment: 'justify',
                margin: [0,0,0,5],
            },
            ...this.makeTables(myFactory), //списки условий страхования
            ...this.makeRisksList(myFactory, risks), //таблицы заявленных/не заявленных рисков
            ...this.makeParagraphs(myFactory), //таблицы оговорок
            "\n",
            //таблица для подписей
            {
                table: {
                    headerRows: 1,
                    widths:[245, 245],
                    dontBreakRows: true,
                    keepWithHeaderRows: 1,
                    body: [
                        
                        [
                            {
                                text:"СТРАХОВАТЕЛЬ:",
                                style:"firstHeader",
                                fontSize:12,
                                fillColor: '#e6e6e6',
                            },
                            {
                                text:"СТРАХОВЩИК:",
                                style:"firstHeader",
                                fontSize:12,
                                fillColor: '#e6e6e6',
                            }
                        ],
                        [
                            {
                                text:[
                                    {
                                        text:`${myFactory.newClientCard["Данные компании"]["Форма организации"]} «${myFactory.newClientCard["Данные компании"]["Наименование организации"].toUpperCase()}»\n`,
                                        bold: true
                                    },
                                    {
                                        text:"\n\n\n"
                                    },
                                    {
                                        text:"__________________________________\n",
                                    },
                                    {
                                        text:`${myFactory.newClientCard["Генеральный директор"]["ФИО директора"]}\n`,
                                        fontSize:7
                                    },
                                    {
                                        text:"На основании Устава",
                                        fontSize:7
                                    }
                                ],
                                alignment: "center"
                            },
                            {
                                text:[
                                    {
                                        text:"ООО «СК «КАПИТАЛ-ПОЛИС»\n",
                                        bold: true
                                    },
                                    {
                                        text:"\n\n\n"
                                    },
                                    {
                                        text:"__________________________________\n",
                                    },
                                    {
                                        text:"/Корпусов Д.В./\n",
                                        fontSize:7
                                    },
                                    {
                                        text:"Доверенность №74/2018 от 10.03.2018",
                                        fontSize:7
                                    }
                                ],
                                alignment: "center"
                            },
                        ]
                    ]
                },
                layout: {// цвет границы 
                    hLineColor: '#e6e6e6',
                    vLineColor: '#e6e6e6',
                }
            },
            {
                pageBreak: 'before',
                text: "ПРИЛОЖЕНИЕ 1 - Списки транспортных средств, застрахованных по отдельным условиям страхования",
                alignment: 'justify',
                bold: true,
            },
            ...this.carsTables,
        )
        pdfMake.fonts = {
            Roboto: {
                normal: 'PTN.ttf',
                bold: 'PTN-bold.ttf'
            }
        }
        // pdfMake.createPdf(docDefinition).download('optionalName.pdf');
        console.log(JSON.stringify(docDefinition,null,'    ')); // временно для вставки в редактор
        const win = window.open('', '_blank');
        delay(500).then(()=>pdfMake.createPdf(docDefinition).open({}, win)); // временно, чтобы не плодить кучу файлов
    }
}
const polis = new PolisMaker();



