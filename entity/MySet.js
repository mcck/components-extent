
export default class MySet extends Array{

  constructor(...args){
    super();
    if (args[0] instanceof Function){
      this.setComparer(args[0]);
    } else {
      this.push(args);
    }
  }

  _comparer = function(o1, o2){
    return o1 == o2;
  };

  setComparer(fn){
    if (!(fn instanceof Function)){
      throw new Error('Comparer must be a function');
    }
    this._comparer = fn;
    return;
  }

  push(...args){
    for(let i = 0; i < args.length; i++){
      if (!this.includes(args[i])){
        super.push(args[i]);
      }
    }
    return this.length;
  }

  includes(searchElement, fromlndex=0){
    for (let i = fromlndex; i < this.length; i++){
      if (this._comparer(this[i], searchElement)){
        return true;
      }
    }
    return false;
  }

}