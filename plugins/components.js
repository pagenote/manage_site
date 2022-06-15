import Vue from 'vue'
import VueSearchPanel from 'vue-search-panel'
import VModal from 'vue-js-modal/dist/ssr.nocss'
import KTabs from '@kevindesousa/vue-k-tabs'

import 'vue-js-modal/dist/styles.css'
import VueCalendarHeatmap from '../components/heatmap'

Vue.use(VueCalendarHeatmap)
Vue.use(VModal, {})
Vue.use(KTabs)
Vue.use(VueSearchPanel)
