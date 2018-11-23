export default class Company {
  constructor(){
    this.id = null;
    this.card = null;
    this.responses = {};
    this.isLoaded = false;
    this.isSaved = false;
    this.links = null;
    this.name = null;
    this.factory = null;
    this._isFull = null;
  }
  /**
   * 
   * @param {object} data объект с ответом
   */
  parseFromCompaniesResponse (data) {
    this.id = data.id;
    this.responses.card = data;
    this.name = data.name;
    this.info = {
      'Communications':data.Communications,
      'Legal_address':data.Legal_address,
      'Real_address':data.Real_address,
      'company_group': data.company_group,
      'company_mail': data.company_mail,
      'company_phone': data.company_phone,
      'company_url:':data.company_url,
      'status': data.status,
    }
  }
  markAsLoaded(){
    this.isLoaded = true;
    this.isSaved = true;
  }
  savedAs({id,card,savedObj}){
    this.isSaved = true;
    this.id = id;
    this.card = card;
    this.name = card['Данные компании']['Наименование организации'];
    delete savedObj.type;
    this.responses.card = savedObj;
  }
  set isFull (val) {
    this._isFull = val;
  }
  get isFull () {
    this._isFull = this.getFullness();
    return this._isFull;
  }
  getFullness() {
    const card = this.card;
    for (let outobj in card) {
      const field = card[outobj];
      for (let inobj in field) {
        const val = field[inobj];
        if (val==='') return false;
      }
    }
    return true;
  }
}
/**
 * Функция преобразования строки с айдишниками рассчетов в массив чисел
 * @param {string} ids строка из id 
 */
function parseCalcId (ids) {
  return ids.split(', ').map(v=>Number(v));
}