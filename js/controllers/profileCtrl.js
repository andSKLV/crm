import Company from '../protos/company.js';
import Profile from '../protos/profile.js';
import Loading from '../protos/loading.js';

app.controller('profileCtrl', function ($scope,$rootScope, $http, $q, $location, myFactory) {
  $scope.myFactory = myFactory;
  const scope = this;
  init();
  
  async function init () {
    const id = $scope.myFactory.companyObj.id;
    if (!id) {
      alert('Ошибка открытия клиента. ПОжалуйста обратиетсь к разработчику');
      return false;
    }
    const modal = new Loading();
    modal.show(); // всплывающее окно о загрузке
    const pr = new Profile();
    pr.bindFactory($scope.myFactory);
    await loadDash();
    await $scope.loadCompany(id);
    pr.store.calcLinks = await $scope.loadCalcLinks(id);
    pr.store.calculations = await $scope.loadCalculations(pr.store.calcLinks);//загрузка расчетов
    // TODO: линки с БД connections
    modal.hide();

    function loadDash () {
      return $http.post('src/profile-dashboard.json').then((resp)=>{
        $scope.currObj = resp.data;
      },(err)=>{
        console.error(err);
      })
    }
  }
  /**
   * Функция загрузки айдишников расчетов, которые првязаны к данной компании
   * @param {string} id компания, связки с которой загружаем
   */
  $scope.loadCalcLinks = function (id) {
    const query = {};
    query.type = 'company_calculations';
    query.model = 'company_id';
    query.id = id;
    return $http.post('php/load.php',query).then(resp=>{
      if (Array.isArray(resp.data)) return resp.data;
      else alert ('Возникли проблемы с загрузкой привязанных расчетов. Обратитесь к разработчику');
    },err=>{
      console.error(err);
    });
  }
  /**
   * Загрузка из БД данных карточки клиента
   * @param {strinf} id компании
   */
  $scope.loadCompany = function (id) {
    // const myFactory = $scope.myFactory;
    const data = {};
    data.type = 'load_company';
    data.id=id;
    return $http.post('php/search.php', data).then(async (resp) => {
        const data = resp.data;
        myFactory.newClientCard = generateClientCard(data);
        const companyObj = new Company();
        myFactory.companyObj = companyObj;
        companyObj.parseFromCompaniesResponse(data) //создаем объект с  id  из ответа и сохраняем ответ внутри
        companyObj.card = myFactory.newClientCard;
        companyObj.markAsLoaded();
        clearSearch();
        /**
         *  Функция генерации объекта карточки клиента из данных из БД
         * @param {obj} data - ответ из БД
         * @returns {obj} - объект карточки клиента
         */
        function generateClientCard (data) {
            return {
                'Данные компании':
                {
                   "Форма организации": getOrgForm(data.OrganizationFormID),
                   "Наименование организации": data.name,
                   "Дата регистрации": getDate(data.registration_date),
                   "Наименование рег. органа": data.who_registrate,
                 },
                 "Генеральный директор":
                 {
                   "ФИО директора":data.director_name,
                   "Серия и номер паспорта":data.general_director_passport,
                   "Когда выдан":getDate(data.give_date),
                   "Кем выдан":data.director_authority,
                 },
                 "Реквизиты компании":
                 {
                   "ОГРН":data.OGRN,
                   "ИНН/КПП": getInnKpp(data),
                   "ОКПО":data.OKPO,
                   "ОКВЭД":data.OKVED,
                 },
                 "Банковские реквизиты":
                 {
                   "р/счет":data.r_account,
                   "к/счет":data.k_account,
                   "Банк":data.bank,
                   "БИК":data.bik,
                 }
               }
        }
        /**
         * Функция возвращает наименование формы компании 
         * @param {number} id 
         */
        function getOrgForm (id) {
            if (id==='0') return '';
            const forms = {
                1: "ЗАО",
                2: "ООО",
                3: "ОАО",
                4: "ИП"
            }
            return forms[+id];
        }
        /**
         * Function to parse INN and KPP from loaded obj
         * @param {obj} data object of client from DB
         */
        function getInnKpp (data) {
            if (data.INN===""&&data.KPP==="") return "";
            else return `${data.INN} / ${data.KPP}`;
        }
        function getDate (date) {
            return (date==='0000-00-00') ? '' : date; 
        } 
    },function error(resp){
        console.error(resp);
    })
  }
  /**
   * Загрузка рассчетов из ссылок на них
   * @param {Array} links - массив с обектами пар id - data. берется из метода loadCalcLinks
   */
  $scope.loadCalculations = function (links) {
    const calculations = {};
    if (!Array.isArray(links)) {
      console.error(`Ошибка формата:${typeof links} должкен быть array`);
      return false;
    }
    if (links.length===0) {
      console.log('Нет расчетов');
      return false;
    }
    const query = {};
    query.type='load_linked_calcs';
    query.ids = links.map(link=>link['calc_id']);
    return $http.post('php/load.php',query).then(resp=>{
      if (!Array.isArray(resp.data)) {
        alert (`Проблема с загрузкой расчетов. Пожалуйста, по возможности не закрывайте это окно и обратитесь к разработчику`);
        console.error(resp.data);
        return null;
      }
      if (resp.data.length!==links.length) console.error(`Размер полученных данных не совпадает с запрошенными`);
      return resp.data;

    },err=>{
      console.error(err);
    })
  }

  $scope.newDashboard = {
    currentPage: 0,
    previousPage: -1,
    toLeft(index) {
      return this.previousPage < this.currentPage && this.previousPage == index;
    },
    toRight(index) {
      return this.previousPage > this.currentPage && this.previousPage == index;
    },
    fromLeft(index) {
      return this.previousPage > this.currentPage && this.currentPage == index;
    },
    fromRight(index) {
      return this.previousPage < this.currentPage && this.currentPage == index;
    },
    checkCurrentPage(index) {
      return index === this.currentPage;
    },
    async setCurrentPage(index) {
      // await this.extraAction(index);
      this.previousPage = this.currentPage;
      this.currentPage = index;
    },
    // дополнительные действия при нажатии на каретку
    async extraAction(ind){
      // const prof = $scope.myFactory.profileObj;

      // switch (ind) {
      //   case 1:
      //     if (ind===1&&!prof.store.calculations) {
      //       const calcs = await $scope.loadCalculations(prof.store.calcLinks); //загрузка расчетов, если они еще не были загружены
      //       prof.store.calculations = calcs;
      //       return calcs;
      //     }
      //     break;
      // }
      

    },
    getIndex(param) {
      // FIXME:
      // this.setCurrentPage($scope.clientCard.indexOf(param));
    }
  }
  $scope.loadToDashboard = (key) => {//обратный переход для карточки клиента
    $scope.currObj.forEach((param, i) => {
      param.values.forEach(({ name }, j) => {
        if (name == key) {
          Array.from(document.querySelectorAll(".company_dashboard_inputs")).forEach(item => {
            item.classList.remove("selected");
          });
          Array.from(document.querySelectorAll("div.clientCard td")).forEach(node => {
            node.classList.remove("mi_selected");
            if (node.title == key) node.classList.add("mi_selected");
          })
          if ($scope.newDashboard.currentPage != i) $scope.newDashboard.setCurrentPage(i);
          setTimeout(() => {
            const elem = document.querySelector(".ul_current").firstElementChild.children[j].firstElementChild;
            elem.classList.add("selected");
            elem.focus();
          }, 100);
        }
      })
    })
  };
  $scope.isntEmpty = (obj) => {
    for (let key in obj) {
        if (obj[key] != "" && obj[key] != "Форма организации" && obj[key] != undefined) return true;
    }
    return false;
  };
    /**
   * Deleting serach result after choosing one of the results
   */
  function clearSearch () {
    try {
        $rootScope.search_result = [];
    }
    catch (err) {
        console.error (`Clear search results problem: ${err}`);
    }
  }

});
