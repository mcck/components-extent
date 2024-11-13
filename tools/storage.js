
let VALUE_TYPE = {
  undefined: 1,
  boolean: 2,
  number: 3,
  string: 4,
  object: 5,
  function: 6,
};

class MyStorage {
  namespace = '';
  storagObj = null;
  constructor(storageObj, ns) {
    this.namespace = ns;
    this.storagObj = storageObj;
  }

  clear() {
    this.keys().forEach(this.storagObj.removeItem);
  }
  getItem(key, def) {
    let val = this.storagObj.getItem(this.namespace + ':' + key);
    return val ? deserialize(val) : def;
  }
  keys() {
    let keys = [];
    for (let i = 0; i < this.storagObj.length; i++) {
      let key = this.storagObj.key(i);
      if (key.startsWith(this.namespace + ':')) {
        keys.push(key);
      }
    }
    return keys;
  }
  key(index) {
    return this.keys(index);
  }
  get length() {
    return this.keys().length;
  }
  removeItem(key) {
    this.storagObj.removeItem(this.namespace + ':' + key);
  }
  setItem(key, val) {
    this.storagObj.setItem(this.namespace + ':' + key, serialize(val));
  }
}


export class Local extends MyStorage {
  constructor(ns){
    super(localStorage, ns);
  }
}


export class Session extends MyStorage {
  constructor(ns) {
    super(sessionStorage, ns);
  }
}



function serialize(val){
  let res;
  switch (VALUE_TYPE[typeof (val)]){
  case VALUE_TYPE.undefined:
    res = String(VALUE_TYPE.undefined) + '';
    break;
  case VALUE_TYPE.boolean:
    res = String(VALUE_TYPE.boolean) + Number(val);
    break;
  case VALUE_TYPE.number:
    res = String(VALUE_TYPE.number) + val;
    break;
  case VALUE_TYPE.string:
    res = String(VALUE_TYPE.string) + val;
    break;
  case VALUE_TYPE.object:
    res = String(VALUE_TYPE.object) + JSON.stringify(val);
    break;
  case VALUE_TYPE.function:
    res = String(VALUE_TYPE.function) + val.toString();
    break;
  }
  return res;
}
function deserialize(val){
  let type = val.at(0);
  val = val.substring(1);
  switch(type){
  case VALUE_TYPE.undefined:
    return undefined;
  case VALUE_TYPE.boolean:
    return Boolean(Number(val));
  case VALUE_TYPE.number:
    return Number(val);
  case VALUE_TYPE.string:
    return val;
  case VALUE_TYPE.object:
    return JSON.parse(val);
  case VALUE_TYPE.function:
    return new Function('return '+val)();
  }
}
