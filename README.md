# manage_site
> 这是 pagenote 插件管理页的项目。

## 技术栈
* Vue.js
* Nuxt.js
* vuetify

## 启动开发
> 首先，请安装`/extension` 目录下最新版 `开发者版本 pagnote插件`。
> 当安装好 pagenote 插件后，就如同启动了一个接口服务，然后你便可以与 `pagenote插件` 进行通信，方式如同`http`请求。

以下开发流程同常见 web 项目。
```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev
```

demo 见 `pages/users/you_nickname.vue`
```typescript
// api 调用demo。 有什么接口，参数 返回是什么，根据 typescript 提示查看即可
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

## 部署管理页

### 自动部署（推荐）
你可以基于此项目进行开发，开发完毕后提交 MR 到 master 分支，合并后将自动部署在 https://dev.pagenote.cn 域名下

### 自行部署
你也可以自行部署在你自己的服务器上。部署方式见 [nuxt.js](https://www.nuxtjs.cn/) 


## 注意事项
* 建议使用 TypeScript
