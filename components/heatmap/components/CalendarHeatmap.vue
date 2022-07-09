<template lang='pug'>
  svg.vch-wrapper(:viewBox="viewbox")
    g.vch-months-labels-wrapper(:transform="monthsLabelWrapperTransform[position]")
      text.vch-month-label(
        v-for="(month, index) in heatmap.firstFullWeekOfMonths",
        :x="getMonthLabelPostion(month).x",
        :y="getMonthLabelPostion(month).y"
      ) {{ lo.months[month.value] }}

    g.vch-days-labels-wrapper(:transform="daysLabelWrapperTransform[position]")
      text.vch-day-label(
        :x="vertical ? SQUARE_SIZE * 1 : 0",
        :y="vertical ? SQUARE_SIZE - SQUARE_BORDER_SIZE : 20"
      ) {{ lo.days[1] }}
      text.vch-day-label(
        :x="vertical ? SQUARE_SIZE * 3 : 0",
        :y="vertical ? SQUARE_SIZE - SQUARE_BORDER_SIZE : 44"
      ) {{ lo.days[3] }}
      text.vch-day-label(
        :x="vertical ? SQUARE_SIZE * 5 : 0",
        :y="vertical ? SQUARE_SIZE - SQUARE_BORDER_SIZE : 69"
      ) {{ lo.days[5] }}

    g.vch-legend-wrapper(v-if="showLegend" :transform="legendWrapperTransform[position]")
      text(
        :x="vertical ? SQUARE_SIZE * 1.25 : -25"
        :y="vertical ? 8 : SQUARE_SIZE + 1"
      ) {{ lo.less }}
      rect(
        v-for="(color, index) in rangeColor",
        :key="index",
        :style="{ fill: color }",
        :width="SQUARE_SIZE - SQUARE_BORDER_SIZE",
        :height="SQUARE_SIZE - SQUARE_BORDER_SIZE",
        :x="vertical ? SQUARE_SIZE * 1.75 : SQUARE_SIZE * index",
        :y="vertical ? SQUARE_SIZE * (index + 1) : 5"
      )
      text(
        :x="vertical ? SQUARE_SIZE * 1.25 : SQUARE_SIZE * rangeColor.length + 1",
        :y="vertical ? SQUARE_SIZE * (rangeColor.length + 2) - SQUARE_BORDER_SIZE : SQUARE_SIZE + 1"
      ) {{ lo.more }}
    g.vch-year_wrapper(:transform="yearWrapperTransform")
      g.vch-month_wrapper(
        v-for="(week, weekIndex) in heatmap.calendar",
        :key="weekIndex",
        :transform="getWeekPosition(weekIndex)"
      )
        g.day(
          v-for="(day, dayIndex) in week",
          v-if="day.date < now"
          :key="dayIndex",
          :transform="getDayPosition(dayIndex)"
          :class="isSelected(day.date)?'active':'un_active'"
        )
          rect.vch-day-square(
            rx="2",
            ry="2",
            :width="SQUARE_SIZE - SQUARE_BORDER_SIZE",
            :height="SQUARE_HEIGHT_SIZE - SQUARE_BORDER_SIZE",
            :data-level="day.colorIndex",
            :style="{fill: rangeColor[day.colorIndex]}"
            v-tooltip="tooltipOptions(day)",
            @click="$emit('day-click', day)"
          )
          //text(v-if='day.count>0') {{day.count}}
</template>

<script>
import dayjs from 'dayjs';
import { VTooltip } from 'v-tooltip'
import Heatmap from './Heatmap'
import {
  DAYS_IN_WEEK,
  DEFAULT_LOCALE,
  DEFAULT_RANGE_COLOR,
  DEFAULT_TOOLTIP_UNIT,
  SQUARE_HEIGHT_SIZE,
  SQUARE_SIZE
} from './consts.js'

VTooltip.enabled = true

