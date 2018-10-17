/**
 *  Модальное окно с просьбой подождать так как идет загрузка данных
 * Чтобы его подключить в html вставить div id=loading_modal и loading модель, в js создать новый объект класса для управления им
 */
export default class Loading {
  constructor(show){
    this.div = document.querySelector('#loading_modal');
    if (show) this.show();
  }
  show () {
    if (this.div) this.div.style.display = 'block';
  }
  hide () {
    if (this.div) this.div.style.display = 'none';
  }
}