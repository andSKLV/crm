export default class Polis {
  constructor(mf) {
    this.isSaved = false;
    this.companyName = null;
    this.calcName = null;
    this.isInited = false;
    this.isRequested = false;

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
  
}

