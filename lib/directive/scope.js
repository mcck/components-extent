/**
 * 给元素添加scope
 */
export default {
  install(vue) {
    vue.directive('scope', {
      // 当被绑定的元素挂载到 DOM 中时
      created(el, binding) {
        let scopeId = binding.instance.getScopeId();
        el.scopeId(scopeId, '');
      }
    });
  },
};
