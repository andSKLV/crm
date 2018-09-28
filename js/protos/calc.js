export default class Calculation {
  constructor () {
    this.id = null;
    this.name = null;
    this.date = null;
    this.company = null;
    this.factory = null;
    this.companyID = null;
  }
  parseFromMyFactory (mf) {
    this.name = mf.calculationName;
    this.factory = mf;
  }
  parseFromResponse (data) {
    this.id = data.id;
    this.date = data.date;
    this.name = this.name || data.name;
    this.companyID = data.companyID || null;
  }
  isEmpty() {
    return this.factory.parks.length===0;
  }
  refreshName() {
    this.name = this.factory.calculationName;
  }
}