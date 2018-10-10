export default class Profile {
  constructor () {
    this.store = {};
    this.factory = null;
  }
  bindFactory (mf) {
    mf.profileObj = this;
    this.factory = mf;
  }
}