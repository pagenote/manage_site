<template>
  <v-app>
    <v-navigation-drawer
      :value="drawer"
      :stateless="false"
      :mini-variant="miniVariant"
      :clipped="clipped"
      :width="200"
      fixed
      app
    >
      <div
        class="menu-bar"
        @mouseenter.stop="toggleMinDrawer(false)"
        @mouseleave.stop="toggleMinDrawer(true)"
      >
        <v-list>
          <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router>
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
          <v-list-item router to="/account" exact>
            <v-list-item-action>
              <v-icon>mdi-account</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title> account </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </v-navigation-drawer>
    <!--    <v-app-bar :clipped-left="clipped" fixed app>-->
    <!--      <v-btn icon @click.stop="miniVariant = !miniVariant">-->
    <!--        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>-->
    <!--      </v-btn>-->
    <!--      <v-btn icon @click.stop="clipped = !clipped">-->
    <!--        <v-icon>mdi-application</v-icon>-->
    <!--      </v-btn>-->
    <!--      <v-btn icon @click.stop="fixed = !fixed">-->
    <!--        <v-icon>mdi-minus</v-icon>-->
    <!--      </v-btn>-->
    <!--      <v-toolbar-title v-text="title" />-->
    <!--      <v-spacer />-->
    <!--      <v-btn icon @click.stop="rightDrawer = !rightDrawer">-->
    <!--        <v-icon>mdi-menu</v-icon>-->
    <!--      </v-btn>-->
    <!--    </v-app-bar>-->
    <v-main class="grey lighten-3">
      <v-btn icon class="toggle-draw-btn">
        <v-app-bar-nav-icon @click.stop="toggleShowDraw(!drawer)" />
      </v-btn>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-navigation-drawer v-model="rightDrawer" :right="right" temporary fixed>
      <div>通知</div>
    </v-navigation-drawer>
    <!--    <v-footer :absolute="!fixed" app>-->
    <!--      <span>&copy; {{ new Date().getFullYear() }}</span>-->
    <!--    </v-footer>-->
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import getCacheInstance from '@pagenote/shared/lib/library/cache'
const drawCache = getCacheInstance<boolean>('draw', {defaultValue: false})
export default Vue.extend({
  name: 'DefaultLayout',
  data(): {
    drawer: boolean
    clipped: boolean
    fixed: boolean
    items: {
      icon: string
      title: string
      to: string
    }[]
    miniVariant: boolean
    right: boolean
    rightDrawer: boolean
  } {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        // {
        //   icon: 'mdi-marker',
        //   title: '标记',
        //   to: '/data/webpage',
        // },
        // {
        //   icon: 'mdi-chart-bubble',
        //   title: '剪切板',
        //   to: '/clipboard',
        // },
        // {
        //   icon: 'mdi-cogs',
        //   title: '设置',
        //   to: '/setting/files',
        // },
        // {
        //   icon: 'mdi-chart-bubble',
        //   title: '设置',
        //   to: '/setting',
        // },
      ],
      miniVariant: true,
      right: true,
      rightDrawer: false,
    }
  },
  mounted() {
    const defaultDrawer = drawCache.get()
    this.drawer = defaultDrawer
  },
  methods: {
    toggleMinDrawer(min: boolean): void {
      this.miniVariant = min
    },
    toggleShowDraw(drawer: boolean): void {
      this.drawer = drawer
      drawCache.set(drawer)
    },
  },
})
</script>

<style lang="scss" scoped>
.menu-bar {
  height: 100%;
}

.toggle-draw-btn {
  position: fixed;
  z-index: 9;
  left: 10px;
  bottom: 10px;
}
</style>
