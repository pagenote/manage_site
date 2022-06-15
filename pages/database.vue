<template>
  <div>
    <button>添加</button>
  </div>
</template>

<script>
import Vue from 'vue'
import Dexie from "dexie";
// import zangodb from 'zangodb';
// const db = new zangodb.Db('mydb', { images: ['path','data','type'], html: ['path','data'] });


const database = new Dexie("vuedbsample");

export default Vue.extend({
  name: 'DatabasePage',
  mounted() {
    database.version(2).stores({
      items: "++id,name,+path"
    });
    database.items.where({ name: `Another item` }).modify({path: 'modifyed'})

  }
})
</script>

