export default class Calculation {
  constructor () {
    this.id = null;
    this.name = null;
    this.date = null;
    this.company = null;
    this.factory = null;
  }
  parseFromMyFactory (mf) {
    this.name = mf.calculationName;
    this.factory = mf;
  }
  parseFromResponse ({id,date,name,}) {
    this.id = id;
    this.date = date;
    this.name = this.name || name;
  }
  isEmpty() {
    return this.factory.parks.length===0;
  }
  refresh() {
    this.name = this.factory.calculationName;
  }
}