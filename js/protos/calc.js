export default class Calculation {
  constructor (mf) {
    this.id = null;
    this.name = null;
    this.date = null;
    this.factory = mf || null;
    this.companyID = null;
    this.links = null;
    this.isSaved = false;
    this.isLoaded = false;
    this.isLinked = false;
    this.isInited = true;
  }
  parseFromMyFactory (mf) {
    this.name = mf.calculationName;
    this.factory = mf;
    mf.calcObj = this;

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
  /**
   * loading links for this calc obj and binding it
   */
  async loadLink() {
    const resp = await this.factory.loadLinks('calc_id',this.id);
    await this.bindLink(resp);
  }
  /**
   * Binding array of links to calculation object
   * @param {Array} arr - all links for this calc 
   */
  bindLink(arr) {
    if (!arr.length) return undefined;
    this.isLinked = (arr.length>0); 
    this.links = arr.length>0 ? arr : null;
  }
}