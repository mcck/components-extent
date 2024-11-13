// 控制台扩展

let global = window || globalThis;

const LOCAL_NAME = 'SYSTEM_LOG_ENABLE';
// 保存原来的方法
const sysConsole = global.console;
global.console = {};

let enable = false;

let localValue = localStorage.getItem(LOCAL_NAME);
if (localValue == 'true'){
  enable = true;
}


global.console.enableLog = function(){
  enable = true;
  localStorage.setItem(LOCAL_NAME, 'true');
};
global.console.disableLog = function(){
  enable = true;
  localStorage.removeItem(LOCAL_NAME);
};

for(let key in sysConsole){
  global.console[key] = function(){
    if (!enable) return;
    return sysConsole[key].apply(sysConsole, arguments);
  };
}