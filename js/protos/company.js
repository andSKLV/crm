let _isFull = null;
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
  }
  /**
   * 
   * @param {object} data объект с ответом
   */
  parseFromCompaniesResponse (data) {
    this.id = data.id;
    this.responses.card = data;
    this.name = data.name;
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
    _isFull = val;
  }
  get isFull () {
    if (_isFull===null) _isFull = this.getFullness();
    return _isFull;
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