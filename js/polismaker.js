/**
 * Класс для работы с PDF
 */

const NOBORDER = [false, false, false, false];
const emptyCell = {
    text: '',
    border: [false, false, false, false],
    fontSize: 1,
}
const HIP_NAME = '№ HIP-0000000-00-17';
const BASEFONTSIZE = 10.5;
const BIGFONTSIZE = BASEFONTSIZE + 1.5;
const currencySign = {
    'Р': '₽',
    'EUR': '€',
    'USD': '$',
}

 class PolisMaker {
    constructor(myFactory) {
        this.carsTables = [];
        this.includedRisksOrder = new Set();
        Set.prototype._indexOf = function (val) {
            return [...this].indexOf(val);
        }
        this.isOneCarGroup = false;
        this.hipName = HIP_NAME; //FIXME: изменить потом, когда дойдет до генерации индекса полиса
        this.CONF = {
            wasMocked: false,
        }
    }
    /**
     * Создаем конфиг из которого забирается вся информация
     * @param {myFactory} mf 
     */
    confConstructor (mf) {
        const conf = this.CONF;
        conf.AGR_LIMIT = `${addSpaces(mf.a_limit.value)} ${currencySign[mf.document.currency]}`;
        conf.RISK_CHANGER = {
            'Поломка реф. установки' : 'Поломка рефрижераторной установки',
            'Неохраняемая стоянка' : 'Кража с неохраняемой стоянки',
        }
        conf.titleBreakerFontSize = this.chooseBreakerSize(mf.polisObj.insurants.length);
        conf.footerObj = this.makeFooterObj(mf.polisObj.insurants.length);
        debugger;
    }
    /**
     * Генерация футера в зависимости от количества страхователей
     * @param {number} numOfIns - количество страхователей
     */
    makeFooterObj (numOfIns) {
        //Добавляет нужное количество пустых ячеек
        const putEmptyCells = num => {
            const arr = [];
            for (let i=0;i<num;i++) {
                arr.push(emptyCell)
            }
            return arr;
        }
        //Добавляет строку с необходимым количеством страхователей и страховщиком
        const createRowWithText = (num,text) => {
            const arr = [emptyCell];
            let printText = text;
            for (let i=0;i<num;i++) {
                if (!text) printText = (i!==colNum-1) ? (colNum===2) ? `Страхователь: подпись и печать` : `Страхователь ${i+1}: подпись и печать` : 'Страховщик: подпись и печать';
                arr.push({
                    text: printText,
                    fontSize: 7,
                    alignment: 'center',
                    border: NOBORDER,
                });
                if (colNum===2) arr.push(emptyCell); //если страхователей 4, то отступы не нужны
            }
            if (colNum!==2) arr.push(emptyCell); //если страхователей 4, то добавляем один отступ в конце
            return arr;
        }
        const colNum = numOfIns+1; // количество страхователей + страховщик
        let marginWidth, dash;
        switch (colNum) {
            case 4:
            case 5:
                dash='________________________________';
                marginWidth = 0;
                break;
            case 3:
                dash='_________________________________________________';
                marginWidth = 0;
                break;
            default:
                dash='_________________________________________________';
                marginWidth = 50;
                break;
        }
        const pageMargins = 25;
        const footerWidths = [];
        footerWidths.push(pageMargins) // отступ слева
        const width = (540-(marginWidth*(colNum-1))-2*pageMargins)/(colNum); 
        for (let i=0;i<colNum;i++) {
            footerWidths.push(width);
            if ((colNum===2) && i!==colNum-1) footerWidths.push(marginWidth);
        }
        footerWidths.push(pageMargins) //отступ справа
        const realColNum = footerWidths.length;
        return {
            table: {
                headerRows: 0,
                widths: footerWidths,
                body: [
                    [
                        {
                            // пустая строка для отступа
                            text: '',
                            fontSize: 1,
                            border: NOBORDER
                        },
                        ...putEmptyCells(realColNum-1) //количество столбцов с подписями и марджинами
                    ],
                    createRowWithText(colNum,dash)
                    ,
                    createRowWithText(colNum)
                ],
                style: 'table'
            }
        }
    }
    /**
     * Создание таблицы подписантов
     * @param {myFactory} myFactory 
     */
    makeSignTable (myFactory) {
        const all = myFactory.polisObj.insurants;
        let headerFontSize, textFontSize, dash, pageWidth;
        //конфиг в зависимости от количества страхователей
        switch (all.length) {
            case 1:
                pageWidth = 490;
                headerFontSize = 12;
                textFontSize = 7;
                dash = "__________________________________\n";
                break;
            case 2:
                pageWidth = 480;
                headerFontSize = 12;
                textFontSize = 7;
                dash = "_______________________________\n";
                break;
            case 3:
                pageWidth = 470;
                headerFontSize = 9;
                textFontSize = 5;
                dash = "__________________________\n";
                break;
            case 4:
                pageWidth = 460;
                headerFontSize = 8;
                textFontSize = 5;
                dash = "____________________\n";
                break;
        }
        const width = Math.floor(pageWidth/(all.length+1));
        const widths = new Array(all.length+1).fill(width);
        //заголовок таблицы
        const headersMake = () => {
            const sigleInsurant = all.length === 1;
            const arr = all.map((ins,i)=>{
                return  {
                    text: sigleInsurant ? `СТРАХОВАТЕЛЬ:` : `СТРАХОВАТЕЛЬ ${i+1}:`,
                    style: "firstHeader",
                    fontSize: headerFontSize,
                    fillColor: '#e6e6e6',
                }
            })
            arr.push({
                text: "СТРАХОВЩИК:",
                style: "firstHeader",
                fontSize: headerFontSize,
                fillColor: '#e6e6e6',
            })
            return arr;
        }
        // тело таблицы
        const bodyMake = () => {
            const arr = all.map(ins=>{
                const form = ins.card["Данные компании"]["Форма организации"];
                const compName = ins.card["Данные компании"]["Наименование организации"].toUpperCase();
                const direcorName = ins.card["Генеральный директор"]["ФИО директора"];
                return {
                    text: [
                        {
                            text: `${form} «${compName}»\n`,
                            bold: true,
                            fontSize: headerFontSize,
                        },
                        {
                            text: "\n\n\n"
                        },
                        {
                            text: dash,
                        },
                        {
                            text: `${direcorName}\n`,
                            fontSize: textFontSize,
                        },
                        {
                            text: "На основании Устава",
                            fontSize: textFontSize,
                        }
                    ],
                    alignment: "center"
                }
            });
            arr.push({
                text: [
                    {
                        text: "ООО «СК «КАПИТАЛ-ПОЛИС»\n",
                        bold: true,
                        fontSize: headerFontSize,
                    },
                    {
                        text: "\n\n\n"
                    },
                    {
                        text: dash,
                    },
                    {
                        text: "/Корпусов Д.В./\n",
                        fontSize: textFontSize,
                    },
                    {
                        text: "Доверенность №74/2018 от 10.03.2018",
                        fontSize: textFontSize,
                    }
                ],
                alignment: "center"
            });
            return arr;
        }
        return {
            table: {
                headerRows: 1,
                widths,
                dontBreakRows: true,
                keepWithHeaderRows: 1,
                body: [
                    headersMake(),
                    bodyMake()
                ]
            },
            layout: {// цвет границы 
                hLineColor: '#e6e6e6',
                vLineColor: '#e6e6e6',
            }
        }
    }
    /**
     * Определение высоты разрыва между таблицами, чтобы на титул все поместилось
     * @param {number} numOfIns - количество страхователей, максимум 4 
     */
    chooseBreakerSize (numOfIns) {
        switch (numOfIns) {
            case 1:
                return BASEFONTSIZE+5;
            case 2:
                return BASEFONTSIZE+3;
            case 3:
                return BASEFONTSIZE-1;
            case 4:
                return 4; // с таким значением помещается на одном листе
            default:
                return BASEFONTSIZE;
        }
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
                    //ищем проц с идентичными машинами
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
                    if (!wasSameRisk (lists[wasIndex].processes, process)) {
                        lists[wasIndex].processes.push(process);
                        lists[wasIndex].risks.push(process.risk);
                    } 

                    if (!lists[wasIndex].wrappings.includes(process.wrapping)) lists[wasIndex].wrappings.push(process.wrapping);
                    currGroup = wasIndex;
                }
                process.cars.forEach(car=>{
                    if (!car.tableGroup) car.tableGroup = [currGroup];
                    if (!car.tableGroup.includes(currGroup)) car.tableGroup.push(currGroup);
                    if (!car.wrappings) car.wrappings = [process.wrapping];
                    if (!car.wrappings.includes(process.wrapping)) car.wrappings.push(process.wrapping);
                })
                if (process.isFull){ 
                    lists[currGroup].isFull = true;
                    lists[currGroup].groups = process.cars[0].tableGroup;
                }
            });
        });
        return lists;
        /**
         * Проверка, сущетсвует ли в нашем списке проц с такими же полями (кроме типа отсека)
         * @param {array} listOfProcesses - список уже добавленных процев
         * @param {process} proc - проверяемый про
         */
        function wasSameRisk (listOfProcesses, proc) {
            const checkingFields = ['cost', 'franchise', 'limit', 'risk', 'turnover'];
            // проходимся по списку всех процев в листе, если есть хоть один, у которого все проверяемые параметры совпадают с нашим то true
            return listOfProcesses.some(p => {
                return checkingFields.every(field => p[field] === proc[field]);
            })
        }
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
        this.isOneCarGroup = (lists.length===1); // если одна группа машин, то слово Група не нужно
        const listContent = [];
        let carTablesCount = 1;
        //порядок столбцов в таблице
        const colOrder = ['risk', 'cost', 'limit', 'franchise'];
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
            'risk': 97+25+35+100,
            'cost': 61+20,
            "amount": 0,
            "wrapping": 0, //100 было
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
                            border: NOBORDER,
                            colSpan: colNumber(),
                            alignment: 'left',
                            fontSize: BIGFONTSIZE,
                        },
                        ...putEmptyCells(colNumber()-1)
                    ],
                    [
                        {
                            text: 'Застрахованные риски,\n согласно п. 1.1',
                            style: "firstHeader",
                            border: NOBORDER,
                            fontSize: BIGFONTSIZE,
                        },
                        {
                            text: 'Страховая стоимость на т.с., руб.',
                            style: "firstHeader",
                            border: NOBORDER,
                            fontSize: BIGFONTSIZE,
                        },
                        
                        {
                            text: 'Лимит выплаты по случаю, руб.',
                            style: "firstHeader",
                            border: NOBORDER,
                            fontSize: BIGFONTSIZE,
                        },
                        {
                            text: 'Франшиза по риску, руб.',
                            style: "firstHeader",
                            border: NOBORDER,
                            fontSize: BIGFONTSIZE,
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
                const reg = /Набор рисков \d+/;
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
                    text: `Набор рисков ${group}:`,
                    border: NOBORDER,
                    colSpan: colNumber(),
                    alignment: 'left',
                    bold: true,
                    fontSize: BASEFONTSIZE,
                }, ...putEmptyCells(colNumber() - 1)]);
            }
            //функция выдачи отступов для строки, что бы значения были отцентрованы
            const getMargin = (str) => {
                const twoRows = ['Повреждение товарных автомобилей', 'Противоправные действия третьих лиц'];
                const noMargin = [0,0,0,0];
                const oneMargin = noMargin; //[0,8,0,8] было для двустрочных
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
                                    fontSize: BIGFONTSIZE,
                                }
                            }
                            else {
                                obj = {
                                    text: `${process[property]}`,
                                    margin: oneMargin,
                                    fontSize: BIGFONTSIZE,
                                }
                            }
                            break;
                        case 'cost':
                        case 'limit':
                        case 'franchise':
                            obj = {
                                text: addSpaces(process[property]),
                                margin: oneMargin,
                                fontSize: BIGFONTSIZE,
                            }
                            break;
                        case 'risk':
                            const riskName = this.CONF.RISK_CHANGER[process[property]] || process[property];
                            obj = {
                                // пункт риска отключен пока
                                // text: `${process[property]} п.\u00A01.1.${this.includedRisksOrder._indexOf(process[property])+1}`,
                                text: `${riskName}`,
                                margin: riskMargin,
                                alignment: 'left',
                                fontSize: BIGFONTSIZE,
                            };
                            break;
                        case 'group':
                            obj = {
                                text: `${group}`,
                                margin: oneMargin,
                                fontSize: BIGFONTSIZE,
                            };
                            break;
                        case 'wrapping':
                            obj = {
                                text: list.wrappings.join(', '),
                                margin: wrapMargin,
                                fontSize: BIGFONTSIZE,
                            };
                            break;
                        default:
                            obj = {
                                text: process[property],
                                margin: oneMargin,
                                fontSize: BIGFONTSIZE,
                            };
                            break;
                    }
                    obj.border = NOBORDER;
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
                const colWidths = (this.isOneCarGroup) ? [44, 88, 121, 58, 149] : [34, 68, 121, 48, 129, 60];
                const contentHeader = [
                    {
                        text: 'п/п',
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
                    },
                    {
                        text: 'Гос. знак',
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
                    },
                    {
                        text: `VIN`,
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
                    },
                    {
                        text: 'Год',
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
                    },
                    {
                        text: 'Тип грузового отсека',
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
                    }
                ];
                if (!this.isOneCarGroup) contentHeader.push(
                    {
                        text: 'Набор рисков*',
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
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
                            text: car.wrappings.join(', '),
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
                                    border: NOBORDER,
                                    colSpan: colNumber,
                                    alignment: 'left',
                                    fontSize: BASEFONTSIZE,
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
            text:'* Транспортные средства застрахованы на условиях и рисках, соответствующих указанным наборам рисков в Таблице 1.',
            bold: false,
            alignment: 'justify',
            fontSize: 10,
        })
        listContent.push(table);
        listContent.push({
            text:`Совокупные выплаты по всем застрахованным рискам не могут превышать - ${this.CONF.AGR_LIMIT}`,
            bold: true,
            alignment: 'justify',
            fontSize: BASEFONTSIZE,
        },'\n')
        return listContent;
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
            if (obj.name === BASENAME) {
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
                        border: NOBORDER,
                        fontSize: BASEFONTSIZE,
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
                        border: NOBORDER,
                        alignment: 'justify',
                        fontSize: BASEFONTSIZE,
                    }
                ]
                paragraph.body.push(tb);
            }
            else {
                mass.forEach((param, num) => {
                    let arr = [];
                    arr.push({
                        text: `${parIndex}.${num + 1}`,
                        border: NOBORDER,
                        fontSize: BASEFONTSIZE,
                    }, {
                            text: param.text,
                            border: NOBORDER,
                            fontSize: BASEFONTSIZE,
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
                widths: [1, 486],
                body: []
            };
            if (included) {
                table.body.push([
                    {
                        text: '1.1 Определения застрахованных рисков',
                        style: "firstHeader",
                        colSpan: 2,
                        border: NOBORDER,
                    },
                    {}
                ])
                let count = 1;
                // сначала добавляем Базовые риски (включенные)
                if (baseRisk.ToPDFinclude) {
                    table.body.push([
                        {
                            text: baseRisk.ToPDFinclude[0].text,
                            bold: baseRisk.ToPDFinclude[0].bold,
                            border: NOBORDER,
                            colSpan: 2,
                            alignment: 'justify',
                            fontSize: BASEFONTSIZE,
                        },
                        emptyCell
                    ]);
                    baseRisk.ToPDFinclude[1].ul.forEach(ul=>{
                        table.body.push([
                            {
                                text: ` `,
                                border: NOBORDER,
                            },
                            {
                                text: `• ${ul}`,
                                border: NOBORDER,
                                alignment: 'justify',
                                fontSize: BASEFONTSIZE,
                            }
                        ])
                    })
                    table.body.push()
                    count++;
                }
                for (const risk of list) {
                    const riskName = this.CONF.RISK_CHANGER[risk.name] || risk.name;
                    table.body.push([
                        {
                            text: [
                                { text: `${riskName}`, bold: true },
                                { text: ` - ${risk.title}. ` }
                            ],
                            border: NOBORDER,
                            colSpan: 2,
                            alignment: 'justify',
                            fontSize: BASEFONTSIZE,
                        },
                        emptyCell,
                    ])
                    count++;
                }
            }
            else {
                table.body.push([
                    {
                        text: '1.2 Незастрахованные риски:',
                        style: "firstHeader",
                        colSpan: 2,
                        border: NOBORDER
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
                            border: NOBORDER,
                            colSpan: 2,
                            alignment: 'justify',
                            fontSize: BASEFONTSIZE,
                        },
                        emptyCell
                    ]);
                    baseRisk.ToPDFnotInclude[1].ul.forEach(ul=>{
                        table.body.push([
                            {
                                text: ` `,
                                border: NOBORDER,
                            },
                            {
                                text: `• ${ul}`,
                                border: NOBORDER,
                                alignment: 'justify',
                                fontSize: BASEFONTSIZE,
                            }
                        ])
                    })
                    count++;
                }
                for (const risk of list) {
                    const riskName = this.CONF.RISK_CHANGER[risk.name] || risk.name;
                    table.body.push([
                        {
                            text: [
                                { text: `${riskName}`, bold: true },
                                { text: ` - ${risk.title}. ` }
                            ],
                            border: NOBORDER,
                            colSpan:2,
                            alignment: 'justify',
                            fontSize: BASEFONTSIZE,
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
            return paragraph.name == BASENAME;
        })[0]);
        const baseHeader = { text: `${BASENAME}:`, bold: true }
        baseRisk.ToPDFinclude = [baseHeader];
        baseRisk.ToPDFnotInclude = [baseHeader];
        if (baseRisk) {
            /**
             * если базовые риски включены - значит они в этом массиве не нужны, удаляем их 
             */
            risks = risks.filter(({ name }) => {
                return name !== BASENAME;
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
            if (risk!==BASENAME) return risks.find(r=>r.name===risk);
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
     * Создание блока с страхователями
     * @param {myFactory} mf 
     * @param {object} param1 объект с параметрами марджинов строк
     */
    prepareInsurantsBlock (mf,{oneRowMargin,twoRowMargin}) {
        const all = mf.polisObj.insurants;
        const makeBlock = (ins, name) => {
            return [
                {
                    text: `${name}`,
                    style: "leftCellFirstTable",
                    margin: oneRowMargin
                },
                {
                    text: [
                        {
                            text: `${ins.card["Данные компании"]["Форма организации"]} ${ins.card["Данные компании"]["Наименование организации"].toUpperCase()}\n`,
                            bold: true,
                        },
                        {
                            text: `${ins.card["Доп. информация"]["Юридический адрес"]}`,
                            fontSize: 10,
                        }

                    ],
                    colSpan: 2,
                    alignment: 'center',
                    margin: twoRowMargin
                }
            ]
        }
        if (all.length===1) {
            return [makeBlock(all[0],`СТРАХОВАТЕЛЬ`)];
        }
        return all.map((ins,i)=>makeBlock(ins,`СТРАХОВАТЕЛЬ ${i+1}`))
    }
    /**
     * Основная функция, создает на основе данных расчета и компании файл PDF и скачивает его
     * @param  {object} myFactory объект с практически всеми нужными данными
     * @param  {array} risks Список рисков с описанием
     */
    makePDF(myFactory, risks) {
        if (!myFactory.companyObj.card) {
            // заполняем нужные поля заглушками, если компания не выбрана
            myFactory.companyObj.card = {
                "Данные компании" : {
                    "Форма организации": '',
                    "Наименование организации": 'ОБРАЗЕЦ',
                },
                "Доп. информация": {
                    "Юридический адрес": '',
                },
                "Генеральный директор": {
                    "ФИО директора": '',
                }
            }
            myFactory.polisObj.insurants.push(myFactory.companyObj);
            this.CONF.wasMocked = true;
        }
        this.confConstructor (myFactory);
        const emptyCell = {
            text: '',
            border: [false, false, false, false],
        }
        const oneRowMargin = [0, 10, 0, 10];
        const twoRowMargin = [0, 5, 0, 5];
        // собираем стоку с данными о территории страхования
        const territory = this.makeTerritory(myFactory);
        let pageWithExtraFooter = null;
        const insurantsBlock = this.prepareInsurantsBlock (myFactory, {oneRowMargin,twoRowMargin});
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
                {
                    text: '\n',
                    fontSize: this.CONF.titleBreakerFontSize,
                },
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
                {
                    text: '\n',
                    fontSize: this.CONF.titleBreakerFontSize,
                },
                {
                    table: {
                        headerRows: 1,
                        widths: [150, 150, 175],
                        body: [
                            ...insurantsBlock,
                        ]
                    },
                    layout: {// цвет границы 
                        hLineColor: '#e6e6e6',
                        vLineColor: '#e6e6e6',
                    }
                },
                {
                    text: '\n',
                    fontSize: this.CONF.titleBreakerFontSize,
                },
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
                                    text: `${this.CONF.AGR_LIMIT}`,
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
                {
                    text: '\n',
                    fontSize: this.CONF.titleBreakerFontSize,
                },
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
                {
                    text: '\n',
                    fontSize: this.CONF.titleBreakerFontSize,
                },
                {
                    table: {
                        headerRows: 1,
                        widths: [242,242],
                        body: [
                            [
                                {
                                    text: 'ЦЕНТР СТРАХОВАНИЯ ТРАНСПОРТНЫХ РИСКОВ\n',
                                    bold: true,
                                    fontSize: 12,
                                    alignment: "center",
                                    colSpan: 2
                                },
                                {
                                }
                            ],
                            [
                                {
                                    text: "УРЕГУЛИРОВАНИЕ УБЫТКОВ\n",
                                    fontSize: 10,
                                    bold: true,
                                    alignment: "center",
                                },
                                {
                                    text: "КЛИЕНТСКАЯ СЛУЖБА\n",
                                    fontSize: 10,
                                    bold: true,
                                    alignment: "center",
                                }
                            ],
                            [
                                {
                                    text: "claims@capitalpolis.ru\n",
                                    fontSize: 10,
                                    alignment: "center",
                                },
                                {
                                    text: "cargo@capitalpolis.ru\n",
                                    fontSize: 10,
                                    alignment: "center",
                                }
                            ],
                            [
                                {
                                    text: "Московский пр., д.22, лит. 3, Санкт-Петербург, 190013, Россия",
                                    fontSize: 10,
                                    alignment: "center",
                                    colSpan: 2,
                                },
                                {
                                }
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
                if (page === pageWithExtraFooter) return {
                    table: {
                        headerRows: 0,
                        widths: [50, 70, 150, 70, 150, 50],
                        body: [
                            [
                                {
                                    text: `Лист ${page.toString()}/${pages.toString()} Полиса ${this.hipName}`,
                                    colSpan: 6,
                                    border: NOBORDER,
                                    alignment: 'center',
                                    fontSize: 7,
                                    margin: [0, 40, 0, 0],
                                }
                            ]
                        ],
                        style: 'table'
                    }
                }
                if (page > 1) {
                    const footer = {};
                    footer.table = Object.assign({},this.CONF.footerObj.table);
                    const len = footer.table.widths.length;
                    const listCounter = [
                        {
                            text: `Лист ${page.toString()}/${pages.toString()} Полиса ${this.hipName}`,
                            colSpan: len,
                            border: NOBORDER,
                            alignment: 'center',
                            fontSize: 7,
                        }
                    ];
                    footer.table.body = [...footer.table.body,listCounter];
                    return footer;
                }
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
            this.makeSignTable(myFactory),//таблица для подписей
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

        this.deleteServiceData (myFactory);
    }
    deleteServiceData (mf) {
        if (this.CONF.wasMocked) {
            mf.companyObj = {};
            mf.polisObj.insurants = [];
        }
        this.CONF.wasMocked = false;
    }
}

const polisMaker = new PolisMaker();



