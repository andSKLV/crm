export default class Calculation {
  constructor (mf) {
    this.id = null;
    this.name = null;
    this.date = null;
    this.factory = mf || null;
    this.companyID = null;
    this.linkId = null;
    this.isSaved = false;
    this.isLoaded = false;
    this.isInited = true;
  }
  parseFromMyFactory (mf) {
    this.name = mf.calculationName;
    this.factory = mf;
  }
  markAsLoaded () {
    this.isSaved = true;
    this.isLoaded = true;
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