export class Company {
  constructor(){
    this.id = null;
    this.card = null;
    this.responses = {};
    this.isLoaded = false;
    this.isSaved = false;
    this.links = null;
    this.name = null;
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
}
/**
 * Функция преобразования строки с айдишниками рассчетов в массив чисел
 * @param {string} ids строка из id 
 */
function parseCalcId (ids) {
  return ids.split(', ').map(v=>Number(v));
}