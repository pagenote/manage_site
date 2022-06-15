<template>
  <swipe-list
    ref='list'
    class='abstract-list'
    :disabled='!enabled'
    :items='webpageList'
    item-key='id'
    @swipeout:click='itemClick'>
    <!--  eslint-disable-next-line vue/no-unused-vars -->
    <template #default='{ item, index, revealLeft, revealRight, close }'>
      <!-- item is the corresponding object from the array -->
      <!-- index is clearly the index -->
      <!-- revealLeft is method which toggles the left side -->
      <!-- revealRight is method which toggles the right side -->
      <!-- close is method which closes an opened side -->
      <div class='card-content'>
        <abstract-page-card :active='false' :checked='false' :light-cnt='item.lightCnt' :page-key='item.key' />
      </div>
    </template>
    <!-- left swipe side template and v-slot:left="{ item }" is the item clearly -->
    <!-- remove if you dont wanna have left swipe side  -->
<!--    <template #left='{ item }'>-->
<!--      <div class='swipeout-action red' title='remove' @click='remove(item)'>-->
<!--        &lt;!&ndash; place icon here or what ever you want &ndash;&gt;-->
<!--        <i class='fa fa-trash'></i>-->
<!--      </div>-->
<!--    </template>-->
<!--    &lt;!&ndash; right swipe side template and v-slot:right"{ item }" is the item clearly &ndash;&gt;-->
<!--    &lt;!&ndash; remove if you dont wanna have right swipe side  &ndash;&gt;-->
<!--    &lt;!&ndash;  eslint-disable-next-line vue/no-unused-vars &ndash;&gt;-->
<!--    <template #right='{ item }'>-->
<!--      <div class='swipeout-action blue'>-->
<!--        &lt;!&ndash; place icon here or what ever you want &ndash;&gt;-->
<!--        <v-icon>mdi-delete</v-icon>-->
<!--      </div>-->
<!--      <div class='swipeout-action green'>-->
<!--        &lt;!&ndash; place icon here or what ever you want &ndash;&gt;-->
<!--        <v-icon>mdi-delete</v-icon>-->
<!--      </div>-->
<!--    </template>-->
    <template #empty>
      <div>
        <!-- change webpageList to an empty array to see this slot in action  -->
        list is empty
      </div>
    </template>
  </swipe-list>
</template>

<script lang='ts'>
import Vue, { PropType } from 'vue'
// @ts-ignore
import { SwipeList, SwipeOut } from 'vue-swipe-actions'
import 'vue-swipe-actions/dist/vue-swipe-actions.css'
import { lightpage } from '@pagenote/shared/lib/extApi'
import Keys = lightpage.WebPageKeys

export default Vue.extend({
  name: 'AbstractPageList',
  components: {
    SwipeList,
    // eslint-disable-next-line vue/no-unused-components
    SwipeOut
  },
  props: {
    enabled: {
      type: Boolean,
      default: true
    },
    webpageList: {
      type: Array as PropType<Keys[]>,
      required: true
    }
  },
  // data():{
  //   enabled: boolean,
  //   webpageList: Keys[],
  // } {
  //   return {
  //     enabled: true,
  //     webpageList: []
  //   }
  // },
  methods: {
    revealFirstRight(): void {
      // @ts-ignore
      this.$refs.list.revealRight(0)
    },
    revealFirstLeft() {
      // @ts-ignore
      this.$refs.list.revealLeft(0)
    },
    closeFirst() {
      // @ts-ignore
      this.$refs.list.closeActions(0)
    },
    closeAll() {
      // @ts-ignore
      this.$refs.list.closeActions()
    },
    // @ts-ignore
    // remove(item) {
    //   // this.webpageList = this.webpageList.filter(i => i !== item)
    // },
    // @ts-ignore
    itemClick(e) {
      // @ts-ignore
      this.$refs.list.closeActions();
      console.log(e, 'item click')
    },
    // @ts-ignore
    fbClick(e) {
      console.log(e, 'First Button Click')
    },
    // @ts-ignore
    sbClick(e) {
      console.log(e, 'Second Button Click')
    }
  }
})
</script>

<style scoped>

.abstract-list {
  position: relative;
}

.swipeout-action {
  display: flex;
  align-items: center;
  padding: 0 3rem;
  cursor: pointer;
  left: 0;
}

/* https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/color/ */
.swipeout-action.blue {
  color: white;
  background-color: #007AFF;
}

.swipeout-action.blue:hover {
  background-color: rgba(0 122 255 / 5%)
}

.swipeout-action.purple {
  color: white;
  background-color: rgb(88 86 214);
}

.swipeout-action.purple:hover {
  background-color: rgba(88 86 214 / 5%)
}

.swipeout-action.red {
  color: white;
  background-color: rgb(255 59 48);
}

.swipeout-action.red:hover {
  background-color: rgba(255 59 48 / 5%)
}

.swipeout-action.green {
  color: white;
  background-color: rgb(76 217 100);
}

.swipeout-action.green:hover {
  background-color: rgba(76 217 100 / 5%)
}

.swipeout-list-item {
  flex: 1;
  border-bottom: 1px solid lightgray;
}

.swipeout-list-item:last-of-type {
  border-bottom: none;
}

.card {
  width: 100%;
  background-color: white;
  border-radius: 3px;
  box-shadow: none;
  border: 1px solid lightgray;
}


.transition-right {
  transform: translate3d(100%, 0, 0) !important;
}

.transition-left {
  transform: translate3d(-100%, 0, 0) !important;
}

.toolbar {
  display: flex;
  align-items: center;
}

.toolbar .toolbar-section {
  flex: 0 0 auto;
}

</style>
