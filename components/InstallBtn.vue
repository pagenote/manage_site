<template>
  <v-btn
    v-bind="$attrs"
    elevation="0"
    color="secondary"
    large
    link
    :href="link"
  >
    {{ text }}
  </v-btn>
</template>

<script lang="ts">
import Vue from 'vue'
import { BrowserType, getBrowserTypeAndVersion } from '~/utils/browser'
import { defaultInstall, installLink } from '@/const/platform'

export default Vue.extend({
  name: 'InstallBtn',
  props: {
    text: {
      type: String,
      default: '立即安装',
    },
  },
  data() {
    return {
      link: defaultInstall,
      browserType: BrowserType.CHROME,
    }
  },
  mounted() {
    const browser = getBrowserTypeAndVersion()
    this.setInstallLink(browser.type)
  },
  methods: {
    setInstallLink(browserType: BrowserType) {
      const link = installLink[browserType] || defaultInstall
      this.link = link

      // Chrome 应用商店，检测连通性
      if (browserType === BrowserType.CHROME) {
        const timeout = setTimeout(() => {
          this.link = defaultInstall
        }, 1000)
        const iframe = document.createElement('iframe')
        iframe.src = link
        iframe.onload = function () {
          clearTimeout(timeout)
        }
        iframe.onerror = () => {
          this.link = link
        }
        iframe.style.display = 'none'
        document.body.appendChild(iframe)
      }
    },
  },
})
</script>
