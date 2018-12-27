export default class Polis {
  constructor(mf) {
    this.isSaved = false;
    this.companyName = null;
    this.calcName = null;
    this.isInited = false;
    this.isRequested = false;
    this.multi = true;
    this.additionsSeen = false;
    this.financeSeen = false;
    this.type = 'Перевозчики';
    this.dates = {
      start: null,
      startDate: null,
      end: null,
      endDate: null,
      changes: [],
      time: 'Год',
    }
    this.insurants = [];
    if (mf) this.bindMyFactory(mf);
  }
  bindMyFactory (myFactory) {
    this.factory = myFactory;
    this.updateNames ();
  };
  updateNames () {
    const myFactory = this.factory;
    if (myFactory.calculationName!=="" && myFactory.calculationName!==undefined) this.calcName = myFactory.calculationName;
    else if (myFactory.calcObj.isLinked) this.calcName = 'привязанный';
    if (myFactory.newClientCard) this.companyName = myFactory.newClientCard['Данные компании']['Наименование организации'];
  };
  /**
   * Функция загрузки стартовых оговорок из json
   * @param {str} str  название загружаемых оговорок: Перевозчики либо Экспедиторы
   * @param {boolean} includeBR - добавлять Базовые риски или нет
   */
  async loadConditions (str, includeBR) {
    let url;
    switch (str) {
      case 'Экспедиторы':
        url = 'polisConditions-conf';
        break;
      case 'Перевозчики':
        url = 'polisConditions'
        break;
      default:
        console.error('Ошибка загрузки оговорок. Ожидался Перевозчики или Экспедиторы, пришел '+str);
        return false;
        break;
    }
    const resp = await fetch (`./src/${url}.json`);
    this.conditions = await resp.json();
    this.conditions.forEach(val=>{
      if (val.name===BASENAME && !includeBR) val.values.forEach(v=>v.checked = false);
      val.included = false;
    });
    return this.conditions;
  }
  updateConditionsCheck() {
    if (!this.conditions) return false;
    this.conditions.forEach(cond=>{
      let counter = 0;
      cond.values.forEach(val=>{if (val.checked) counter++});
      cond.chechedCount = counter;
      cond.delete = (cond) => {return this.deleteAddition(cond);}
    })
  }
  deleteAddition (condition) {
    if (condition.name===BASENAME||condition.name==='Страхование по полису не распространяется на следующие грузы'||condition.const) return false;
    this.conditions = this.conditions.filter(cond=>cond.name!==condition.name);
  }
  applyStartAdditions () {
    //стартовые дополнения 
    this.additions = {'0':[],'1':[],'2':[]};
  }
}

