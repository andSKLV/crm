export class Car {
  constructor () {
    this.id = null;
    this.park = null;
    this.group = {
      id: null,
      obj: null,
    }
    this.data = {
      model: null,
      autNumber: null,
      VIN: null,
      prodYear: null,
      startYear: null,
      endYear: null,
      type: null,
      risks: null,
      company: null,
    }
  }
  setData (obj) {
    this.data = obj;

  }
}

export class CarGroup {
  constructor() {
    this.id = null;
    this.cars = [];
  }
  add(car) {
    this.cars.push(car);
    car.group.obj = this;
  }
}