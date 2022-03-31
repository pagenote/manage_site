<template>
  <div>
    <div>
      当前页适用于0.15.7版本
    </div>
    <v-btn @click="exportData">
      导出数据(导出数据可用于 0.20.11 及其以上版本)
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { makeExportString } from "@pagenote/shared/lib/utils/data";
import { BackupVersion, WebPage } from "@pagenote/shared/lib/@types/data";
import { contentToFile } from "@pagenote/shared/lib/utils/document";
import { WebPageItem } from "@pagenote/shared/lib/models/WebPageItem";
import Bridge from "@/lib/bridge/extensionBridge";

const formatData = function(pages:any[]):WebPage[] {
  const result:WebPage[]=[];
  pages.forEach(function(item) {
    item.key = item.key || item.plainData.key || item.plainData.url;
    item.url = item.key;
    const webpage = new WebPageItem(item);
    if(!webpage.isEmpty()){
      result.push(webpage.data)
    }
  })
  return result
}

let getBridge = function (){
  const element = document.getElementById('messenger');
  const bridgeCli = new Bridge(element,'page','extension');
  if(element){
    getBridge = function (){
      return bridgeCli
    }
  }
  return bridgeCli;
}
export const commonGraphQL = function (query:string) {
  return new Promise((resolve)=>{
    getBridge().sendMessage('GRAPHQL_GET_PAGES',{query}, ({data})=>{
      resolve(data.data)
    }, Math.random())
  })
}
export default Vue.extend({
  name: "backUp",
  layout: 'data',
  methods: {
    exportData() {
      const query = '{pages(deleted:false){deleted,plainData{url,title,icon,categories,description,images,snapshots,createAt,lastModified,steps{bg,id,isActive,offsetX,offsetY,parentW,x,y,time,text,pre,tip,suffix}}}}'
      commonGraphQL(query).then(function(result) {
        console.log('查询数据',result)
        const formatPages = formatData(result?.pages || []);
        if(formatPages?.length) {
          console.log('开始导出',formatPages)

          console.log(formatPages)
          const str = makeExportString({
            pages: formatPages,
            version: BackupVersion.version1,
            extension_version: '0.15.7',
            backup_at: Date.now(),
          })
          contentToFile(str,`0.15.7.${formatPages.length}.pagenote`)
        }else{
          alert('没有发现任何有效数据')
        }
      })
    }
  },
})
</script>
