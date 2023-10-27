/**
 * 查询树结构路径
 * @param { Array } tree 树
 * @param { Funtion } compare 比较方法
 * @param { String } children 子节点字段
 * @returns { Array } 树结构数组
 */
export function findTreePath(tree, compare, children = 'children') {
  let paths = [];

  function find(arr, level) {
    for (let item of arr) {
      paths[level] = item;

      if (compare(item)) {
        // 去除后面的
        paths.splice(level + 1);
        return item;
      } else if (item[children] instanceof Array) {
        if (find(item[children], level + 1)) {
          return item;
        }
      }
    }
  }

  if (!find(tree, 0)){
    // 没有找到
    paths = [];
  }
  return paths;
}