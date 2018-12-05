
/**
 *  Функция генерации объекта карточки клиента из данных из БД
 * @param {obj} data - ответ из БД
 * @returns {obj} - объект карточки клиента
 */
export function GenerateClientCard(data) {
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
        "КПП": data.KPP,
        "ОКПО": data.OKPO,
        "ОКВЭД": data.OKVED,
      },
    "Банковские реквизиты":
      {
        "р/счет": data.r_account,
        "к/счет": data.k_account,
        "Банк": data.bank,
        "БИК": data.bik,
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