export default {
  directives: {
    tooltip: VTooltip
  },

  props: {
    showLegend:{
      type: Boolean,
      default: true
    },
    selectedDays: {
      type: Array,
      default() {
        return []
      }
    },
    endDate: {
      required: true
    },
    max: {
      type: Number
    },
    rangeColor: {
      type: Array,
      default: () => DEFAULT_RANGE_COLOR
    },
    values: { // {day:'2021-02-12',count:1}
      required: true,
      type: Array
    },
    locale: {
      type: Object
    },
    tooltip: {
      type: Boolean,
      default: true
    },
    tooltipUnit: {
      type: String,
      default: DEFAULT_TOOLTIP_UNIT
    },
    vertical: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      now: new Date()
    }
  },

  computed: {
    position() {
      return this.vertical ? 'vertical' : 'horizontal'
    },
    tooltipTransform() {
      return `translate(${this.tooltipX}, ${this.tooltipY})`
    },
    heatmap() {
      return new Heatmap(this.endDate, this.values, this.max)
    },
    width() {
      return {
        horizontal: this.LEFT_SECTION_WIDTH + (this.SQUARE_SIZE * this.heatmap.weekCount) + this.SQUARE_BORDER_SIZE,
        vertical: this.LEFT_SECTION_WIDTH + (this.SQUARE_SIZE * DAYS_IN_WEEK) + this.RIGHT_SECTION_WIDTH
      }
    },
    heigth() {
      return {
        horizontal: this.TOP_SECTION_HEIGTH + (this.SQUARE_SIZE * DAYS_IN_WEEK) + this.SQUARE_BORDER_SIZE + this.BOTTOM_SECTION_HEIGTH,
        vertical: this.TOP_SECTION_HEIGTH + (this.SQUARE_HEIGHT_SIZE * this.heatmap.weekCount) + this.SQUARE_BORDER_SIZE
      }
    },
    viewbox() {
      return `0 0 ${this.width[this.position]} ${this.heigth[this.position]}`
    },
    daysLabelWrapperTransform() {
      return {
        horizontal: `translate(0, ${this.TOP_SECTION_HEIGTH})`,
        vertical: `translate(${this.LEFT_SECTION_WIDTH}, 0)`
      }
    },
    monthsLabelWrapperTransform() {
      return {
        horizontal: `translate(${this.LEFT_SECTION_WIDTH}, 0)`,
        vertical: `translate(0, ${this.TOP_SECTION_HEIGTH})`
      }
    },
    legendWrapperTransform() {
      return {
        horizontal: `translate(${this.width[this.position] - (this.SQUARE_SIZE * this.rangeColor.length) - 30}, ${this.heigth[this.position] - this.BOTTOM_SECTION_HEIGTH})`,
        vertical: `translate(${this.LEFT_SECTION_WIDTH + (this.SQUARE_SIZE * DAYS_IN_WEEK)}, ${this.TOP_SECTION_HEIGTH})`
      }
    },
    yearWrapperTransform() {
      return `translate(${this.LEFT_SECTION_WIDTH}, ${this.TOP_SECTION_HEIGTH})`
    },

    SQUARE_BORDER_SIZE: () => SQUARE_SIZE / 5,
    SQUARE_SIZE() {
      return SQUARE_SIZE + this.SQUARE_BORDER_SIZE
    },
    SQUARE_HEIGHT_SIZE() {
      return SQUARE_HEIGHT_SIZE + SQUARE_HEIGHT_SIZE / 5
    },
    TOP_SECTION_HEIGTH() {
      return SQUARE_SIZE + (SQUARE_SIZE / 2)
    },
    RIGHT_SECTION_WIDTH() {
      return this.SQUARE_SIZE * 3
    },
    BOTTOM_SECTION_HEIGTH() {
      return SQUARE_SIZE + (SQUARE_SIZE / 2)
    },
    LEFT_SECTION_WIDTH() {
      return Math.ceil(SQUARE_SIZE * 2.5)
    },

    lo() {
      if (this.locale) {
        return {
          months: this.locale.months || DEFAULT_LOCALE.months,
          days: this.locale.days || DEFAULT_LOCALE.days,
          on: this.locale.on || DEFAULT_LOCALE.on,
          less: this.locale.less || DEFAULT_LOCALE.less,
          more: this.locale.more || DEFAULT_LOCALE.more
        }
      }
      return DEFAULT_LOCALE
    }
  },

  methods: {
    isSelected(date){
      return this.selectedDays.includes(dayjs(date).format('YYYY/MM/DD'));
    },
    onSelect(day){
      this.$emit('onSelect',day)
    },
    tooltipOptions(day) {
      if (this.tooltip) {
        return {
          content: `<b>${day.count} ${this.tooltipUnit}</b> ${this.lo.on} ${this.lo.months[day.date.getMonth()]} ${day.date.getDate()}, ${day.date.getFullYear()}`,
          delay: { show: 150, hide: 50 }
        }
      }
      return false
    },
    getWeekPosition(index) {
      if (this.vertical) {
        return `translate(0, ${(this.SQUARE_HEIGHT_SIZE * this.heatmap.weekCount) - ((index + 1) * this.SQUARE_HEIGHT_SIZE)})`
      }
      return `translate(${index * this.SQUARE_SIZE}, 0)`
    },
    getDayPosition(index) {
      if (this.vertical) {
        return `translate(${index * this.SQUARE_SIZE}, 0)`
      }
      return `translate(0, ${index * this.SQUARE_SIZE})`
    },
    getMonthLabelPostion(month) {
      const position = { x: 0, y: 0 }
      position.x = this.vertical ? 3 : this.SQUARE_SIZE * month.index
      position.y = this.vertical ? (this.SQUARE_HEIGHT_SIZE * this.heatmap.weekCount) - (this.SQUARE_HEIGHT_SIZE * (month.index)) - (this.SQUARE_HEIGHT_SIZE / 4) : this.SQUARE_SIZE - this.SQUARE_BORDER_SIZE
      return position
    }
  }
}
</script>

