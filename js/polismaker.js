import { GetLocaleMonth, GetFullForm, GetWordsFromPrice, GetWordsFromNumber } from './ServiceFunctions.js';

const NOBORDER = [false, false, false, false];
const DASHBORDER = {
    hLineStyle: function (i, node) {

        return { dash: { length: 1, space: 3 } };
    },
    vLineStyle: function (i, node) {

        return { dash: { length: 1, space: 3 } };
    },
};
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
        this.carsNumber = 0;
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
    confConstructor(mf) {
        const conf = this.CONF;
        conf.AGR_LIMIT = `${addSpaces(mf.a_limit.value)} ${currencySign[mf.document.currency]}`;
        conf.RISK_CHANGER = {
            'Поломка реф. установки': 'Поломка рефрижераторной установки',
            'Неохраняемая стоянка': 'Кража с неохраняемой стоянки',
        }
        conf.vars = {
            insurer: 'СТРАХОВЩИК',
            insurant: 'СТРАХОВАТЕЛЬ',
            polisCMRTTH: 'ПОЛИС CMR/ТТН - СТРАХОВАНИЯ ПЕРЕВОЗЧИКА',
            inrulesofdoc: 'Страхование действует в соответствии с Договором CMR/ТТН - страхования перевозчика',
            kapitalpolis: 'ООО «СК «КАПИТАЛ-ПОЛИС»',
            kpadress: 'Московский пр., д.22, лит. 3, Санкт-Петербург, 190013',
            period: 'ПЕРИОД СТРАХОВАНИЯ',
            territory: 'ТЕРРИТОРИЯ СТРАХОВАНИЯ',
            agrlimit: 'АГРЕГАТНЫЙ ЛИМИТ ОТВЕТСТВЕННОСТИ СТРАХОВЩИКА ПО ПОЛИСУ',
            fromdate: 'ДАТА ВЫДАЧИ',
            allcargo: 'Страхованием покрывается любой и каждый груз, с учетом исключений, предусмотренных полисом.',
            kpdirector: '/Корпусов Д.В/',
            attorney: 'Доверенность №74/2018 от 10.03.2018',
            cargocenter: 'ЦЕНТР СТРАХОВАНИЯ ТРАНСПОРТНЫХ РИСКОВ',
            lesionCenter: `УРЕГУЛИРОВАНИЕ УБЫТКОВ`,
            clientsCenter: 'КЛИЕНТСКАЯ СЛУЖБА',
            lesionCenterMail: 'claims@capitalpolis.ru',
            clientsCenterMail: 'cargo@capitalpolis.ru',
            page: 'Лист',
            ofPolis: 'Полиса',
            riskAndRules: '1. Риски и условия страхования для транспортных средств, перечисленных в Приложении 1',
            appex1: 'ПРИЛОЖЕНИЕ 1 - Списки транспортных средств подпадающих под страхование Полиса',
            table1: 'Таблица 1 - Условия страхования',
            insuredRisks: 'Застрахованные риски,',
            asPoint: ' согласно п. 1.1',
            insuredPrice: 'Страховая стоимость на т.с., руб.',
            insuredLimit: 'Лимит выплаты по случаю, руб.',
            insuredFranch: 'Франшиза по риску, руб.',
            risksPack: 'Набор рисков',
            listOfAuto: 'Список транспортных средств',
            listOfAutoNum: 'Список транспортных средств №',
            pp: 'п/п',
            carNumber: 'Гос. знак',
            VIN: 'VIN',
            carYear: 'Год',
            carType: 'Тип грузового отсека',
            footnote: '* Транспортные средства застрахованы на условиях и рисках, соответствующих указанным наборам рисков в Таблице 1.',
            allPaymentNotBigger: 'Совокупные выплаты по всем застрахованным рискам не могут превышать',
            insuredRisksDefinition: '1.1 Определения застрахованных рисков',
            notInsuredRisksDefinition: '1.2 Незастрахованные риски:',
            companyHeader: 'Страхователь'
        }
        conf.titleBreakerFontSize = this.chooseBreakerSize(mf.polisObj.insurants.length);
        conf.footerObj = this.makeFooterObj(mf.polisObj.insurants.length);
    }
    /**
     * Генерация футера в зависимости от количества страхователей
     * @param {number} numOfIns - количество страхователей
     */
    makeFooterObj(numOfIns) {
        //Добавляет нужное количество пустых ячеек
        const putEmptyCells = num => {
            const arr = [];
            for (let i = 0; i < num; i++) {
                arr.push(emptyCell)
            }
            return arr;
        }
        //Добавляет строку с необходимым количеством страхователей и страховщиком
        const createRowWithText = (num, text) => {
            const arr = [emptyCell];
            let printText = text;
            for (let i = 0; i < num; i++) {
                if (!text) printText = (i !== colNum - 1) ? (colNum === 2) ? `Страхователь: подпись и печать` : `Страхователь ${i + 1}: подпись и печать` : 'Страховщик: подпись и печать';
                arr.push({
                    text: printText,
                    fontSize: 7,
                    alignment: 'center',
                    border: NOBORDER,
                });
                if (colNum === 2) arr.push(emptyCell); //если страхователей 4, то отступы не нужны
            }
            if (colNum !== 2) arr.push(emptyCell); //если страхователей 4, то добавляем один отступ в конце
            return arr;
        }
        const colNum = numOfIns + 1; // количество страхователей + страховщик
        let marginWidth, dash;
        switch (colNum) {
            case 4:
            case 5:
                dash = '________________________________';
                marginWidth = 0;
                break;
            case 3:
                dash = '_________________________________________________';
                marginWidth = 0;
                break;
            default:
                dash = '_________________________________________________';
                marginWidth = 50;
                break;
        }
        const pageMargins = 25;
        const footerWidths = [];
        footerWidths.push(pageMargins) // отступ слева
        const width = (540 - (marginWidth * (colNum - 1)) - 2 * pageMargins) / (colNum);
        for (let i = 0; i < colNum; i++) {
            footerWidths.push(width);
            if ((colNum === 2) && i !== colNum - 1) footerWidths.push(marginWidth);
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
                        ...putEmptyCells(realColNum - 1) //количество столбцов с подписями и марджинами
                    ],
                    createRowWithText(colNum, dash)
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
    makeSignTable(myFactory, isContract) {
        const all = myFactory.polisObj.insurants;
        let headerFontSize, textFontSize, dash, pageWidth;
        //конфиг в зависимости от количества страхователей
        switch (all.length) {
            case 1:
                pageWidth = isContract ? 485 : 490;
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
        if (isContract) {
            headerFontSize = 8;
        }
        const width = Math.floor(pageWidth / (all.length + 1));
        const widths = new Array(all.length + 1).fill(width);
        //заголовок таблицы
        const headersMake = () => {
            const sigleInsurant = all.length === 1;
            const arr = all.map((ins, i) => {
                return {
                    text: sigleInsurant ? `${this.CONF.vars.insurant}` : `${this.CONF.vars.insurant} ${i + 1}:`,
                    style: "firstHeader",
                    fontSize: headerFontSize,
                    fillColor: (isContract) ? '#ffffff' : '#e6e6e6',
                }
            })
            arr.push({
                text: this.CONF.vars.insurer,
                style: "firstHeader",
                fontSize: headerFontSize,
                fillColor: (isContract) ? '#ffffff' : '#e6e6e6',
            })
            return arr;
        }
        // тело таблицы
        const bodyMake = () => {
            const arr = all.map(ins => {
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
                        text: `${this.CONF.vars.kapitalpolis}\n`,
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
                        text: `${this.CONF.vars.kpdirector}\n`,
                        fontSize: textFontSize,
                    },
                    {
                        text: this.CONF.vars.attorney,
                        fontSize: textFontSize,
                    }
                ],
                alignment: "center"
            });
            return arr;
        }
        const layout = (isContract) ? DASHBORDER : { hLineColor: '#e6e6e6', vLineColor: '#e6e6e6' }
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
            layout,
        }
    }
    /**
     * Определение высоты разрыва между таблицами, чтобы на титул все поместилось
     * @param {number} numOfIns - количество страхователей, максимум 4 
     */
    chooseBreakerSize(numOfIns) {
        switch (numOfIns) {
            case 1:
                return BASEFONTSIZE + 5;
            case 2:
                return BASEFONTSIZE + 3;
            case 3:
                return BASEFONTSIZE - 1;
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
                    currGroup = lists.length - 1;
                }
                else {
                    if (!wasSameRisk(lists[wasIndex].processes, process)) {
                        lists[wasIndex].processes.push(process);
                        lists[wasIndex].risks.push(process.risk);
                    }

                    if (!lists[wasIndex].wrappings.includes(process.wrapping)) lists[wasIndex].wrappings.push(process.wrapping);
                    currGroup = wasIndex;
                }
                process.cars.forEach(car => {
                    if (!car.tableGroup) car.tableGroup = [currGroup];
                    if (!car.tableGroup.includes(currGroup)) car.tableGroup.push(currGroup);
                    if (!car.wrappings) car.wrappings = [process.wrapping];
                    if (!car.wrappings.includes(process.wrapping)) car.wrappings.push(process.wrapping);
                })
                if (process.isFull) {
                    lists[currGroup].isFull = true;
                    lists[currGroup].groups = process.cars[0].tableGroup;
                }
            });
        });
        this.carsNumber = lists.reduce((acc, list) => {
            return (list.isFull) ? acc + list.cars.length : acc
        }, 0);
        return lists;
        /**
         * Проверка, сущетсвует ли в нашем списке проц с такими же полями (кроме типа отсека)
         * @param {array} listOfProcesses - список уже добавленных процев
         * @param {process} proc - проверяемый про
         */
        function wasSameRisk(listOfProcesses, proc) {
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
        this.isOneCarGroup = (lists.length === 1); // если одна группа машин, то слово Група не нужно
        const listContent = [];
        let carTablesCount = 1;
        //порядок столбцов в таблице
        const colOrder = ['risk', 'cost', 'limit', 'franchise'];
        const colNumber = () => colOrder.length;
        const putEmptyCells = num => {
            const arr = [];
            for (let i = 0; i < num; i++) {
                arr.push(emptyCell)
            }
            return arr;
        }
        // ширины столбца
        const colWidth = {
            'group': 0,
            'risk': 97 + 25 + 35 + 100,
            'cost': 61 + 20,
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
                            text: this.CONF.vars.table1,
                            border: NOBORDER,
                            colSpan: colNumber(),
                            alignment: 'left',
                            fontSize: BIGFONTSIZE,
                        },
                        ...putEmptyCells(colNumber() - 1)
                    ],
                    [
                        {
                            text: `${this.CONF.vars.insuredRisks}\n${this.CONF.vars.asPoint}`,
                            style: "firstHeader",
                            border: NOBORDER,
                            fontSize: BIGFONTSIZE,
                        },
                        {
                            text: this.CONF.vars.insuredPrice,
                            style: "firstHeader",
                            border: NOBORDER,
                            fontSize: BIGFONTSIZE,
                        },

                        {
                            text: this.CONF.vars.insuredLimit,
                            style: "firstHeader",
                            border: NOBORDER,
                            fontSize: BIGFONTSIZE,
                        },
                        {
                            text: this.CONF.vars.insuredFranch,
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
                return (i % 2 === 1 && i > 2) ? '#e6e6e6' : null;
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
        lists.forEach((list, i) => {
            const group = i + 1;
            let tableContent = table.table.body;
            if (!this.isOneCarGroup) {
                // добавляем разделитель Групп, если групп больше чем одна
                tableContent.push([{
                    text: `${this.CONF.vars.risksPack} ${group}:`,
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
                const noMargin = [0, 0, 0, 0];
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
                const widthsFromCols = {
                    5: [44, 88, 121, 58, 149],
                    6: [34, 68, 121, 48, 129, 60],
                    7: [20, 48, 121, 33, 129, 60, 52],
                }
                let colNumber;
                if (!this.isOneCarGroup && myFactory.polisObj.insurants.length > 1) colNumber = 7
                else if (!this.isOneCarGroup || myFactory.polisObj.insurants.length > 1) colNumber = 6
                else colNumber = 5;
                const tableHeader = (this.isOneCarGroup) ? this.CONF.vars.listOfAuto : `${this.CONF.vars.listOfAutoNum} ${carTablesCount} - ${this.CONF.vars.risksPack}: ${list.groups.map(x => x + 1).join(', ')}`;
                const colWidths = widthsFromCols[colNumber];
                const contentHeader = [
                    {
                        text: this.CONF.vars.pp,
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
                    },
                    {
                        text: this.CONF.vars.carNumber,
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
                    },
                    {
                        text: this.CONF.vars.VIN,
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
                    },
                    {
                        text: this.CONF.vars.carYear,
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
                    },
                    {
                        text: this.CONF.vars.carType,
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
                    }
                ];
                if (!this.isOneCarGroup) contentHeader.push(
                    {
                        text: `${this.CONF.vars.risksPack}*`,
                        style: "firstHeader",
                        fontSize: BASEFONTSIZE,
                    }
                )
                if (myFactory.polisObj.insurants.length > 1) contentHeader.push(
                    {
                        text: `${this.CONF.vars.companyHeader}`,
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
                            text: car.tableGroup.map(x => x + 1).join(', '),
                            style: 'carInfo',
                        }
                    )
                    if (myFactory.polisObj.insurants.length > 1) content.push(
                        {
                            text: car.data.insurant,
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
                                ...putEmptyCells(colNumber - 1),
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
            text: this.CONF.vars.footnote,
            bold: false,
            alignment: 'justify',
            fontSize: 10,
        })
        listContent.push(table);
        listContent.push({
            text: `${this.CONF.vars.allPaymentNotBigger} - ${this.CONF.AGR_LIMIT}`,
            bold: true,
            alignment: 'justify',
            fontSize: BASEFONTSIZE,
        }, '\n')
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
                        text: this.CONF.vars.insuredRisksDefinition,
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
                    baseRisk.ToPDFinclude[1].ul.forEach(ul => {
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
                        text: this.CONF.vars.notInsuredRisksDefinition,
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
                    baseRisk.ToPDFnotInclude[1].ul.forEach(ul => {
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
                            colSpan: 2,
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
        const includedRisks = [...this.includedRisksOrder].map(risk => {
            if (risk !== BASENAME) return risks.find(r => r.name === risk);
        }).filter(val => val !== undefined);
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
    prepareInsurantsBlock(mf, { oneRowMargin, twoRowMargin }) {
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
        if (all.length === 1) {
            return [makeBlock(all[0], `${this.CONF.vars.insurant}`)];
        }
        return all.map((ins, i) => makeBlock(ins, `${this.CONF.vars.insurant} ${i + 1}`))
    }
    start(mf, risks) {
        return new Promise(resolve => {
            this.makePDF(mf, risks);
            resolve();
        })
    }
    /**
     * Основная функция, создает на основе данных расчета и компании файл PDF и скачивает его
     * @param  {object} myFactory объект с практически всеми нужными данными
     * @param  {array} risks Список рисков с описанием
     */
    makePDF(myFactory, risks) {
        if (!myFactory.companyObj.card || myFactory.companyObj.card["Данные компании"]["Наименование организации"] === '') {
            // заполняем нужные поля заглушками, если компания не выбрана
            myFactory.companyObj.card = {
                "Данные компании": {
                    "Форма организации": 'ООО',
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
        this.confConstructor(myFactory);
        const emptyCell = {
            text: '',
            border: [false, false, false, false],
        }
        const oneRowMargin = [0, 10, 0, 10];
        const twoRowMargin = [0, 5, 0, 5];
        // собираем стоку с данными о территории страхования
        const territory = this.makeTerritory(myFactory);
        let pageWithExtraFooter = null;
        const insurantsBlock = this.prepareInsurantsBlock(myFactory, { oneRowMargin, twoRowMargin });
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
                                        `${this.CONF.vars.polisCMRTTH} \n`,
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
                                    text: `${this.CONF.vars.inrulesofdoc} ${this.hipName}.`,
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
                                    text: this.CONF.vars.insurer,
                                    style: "leftCellFirstTable",
                                    margin: oneRowMargin,
                                },
                                {
                                    text: [
                                        {
                                            text: `${this.CONF.vars.kapitalpolis}\n`,
                                            bold: true,
                                        },
                                        {
                                            text: `${this.CONF.vars.kpadress}\n`,
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
                                    text: this.CONF.vars.period,
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
                                    text: this.CONF.vars.territory,
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
                                    text: this.CONF.vars.agrlimit,
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
                                    text: this.CONF.vars.fromdate,
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
                                    text: this.CONF.vars.allcargo,
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
                                            text: `${this.CONF.vars.kapitalpolis}\n`,
                                            bold: true,
                                        },
                                        {
                                            text: "\n\n"
                                        },
                                        {
                                            text: "__________________________________________\n",
                                        },
                                        {
                                            text: `${this.CONF.vars.kpdirector}\n`,
                                            fontSize: 7
                                        },
                                        {
                                            text: `${this.CONF.vars.attorney}\n`,
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
                        widths: [242, 242],
                        body: [
                            [
                                {
                                    text: `${this.CONF.vars.cargocenter}\n`,
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
                                    text: `${this.CONF.vars.lesionCenter}В\n`,
                                    fontSize: 10,
                                    bold: true,
                                    alignment: "center",
                                },
                                {
                                    text: `${this.CONF.vars.clientsCenter}\n`,
                                    fontSize: 10,
                                    bold: true,
                                    alignment: "center",
                                }
                            ],
                            [
                                {
                                    text: `${this.CONF.vars.lesionCenterMail}\n`,
                                    fontSize: 10,
                                    alignment: "center",
                                },
                                {
                                    text: `${this.CONF.vars.clientsCenterMail}\n`,
                                    fontSize: 10,
                                    alignment: "center",
                                }
                            ],
                            [
                                {
                                    text: this.CONF.vars.kpadress,
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
                                    text: `${this.CONF.vars.page} ${page.toString()}/${pages.toString()} ${this.CONF.vars.ofPolis} ${this.hipName}`,
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
                    footer.table = Object.assign({}, this.CONF.footerObj.table);
                    const len = footer.table.widths.length;
                    const listCounter = [
                        {
                            text: `${this.CONF.vars.page} ${page.toString()}/${pages.toString()} ${this.CONF.vars.ofPolis} ${this.hipName}`,
                            colSpan: len,
                            border: NOBORDER,
                            alignment: 'center',
                            fontSize: 7,
                        }
                    ];
                    footer.table.body = [...footer.table.body, listCounter];
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
                text: this.CONF.vars.riskAndRules,
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
                text: `${this.CONF.vars.appex1} ${this.hipName}`,
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
        // const win = window.open('', '_blank');
        // delay(500).then(() => pdfMake.createPdf(docDefinition).open({}, win)); // временно, чтобы не плодить кучу файлов
    }
    deleteServiceData(mf) {
        if (this.CONF.wasMocked) {
            mf.companyObj = {};
            mf.polisObj.insurants = [];
        }
        this.CONF.wasMocked = false;
    }
}

const polisMaker = new PolisMaker();


class ContractMaker {
    constructor(myFactory) {
        this.CONF = {}
    }
    makeTerritory(mf) {
        const condition = mf.polisObj.conditions.filter(x => x.name === 'Страхование по полису не распространяется на перевозки из/в/через')
        if (!condition) return '';
        let territory = condition[0].values.reduce((acc, x) => {
            return (x.checked) ? [...acc, x.text] : acc
        }, [])
        if (territory.length === 0) return '';
        territory = territory.join(', ');
        return territory;
    }
    makeShipments(mf) {
        const condition = mf.polisObj.conditions.filter(x => x.name === 'Страхование по полису не распространяется на следующие типы грузов');
        if (!condition) return '';
        let shipments = condition[0].values.reduce((acc, x) => {
            return (x.checked) ? [...acc, x.text] : acc
        }, [])
        if (shipments.length === 0) return '';
        shipments.unshift('');
        shipments = shipments.join('\n  -   ');
        return shipments;
    }
    async confConstructor(mf) {
        const conf = this.CONF;
        const resp = await fetch('./src/contract.json');
        conf.vars = await resp.json();
        const company = mf.polisObj.insurants[0];
        conf.companyForm = company.card["Данные компании"]["Форма организации"];
        conf.companyFullForm = GetFullForm(conf.companyForm);
        conf.companyName = company.card["Данные компании"]["Наименование организации"];
        conf.directorName = company.card["Генеральный директор"]["ФИО директора"];
        conf.roditelniyFIO = this.getShortFIO(conf.direcorName);
        conf.contractNumber = HIP_NAME;
        conf.territory = this.makeTerritory(mf);
        conf.shipments = this.makeShipments(mf);
        const startDate = this.getStrDate(mf.polisObj.dates.startDate);
        conf.date = `${startDate.day} ${startDate.month} ${startDate.year} г.`;
        conf.cleanDate = `c «${startDate.day}» ${startDate.month} ${startDate.year} года `
        const endDate = this.getStrDate(mf.polisObj.dates.endDate);
        conf.endDate = `по «${endDate.day}» ${endDate.month} ${endDate.year} года. `;
        conf.price = `${mf.payment.leftPrice} ${currencySign[mf.document.currency]}`;
        conf.priceStr = GetWordsFromPrice(Number(mf.payment.leftPrice.replace(new RegExp(' ', 'g'), '')));
        conf.carsNumber = polisMaker.carsNumber;
        conf.carsNumberWords = `(${GetWordsFromNumber(conf.carsNumber)})`;
        conf.carsEndWithOne = this.getMultipleWord(conf.carsNumber);
        return conf.vars;
    }
    getMultipleWord(num) {
        const it = num % 10;
        switch (true) {
            case (it === 1):
                return ' единицу.'
            case (it > 1 && it < 5):
                return ' единицы.'
            default:
                return ' единиц.'
        }
    }
    getStrDate(date) {
        let day = date.getDate();
        if (day < 10) day = '0' + day;
        let month = GetLocaleMonth(date.getMonth(), false);
        const year = date.getFullYear();
        return { day, month, year };
    }
    getShortFIO(FIO) {
        //FIXME:
        if (FIO === '') return 'Иванова И.И.'
        return 'Иванова И.И.'
    }
    /**
     * Создается массив со строками из данных по финансам
     * @param {myFactory} param0 
     */
    makeFinanceTable({ payment }) {
        const finances = payment.array;
        const numOfPeriods = Number(payment.val);
        let periodText = '';
        switch (numOfPeriods) {
            case 1:
                periodText = '-й период';
                break;
            case 2:
                periodText = '-е полугодие';
                break;
            case 4:
                periodText = '-й квартал';
                break;
            case 6:
                periodText = '-е два месяца';
                break;
            case 12:
                periodText = '-й месяц';
                break;
        }
        return finances.map((fin, i) => {
            const date = (i === 0) ? `До ${fin.debtDate}` : fin.debtDate;
            return [`${i + 1}${periodText}`, `${date}`, `${fin.debt}`]
        })
    }
    async makePDF(myFactory) {
        await this.confConstructor(myFactory);
        const putEmptyCells = (num) => new Array(num).map(x => new Object());
        const COLS = 4;
        const breaker = () => {
            return [
                {
                    text: ['\n'],
                    colSpan: COLS,
                }, ...putEmptyCells(COLS - 1)
            ]
        }
        /**
         * Создание произвольной строки с заданной вложенностью и текстом
         * @param {Number} level уровень вложенности
         * @param {String} varName текст, который необходимо вывести 
         */
        const makeRow = (level, varName) => {
            let arr = [];
            for (let i = 1; i < level; i++) {
                arr.push({ text: [''] });
            }
            arr.push({
                text: varName,
                colSpan: COLS - level + 1
            })
            if (level < COLS) arr = [...arr, ...putEmptyCells(COLS - level)];
            return arr;
        }
        /**
         * Создание строки с заголовком раздела
         * @param {Number} point пункт договора
         */
        const makeHeader = point => {
            const varName = `p${point}`
            return [
                {
                    text: [{
                        text: `${this.CONF.vars[varName]} `,
                        bold: true,
                        alignment: 'center',
                    }],
                    colSpan: COLS
                }, ...putEmptyCells(COLS - 1)
            ]
        }
        /**
         * Формирование строки с вложенностью относительно пункта договора
         * @param {String} str номер пункта
         * @param {Array} args если нестандартный пункт, то передается архив с текстовыми полями, которые должны выводиться 
         */
        const autoRow = (str, args) => {
            const l = str.match(/\./g);
            const level = l ? l.length : 1;
            const varName = `p${str.replace(/\./g, '_')}`;
            const innerText = args ? args : [this.CONF.vars[varName]];
            let arr = [];
            for (let i = 1; i < level; i++) {
                arr.push({ text: [''] });
            }
            arr.push({ text: [`${str}.`] });
            arr.push({
                text: innerText,
                colSpan: COLS - level
            })
            if (level < 3) arr = [...arr, ...putEmptyCells(COLS - (level + 1))];
            return arr;
        }
        /**
         * Формирование строки с вложенностью относительно пункта договора с одним дополнительным отступом слева
         * @param {String} str номер пункта
         * @param {Array} args если нестандартный пункт, то передается архив с текстовыми полями, которые должны выводиться 
         */
        const autoRowWithMargin = (str, args) => {
            const l = str.match(/\./g);
            const level = l ? l.length + 1 : 1;
            const varName = `p${str.replace(/\./g, '_')}`;
            const innerText = args ? args : [this.CONF.vars[varName]];
            let arr = [];
            for (let i = 1; i < level; i++) {
                arr.push({ text: [''] });
            }
            arr.push({ text: [`${str}.`] });
            arr.push({
                text: innerText,
                bold: (level === 1),
                colSpan: COLS - level
            })
            if (level < 3) arr = [...arr, ...putEmptyCells(COLS - (level + 1))];
            return arr;
        }
        /**
         * Создание строки HIP
         * @param {String} hipName HIP пункт
         */
        const makeHipRow = hipName => {
            const arr = [{}];
            arr.push({ text: `HIP-${hipName}.`, bold: true });
            arr.push({ text: this.CONF.vars[`hip_${hipName}`], bold: true, colSpan: 2 });
            arr.push(...putEmptyCells(COLS - 3))
            return arr;
        }
        const repeatCreation = (func, arr) => {
            const res = arr.map(param => func(param));
            return res;
        }
        /**
         * Создание таблицы п10 с юридической информацией
         */
        const legalInfoTable = () => {
            /**
             * Создание объекта с удобными полями из объекта страхователя/страховщика
             * @param {Object} ins  
             */
            const parseInsurantToObj = ins => {
                if (ins.isKP) {
                    const obj = this.CONF.vars.KP_info;
                    obj.isKP = true;
                    return obj;
                }
                return {
                    form: ins.card["Данные компании"]["Форма организации"],
                    compName: ins.card["Данные компании"]["Наименование организации"],
                    legalAdres: ins.card["Доп. информация"]["Юридический адрес"],
                    adres: ins.card["Доп. информация"]["Фактический адрес"],
                    phone: ins.card["Доп. информация"]["Телефон"],
                    mail: ins.card["Доп. информация"]["Эл. почта"],
                    inn: ins.card["Реквизиты компании"]["ИНН"],
                    kpp: ins.card["Реквизиты компании"]["КПП"],
                    ogrn: ins.card["Реквизиты компании"]["ОГРН"],
                    raccount: ins.card["Банковские реквизиты"]["р/счет"],
                    kaccount: ins.card["Банковские реквизиты"]["к/счет"],
                    bik: ins.card["Банковские реквизиты"]["БИК"],
                    bank: ins.card["Банковские реквизиты"]["Банк"],
                }
            }
            /**
             * Создание таблицы с информацией в нужном виде
             * @param {Array} arr массив всех страхователей и страховщика
             * @param {Number} i индекс номера в массиве, таблица создается для двух элементов, левый i, правый i+1
             */
            const makeTable = (arr, i) => {
                const isIndexed = arr.length > 2;
                const obj1 = parseInsurantToObj(arr[i]);
                const obj2 = parseInsurantToObj(arr[i + 1]);
                const role1 = (isIndexed) ? `СТРАХОВАТЕЛЬ ${i + 1}` : `СТРАХОВАТЕЛЬ`;
                const role2 = (!obj2.isKP) ? `СТРАХОВАТЕЛЬ ${i + 2}` : `СТРАХОВЩИК`;
                /**
                 * Создание нужной строки с адресами в зависимости от того, совпадают ли эти адреса
                 * @param {Object} obj Объект с информацией о страхователе/страховщике
                 */
                const adresStr = obj => {
                    return (obj.legalAdres.trim() === obj.adres.trim()) ? `Юридический, почтовый адрес: ${obj.legalAdres}` : `Юридический адрес: ${obj.legalAdres}, почтовый адрес: ${obj.adres}`;
                }
                return [
                    { text: '' },
                    {
                        table: {
                            widths: [235, 235],
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `${role1}: ` },
                                            { text: `${obj1.form} ${obj1.compName}`, bold: true }
                                        ]
                                    }, {
                                        text: [
                                            { text: `${role2}: ` },
                                            { text: `${obj2.form} ${obj2.compName}`, bold: true }
                                        ]
                                    }],
                                [adresStr(obj1), adresStr(obj2)],
                                [`телефон: ${obj1.phone}, e-mail: ${obj1.mail}`, `телефон: ${obj2.phone}, e-mail: ${obj2.mail}`],
                                [`ИНН ${obj1.inn} КПП ${obj1.kpp} ОГРН ${obj1.ogrn}`, `ИНН ${obj2.inn} КПП ${obj2.kpp} ОГРН ${obj2.ogrn}`],
                                [`р/счет ${obj1.raccount} ${obj1.bank} к/счет ${obj1.kaccount} БИК ${obj1.bik}`, `р/счет ${obj2.raccount} ${obj2.bank} к/счет ${obj2.kaccount} БИК ${obj2.bik}`]
                            ],
                        },
                        layout: 'noBorders',
                        colSpan: COLS - 1,
                        alignment: 'justify',
                    }, ...putEmptyCells(COLS - 2)
                ]
            }
            const arr = [...myFactory.polisObj.insurants, { isKP: true }]; //страхователи + страховщик
            const tables = [];
            for (let i = 0; i < arr.length; i = i + 2) {
                const t = makeTable(arr, i);
                tables.push(t);
            }
            return tables;
        }
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [50, 65, 50, 65],
            defaultStyle: {
                fontSize: 8,
                bold: false,
                alignment: 'justify',
            },
            content: [
                {
                    table: {
                        headerRows: 0,
                        widths: [15, 30, 25, 395],
                        body: [
                            //заголовок
                            [
                                {
                                    text: [
                                        `${this.CONF.vars.contractCMR}\n`,
                                        `${this.CONF.contractNumber}\n`
                                    ],
                                    colSpan: COLS,
                                    style: 'firstHeader',
                                    fontSize: 16,
                                }, ...putEmptyCells(COLS - 1)
                            ],
                            //подзаголовок
                            [
                                {
                                    text: `\n${this.CONF.vars.insuranceOfTransport}`,
                                    colSpan: COLS,
                                    fontSize: 10,
                                    alignment: 'center',
                                }, ...putEmptyCells(COLS - 1)
                            ],
                            breaker(),
                            //дата и город
                            [
                                {
                                    table: {
                                        widths: [235, 235],
                                        body: [
                                            [this.CONF.date, this.CONF.vars.city]
                                        ],

                                        alignment: 'center',
                                    },
                                    layout: 'noBorders',
                                    colSpan: COLS,
                                    alignment: 'center',
                                }, ...putEmptyCells(COLS - 1)
                            ],
                            //страхователь - страховщик
                            [
                                {
                                    text: [
                                        { text: `${this.CONF.vars.firstCell1} ` },
                                        { text: `${this.CONF.vars.firstCellKP} `, bold: true },
                                        { text: `${this.CONF.vars.firstCell2} ` },
                                        { text: `${this.CONF.companyFullForm.toUpperCase()} `, bold: true },
                                        { text: `«${this.CONF.companyName}» `, bold: true },
                                        { text: `(${this.CONF.companyForm} «${this.CONF.companyName}») ` },
                                        { text: `${this.CONF.vars.firstCell3} ` },
                                        { text: `${this.CONF.roditelniyFIO}` },
                                        { text: `${this.CONF.vars.firstCell4}` }
                                    ],
                                    colSpan: COLS,
                                }, ...putEmptyCells(COLS - 1)

                            ],
                            breaker(),
                            makeHeader('1'),
                            breaker(),
                            ...repeatCreation(autoRow, ['1.1', '1.2']),
                            autoRow('1.3', [
                                this.CONF.vars.p1_3_first,
                                {
                                    text: this.CONF.cleanDate,
                                    bold: true,
                                },
                                {
                                    text: this.CONF.endDate,
                                    bold: true,
                                },
                                this.CONF.vars.p1_3_second
                            ]),
                            ...repeatCreation(autoRowWithMargin, ['2', '2.1', '2.1.1', '2.1.2', '2.1.3', '2.2']),
                            breaker(),
                            ...repeatCreation(autoRowWithMargin, ['3', '3.1', '3.1.1', '3.1.2', '3.1.3']),
                            autoRowWithMargin('3.2', [{ text: this.CONF.vars.p3_2, bold: true }]),
                            makeRow(3, this.CONF.vars.p3_2_end),
                            makeHipRow('R01'),
                            makeRow(3, this.CONF.vars.hip_R01_text),
                            makeHipRow('R02'),
                            makeRow(3, this.CONF.vars.hip_R02_text),
                            makeHipRow('C01'),
                            //вложенные списки
                            [
                                {
                                    text: ['']
                                },
                                {
                                    text: ['']
                                },
                                {
                                    stack: [
                                        `${this.CONF.vars.hip_C01_text.start}\n`,
                                        {
                                            ol: [
                                                `${this.CONF.vars.hip_C01_text.p1}`,
                                                `${this.CONF.vars.hip_C01_text.p2}`,
                                                `${this.CONF.vars.hip_C01_text.p3}`,
                                                `${this.CONF.vars.hip_C01_text.p4}`,
                                                `${this.CONF.vars.hip_C01_text.p5}`,
                                                [
                                                    `${this.CONF.vars.hip_C01_text.p6}`,
                                                    {
                                                        type: 'lower-alpha',
                                                        ol: [
                                                            `${this.CONF.vars.hip_C01_text.p6_a}`,
                                                            `${this.CONF.vars.hip_C01_text.p6_b}`,
                                                            {
                                                                type: 'lower-roman',
                                                                ol: [
                                                                    `${this.CONF.vars.hip_C01_text.p6_b_i}`,
                                                                    `${this.CONF.vars.hip_C01_text.p6_b_ii}`,
                                                                    `${this.CONF.vars.hip_C01_text.p6_b_iii}`
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ],
                                                `${this.CONF.vars.hip_C01_text.p7}`
                                            ]
                                        }
                                    ],
                                    colSpan: 2,
                                },
                                {
                                    text: ['']
                                },
                            ],
                            makeHipRow('R03'),
                            makeRow(3, this.CONF.vars.hip_R03_text),
                            makeHipRow('R04'),
                            makeRow(3, this.CONF.vars.hip_R04_text),
                            breaker(),
                            makeHeader('4'),
                            breaker(),
                            ...repeatCreation(autoRow, ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8']),
                            breaker(),
                            makeHeader('5'),
                            breaker(),
                            ...repeatCreation(autoRow, ['5.1', '5.2']),
                            autoRow('5.3', [
                                { text: this.CONF.vars.p5_3 },
                                { text: ` ${this.CONF.carsNumber} ${this.CONF.carsNumberWords}${this.CONF.carsEndWithOne}`, bold: true }
                            ]),
                            ...repeatCreation(autoRow, ['5.4', '5.4.1', '5.4.2', '5.4.2.1', '5.4.2.2', '5.4.3', '5.5', '5.6', '5.7']),
                            breaker(),
                            makeHeader('6'),
                            breaker(),
                            autoRow('6.1', [
                                { text: this.CONF.vars.p6_1 },
                                { text: `${this.CONF.price} (${this.CONF.priceStr}) `, bold: true },
                                { text: [this.CONF.vars.p6_1_end, this.CONF.vars.payText[myFactory.payment.val]] }
                            ]),
                            autoRow('6.2'),
                            //таблица платежей 
                            [
                                {
                                    text: ['']
                                },
                                {
                                    table: {
                                        headerRows: 1,
                                        widths: [145, 145, 145],
                                        body: [
                                            ['№ очетного периода', 'Дата начала отчетного периода', 'Сумма платежа'],
                                            ...this.makeFinanceTable(myFactory),
                                        ],

                                    },
                                    layout: DASHBORDER,
                                    colSpan: COLS - 1,
                                    alignment: 'center',
                                }, ...putEmptyCells(COLS - 2)
                            ],
                            ...repeatCreation(autoRow, ['6.3', '6.4', '6.5', '6.6']),
                            breaker(),
                            makeHeader('7'),
                            breaker(),
                            ...repeatCreation(autoRow, ['7.1', '7.2']),
                            //таблица убыточности
                            [
                                {
                                    text: ['']
                                },
                                {
                                    table: {
                                        headerRows: 1,
                                        widths: [225, 225],
                                        body: [
                                            [this.CONF.vars.p7_2_table.h1, this.CONF.vars.p7_2_table.h2],
                                            [this.CONF.vars.p7_2_table.r1_1, this.CONF.vars.p7_2_table.r1_2],
                                            [this.CONF.vars.p7_2_table.r2_1, this.CONF.vars.p7_2_table.r2_2],
                                            [this.CONF.vars.p7_2_table.r3_1, this.CONF.vars.p7_2_table.r3_2],
                                        ],
                                    },
                                    layout: DASHBORDER,
                                    colSpan: COLS - 1,
                                    alignment: 'center',
                                }, ...putEmptyCells(COLS - 2)
                            ],
                            ...repeatCreation(autoRow, ['7.3', '7.4']),
                            breaker(),
                            makeHeader('8'),
                            breaker(),
                            ...repeatCreation(autoRow, ['8.1', '8.2']),
                            breaker(),
                            makeHeader('9'),
                            breaker(),
                            ...repeatCreation(autoRow, ['9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '9.7', '9.7.1', '9.7.2', '9.7.3', '9.7.4', '9.7.5', '9.7.6']),
                            makeRow(2, this.CONF.vars.p9_7_end),
                            breaker(),
                            makeHeader('10'),
                            breaker(),
                            ...legalInfoTable(),
                            // FIXME:

                        ],
                        style: 'table',
                    },
                    layout: 'noBorders',
                },
                '\n',
                polisMaker.makeSignTable(myFactory, true),
            ],
            footer: (page, pages, smth, pagesArr) => {

                const footer = {};
                footer.table = Object.assign({}, polisMaker.CONF.footerObj.table);
                const len = footer.table.widths.length;
                const listCounter = [
                    {
                        text: `${polisMaker.CONF.vars.page} ${page.toString()}/${pages.toString()} ${this.CONF.vars.ofContract} ${polisMaker.hipName}`,
                        colSpan: len,
                        border: NOBORDER,
                        alignment: 'center',
                        fontSize: 7,
                    }
                ];
                const emptyRow = [{ text: '\n\n\n', border: NOBORDER, colSpan: len }];
                footer.table.body = (page < pages) ? [...footer.table.body, listCounter] : [emptyRow, listCounter];
                return footer;

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
                    alignment: 'center',
                },
                carInfo: {
                    fontSize: 9,
                }
            }
        };
        pdfMake.fonts = {
            Roboto: {
                normal: 'PTN.ttf',
                bold: 'PTN-bold.ttf'
            }
        }
        const win = window.open('', '_blank');
        delay(500).then(() => pdfMake.createPdf(docDefinition).open({}, win)); // временно, чтобы не плодить кучу файлов
    }

}
const contractMaker = new ContractMaker();

export { polisMaker, contractMaker }
