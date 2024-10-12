import { hasNotValue } from "./utils";

/**
 * tree类型转list
 * @param {Array} tree 树列表
 * @param {String} childrenKey 子项字段
 * @returns {Array} list
 */
export function TreeToList(tree = [], childrenKey = "children", parent) {
  let arr = [];
  tree.forEach((item) => {
    arr.push({ ...item, [childrenKey]: null });
    let child = item[childrenKey];
    if (child && child.length) {
      let res = TreeToList(child, childrenKey, item);
      arr = arr.concat(res);
    }
    item.parent = parent;
  });
  return arr;
}
/**
 * list转tree
 * @param {Array} list
 * @param {Object} opt
 * @returns
 */
export function ListToTree(list = [], option) {
  let opt = Object.assign(
    {
      key: "id",
      parentKey: "parentId",
      childrenKey: "children",
      setParent: false,
    },
    option
  );

  if (opt.setParent !== false && typeof opt.setParent != "string") {
    opt.setParent = "parent";
  }

  if (opt.clone) {
    for (let i = 0, len = list.length; i < len; i++) {
      list[i] = { ...list[i] };
    }
  }
  let top = [];
  list.forEach((item) => {
    // 查找父级
    let parent = list.find((it) => it[opt.key] == item[opt.parentKey]);
    if (parent) {
      parent[opt.childrenKey] = parent[opt.childrenKey] || [];
      parent[opt.childrenKey].push(item);
    } else {
      top.push(item);
    }

    if (opt.setParent) {
      item[opt.setParent] = parent;
    }
  });
  return top;
}

/**
 * 查询树结构路径
 * @param { Array } tree 树
 * @param { Funtion } compare 比较方法
 * @param { String } children 子节点字段
 * @returns { Array } 树结构数组
 */
export function findTreePath(tree, compare, config) {
  let conf = {
    children: "children",
    copy: true,
    ...config,
  };

  let paths = [];

  function find(arr, level) {
    for (let item of arr) {
      paths[level] = conf.copy ? { ...item } : item;

      if (compare(item, level)) {
        // 去除后面的
        paths.splice(level + 1);
        return item;
      } else if (item[conf.children] instanceof Array) {
        if (find(item[conf.children], level + 1)) {
          return item;
        }
      }
    }
  }

  if (!find(tree, 0)) {
    // 没有找到
    paths = [];
  }
  return paths;
}

export function findTreeToList(tree, compare, config) {
  let conf = {
    children: "children",
    copy: true,
    ...config,
  };

  let list = [];
  function find(item, level) {
    if (compare(item, level)) {
      list.push(conf.copy ? { ...item } : item);
    }
    if (item[conf.children] instanceof Array) {
      for (let it of item[conf.children]) {
        find(it, level + 1);
      }
    }
  }

  tree.forEach(it => {
    find(it, 0);
  });

  return list;
}

/**
 * 扩展数组的every
 * 数组every默认返回true
 */
export function collectEvery(arr, compare = (v) => !!v) {
  if (hasNotValue(arr)) {
    return false;
  }
  let bool = false;
  for (let val of arr) {
    bool = true;
    if (!compare(val)) {
      return false;
    }
  }
  return bool;
}

