export default class Profile {
  constructor () {
    this.store = {}; // хранилище всех объектов, например ответы от базы данных по расчетам и тд
    this.factory = null;
  }
  bindFactory (mf) {
    mf.profileObj = this;
    this.factory = mf;
  }
}