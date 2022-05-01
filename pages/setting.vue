<template>
  <v-row>
    <v-col cols="2">
      <v-sheet rounded="lg">
        <v-list color="transparent">
          <v-list-item
            v-for="n in menus"
            :key="n.title"
            link
            :to="n.link"
            nuxt
            exact
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ n.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <!--          <v-divider class="my-2"></v-divider>-->

          <!--          <v-list-item-->
          <!--            color="grey lighten-4"-->
          <!--          >-->
          <!--            <v-list-item-content>-->
          <!--              <v-list-item-title>-->
          <!--                重置-->
          <!--              </v-list-item-title>-->
          <!--            </v-list-item-content>-->
          <!--          </v-list-item>-->
        </v-list>
      </v-sheet>
    </v-col>

    <v-col>
      <v-sheet rounded="lg">
        <nuxt-child />
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'SettingPage',
  data(): { menus: { link: string; title: string }[] } {
    return {
      menus: [
        // {
        //   title: '画笔设置',
        //   link: '/setting'
        // },
        {
          title: '数据同步',
          link: '/setting/files',
        },
        {
          title: '搜索引擎联动',
          link: '/setting/search'
        },
        {
          title: '剪切板',
          link: '/setting/clipboard'
        },
        // {
        //   title: '禁用管理',
        //   link: '/setting/disallow'
        // }
      ],
    }
  },
})
</script>
