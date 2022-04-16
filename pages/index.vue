<template>
  <div>
    <section class="section1">
      <div class="content">
        <div class="menu py-4">
          <v-btn elevation="0" outlined large href="/setting"> 管理 </v-btn>
        </div>
        <div class="install-guide">
          <h1 class="text-h2">
            <div>用 <span class="font-worksans">PAGENOTE</span></div>
            <div>标记网页</div>
          </h1>
          <div class="text--secondary my-12 text-textColor">
            <h2 class="py-4">
              小而美的网页标记工具。 记录网页如此
              <span class="light-green">简单</span>
            </h2>
          </div>
          <div>
            <install-btn text="从应用商店安装" />
          </div>
        </div>
      </div>
    </section>

    <section class="section3 my-4">
      <v-row class="content">
        <v-col cols="6" class="round-mask">
          <iframe
            src="//player.bilibili.com/player.html?aid=542768142&bvid=BV1bi4y1L79R&cid=256021866&page=1"
            scrolling="no"
            border="0"
            frameborder="no"
            framespacing="0"
            allowfullscreen="true"
          >
          </iframe>
        </v-col>
        <v-col cols="6">
          <h2>从选中一段文本开始</h2>
          <p class="text--secondary text-body-2 my-8">
            在网页中选中一段关键内容，即可高亮它，并留下一段批注。
            <br />
            在任意网站皆可使用，在线网页、离线 HTML 网页均可。
          </p>
          <v-btn
            color="#cce8fd"
            elevation="0"
            size="80"
            link
            :href="defaultInstall"
          >
            立即安装
          </v-btn>
        </v-col>
      </v-row>
    </section>

    <!--    <section class='section2 my-4'>-->
    <!--      <v-row class='content'>-->
    <!--        <v-col>-->
    <!--          <h2 class='text-lg-h2'>在网页里， <br>勾勾画画。</h2>-->
    <!--        </v-col>-->
    <!--        <v-col>-->
    <!--          <div class='text&#45;&#45;secondary text-body-2'>-->
    <!--            <h3 class='text-h4'>-->
    <!--              专注于网页标记，-->
    <!--              <br>-->
    <!--              打造自己的笔记系统。-->
    <!--            </h3>-->

    <!--          </div>-->
    <!--        </v-col>-->
    <!--      </v-row>-->
    <!--    </section>-->
  </div>
</template>

<script>
import { defaultInstall } from '@/const/platform'

export default {
  name: 'IndexPage',
  layout: 'empty',
  data() {
    return {
      defaultInstall,
    }
  },
}
</script>
<style lang="scss" scoped>
.content {
  width: 1040px;
  margin: 0 auto;
}

.section1 {
  background-image: url('../assets/svg/bg-1.svg');
  background-size: contain;
  background-position: right;
  min-height: 660px;
  .install-guide {
    padding: 140px 0;
  }
  .text-h2 {
    font-weight: normal;
  }
}

.section2 {
  background-image: url('../assets/svg/bg-2.svg');
  background-size: contain;
  min-height: 200px;
  background-position: left center;
}

$WIDTH: 200px;
.round-mask {
  img {
    width: $WIDTH * 2;
  }
  //clip-path: circle($WIDTH at $WIDTH $WIDTH);
  //background-color: #FECFD0;
}
</style>
