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
  loadLink() {
    const fd = new FormData();
    fd.append('id',this.id);
    const req = new Request('php/get_link.php',{method:'POST',body:fd});
    fetch(req).then(async (resp)=>{
      resp = await resp.json();
      debugger;
    },(err)=>{
      console.error('Ошибка поиска привязки расчета')
    })
  }
}