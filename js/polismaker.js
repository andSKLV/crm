import { GetLocaleMonth, GetFullForm, GetWordsFromNumber } from './ServiceFunctions.js';

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
    makeSignTable(myFactory) {
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
                    fillColor: '#e6e6e6',
                }
            })
            arr.push({
                text: this.CONF.vars.insurer,
                style: "firstHeader",
                fontSize: headerFontSize,
                fillColor: '#e6e6e6',
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
        const win = window.open('', '_blank');
        delay(500).then(() => pdfMake.createPdf(docDefinition).open({}, win)); // временно, чтобы не плодить кучу файлов
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
    confConstructor(mf) {
        const conf = this.CONF;
        conf.vars = {
            contractCMR: 'ДОГОВОР CMR/ТТН - СТРАХОВАНИЯ ПЕРЕВОЗЧИКА',
            insuranceOfTransport: 'СТРАХОВАНИЕ ГРУЗОВ ДЛЯ ТРАНСПОРТНЫХ ОПЕРАТОРОВ',
            city: 'г. Санкт-Петербург',
            executed: 'Исключено',
            firstCell1: '  В соответствии с настоящим Договором CMR/ТТН-страхования (далее - Договор)',
            firstCellKP: 'Общество с ограниченной ответственностью «Страховая компания «Капитал-полис страхование»',
            firstCellKPsmall: '(ООО «СК «Капитал-полис С»)',
            firstCell2: 'в лице Заместителя генерального директора Корпусова Д.В, действующего на основании Доверенности № 2-1602/2012 от 20.02.2012, в дальнейшем именуемое «Страховщик», и ',
            firstCell3: 'в лице',
            firstCell4: ', действующего на основании Устава, именуемое в дальнейшем «Страхователь», договорились о следующем:',
            p1: 'ПРЕДМЕТ ДОГОВОРА/ ОБЪЕКТ СТРАХОВАНИЯ',
            p1_1: 'Настоящим удостоверяется факт заключения Договора страхования грузов на основании Заявления страхователя и на условиях, содержащихся в настоящем Договоре и Правилах страхования грузов для транспортных операторов, утвержденных Приказом от 24.04.2012г. № 51-12 (далее – Правила), являющихся неотъемлемыми приложениями к настоящему Договору. В случае обнаружения расхождений между положениями настоящего Договора и положениями Правил приоритет имеют положения настоящего Договора.',
            p1_2: 'Страхователь передает, а Страховщик принимает на страхование в соответствии с процедурой, предусмотренной  Договором, груз – новые товарные автомобили, перевозимый Страхователем автомобильным транспортом по территории Российской федерации с учетом изъятий, предусмотренных настоящим Договором.',
            p1_3: 'Страхование не распространяется на перевозку грузов из/в/через «горячие точки»: ',
            p1_4: 'Если Стороны не договорятся об ином, страхование не распространяется на перевозки следующих грузов:',
            p2: 'Застрахованные риски',
            p3: 'ОБЩИЕ ПОЛОЖЕНИЯ',
            p3_1: 'Страхователь не застрахован от страховых рисков, не обозначенных в Договоре в качестве застрахованных, даже в тех случаях, когда они могли бы подпадать под общее определение застрахованных рисков.',
            p3_2: 'Страхование по Договору действует при условии соблюдения Страхователем инструкций для водителей, являющихся неотъемлемой частью Договора.',
            p3_3: 'Если иное не согласовано сторонами в письменной форме, страхование не распространяется на перевозки грузов, выполняемые с привлечением в качестве перевозчика физических лиц, не зарегистрированных в установленном законом порядке в качестве индивидуальных предпринимателей.',
            p3_4: 'Страхование распространяется на весь период перевозки груза, с момента принятия груза Страхователем, включая перегрузки (перевалки), временное хранение и кратковременные (до 12 часов) остановки на охраняемых стоянках, до момента передачи его Страхователем конечному грузополучателю, либо иному лицу, указанному грузовладельцем.',
            p3_5: 'Страхование, предусмотренное настоящим Договором, распространяется исключительно на перевозки, осуществляемые транспортными средствами, принадлежащими или арендованными Страхователем, если Стороны не договорятся об ином. При этом транспортная накладная должна быть подписана грузоотправителем и перевозчиком или их уполномоченными лицами.',
            p4: 'СРОК ДЕЙСТВИЯ ДОГОВОРА',
            p5: 'СТРАХОВАЯ СУММА. ЛИМИТЫ ОТВЕТСТВЕННОСТИ СТРАХОВЩИКА',
            p5_1: `Страховая стоимость груза – его действительная стоимость, которая определяется исходя из затрат на приобретение или изготовление груза, иных расходов, необходимость оплаты которых была вызвана процессом транспортировки (таможенные платежи, провозная плата). 
            Таможенные платежи и провозная плата включены в страховую сумму по настоящему Договору, если на основании акцептованного Страховщиком Заявления Страхователя по ним установлены лимиты ответственности Страховщика (п.п. 5.6.1. и 5.6.2. Договора соответственно).
            Страховая стоимость контейнера - его действительная (рыночная) стоимость на дату начала перевозки. `,
            p5_2: 'Действительная стоимость груза может быть подтверждена инвойсом (счетом) грузоотправителя. При международной перевозке дополнительно может быть запрошена грузовая таможенная декларация. Страхователь имеет право подтвердить страховую стоимость груза, представив соответствующее заключение Торгово-Промышленной палаты.',
            p5_3: 'Таможенные платежи и провозная плата возмещаются в размере, определенном в соответствии с действующим законодательством, пропорционально количеству утраченного или поврежденного груза, но не более установленных Договором лимитов ответственности Страховщика. ',
            p5_4: 'Страховая сумма по каждой перевозке соответствует страховой стоимости перевозимого груза и, в случае страхования риска, предусмотренного п.2.2.9. настоящего Договора, страховой стоимости контейнера, но не превышает лимита ответственности Страховщика, установленного Договором. ',
            p5_5: 'Лимит ответственности Страховщика - денежная сумма, в пределах которой Страховщик обязуется выплачивать страховое возмещение.',
            p5_6_first: 'Лимит ответственности Страховщика по страховому случаю устанавливается в размере ',
            p5_6_second: ', включая: ',
            p5_6_1: 'Лимит ответственности Страховщика по возмещению уплаченных таможенных платежей;',
            p5_6_2: 'Лимит ответственности Страховщика по возмещению провозной платы;',
            p5_6_3: 'Лимит ответственности Страховщика по возмещению расходов на восстановление  контейнера (п. 2.2.9. настоящего Договора).',
            p5_7: 'Общий (агрегатный) лимит  ответственности Страховщика по настоящему Договору устанавливается в размере',
            p5_8: 'После каждой выплаты страхового возмещения размер общего (агрегатного) лимита ответственности Страховщика автоматически уменьшается на сумму выплаченного страхового возмещения. Договор страхования прекращает свое действие, если  агрегатный лимит исчерпан.',
            p5_9: 'Общая сумма страховых выплат по одному и каждому страховому случаю не может превышать предельных сумм возмещения ущерба, установленных для перевозчиков и экспедиторов действующим законодательством и международными договорами Российской Федерации, а также сумм обоснованных расходов по спасанию груза и уменьшению убытков.',
            p5_10: 'Безусловная франшиза по одному страховому случаю составляет ',

        }
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
        conf.date = `«${startDate.day}» ${startDate.month} ${startDate.year} года`;
        conf.cleanDate = `C ${startDate.day} ${startDate.month} ${startDate.year} года `
        const endDate = this.getStrDate(mf.polisObj.dates.endDate);
        conf.endDate = `по ${endDate.day} ${endDate.month} ${endDate.year} года`;
        conf.limit = `${addSpaces(mf.a_limit.value)} ${currencySign[mf.document.currency]}`;
        conf.limitStr = GetWordsFromNumber(Math.round(mf.a_limit.value));
        const fr = 1000000; //FIXME:
        conf.franchise = `${addSpaces(fr)} ${currencySign[mf.document.currency]}`
        conf.franchiseStr = GetWordsFromNumber(fr);
    }
    getStrDate(date) {
        let day = date.getDate();
        if (day < 10) day = '0' + day;
        let month = GetLocaleMonth(date.getMonth(), false);
        const year = date.getFullYear();
        return { day, month, year };
    }
    getShortFIO(FIO) {
        if (FIO === '') return 'Иванова И.И.'
        return 'Иванова И.И.'
    }
    makePDF(myFactory) {
        debugger;
        this.confConstructor(myFactory);
        const putEmptyCells = (num) => new Array(num).map(x => new Object());
        const COLS = 6;
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [50, 65, 50, 65],
            defaultStyle: {
                fontSize: 10,
                bold: false,
                alignment: 'justify',
            },
            content: [
                {
                    table: {
                        headerRows: 0,
                        widths: [80, 25, 25, 25, 215, 70],
                        body: [
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
                            [
                                {
                                    text: `\n${this.CONF.vars.insuranceOfTransport}`,
                                    colSpan: COLS,
                                    fontSize: 12,
                                    alignment: 'center',
                                }, ...putEmptyCells(COLS - 1)
                            ],
                            [
                                {
                                    text: [
                                        `\n${this.CONF.date}\n`,
                                        `${this.CONF.vars.city}\n\n`
                                    ],
                                    colSpan: COLS,
                                    alignment: 'center',
                                }, ...putEmptyCells(COLS - 1)
                            ],
                            [
                                {
                                    text: [
                                        { text: `${this.CONF.vars.firstCell1} ` },
                                        { text: `${this.CONF.vars.firstCellKP} `, bold: true },
                                        { text: `${this.CONF.vars.firstCellKPsmall} ` },
                                        { text: `${this.CONF.vars.firstCell2} ` },
                                        { text: `${this.CONF.companyFullForm} `, bold: true },
                                        { text: `«${this.CONF.companyName}» `, bold: true },
                                        { text: `(${this.CONF.companyForm} «${this.CONF.companyName}») ` },
                                        { text: `${this.CONF.vars.firstCell3} ` },
                                        { text: `${this.CONF.roditelniyFIO}` },
                                        { text: `${this.CONF.vars.firstCell4}` }
                                    ],
                                    colSpan: COLS,
                                }, ...putEmptyCells(COLS - 1)

                            ],
                            //РАЗРЫВ
                            [
                                {
                                    text: ['\n'],
                                    colSpan: COLS,
                                }, ...putEmptyCells(COLS - 1)
                            ],
                            [
                                {
                                    text: [
                                        this.CONF.vars.p1
                                    ],
                                },
                                {
                                    text: ['1.1'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p1_1],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['1.2'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p1_2],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['1.3'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p1_3, this.CONF.territory],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['1.4'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p1_4, this.CONF.shipments],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [
                                        this.CONF.vars.p2.toUpperCase()
                                    ],
                                },
                                {
                                    text: ['2.1'],
                                    alignment: 'center',
                                },
                                {
                                    text: [''],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [
                                        this.CONF.vars.p2.toUpperCase()
                                    ],
                                },
                                {
                                    text: ['2.1'],
                                    alignment: 'center',
                                },
                                {
                                    text: [''],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            //РАЗРЫВ
                            [
                                {
                                    text: ['\n'],
                                    colSpan: COLS,
                                }, ...putEmptyCells(COLS - 1)
                            ],
                            [
                                {
                                    text: [
                                        this.CONF.vars.p3.toUpperCase()
                                    ],
                                },
                                {
                                    text: ['3.1'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p3_1],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['3.2'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p3_2],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['3.3'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p3_3],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['3.3'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p3_3],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['3.4'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p3_4],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['3.5'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p3_5],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            //РАЗРЫВ
                            [
                                {
                                    text: ['\n'],
                                    colSpan: COLS,
                                }, ...putEmptyCells(COLS - 1)
                            ],
                            [
                                {
                                    text: [
                                        this.CONF.vars.p4.toUpperCase()
                                    ],
                                },
                                {
                                    text: ['4.1'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.cleanDate, this.CONF.endDate],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            //РАЗРЫВ
                            [
                                {
                                    text: ['\n'],
                                    colSpan: COLS,
                                }, ...putEmptyCells(COLS - 1)
                            ],
                            [
                                {
                                    text: [
                                        this.CONF.vars.p5.toUpperCase()
                                    ],
                                },
                                {
                                    text: ['5.1'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p5_1],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['5.2'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p5_2],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['5.3'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p5_3],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['5.4'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p5_4],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['5.5'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p5_5],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['5.6'],
                                    alignment: 'center',
                                },
                                {
                                    text: [
                                        { text: `${this.CONF.vars.p5_6_first} ` },
                                        { text: `${this.CONF.limit} (${this.CONF.limitStr})`, bold: true },
                                        { text: `${this.CONF.vars.p5_6_second} ` },
                                    ],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: [''],
                                    alignment: 'center',
                                },
                                {
                                    text: ['5.6.1'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p5_6_1],
                                    colSpan: 2,
                                }, {},
                                {
                                    text: [this.CONF.vars.executed], //ИСКЛЮЧЕНО
                                    alignment: 'center',
                                }
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: [''],
                                    alignment: 'center',
                                },
                                {
                                    text: ['5.6.2'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p5_6_2],
                                    colSpan: 2,
                                }, {},
                                {
                                    text: [this.CONF.vars.executed], //ИСКЛЮЧЕНО
                                    alignment: 'center',
                                }
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: [''],
                                    alignment: 'center',
                                },
                                {
                                    text: ['5.6.3'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p5_6_3],
                                    colSpan: 2,
                                }, {},
                                {
                                    text: [this.CONF.vars.executed], //ИСКЛЮЧЕНО
                                    alignment: 'center',
                                }
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['5.7'],
                                    alignment: 'center',
                                },
                                {
                                    text: [
                                        { text: `${this.CONF.vars.p5_7} ` },
                                        { text: `${this.CONF.limit} (${this.CONF.limitStr})`, bold: true },
                                    ],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['5.8'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p5_8],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['5.9'],
                                    alignment: 'center',
                                },
                                {
                                    text: [this.CONF.vars.p5_9],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: [''],
                                },
                                {
                                    text: ['5.10'],
                                    alignment: 'center',
                                },
                                {
                                    text: [
                                        { text: `${this.CONF.vars.p5_10} ` },
                                        { text: `${this.CONF.franchise} (${this.CONF.franchiseStr})`, bold: true },
                                    ],
                                    colSpan: COLS - 2
                                }, ...putEmptyCells(COLS - 3)
                            ],
                            [
                                {
                                    text: `ПРЕДМЕТ ДОГОВОРА/ ОБЪЕКТ СТРАХОВАНИЯ`,
                                },
                                {
                                    text: `10.6`,
                                },
                                {
                                    text: `9.1.2`,
                                },
                                {
                                    text: `8.1.2.3`,
                                },
                                {
                                    text: `Гибель или повреждение всего или части груза вследствие дорожно-транспортного происшествия, наступившего в результате действий третьих лиц, - согласно п. 4.5.1. Правил.`,
                                },
                                {
                                    text: `Не застраховано`,
                                },
                            ],

                        ],
                        style: 'table',
                    },
                    // layout: 'noBorders',
                }
            ],
            footer: (page, pages, smth, pagesArr) => {
                if (page > 1) {
                    // const footer = {};
                    // footer.table = Object.assign({},this.CONF.footerObj.table);
                    // const len = footer.table.widths.length;
                    // const listCounter = [
                    //     {
                    //         text: `${this.CONF.vars.page} ${page.toString()}/${pages.toString()} ${this.CONF.vars.ofPolis} ${this.hipName}`,
                    //         colSpan: len,
                    //         border: NOBORDER,
                    //         alignment: 'center',
                    //         fontSize: 7,
                    //     }
                    // ];
                    // footer.table.body = [...footer.table.body,listCounter];
                    // return footer;
                    return {}
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
