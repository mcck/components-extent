/**
 * 给元素添加scope
 */
export default {
  install(vue) {
    vue.directive('scope-id', {
      // 当被绑定的元素挂载到 DOM 中时
      created(el, binding, ctx) {
        debugger
        let scopeId = ctx.scopeId;
        el.setAttribute(scopeId, '');
      }
    });
  },
};
