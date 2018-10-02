export class Company {
  constructor(){
    this.id = null;
    this.card = null;
    this.responses = {};
    this.isLoaded = false;
  }
  /**
   * 
   * @param {object} data объект с ответом
   */
  parseFromCompaniesResponse (data) {
    this.id = data.id;
    this.responses.card = data;
  }
}
/**
 * Функция преобразования строки с айдишниками рассчетов в массив чисел
 * @param {string} ids строка из id 
 */
function parseCalcId (ids) {
  return ids.split(', ').map(v=>Number(v));
}