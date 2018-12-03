/**
 * Класс для работы с PDF
 */

const NOBORDER = [false,false,false,false];
const emptyCell = {
    text: '',
    border: [false, false, false, false],
}
const HIP_NAME = '№ HIP-0000000-00-17';

 class PolisMaker {
    constructor() {
        this.carsTables = [];
        this.includedRisksOrder = new Set();
        Set.prototype._indexOf = function (val) {
            return [...this].indexOf(val);
        }
        this.isOneCarGroup = false;
        this.hipName = HIP_NAME; //FIXME: изменить потом, когда дойдет до генерации индекса полиса
    }
    /**
     * Перераспределяем машины по спискам
     * @param {object} myFactory объект с практически всеми нужными данными
     * @return {array} массив со списками машин
     */
    makeCarLists(myFactory) {
        let lists = [];
        myFactory.parks.forEach((park, parkNumber) => {
            park.processes.forEach((process, i) => {
                let wasIndex = null;
                for (let k = 0; k < i; k++) {
                    if (this.areEquivalent(process.cars, park.processes[k]["cars"])) {
                        wasIndex = lists.findIndex(l => l.processes.includes(park.processes[k]));
                        break;
                    }
                }
                let currGroup;
                if (i == 0 || wasIndex === null) {
                    lists.push(
                        {
                            cars: process.cars,
                            processes: [process],
                            risks: [process.risk],
                            wrappings: [process.wrapping],
                            group: lists.length,
                        }
                    )
                    currGroup = lists.length-1;
                }
                else {
                    lists[wasIndex].processes.push(process);
                    lists[wasIndex].risks.push(process.risk);
                    if (lists[wasIndex].wrappings.includes(process.wrapping)) lists[wasIndex].wrappings.push(process.wrapping);
                    currGroup = wasIndex;
                }
                process.cars.forEach(car=>{
                    if (!car.tableGroup) car.tableGroup = [currGroup];
                    if (!car.tableGroup.includes(currGroup)) car.tableGroup.push(currGroup);
                })
                if (process.isFull){ 
                    lists[currGroup].isFull = true;
                    lists[currGroup].groups = process.cars[0].tableGroup;
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
        if (mass1.length !== mass2.length) return false;
        for (const car of mass1) {
            if (!mass2.includes(car)) return false;
        }
        return true;
    }
    /**
     * Создаем массив, который представляет из себя таблицы с рисками и номерами машин
     * @param {object} myFactory объект с практически всеми нужными данными
     * @return {arrayOfTables}
     */
    makeTables(myFactory) {
        this.carsTables = [];
        let body = [];
        const lists = this.makeCarLists(myFactory);
        if (lists.length===1) this.isOneCarGroup = true; // если одна группа машин, то слово Група не нужно
        const listContent = [];
        let carTablesCount = 1;
        //порядок столбцов в таблице
        const colOrder = ['risk', 'wrapping', 'cost', 'limit', 'franchise'];
        const colNumber = () => colOrder.length;
        const putEmptyCells = num => {
            const arr = [];
            for (let i=0;i<num;i++) {
                arr.push(emptyCell)
            }
            return arr;
        }
        // ширины столбца
        const colWidth = {
            'group': 0,
            'risk': 97+25+35,
            'cost': 61+20,
            "amount": 0,
            "wrapping": 60+25+15,
            "limit": 60,
            "franchise": 60,
        }
        const rowWidths = [];
        //создание массива с ширинами столбцов
        for (let i = 0; i < colOrder.length; i++) {
            const name = colOrder[i];
            rowWidths.push(colWidth[name]);
        }
        let table = {
            style: 'table',
            table: {
                headerRows: 1,
                widths: rowWidths,
                body: [
                    [
                        {
                            text: 'Таблица 1 - Условия страхования',
                            border: [false, false, false, false],
                            colSpan: colNumber(),
                            alignment: 'left',
                        },
                        ...putEmptyCells(colNumber()-1)
                    ],
                    [
                        {
                            text: 'Застрахованные риски,\n согласно п. 1.1',
                            style: "firstHeader",
                            border: [false, false, false, false],
                        },
                        {
                            text: 'Тип грузового отсека',
                            style: "firstHeader",
                            border: [false, false, false, false],
                        },
                        {
                            text: 'Страховая стоимость, руб.',
                            style: "firstHeader",
                            border: [false, false, false, false],
                        },
                        
                        {
                            text: 'Лимит по случаю, руб.',
                            style: "firstHeader",
                            border: [false, false, false, false],
                        },
                        {
                            text: 'Франшиза по случаю, руб.',
                            style: "firstHeader",
                            border: [false, false, false, false],
                        }
                    ]
                ]
            }
        }
        if (this.isOneCarGroup) table.layout = {
            fillColor: function (i, node) {
                return (i % 2 === 1 && i>2) ? '#e6e6e6' : null;
            }
        }
        else table.layout = {
            fillColor: function (i, node) {
                const text = node.table.body[i][0].text;
                const reg = /Набор \d+/;
                const isGroupRow = reg.test(text);
                return (isGroupRow) ? '#e6e6e6' : null;
            }
        }
        lists.forEach((list,i) => {
            const group = i + 1;
            let tableContent = table.table.body;
            if (!this.isOneCarGroup) {
                // добавляем разделитель Групп, если групп больше чем одна
                tableContent.push([{
                    text: `Набор ${group}:`,
                    border: NOBORDER,
                    colSpan: colNumber(),
                    alignment: 'left',
                    bold: true,
                }, ...putEmptyCells(colNumber() - 1)]);
            }
            //функция выдачи отступов для строки, что бы значения были отцентрованы
            const getMargin = (str) => {
                const twoRows = ['Повреждение товарных автомобилей', 'Противоправные действия третьих лиц'];
                const noMargin = [0,0,0,0];
                const oneMargin = [0,8,0,8];
                return twoRows.includes(str) ? noMargin : oneMargin;
            }

            list.processes.forEach((process, i) => {
                const row = [];
                const riskMargin = getMargin(process.risk);
                const wrapMargin = getMargin(process.wrapping);
                const oneMargin = getMargin('');
                this.includedRisksOrder.add(process.risk);

                colOrder.forEach((property, id) => {
                    let obj;
                    switch (property) {
                        case 'amount':
                            if (myFactory.amountType == "Тягачей") {
                                obj = {
                                    text: `${process[property] / 24}`,
                                    margin: oneMargin,
                                }
                            }
                            else {
                                obj = {
                                    text: `${process[property]}`,
                                    margin: oneMargin,
                                }
                            }
                            break;
                        case 'cost':
                        case 'limit':
                        case 'franchise':
                            obj = {
                                text: this.addSpaces(process[property]),
                                margin: oneMargin,
                            }
                            break;
                        case 'risk':
                            obj = {
                                // text: `${process[property]} п.\u00A01.1.${this.includedRisksOrder._indexOf(process[property])+1}`,
                                text: `${process[property]}`,
                                margin: riskMargin,
                                alignment: 'left',
                            };
                            break;
                        case 'group':
                            obj = {
                                text: `${group}`,
                                margin: oneMargin
                            };
                            break;
                        case 'wrapping':
                            obj = {
                                text: process[property],
                                margin: wrapMargin,
                            };
                            break;
                        default:
                            obj = {
                                text: process[property],
                                margin: oneMargin,
                            };
                            break;
                    }
                    obj.border = [false, false, false, false];
                    row.push(obj);
                })
                tableContent.push(row);
            })

            if (list.isFull) {
                this.carsTables.push('\n');
                // генерируем таблицу в зависимости от количества групп ТС
                // если групп ТС больше одной, то необходимо добавить дополнительный стоблец с обозначением Групп
                const colNumber = (this.isOneCarGroup) ? 5 : 6;
                const tableHeader = (this.isOneCarGroup) ? 'Список транспортных средств' : `Список транспортных средств №${carTablesCount} - Набор рисков: ${list.groups.map(x=>x+1).join(', ')}`;
                const colWidths = (this.isOneCarGroup) ? [44, 88, 121, 58, 149] : [44, 68, 121, 48, 129, 50];
                const contentHeader = [
                    {
                        text: 'п/п',
                        style: "firstHeader"
                    },
                    {
                        text: 'Гос. знак',
                        style: "firstHeader",
                    },
                    {
                        text: `VIN`,
                        style: "firstHeader",
                    },
                    {
                        text: 'Год',
                        style: "firstHeader",
                    },
                    {
                        text: 'Марка',
                        style: "firstHeader",
                    }
                ];
                if (!this.isOneCarGroup) contentHeader.push(
                    {
                        text: 'Набор*',
                        style: "firstHeader",
                    }
                )
                /**
                 * Возвращает строку с описанием ТС со столбцом Группа или без него в зависимости от общего кол-ва групп
                 * @param {*} car 
                 * @param {*} i 
                 */
                const contentBody = (car, i) => {
                    const content = [
                        {
                            text: i + 1,
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
                    if (!this.isOneCarGroup) content.push(
                        {
                            text: car.tableGroup.map(x=>x+1).join(', '),
                            style: 'carInfo',
                        }
                    )
                    return content;
                };
                const tableCar = {
                    style: 'table',
                    table: {
                        headerRows: 2,
                        widths: colWidths,
                        body: [
                            [
                                {
                                    text: tableHeader,
                                    border: [false, false, false, false],
                                    colSpan: colNumber,
                                    alignment: 'left'
                                },
                                ...putEmptyCells(colNumber-1),
                            ],
                            contentHeader,
                        ]
                    },
                }
                const tableContentCar = tableCar.table.body;
                // данные по машинам
                list.cars.forEach((car, i) => {
                    tableContentCar.push(
                        contentBody(car, i)
                    )
                })
                this.carsTables.push(tableCar);
                carTablesCount++;
            }
        })
        if (!this.isOneCarGroup) this.carsTables.push({
            text:'* Транспортные средства застрахованы на условиях и рисках, соответствующих указанным наборам в Таблице 1.',
            bold: false,
            alignment: 'justify',
        })
        listContent.push(table);
        listContent.push({
            text:'Совокупные выплаты по всем застрахованным случаям не могут превышать агрегатный лимит отвественности страховщика по Полису.',
            bold: true,
            alignment: 'justify',
            fontSize: 12,
        },'\n')
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
        const paragraphs = [];
        let parIndex = 2; //Стартующий номер параграфа, так как 1 занята под Риски
        myFactory.polisObj.conditions.forEach(obj => {
            if (obj.name === "Базовые риски") {
                return;
            }
            if (obj.const) return;
            let paragraph = {};
            paragraph.widths = [30, 457];
            paragraph.keepWithHeaderRows = 1;
            paragraph.body = [
                [
                    {
                        text: `${parIndex}. ${obj.name}:`,
                        style: "firstHeader",
                        colSpan: 2,
                        border: [false, false, false, false],
                    },
                    {},
                ]
            ];
            let mass = obj.values.filter(({ checked }) => checked);
            if (obj.oneLine) {
                const text = mass.map(el => el.text).join(', ');
                const tb = [
                    {
                        text: text,
                        colSpan: 2,
                        border: [false, false, false, false],
                        alignment: 'justify',
                    }
                ]
                paragraph.body.push(tb);
            }
            else {
                mass.forEach((param, num) => {
                    let arr = [];
                    arr.push({
                        text: `${parIndex}.${num + 1}`,
                        border: [false, false, false, false],
                    }, {
                            text: param.text,
                            border: [false, false, false, false],
                        })
                    paragraph.body.push(arr);
                    paragraph.headerRows = 1;
                });
            }
            paragraph.headerRows = 1;
            let layout = {
                fillColor: function (i, node) {
                    return (i % 2 === 0) ? '#e6e6e6' : null;
                }
            }
            paragraphs.push({
                table: paragraph,
                layout
            }, "\n");
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
        const prepareListToPDF = ({ list, included, baseRisk }) => {
            const table = {
                headerRows: 1,
                widths: [30, 457],
                body: []
            };
            if (included) {
                table.body.push([
                    {
                        text: '1.1 Определения застрахованных рисков',
                        style: "firstHeader",
                        colSpan: 2,
                        border: [false, false, false, false],
                    },
                    {}
                ])
                let count = 1;
                // сначала добавляем Базовые риски (включенные)
                if (baseRisk.ToPDFinclude) {
                    table.body.push([
                        // {
                        //     text: `1.1.${count}`,
                        //     border: [false, false, false, false],
                        // },
                        {
                            text: baseRisk.ToPDFinclude[0].text,
                            bold: baseRisk.ToPDFinclude[0].bold,
                            border: [false, false, false, false],
                            colSpan: 2,
                            alignment: 'justify'
                        },
                        emptyCell
                    ]);
                    baseRisk.ToPDFinclude[1].ul.forEach(ul=>{
                        table.body.push([
                            {
                                text: ` `,
                                border: [false, false, false, false],
                            },
                            {
                                text: `• ${ul}`,
                                border: [false, false, false, false],
                                alignment: 'justify'
                            }
                        ])
                    })
                    table.body.push()
                    count++;
                }
                for (const risk of list) {
                    table.body.push([
                        // {
                        //     text: `1.1.${count}`,
                        //     border: [false, false, false, false],
                        // },
                        {
                            text: [
                                { text: `${risk.name}`, bold: true },
                                { text: ` - ${risk.title}. ` }
                            ],
                            border: [false, false, false, false],
                            colSpan: 2,
                            alignment: 'justify'
                        },
                        emptyCell,
                    ])
                    count++;
                }
            }
            else {
                table.body.push([
                    {
                        text: '1.2 Определения не заявленных на страхование рисков:',
                        style: "firstHeader",
                        colSpan: 2,
                        border: [false, false, false, false]
                    },
                    {}
                ])
                let count = 1;
                // сначала добавляем Базовые риски (исключенные)
                if (baseRisk.ToPDFnotInclude) {
                    table.body.push([
                        {
                            text: baseRisk.ToPDFnotInclude[0].text,
                            bold: baseRisk.ToPDFnotInclude[0].bold,
                            border: [false, false, false, false],
                            colSpan: 2,
                            alignment: 'justify'
                        },
                        emptyCell
                    ]);
                    baseRisk.ToPDFnotInclude[1].ul.forEach(ul=>{
                        table.body.push([
                            {
                                text: ` `,
                                border: [false, false, false, false],
                            },
                            {
                                text: `• ${ul}`,
                                border: [false, false, false, false],
                                alignment: 'justify'
                            }
                        ])
                    })
                    count++;
                }
                for (const risk of list) {
                    table.body.push([
                        {
                            text: [
                                { text: `${risk.name}`, bold: true },
                                { text: ` - ${risk.title}. ` }
                            ],
                            border: [false, false, false, false],
                            colSpan:2,
                            alignment: 'justify'
                        },
                        emptyCell,
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
        let content = [];
        /** 
         * После таблиц с номерами авто и рисками идет перечисление застрахованных и незастрахованных рисков 
         * Начинаем с базовых рисков
         * Если они включены(по умолчанию включены)
         */
        let baseRisk = Object.assign({}, myFactory.polisObj.conditions.filter((paragraph) => {
            return paragraph.name == "Базовые риски";
        })[0]);
        const baseHeader = { text: "Базовые риски:", bold: true }
        baseRisk.ToPDFinclude = [baseHeader];
        baseRisk.ToPDFnotInclude = [baseHeader];
        if (baseRisk) {
            /**
             * если базовые риски включены - значит они в этом массиве не нужны, удаляем их 
             */
            risks = risks.filter(({ name }) => {
                return name !== "Базовые риски";
            })
            /**
             * Сначала отбираем те параметры базовых рисков, которые включены, а затем делаем из них массив строк
             */
            const baseInclude = [];
            const baseNotInlude = [];

            baseRisk.values.forEach((val) => {
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
            if (baseInclude.length === 0) delete baseRisk.ToPDFinclude;
            if (baseNotInlude.length === 0) delete baseRisk.ToPDFnotInclude;
        }
        /**
         * Дальше перечисляем сначала те риски, которые застрахованы, а также к каким перечням(спискам) машин они относятся
         * Для начала раскидаем машины по спискам
         */
        let lists = this.makeCarLists(myFactory);
        /**
         * Затем определим, какие риски и куда входят
         */
        for (const risk of risks) {
            risk.list = [];
            lists.forEach((list, i) => {
                if (list.risks.includes(risk.name)) risk.list.push(i + 1);
            });
        }
        /**
         * Остается лишь преобразовать профильтрованные данные в формат pdf
         */
        //сортируем массив включенных рисков по очереди упоминания в таблице условий
        const includedRisks = [...this.includedRisksOrder].map(risk=>{
            if (risk!=='Базовые риски') return risks.find(r=>r.name===risk);
        }).filter(val=>val!==undefined);
        content.push(prepareListToPDF(
            {
                list: includedRisks,
                included: true,
                baseRisk
            }), "\n"
        );
        const notIncludedRisks = risks.filter((risk) => {
            return risk.list.length == 0
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
    makeTerritory(myFactory) {
        const territoryVals = [];
        myFactory.polisObj.conditions.find(c => c.type === 'territory').values.forEach(v => {
            if (v.checked) territoryVals.push(v.text.toUpperCase());
        });
        return territoryVals.join(', ');
    }
    /**
     * Основная функция, создает на основе данных расчета и компании файл PDF и скачивает его
     * @param  {object} myFactory объект с практически всеми нужными данными
     * @param  {array} risks Список рисков с описанием
     */
    makePDF(myFactory, risks) {
        const emptyCell = {
            text: '',
            border: [false, false, false, false],
        }
        const oneRowMargin = [0, 10, 0, 10];
        const twoRowMargin = [0, 5, 0, 5];
        // собираем стоку с данными о территории страхования
        const territory = this.makeTerritory(myFactory);
        const currencySign = {
            'Р': '₽',
            'EUR': '€',
            'USD': '$',
        }
        let pageWithExtraFooter = null;
        console.log(this.hipName);
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [50, 115, 50, 65],
            content: [
                {
                    table: {
                        headerRows: 1,
                        widths: [150, 150, 175],
                        body: [
                            [
                                {
                                    text: [
                                        "ПОЛИС CMR/ТТН - СТРАХОВАНИЯ ПЕРЕВОЗЧИКА \n",
                                        `${this.hipName}`
                                    ],
                                    colSpan: 3,
                                    style: 'firstHeader',
                                    fontSize: 20,
                                    fillColor: '#e6e6e6',
                                },
                                {},
                                {}
                            ],
                            [
                                {
                                    text: `Страхование действует в соответствии с Договором CMR/ТТН - страхования перевозчика ${this.hipName}.`,
                                    colSpan: 3,
                                    fontSize: 10,
                                    alignment: 'center'
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
                        widths: [150, 150, 175],
                        body: [
                            [
                                {
                                    text: "СТРАХОВЩИК",
                                    style: "leftCellFirstTable",
                                    margin: oneRowMargin,
                                },
                                {
                                    text: [
                                        {
                                            text: "ООО «СК «КАПИТАЛ-ПОЛИС»\n",
                                            bold: true,
                                        },
                                        {
                                            text: "Московский пр., д.22, лит. 3, Санкт-Петербург, 190013\n",
                                            fontSize: 10
                                        }
                                    ],
                                    colSpan: 2,
                                    alignment: 'center',
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
                                    text: `${myFactory.polisObj.dates.start} - ${myFactory.polisObj.dates.end}`,
                                    alignment: 'center',
                                    bold: true,
                                    colSpan: 2,
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
                        widths: [150, 150, 175],
                        body: [
                            [
                                {
                                    text: "СТРАХОВАТЕЛЬ",
                                    style: "leftCellFirstTable",
                                    margin: oneRowMargin

                                },
                                {
                                    text: [
                                        {
                                            text: `${myFactory.companyObj.card["Данные компании"]["Форма организации"]} ${myFactory.companyObj.card["Данные компании"]["Наименование организации"].toUpperCase()}\n`,
                                            bold: true,
                                        },
                                        {
                                            text: `${myFactory.companyObj.card["Доп. информация"]["Юридический адрес"]}`,
                                            fontSize: 10,
                                        }

                                    ],
                                    colSpan: 2,
                                    alignment: 'center',
                                    margin: twoRowMargin
                                },
                            ],
                            [
                                {
                                    text: "КОЛИЧЕСТВО ЗАСТРАХОВАННЫХ ТРАНСПОРТНЫХ СРЕДСТВ",
                                    style: "leftCellFirstTable",
                                    margin: twoRowMargin
                                },
                                {
                                    text: `${myFactory.totalAmount / 24}`,
                                    margin: oneRowMargin,
                                    bold: true,
                                    colSpan: 2,
                                    alignment: 'center'
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
                        widths: [150, 150, 175],

                        body: [
                            [
                                {
                                    text: "ТЕРРИТОРИЯ СТРАХОВАНИЯ",
                                    style: "leftCellFirstTable",
                                    margin: oneRowMargin.map((v, i) => (i === 1) ? v + 2 : v)
                                },
                                {
                                    text: `${territory}`,
                                    colSpan: 2,
                                    alignment: 'center',
                                    margin: (territory.length < 65) ? oneRowMargin : twoRowMargin
                                },
                            ],
                            [
                                {
                                    text: "АГРЕГАТНЫЙ ЛИМИТ ОТВЕТСТВЕННОСТИ СТРАХОВЩИКА ПО ПОЛИСУ",
                                    style: "leftCellFirstTable",
                                    margin: twoRowMargin
                                },
                                {
                                    text: `${this.addSpaces(myFactory.a_limit.value)} ${currencySign[myFactory.document.currency]}`,
                                    margin: oneRowMargin,
                                    bold: true,
                                    colSpan: 2,
                                    alignment: 'center'
                                },
                            ],
                            [
                                {
                                    text: "ДАТА ВЫДАЧИ",
                                    style: "leftCellFirstTable",
                                    margin: oneRowMargin
                                },
                                {
                                    text: `${parseDate(new Date())}`,
                                    bold: true,
                                    colSpan: 2,
                                    alignment: 'center',
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
                        widths: [493],
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
                        widths: [100, 300, 75],
                        body: [
                            [
                                {
                                    text: [
                                        {
                                            text: "ООО «СК «КАПИТАЛ-ПОЛИС»\n",
                                            bold: true,
                                        },
                                        {
                                            text: "\n\n"
                                        },
                                        {
                                            text: "__________________________________________\n",
                                        },
                                        {
                                            text: "/Корпусов Д.В/\n",
                                            fontSize: 7
                                        },
                                        {
                                            text: "Доверенность №74/2018 от 10.03.2018\n",
                                            fontSize: 7
                                        },
                                        {
                                            text: "\n"
                                        }
                                    ],
                                    alignment: "center",
                                    colSpan: 3
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
                        widths: [100, 300, 75],
                        body: [
                            [
                                {
                                    text: [
                                        {
                                            text: 'ЦЕНТР СТРАХОВАНИЯ ТРАНСПОРТНЫХ РИСКОВ\n\n',
                                            bold: true,
                                            fontSize: 12,
                                        },
                                        {
                                            text: "Телефон: +7 (812) 322-63-51\n",
                                            fontSize: 10,
                                        },
                                        {
                                            text: "E-mail: cargo@capitalpolis.ru, claims@capitalpolis.ru\n",
                                            fontSize: 10,
                                        },
                                        {
                                            text: "Московский пр., д.22, лит. 3, Санкт-Петербург, 190013, Россия",
                                            fontSize: 10
                                        }
                                    ],
                                    alignment: "center",
                                    colSpan: 3
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
            footer: (page, pages, smth, pagesArr) => {
                const findExtraPage = arr => {
                    let pageNumb = null;
                    arr.forEach((page, ind) => {
                        if (page.items[0].type === 'line' && page.items[0].item.inlines[0].text === 'ПРИЛОЖЕНИЕ ' &&
                            page.items[0].item.inlines[1].text === '1 ') pageNumb = ind;
                    })
                    if (!pageNumb) console.error('Не найдена страница с приложением 1');
                    else pageWithExtraFooter = pageNumb;
                }
                if (pageWithExtraFooter === null) {
                    findExtraPage(pagesArr);
                }
                console.log(this.hipName);
                if (page === pageWithExtraFooter) return {
                    table: {
                        headerRows: 0,
                        widths: [50, 70, 150, 70, 150, 50],
                        body: [
                            [
                                {
                                    text: `Лист ${page.toString()}/${pages.toString()} Полиса ${this.hipName}`,
                                    colSpan: 6,
                                    border: [false, false, false, false],
                                    alignment: 'center',
                                    fontSize: 7,
                                    margin: [0, 40, 0, 0],
                                }
                            ]
                        ],
                        style: 'table'
                    }
                }
                console.log(this.hipName);
                if (page > 1) return {
                    table: {
                        headerRows: 0,
                        widths: [50, 70, 150, 70, 150, 50],
                        body: [
                            [
                                {
                                    // пустая строка для отступа
                                    text: '',
                                    fontSize: 12,
                                    border: [false, false, false, false]
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
                                    border: [false, false, false, false],
                                },
                                {
                                    text: '___________________________________',
                                    border: [false, false, false, false],
                                }
                                ,
                                {
                                    text: 'Cтраховщик:',
                                    fontSize: 10,
                                    border: [false, false, false, false],
                                },
                                {
                                    text: '___________________________________',
                                    border: [false, false, false, false],
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
                                    border: [false, false, false, false],
                                },
                                emptyCell,
                                {
                                    text: 'подпись и печать',
                                    fontSize: 7,
                                    alignment: 'center',
                                    border: [false, false, false, false],
                                },
                                emptyCell
                            ],
                            [
                                {
                                    text: `Лист ${page.toString()}/${pages.toString()} Полиса ${this.hipName}`,
                                    colSpan: 6,
                                    border: [false, false, false, false],
                                    alignment: 'center',
                                    fontSize: 7,
                                }
                            ]
                        ],
                        style: 'table'
                    }
                };
            },
            styles: {
                leftCellFirstTable: {
                    fillColor: '#e6e6e6',
                    fontSize: 10,
                },
                table: {
                    fontStyle: "PT Sans Narrow",
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
            // {
            //     pageBreak: 'before',
            //     text: ` Под действия настоящего Полиса подпадаю следующие наборы транспортных средств, указанные в Приложении 1, на закрепленных ниже условиях:`,
            //     alignment: 'justify',
            //     margin: [0, 0, 0, 5],
            // },
            {
                pageBreak: 'before',
                text: `1. Риски и условия страхования для транспортных средств, перечисленных в Приложении 1`,
                alignment: 'center',
                margin: [0, 0, 0, 5],
                style: "firstHeader",
            },
            ...this.makeTables(myFactory), //списки условий страхования
            ...this.makeRisksList(myFactory, risks), //таблицы заявленных/не заявленных рисков
            ...this.makeParagraphs(myFactory), //таблицы оговорок
            "\n",
            //таблица для подписей
            {
                table: {
                    headerRows: 1,
                    widths: [245, 245],
                    dontBreakRows: true,
                    keepWithHeaderRows: 1,
                    body: [

                        [
                            {
                                text: "СТРАХОВАТЕЛЬ:",
                                style: "firstHeader",
                                fontSize: 12,
                                fillColor: '#e6e6e6',
                            },
                            {
                                text: "СТРАХОВЩИК:",
                                style: "firstHeader",
                                fontSize: 12,
                                fillColor: '#e6e6e6',
                            }
                        ],
                        [
                            {
                                text: [
                                    {
                                        text: `${myFactory.companyObj.card["Данные компании"]["Форма организации"]} «${myFactory.companyObj.card["Данные компании"]["Наименование организации"].toUpperCase()}»\n`,
                                        bold: true
                                    },
                                    {
                                        text: "\n\n\n"
                                    },
                                    {
                                        text: "__________________________________\n",
                                    },
                                    {
                                        text: `${myFactory.companyObj.card["Генеральный директор"]["ФИО директора"]}\n`,
                                        fontSize: 7
                                    },
                                    {
                                        text: "На основании Устава",
                                        fontSize: 7
                                    }
                                ],
                                alignment: "center"
                            },
                            {
                                text: [
                                    {
                                        text: "ООО «СК «КАПИТАЛ-ПОЛИС»\n",
                                        bold: true
                                    },
                                    {
                                        text: "\n\n\n"
                                    },
                                    {
                                        text: "__________________________________\n",
                                    },
                                    {
                                        text: "/Корпусов Д.В./\n",
                                        fontSize: 7
                                    },
                                    {
                                        text: "Доверенность №74/2018 от 10.03.2018",
                                        fontSize: 7
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
                text: `ПРИЛОЖЕНИЕ 1 - Списки транспортных средств подпадающих под страхование Полиса ${this.hipName}`,
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
        // console.log(JSON.stringify(docDefinition,null,'    ')); // временно для вставки в редактор
        const win = window.open('', '_blank');
        delay(500).then(() => pdfMake.createPdf(docDefinition).open({}, win)); // временно, чтобы не плодить кучу файлов
    }
}
const polis = new PolisMaker();



