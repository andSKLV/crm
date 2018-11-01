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
   */
  async loadConditions (str) {
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
    if (condition.name==='Базовые риски'||condition.name==='Страхование по полису не распространяется на следующие грузы') return false;
    this.conditions = this.conditions.filter(cond=>cond.name!==condition.name);
  }
  applyStartAdditions () {
    //стартовые дополнения 
    this.additions = {'1':[],'2':[]};
  }
}

