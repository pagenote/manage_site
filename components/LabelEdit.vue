<template>
  <div class='vlabeledit'>
    <div v-if='!edit' class='vlabeledit-label' @click='onLabelClick'>{{ vlabel }}</div>
    <input
v-if='edit' ref='labeledit' v-model='label' type='text' :placeholder='vplaceholder' class='vlabeledit-input'
           @blur='updateTextBlur' @keyup.enter='updateTextEnter' />
  </div>
</template>
<script>
export default {
  name: 'LabelEdit',
  props: ['text', 'placeholder'],
  data() {
    return {
      edit: false, // define whether it is in edit mode or not
      label: '', // v-bind data model for input text
      empty: 'Enter some text value' // empty place holder .. replace with your own localization for default
    }
  },
  computed: {
    vplaceholder() {
      // check if the placeholder is undefined or empty
      if (this.placeholder === undefined || this.placeholder === '') {
        // if it is empty or undefined, pre-populate with built-in place holder text
        return this.empty
      } else {
        return this.placeholder
      }
    },
    vlabel() {
      // after text has been updated
      // return text value or place holder value depends on value of the text
      if (this.text === undefined || this.text === '') {
        return this.vplaceholder
      } else {
        return this.label
      }
    }
  },
  watch: {
    text(value) {
      if (value === '' || value === undefined) {
        this.label = this.vplaceholder
      } else {
        this.label = value
      }
    }
  },
  mounted() {
    // initiate the label view
    this.initText()
  },
  updated() {
    const ed = this.$refs.labeledit
    if (ed != null) {
      ed.focus()
    }
  }, // parent should provide :text or :placeholder
  methods: {
    initText() {
      if (this.text === '' || this.text === undefined) {
        this.label = this.vlabel
      } else {
        this.label = this.text
      }
    },
    // when the div label got clicked and trigger the text box
    onLabelClick() {
      this.edit = true
      this.label = this.text
    },
    // trigger when textbox got lost focus
    updateTextBlur() {
      // update the edit mode to false .. display div label text
      this.edit = false
      // emit text updated callback
      this.$emit('text-updated-blur', this.label)
    },
    updateTextEnter() {
      this.edit = false
      this.$emit('text-updated-enter', this.label)
    }
  }
}
</script>

<style>
.vlabeledit-label{
  color: #999;
}
</style>
