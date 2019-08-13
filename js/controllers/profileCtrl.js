import Company from '../protos/company.js';
import Profile from '../protos/profile.js';
import Loading from '../protos/loading.js';
import { GenerateClientCard } from '../ServiceFunctions.js';
import { isNumeric, delay, getPathName} from '../calculation.js';

app.controller('profileCtrl', function ($scope, $rootScope, $http, $q, $location, myFactory) {
  $scope.myFactory = myFactory;
  myFactory.scopes.profile = $scope;
  const scope = this;

  async function init() {
    const id = $scope.myFactory.companyObj.id;
    if (!id) {
      alert('Ошибка открытия клиента. Пожалуйста обратиетсь к разработчику');
      return false;
    } // всплывающее окно о загрузке
    const pr = new Profile();
    pr.bindFactory($scope.myFactory);
    await loadDash();
    const modal = new Loading();
    modal.show();
    await $scope.loadCompany(id);
    pr.store.calcLinks = await $scope.loadCalcLinks(id);
    const calcs = await $scope.loadCalculations(pr.store.calcLinks);//загрузка расчетов
    if (calcs) calcs.sort((a,b)=>a.date<b.date ? 1 : -1) //сортируем по дате
    pr.store.calculations = fixPremia(calcs);
    await $scope.loadAddresses ();
    $scope.addCompanyToInsurants (myFactory.companyObj);
    // TODO: линки с БД connections
    modal.hide();

    function loadDash() {
      return $http.post('./src/profile-dashboard.json').then((resp) => {
        $scope.currObj = resp.data;
      }, (err) => {
        console.error(err);
      })
    }
    /**
     * Функция изменения вида значения фактической премии, так как она может быть записана с коэфициентом
     * @param {Array} arr - массив с расчетами из БД
     */
    function fixPremia(arr) {
      if (!arr) return [];
      const fixed = arr.map(calc => {
        const oldVal = calc['fact_premia'];
        let newVal = null;
        if (!oldVal || oldVal === ';1') newVal = calc['total_price'];
        else {
          const ind = oldVal.search(';');
          if (ind >= 1) newVal = oldVal.slice(0, ind);
        }
        calc['fact_premia'] = newVal;
        return calc;
      })
      return fixed;
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
    return $http.post('php/load.php', query).then(resp => {
      if (Array.isArray(resp.data)) {
        const was = {};
        // выбираем только уникальные айдишники, без повторов
        const uniq = resp.data.filter(link => {
          if (!was[link.calc_id]) {
            was[link.calc_id] = true;
            return true;
          }
          else return false;
        })
        //переворачиваем для хронологического порядка
        uniq.reverse();
        return uniq;
      }
      else alert('Возникли проблемы с загрузкой привязанных расчетов. Обратитесь к разработчику');
    }, err => {
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
    data.id = id;
    return $http.post('php/search.php', data).then(async (resp) => {
      const data = resp.data;
      myFactory.newClientCard = GenerateClientCard(data);
      const companyObj = new Company();
      myFactory.companyObj = companyObj;
      companyObj.parseFromCompaniesResponse(data) //создаем объект с  id  из ответа и сохраняем ответ внутри
      companyObj.card = myFactory.newClientCard;
      companyObj.markAsLoaded();
      clearSearch();
    }, function error(resp) {
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
    if (links.length === 0) {
      console.log('Нет расчетов');
      return false;
    }
    const query = {};
    query.type = 'load_linked_calcs';
    query.ids = links.map(link => link['calc_id']);
    return $http.post('php/load.php', query).then(resp => {
      if (!Array.isArray(resp.data)) {
        alert(`Проблема с загрузкой расчетов. Пожалуйста, по возможности не закрывайте это окно и обратитесь к разработчику`);
        console.error(resp.data);
        return null;
      }
      if (resp.data.length !== links.length) console.warn(`Размер полученных данных не совпадает с запрошенными`);
      return resp.data;

    }, err => {
      console.error(err);
    })
  }
  /**
   * Загрузка юр и фактического адреса компании
   * ID для запросов берутся из companyObj.responses
   * Загруженные данные сохраняются в companyObj и newClientCard
   */
  $scope.loadAddresses = () => {
    const check = str => {
      return (isNumeric(str)) ? str : '1';
    }
    const query = {
      legal_id: check(myFactory.companyObj.responses.card.Legal_address),
      real_id: check(myFactory.companyObj.responses.card.Real_address),
    }
    const formatAddress = adr => {
      return Object.values(adr).slice(1).filter(v=>v!=='').map(v=>v.trim());
    }
    if (query.legal_id==='1'&&query.real_id==='1') return false;
    query.type = 'addresses';
    return $http.post('php/load.php',query).then(resp=>{
      if (!Array.isArray(resp.data)) {
        console.error(resp.data);
        return false;
      }
      const data = resp.data;
      myFactory.companyObj.responses.adresses = data;
      if (data[0].id!=='1') {
        if (data[0].PostalCode==='0') delete data[0].PostalCode;//если индекс 0, то удаляем его
        const legal = formatAddress(data[0]).join(', ');
        myFactory.newClientCard['Доп. информация']['Юридический адрес'] = legal;
      }
      if (data[1].id!=='1') {
        if (data[1].PostalCode==='0') delete data[1].PostalCode;//если индекс 0, то удаляем его
        const fakt = formatAddress(data[1]).join(', ');
        myFactory.newClientCard['Доп. информация']['Фактический адрес'] = fakt;
      }
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
      const mf = $scope.myFactory;
      this.previousPage = this.currentPage;
      this.currentPage = index;
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
  $scope.relocate = (path) => {
    $scope.myFactory.cameFrom = {
      name: getPathName($location.$$path),
      path: $location.$$path,
    };
    $location.path(path);
  };
  /**
 * Deleting serach result after choosing one of the results
 */
  function clearSearch() {
    try {
      $rootScope.search_result = [];
    }
    catch (err) {
      console.error(`Clear search results problem: ${err}`);
    }
  }
  $scope.$on('$destroy', function () {
    $scope.myFactory.removeCellSelection('dashboard_container', true);
  });
  /**
   * для вывода подсказок
   */
  $scope.tooltip = {
    title: "",
    fadeIn(title) {
      if (title === '') title = 'Без названия';
      this.title = title;
    },
    fadeOut() {
      this.title = '';
    }
  };
  /**
   * Добавляем компанию в сострахователи
   * @param {Company} company 
   */
  $scope.addCompanyToInsurants = (company) => {
    if (myFactory.polisObj && 
        myFactory.polisObj.insurants.length<4 && 
        !myFactory.polisObj.insurants.some(ins=>ins.id===company.id)) myFactory.polisObj.insurants.push(company);
  }
  if (!$scope.myFactory.companyObj.id) $scope.relocate('/');
  else init();
});
