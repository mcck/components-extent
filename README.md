## 全局安装
```
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

### 表格工具
```
import {ElTableExt} from 'components-extent';
ElTableExt.setApi(Api); // 必须设置API，或者在data中设置api属性
mixins: [ElTableExt]
```
默认自动获取表格数据(调用api中的page方法)，可以设置autoInit: false关闭
```
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

    <h-pageination :page="table.page" align="right" :refresh="getTableList"></h-pageination>
  </div>

```

### from工具
```
import {ElFormExt} from 'components-extent';
mixins: [ElFormExt]
```
提供监听表单数据修改功能

### contextmenu 右键菜单
```
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
```
import {context} from 'components-extent';
context.uploadFunction = function(){}
```
方式三、
调用时传入
import {FileUtil} from 'components-extent';
FileUtil.upload(file, {uploadFunction: Function});

##### file 可以是InputHTMLEleement, File, Blob, Array

### emitter 事件处理
```
import {emitter} from 'components-extent';

emitter.emit('xxx', 123);
emitter.on('xxx', Function);
```

### TemplateApi
模板API封装了通用的Api方法
