export class Company {
  constructor(data){
    this.id = data.id;
    this.calculationsId = (data.calculations) ? parseCalcId(data.calculations) : null;
  }
}
/**
 * Функция преобразования строки с айдишниками рассчетов в массив чисел
 * @param {string} ids строка из id 
 */
function parseCalcId (ids) {
  return ids.split(', ').map(v=>Number(v));
}