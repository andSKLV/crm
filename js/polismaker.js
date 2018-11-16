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
                if(i==0 || !this.areEquivalent(park.processes[i]["cars"],park.processes[i-1]["cars"]) ){
                    lists.push(
                        {
                            cars: park.processes[i]["cars"],
                            processes: [park.processes[i]],
                            risks: [park.processes[i].risk]
                        }
                    )
                }
                else{
                    lists[lists.length-1].processes.push(park.processes[i]);
                    lists[lists.length-1].risks.push(park.processes[i].risk);
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
        let body=[];
        const lists=this.makeCarLists(myFactory);
        
        console.log(lists);
        const listContent=[];
        let listCount=1;
        lists.forEach((list)=>{
            let table={
                style: 'table',
                table: {
                    headerRows: 1,
                    widths:[71,71,71,97,71,71],
                    body: [
                        [
                            {
                                text: `Условия страхования транспортных средств Перечня ${listCount} (см. Приложение 1)`,
                                alignment:'center',
                                bold: true,
                                colSpan: 6,
                                border: [false, false, false, false],
                            },
                            {},
                            {},
                            {},
                            {},
                            {},
                        ],
                        [
                            {
                                text:'Страховая стоимость, руб.', 
                                style:"firstHeader",
                            },
                            {
                                text:`Количество ${myFactory.amountType}`,
                                style:"firstHeader", 
                            },
                            {
                                text:'Тип грузового отсека', 
                                style:"firstHeader",
                            },
                            {
                                text:'Застрахованные риски', 
                                style:"firstHeader",
                            },
                            {
                                text:'Лимит по случаю, руб.', 
                                style:"firstHeader",
                            },
                            {
                                text:'Франшиза по случаю, руб.',
                                style:"firstHeader",
                            }
                        ]
                    ]
                },
                layout: {
                    
                }
            }
            let tableContent=table.table.body;
            list.processes.forEach((process, i)=>{
                let row=[];
                let properties=["cost", "amount", "wrapping", "risk", "limit", "franchise"];
                properties.forEach((property)=>{
                    if(property=="amount"){
                        if(myFactory.amountType=="Тягачей"){
                            row.push(
                                {
                                    text: `${process[property] / 24}`
                                }
                            );
                        }
                        else{
                            row.push(
                                {
                                    text: `${process[property]}`
                                }
                            );
                        }
                    }
                    else if(property=="cost" || property=="limit" || property=="franchise"){
                        row.push(
                            {
                                text: this.addSpaces(process[property]),
                                // alignment: 'right',
                            });
                    }
                    else{
                        row.push(process[property]);
                    }

                })
                tableContent.push(row);
            })
            listContent.push(table, "\n");
            this.carsTables.push('\n',`Перечень ${listCount}`);
            table={
                style: 'table',
                table: {
                    headerRows: 1,
                    widths:[93,143,73,161],
                    body: [
                        [
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
            tableContent=table.table.body;
            // данные по машинам
            for(const car of list.cars){
                tableContent.push(
                    [
                        car.data.autNumber,
                        car.data.VIN,
                        car.data.prodYear,
                        car.data.model,
                    ]
                )
            }
            let layout = {};
            if (tableContent.length>3) {
                table.table.layout = {
                    fillColor: function (i, node) {
                        return (i % 2 === 0) ? '#CCCCCC' : null;
                    }
                }
            }
            this.carsTables.push(table);
            listCount++;
        })
        
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
        myFactory.polisObj.conditions.forEach((obj,i)=>{
            if(obj.name==="Базовые риски"){
                return;
            }
            let paragraph={};
            paragraph.widths=[30, 459];
            paragraph.keepWithHeaderRows=1;
            paragraph.layout={
                hLineColor: '#e6e6e6',
                vLineColor: '#e6e6e6',
            };
            paragraph.body=[
                [       
                    { 
                        text: `${i+1}. ${obj.name}:`,
                        style: "firstHeader",
                        colSpan:2      
                    },
                    {},
                ]
            ];
            let mass=obj.values.filter(({checked})=>checked);
            mass.forEach((param, num)=>{
                let arr=[];
                arr.push({
                    text:`${i+1}.${num+1}.`
                },{
                    text:param.text
                })
                paragraph.body.push(arr);
                paragraph.headerRows= 1;
            });
            let layout = {};
            if (paragraph.body.length>3) layout = {
                fillColor: function (i, node) {
                    return (i % 2 === 0) ? '#CCCCCC' : null;
                }
            }
            paragraphs.push({
                table:paragraph,
                layout
            },"\n");
            
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
                widths:[30, 459],
                body:[]
            };
            if(included){
                table.body.push([
                    {
                        text: '1.1 Определения застрахованных рисков:',
                        style: "firstHeader",
                        colSpan: 2,
                    },
                    {}
                ])
                let count=1;
                if(baseRisk.ToPDFinclude){
                    table.body.push([
                        {
                            text: `1.1.${count}`
                        },
                        {
                            stack: baseRisk.ToPDFinclude
                        }
                    ]);
                    count++;
                } 
                for(const risk of list){
                    table.body.push([
                        {
                            text: `1.1.${count}`
                        },
                        {
                            text: `${risk.name} - ${risk.title.toLowerCase()}. `
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
                        colSpan: 2
                    },
                    {}
                ])
                let count=1;
                if(baseRisk.ToPDFnotInclude){
                    table.body.push([
                        {
                            text: `1.2.${count}`
                        },
                        {
                            stack: baseRisk.ToPDFnotInclude
                        }
                    ]);
                    count++;
                } 
                for(const risk of list){
                    table.body.push([
                        {
                            text: `1.2.${count}`
                        },
                        {
                            text: `${risk.name} - ${risk.title.toLowerCase()}. `
                        }
                        
                    ])
                    count++;
                }
            }
            let layout = {};
            if (table.body.length>3) layout = {
                fillColor: function (i, node) {
                    return (i % 2 === 0) ? '#CCCCCC' : null;
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
     * Основная функция, создает на основе данных расчета и компании файл PDF и скачивает его
     * @param  {object} myFactory объект с практически всеми нужными данными
     * @param  {array} risks Список рисков с описанием
     */
    makePDF(myFactory, risks){
        console.log(myFactory.parks);
        let docDefinition = {
            pageMargins: [ 50, 60, 50, 30 ],
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
                            [
                                {
                                    text: "СТРАХОВЩИК",
                                    style: "leftCellFirstTable",
                                    margin:[0,20,0,0],
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
                                        },
                                        {
                                            text:"Телефон: +7 (812) 322-63-51\n",
                                            fontSize: 10
                                        },
                                        {
                                            text:"E-mail: cargo@capitalpolis.ru, claims@capitalpolis.ru",
                                            fontSize: 10
                                        }
                                    ],
                                    colSpan: 2,
                                    alignment:'center'
                                },
                                {}
                            ],
                            [
                                {
                                    text: "ПЕРИОД СТРАХОВАНИЯ",
                                    style: "leftCellFirstTable"
                                    
                                },
                                {
                                    text:`${myFactory.polisObj.dates.start} - ${myFactory.polisObj.dates.end}`,
                                    alignment: 'center',
                                    bold: true,
                                    colSpan:2
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
                                    style: "leftCellFirstTable"
                                    
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
                                    alignment:'center'
                                },
                            ],
                            [
                                {
                                    text: "КОЛИЧЕСТВО\n ТРАНСПОРТНЫХ СРЕДСТВ",
                                    style: "leftCellFirstTable"
                                    
                                },
                                {
                                    text:`${myFactory.totalAmount / 24 }`,
                                    margin:[0,5,0,0],
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
                                    style: "leftCellFirstTable"
                                    
                                },
                                {
                                    text:"РОССИЯ, КАЗАХСТАН, БЕЛАРУСЬ, УКРАИНА, СТРАНЫ ЕВРОПЫ",
                                    colSpan: 2,
                                    alignment:'center',
                                },
                            ],
                            [
                                {
                                    text: "ЛИМИТ ОТВЕТСТВЕННОСТИ СТРАХОВЩИКА ПО СЛУЧАЮ",
                                    style: "leftCellFirstTable"
                                    
                                },
                                {
                                    text:`${this.addSpaces(myFactory.a_limit.value)}`,
                                    margin:[0,5,0,0],
                                    bold: true,
                                    colSpan: 2,
                                    alignment:'center'
                                },
                            ],
                            [
                                {
                                    text: "АГРЕГАТНЫЙ ЛИМИТ ОТВЕТСТВЕННОСТИ СТРАХОВЩИКА ПО ПОЛИСУ",
                                    style: "leftCellFirstTable"
                                    
                                },
                                {
                                    text:`${this.addSpaces(myFactory.a_limit.value)}`,
                                    margin:[0,10,0,0],
                                    bold: true,
                                    colSpan: 2,
                                    alignment:'center'
                                },
                            ],
                            [
                                {
                                    text: "БЕЗУСЛОВНАЯ ФРАНШИЗА",
                                    style: "leftCellFirstTable"
                                    
                                },
                                {
                                    text:"НЕ ПРИМЕНЯЕТСЯ",
                                    colSpan: 2,
                                    alignment:'center'
                                },
                            ],
                            [
                                {
                                    text: "ДАТА ВЫДАЧИ",
                                    style: "leftCellFirstTable"
                                    
                                },
                                {
                                    text:`${parseDate(new Date())}`,
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
                {
                    text:"\n",
                    
                },
            ],
            footer: function(page, pages) { 
                return { 
                    columns: [ 
                        
                        { 
                            alignment: 'center',
                            fontSize:6,
                            text: [
                                { 
                                    text:"Страница "+ page.toString(), 
                                    italics: true,
                                    
                                },
                                '/',
                                { 
                                    text: pages.toString()+" Полиса № HIP-0000000-00-17", 
                                    italics: true 
                                    
                                }
                            ]
                        }
                    ],
                    margin: [10, 0]
                };
            },
            styles: {
                leftCellFirstTable: {
                    italics: true,
                    fillColor: '#e6e6e6',
                    fontSize: 10,
                },
                table: {
                    fontStyle:"PT Sans Narrow",
                    alignment: 'center'
                },
                firstHeader: {
                    bold: true,
                    fillColor: '#e6e6e6',
                    alignment: 'center'
                },
            }
    
        };
        
        docDefinition.content.push(
            {
                pageBreak: 'before',
                text: " Под действия  настоящего  Полиса подпадают  следующие  Перечни  транспортных средств, на закрепленных ниже условиях:",
                alignment: 'justify',
            },
            "\n",
            ...this.makeTables(myFactory), //перечни условий страхования
            "\n",
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
                                fontSize:12
                            },
                            {
                                text:"СТРАХОВЩИК:",
                                style:"firstHeader",
                                fontSize:12
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
                text: "ПРИЛОЖЕНИЕ 1 - Перечни транспортных средств, застрахованных по отдельным условиям страхования",
                alignment: 'justify',
                bold: true,
            },
            "\n",
            ...this.carsTables,
        )
        // pdfMake.createPdf(docDefinition).download('optionalName.pdf');
        console.log(JSON.stringify(docDefinition,null,'    ')); // временно для вставки в редактор
        const win = window.open('', '_blank');
        delay(500).then(()=>pdfMake.createPdf(docDefinition).open({}, win)); // временно, чтобы не плодить кучу файлов

    }
}
const polis = new PolisMaker();



