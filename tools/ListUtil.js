import { Utils } from "..";

/**
 * 查询树结构路径
 * @param { Array } tree 树
 * @param { Funtion } compare 比较方法
 * @param { String } children 子节点字段
 * @returns { Array } 树结构数组
 */
export function findTreePath(tree, compare, config) {
  let conf = {
    children: 'children',
    copy: true,
    ...config
  }

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

  if (!find(tree, 0)){
    // 没有找到
    paths = [];
  }
  return paths;
}

export function findTreeToList(tree, compare, config){

  let conf = {
    children: 'children',
    copy: true,
    ...config
  }

  let list = [];
  function find(item, level) {
    if (compare(item, level)){
      list.push(conf.copy ? { ...item } : item);
    }
    if (item[conf.children] instanceof Array){
      for (let it of item[conf.children]){
        find(it, level+1);
      }
    }
  }

  find(tree, 0);

  return list;
}

/**
 * 扩展数组的every
 * 数组every默认返回true
 */
export function collectEvery(arr, compare=v=>!!v){
  if (Utils.hasNotValue(arr)){
    return false;
  }
  let bool = false;
  for(let val of arr){
    bool = true;
    if (!compare(val)){
      return false;
    }
  }
  return bool;
}