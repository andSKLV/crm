export default class Loading {
  constructor(){
    this.div = document.querySelector('#loading_modal');
  }
  show () {
    if (this.div) this.div.style.display = 'block';
  }
  hide () {
    if (this.div) this.div.style.display = 'none';
  }
}