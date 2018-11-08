export class Car {
  constructor () {
    this.id = null;
    this.process= null;
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
}