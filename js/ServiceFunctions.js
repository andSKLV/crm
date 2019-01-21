import Company from './protos/company.js';
/**
 *  Функция генерации объекта карточки клиента из данных из БД
 * @param {obj} data - ответ из БД
 * @returns {obj} - объект карточки клиента
 */
function GenerateClientCard(data) {
  return {
    'Данные компании':
      {
        "Форма организации": getOrgForm(data.OrganizationFormID),
        "Наименование организации": data.name,
        "Дата регистрации": getDate(data.registration_date),
        "Наименование рег. органа": data.who_registrate,
      },
    "Генеральный директор":
      {
        "ФИО директора": data.director_name,
        "Серия и номер паспорта": data.general_director_passport,
        "Когда выдан": getDate(data.give_date),
        "Кем выдан": data.director_authority,
      },
    "Продолжение":
      {
        "Место рождения": data.director_birth_place,
        "Адрес регистрации": data.director_address,
      },
    "Реквизиты компании":
      {
        "ОГРН": data.OGRN,
        "ИНН": data.INN,
        "КПП": data.num,
      },
    "Доп. информация":
      {
        "Телефон": data.company_phone,
        "Эл. почта": data.company_mail,
        "Юридический адрес": data.Legal_address,
        "Фактический адрес": data.Real_address,
      }
  }
}
/**
 * Функция возвращает наименование формы компании 
 * @param {number} id 
 */
function getOrgForm(id) {
  if (id === '0') return '';
  const forms = {
    1: "ЗАО",
    2: "ООО",
    3: "ОАО",
    4: "ИП"
  }
  return forms[+id];
}
function getDate(date) {
  return (date === '0000-00-00') ? '' : date;
}

const DeleteInsurant = (insurant, factory) => {
  /**
   * Checnum if deleting active company
   * @param {object} param0 insurant
   * @param {Company } param1 active company
   */
  const isActiveCompany = ({id: deleteId},{id: activeId}) => deleteId===activeId;
  /**
   * Выбираем ближайший не удаляемый элемент. Если удаляемый последний - возвращаем предпоследний, 
   * если не последний - то возвращаем последний
   * @param {object} toDelete - удаляемый элемент
   * @param {array} all - массив с элементами
   */
  const chooseActiveCompany = (toDelete, all) => {
      const id = all.indexOf(toDelete);
      const len = all.length;
      return (id===len-1 && len>1) ?  all[len-2] : all[len-1];
  };
  if (isActiveCompany(insurant,factory.companyObj)) {
      if (factory.polisObj.insurants.length>1) {
          const newActive = chooseActiveCompany(insurant,factory.polisObj.insurants);
          factory.companyObj = newActive;
      }
      else {
          factory.companyObj = new Company();
          delete factory.newClientCard;
      }
  }
  factory.polisObj.insurants = factory.polisObj.insurants.filter(el=>el!==insurant);
}
const GetLocaleMonth = (m,isUpper) => {
  const monthes = {
    0: 'января',
    1: 'февраля',
    2: 'марта',
    3: 'апреля',
    4: 'мая',
    5: 'июня',
    6: 'июля',
    7: 'августа',
    8: 'сентября',
    9: 'октября',
    10: 'ноября',
    11: 'декабря',
  }
  let month = monthes[m];
  if (isUpper) month = month[0].toUpperCase() + month.slice(1);
  return month;
}
const GetFullForm = (short,form = 'им') => {
  const forms = {
    'ООО': ['Общество с ограниченной ответственностью','Общества с ограниченной ответственностью'],
    'ЗАО': ['Закрытое акционерное общество','Закрытого акционерного общества'],
    'ПАО': ['Публичное акционерное общество','Публичного акционерного общества'],
    'ОАО': ['Открытое акционерное общество','Открытого акционерного общества'],
  }
  const selectors = {
    'им': '0',
    'род': '1'
  }
  if (!forms[short]) return '';
  const selector = selectors[form] ? selectors[form] : selectors['им'];
  return forms[short][selector];
}
const GetWordsFromNumber = (num = 0) => {
  return sum_letters(num) + ', 00/100';
  function num_letters(num, d) {  // целое число прописью, это основа
    let str = '', arr = [
      ['','тысяч','миллион','миллиард','триллион'],
      ['и','',''],
      ['а','ов','ов']
    ];
    if (num == '' || num == '0') return ' ноль'; // 0
    num = num.split(/(?=(?:\d{3})+$)/);  // разбить число в массив с трёхзначными числами
    if (num[0].length == 1) num[0] = '00'+num[0];
    if (num[0].length == 2) num[0] = '0'+num[0];
    for (let i = (num.length - 1); i >= 0; i--) {  // соединить трёхзначные числа в одно число, добавив названия разрядов с окончаниями
      if (num[i] != '000') {
        str = (((d && i == (num.length - 1)) || i == (num.length - 2)) && (num[i][2] == '1' || num[i][2] == '2') ? t(num[i],1) : t(num[i])) + declOfNum(num[i], arr[0][num.length - 1 - i], (i == (num.length - 2) ? arr[1] : arr[2])) + str;
      }
    }
    function t(num, d) {  // преобразовать трёхзначные числа
      let arr = [
        ['',' одного',' двух',' трех',' четырех',' пяти',' шести',' семи',' восьми',' девяти'],
        [' десяти',' одиннадцати',' двенадцати',' тринадцати',' четырнадцати',' пятнадцати',' шестнадцати',' семнадцати',' восемнадцати',' девятнадцати'],
        ['','',' двадцати',' тридцати',' сорока',' пятидесяти',' шестидесяти',' семидесяти',' восьмидесяти',' девяноста'],
        ['',' ста',' двухсот',' трехсот',' четырехсот',' пятисот',' шестисот',' семисот',' восьмисот',' девятисот'],
        ['',' одной',' двух']
      ];
      return arr[3][num[0]] + (num[1] == 1 ? arr[1][num[2]] : arr[2][num[1]] + (d ? arr[4][num[2]] : arr[0][num[2]]));
    }
    return str;
  }
  function declOfNum(n, t, o) {  // склонение именительных рядом с числительным: число (typeof = string), корень (не пустой), окончание
    let num = [2,0,1,1,1,2,2,2,2,2];
    return (t == '' ? '' : ' ' + t + (n[n.length-2] == "1"?o[2]:o[num[n[n.length-1]]]));
  }
  function razUp(arr) {  // сделать первую букву заглавной и убрать лишний первый пробел
    return arr[1].toUpperCase() + arr.substring(2);
  }
  function sum_letters(num) {
    num = Number(num).toFixed(2).split('.');  // округлить до сотых и сделать массив двух чисел: до точки и после неё
    return razUp(num_letters(num[0]) + declOfNum(num[0], 'рубл', ['я','ей','ей']));
  }
}
export {
  GenerateClientCard,
  DeleteInsurant,
  GetLocaleMonth,
  GetFullForm,
  GetWordsFromNumber
}