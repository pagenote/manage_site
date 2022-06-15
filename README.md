# manage_site
> 这是 pagenote 插件管理页的项目。

## 技术栈
* Vue.js
* Nuxt.js
* vuetify

## 启动开发

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev
```

```typescript
// api 调用demo
import generateApi from '@pagenote/shared/lib/generateApi'
const api = generateApi();

mounted(){
  // 查询网页笔记
  api.lightpage.getLightPages({
    query:{
      deleted: false,
    },
    sort:{
      ['createAt']: -1,
    },
    limit: 9999,
    ignoreDetail: false,
  }).then((result)=> {
    if(result.success){
      // ....
    }
  })
}

```

## 部署服务

### 自动部署（推荐）
你可以基于此项目进行开发，开发完毕后提交 MR 到主分支，合并后将自动部署在 https://dev.pagenote.cn/highlight

### 自行部署
你也可以自行部署在你自己的服务器上。部署方式见 [nuxt.js](https://www.nuxtjs.cn/) 
