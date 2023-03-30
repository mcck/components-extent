## 全局安装
```js
import componentsExtent from 'components-extent';
app.use({option}, componentsExtent);
```
推荐components-extent引入放在main.js最上方，否则extend.js方法异常

### option: 
uploadFunction：上传文件的方法，返回格式为 {hash: filePath}

fileHashFunction：验证文件md5方法, 返回格式为 {hash: filePath}

axiosInstance：axios请求工具对象

## 按需引入
请查看 index.js文件


### 注意
element-ui 相关的组件需要单独注册
```js
import ElementExtent from 'components-extent/lib/element/index.js';
app.use(ElementExtent);
```
### 表格工具
```js
import {ElTableExt} from 'components-extent';
ElTableExt.setApi(Api); // 必须设置API，或者在data中设置api属性
mixins: [ElTableExt]
```
默认自动获取表格数据(调用api中的page方法)，可以设置autoInit: false关闭
```html
<div>
    <div class="table-button">
      <div class="table-button-left" @keydown.enter="getTableList">
        <div class="table-button-item">
          <label>名称</label>
          <el-input v-model="queryParam.name_like" clearable size="small"></el-input>
        </div>
      </div>
      <div class="table-button-right">
        <el-button @click="getTableList" size="small" type="primary">搜索/刷新</el-button>
      </div>
    </div>
    <el-table ref="table" :data="table.list" :max-height="table.height"
      :default-sort="defaultOrder"
      v-loading="table.loading"
      class="h-table"
      border
      @sort-change="defaultSortMethod"
      @select="handerSelect">
      <h-table-column prop="newsTitle" label="标题" sortable="custom"></h-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="{row}">
          <el-button type="text" size="small" @click="toEditPage(row)" >编辑</el-button>
          <el-button type="text" class="error-text" size="small" @click="deleteRow(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <h-pageination :page="page" align="right" :refresh="getTableList"></h-pageination>
  </div>

```

### from工具
```js
import {ElFormExt} from 'components-extent';
mixins: [ElFormExt]
```
提供监听表单数据修改功能

### contextmenu 右键菜单
```js
let menus = [
  {
    name: '菜单',
    params: 123
    click: function(params, ...args){
    }
  }
]
import {contextmenu} from 'components-extent';
contextmenu.handerContextmenu(event, menus, 'aaa');
```

### FileUtil 文件工具
提供上传和文件路径处理, 需要先设置 uploadFunction 和 fileHashFunction 方法
设置方式一、全局引入时设置
方式二、
```js
import {context} from 'components-extent';
context.uploadFunction = function(){}
```
方式三、
调用时传入
import {FileUtil} from 'components-extent';
FileUtil.upload(file, {uploadFunction: Function});

##### file 可以是InputHTMLEleement, File, Blob, Array

### emitter 事件处理
```js
import {emitter} from 'components-extent';

emitter.emit('xxx', 123);
emitter.on('xxx', Function);
```

### TemplateApi
模板API封装了通用的Api方法

### MaxFileUploader
超大文件上传，上传步骤：
1. 初始化
2. 计算总任务数
3. 分片
4. 请求开启分片上传任务
5. 依次上传分片
6. 请求合并分片
7. 获取结果

* 用法
``` js
import {MaxFileUploader} from 'components-extent';
let uploder = new MaxFileUploader({
  url: 'xxx',
  md5Url: new URL('./md5.js', location),
  params: {},
  axios
});

uploader.progress((params, status, count, total, message) => {
  // 进度
})

uploader.then((params, res) => {
  // 上传完成
})

uploader.finally((params) => {
  // 最终调用
})

uploader.reserve((param)=>{
  // 不满足分片规则时调用
})

// 销毁
uploder.destroy()
```

* 构造函数参数：config
```json
{
  // 每个分片大小，单位字节，默认20M
  chunkSize: 20971520,
  // 设置文件最小多大才开始分割，单位字节，默认100M
  thresholdSize: 104857600,
  // 上传时并发数，默认10个
  concurrency: 10,
  // 基础的url，非空,接口必须准守规则
  url: null,
  // 开启分片上传任务请求配置
  startRequest: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  // 上传分片文件请求配置
  uploadRequest: {
    method: 'PUT',
  },

  // 获取结果请求配置
  resultRequest: {
    method: 'GET',
  },

  // 开始合并请求配置
  mergeRequest: {
    method: 'GET',
  },

  // MD5的url，用于计算分片的hash值，类型必须是URL
  md5Url: null,

  // 是否自动关闭线城池
  autoCloseThreadPool: true,
  // 线程池，默认自动创建
  threadPool: null
}
```


### retry
重试工具
* 用法
```js
import {utils} from 'components-extent';

utils.retry(function(){
  // 业务代码
}, {maxCount: 100});

```
* 方法参数
```
retry(fn, options)
fn {Funtion} 执行方法
options {Object} 配置
  maxCount: Number, // 最大重试次数，默认3次
  exceptionOut: 出现异常退出，默认false
  interval: 间隔多久一次
```


### ThreadPool
js线城池

* 参数
  * 构造参数config
    ```json
    // 线城池大小默认4个
    coreSize: 4
    ```

  * init和submit
    ```js
    submit(fn, ...args)
    fn {Function} 执行的方法，如果调用submit，方法中必须调用postMessage方法，参数为对象success和args
    args {...Any} 方法需要的参数
    ```

* 用法
```js
import {ThreadPool} from 'components-extent';
let threadPool = new ThreadPool(config)
// 初始化
threadPool.init((args1, args2)=>{
  // 初始化代码
}, args1, args2)

// 提交任务
threadPool.submit((args1, args2)=>{
  // 执行代码
  // 执行完成需要调用
  postMessage({
    success: true,
    args: {}
  })
}, args1, args2).then(res => {
  // 执行成功后
})

// 销毁
threadPool.destroy()

```