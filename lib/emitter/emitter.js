function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx,
    });

    this._registerAutoDestroy(name, callback, ctx);

    return this;
  },

  _registerAutoDestroy(name, callback, ctx, ){
    if (!ctx?.$) {
      return;
    }
    let self = this;
    let bum = ctx.$.bum = ctx.$.bum || [];
    bum.push(function websocketAutoDestroy() {
      self.off(name, callback);
    });
    // let da = ctx.$.da = ctx.$.da || [];
    // da.push(function websocketAutoDestroy() {
    //   console.log(2);
    // });
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      return callback.apply(ctx, arguments);
    }

    listener._ = callback;
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;
    let result = [];
    for (i; i < len; i++) {
      result.push(evtArr[i].fn.apply(evtArr[i].ctx, data, evtArr[i].mete));
    }

    return result;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  },
};

// module.exports = E;
export default E;