<style lang='css'>
html {
  --color-calendar-graph-day-bg: #ebedf0;
  -color-calendar-graph-day-border: rgba(27, 31, 35, 0.06);
  --color-calendar-graph-day-L1-bg: #9be9a8;
  --color-calendar-graph-day-L2-bg: #40c463;
  --color-calendar-graph-day-L3-bg: #30a14e;
  --color-calendar-graph-day-L4-bg: #216e39;
  --color-calendar-graph-day-L1-border: rgba(27, 31, 35, 0.06);
  --color-calendar-graph-day-L2-border: rgba(27, 31, 35, 0.06);
  --color-calendar-graph-day-L3-border: rgba(27, 31, 35, 0.06);
  --color-calendar-graph-day-L4-border: rgba(27, 31, 35, 0.06);
}
</style>

<style scoped lang='scss'>
svg text{
  user-select: none;
}
g.day{
  text{
    font-size: 6px;
  }
  &.active{
    rect.vch-day-square{
      stroke: #6aaaff !important;
      stroke-width: 1px;
    }
  }
}
svg.vch-wrapper {
  width: 100%;
  height: 100%;
  max-height: 620px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 10px;
}

svg.vch-wrapper .vch-months-labels-wrapper text.vch-month-label {
  font-size: 10px;
}

svg.vch-wrapper .vch-days-labels-wrapper text.vch-day-label,
svg.vch-wrapper .vch-legend-wrapper text {
  font-size: 9px;
}

svg.vch-wrapper .vch-months-labels-wrapper text.vch-month-label,
svg.vch-wrapper .vch-days-labels-wrapper text.vch-day-label,
svg.vch-wrapper .vch-legend-wrapper text {
  fill: #767676;
}

rect.vch-day-square {
  fill: var(--color-calendar-graph-day-bg);
  shape-rendering: geometricPrecision;
  outline: 1px solid var(--color-calendar-graph-day-border);
  outline-offset: -1px;

  &[data-level="0"] {
    outline: 1px solid var(--color-calendar-graph-day-border);
    outline-offset: -1px;
  }
  &[data-level="1"]{
     fill: var(--color-calendar-graph-day-L1-bg);
     outline: 1px solid var(--color-calendar-graph-day-L1-border);
  }
}


svg.vch-wrapper rect.vch-day-square:hover {
  stroke: #555;
  stroke-width: 1px;
}

svg.vch-wrapper rect.vch-day-square:focus {
  outline: none;
}
</style>

<style>
.vue-tooltip-theme.tooltip {
  display: block !important;
  z-index: 10000;
}

.vue-tooltip-theme.tooltip .tooltip-inner {
  background: rgba(0 0 0 / 70%);
  border-radius: 3px;
  color: #ebedf0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 12px;
  line-height: 16px;
  padding: 14px 10px;
}

.vue-tooltip-theme.tooltip .tooltip-inner b {
  color: white;
}

.vue-tooltip-theme.tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: black;
  z-index: 1;
}

.vue-tooltip-theme.tooltip[x-placement^="top"] {
  margin-bottom: 5px;
}

.vue-tooltip-theme.tooltip[x-placement^="top"] .tooltip-arrow {
  border-width: 5px 5px 0;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  bottom: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.vue-tooltip-theme.tooltip[x-placement^="bottom"] {
  margin-top: 5px;
}

.vue-tooltip-theme.tooltip[x-placement^="bottom"] .tooltip-arrow {
  border-width: 0 5px 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.vue-tooltip-theme.tooltip[x-placement^="right"] {
  margin-left: 5px;
}

.vue-tooltip-theme.tooltip[x-placement^="right"] .tooltip-arrow {
  border-width: 5px 5px 5px 0;
  border-left-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
  left: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.vue-tooltip-theme.tooltip[x-placement^="left"] {
  margin-right: 5px;
}

.vue-tooltip-theme.tooltip[x-placement^="left"] .tooltip-arrow {
  border-width: 5px 0 5px 5px;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  right: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.vue-tooltip-theme.tooltip[aria-hidden='true'] {
  visibility: hidden;
  opacity: 0;
  transition: opacity .15s, visibility .15s;
}

.vue-tooltip-theme.tooltip[aria-hidden='false'] {
  visibility: visible;
  opacity: 1;
  transition: opacity .15s;
}
</style>
