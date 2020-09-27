# vue3-scroll-picker

Vue 3 scroll picker.

### Example
[Demo](https://hj29.github.io/vue3-scroll-picker/)

[Example Code](https://github.com/HJ29/vue3-scroll-picker/tree/master/example/src/)

### Install
```
yarn add vue3-scroll-picker
npm i --save vue3-scroll-picker
```

### Register Global Component
```
import { createApp } from 'vue';
import App from './App.vue'
import ScrollPicker from 'vue3-scroll-picker';
import 'vue3-scroll-picker/dist/vue3-scroll-picker.css'

const app = createApp(App);
app.use(ScrollPicker);
app.mount('#app')
```

### Register Local Component
```
import ScrollPicker from 'vue3-scroll-picker';
import 'vue3-scroll-picker/dist/vue3-scroll-picker.css'

export default {
  components: {
    ScrollPicker,
  },
};
```

### Props

| Name                   | Type                                               | Required | Default | Notes                                                                                                                                                                                                                                                                                                |
| ---------------------- | -------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| :options               | string[][]<br>{ label: string; value: string }[][] | yes      | []      | Options use can select.<br> label value type: label as display, value to emit<br>label value example: [ [ { label: 'A1', value: 'a1' }, { label: 'A2', value: 'a2' } ], [ { label: 'B1', value: 'b1' } ] ]<br>string type: same label and value<br>string type example: [ [ 'a1', 'a2' ], [ 'b1' ] ] |
| :valueModel \| v-model | string[]                                           | yes      | []      | Array value emit<br>Example: [ 'a2', 'b1' ]                                                                                                                                                                                                                                                          |
| active-style           | string                                             | no       | ''      | css (change active option style)style                                                                                                                                                                                                                                                                |
| inactive-style         | string                                             | no       | ''      | css (change inactive option style)style                                                                                                                                                                                                                                                              |
| active-class           | string                                             | no       | ''      | css class                                                                                                                                                                                                                                                                                            |
| inactive-class         | string                                             | no       | ''      | css class                                                                                                                                                                                                                                                                                            |

### Event
| Name               | Description                |
| ------------------ | -------------------------- |
| @update:modelValue | event emit when use select |

### Slot
| Name                  | prop                                                                 | Description                                                                |
| --------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| v-slot:option         | active: boolean<br/>item: string \| { label: string; value: string } | override option card                                                       |
| v-slot:center-overlay |                                                                      | override center active option area, able to add seperator to active area   |
| v-slot:top-overlay    |                                                                      | override top inactive option area, able to change top gradient color       |
| v-slot:bottom-overlay |                                                                      | override bottom inactive option area, able to change bottom gradient color |

### Example
```
<template>
  <scroll-picker  
    :options="options" 
    v-model="selections"
  />
</template>
```
```
<script>
import { defineComponent, reactive, toRefs } from 'vue';
const exampleOptions = [
  [
    {
      label: "A1",
      value: "a1"
    },
    {
      label: "A2",
      value: "a2"
    },
  ],
  [
    {
      label: "B1",
      value: "b1"
    },
    {
      label: "B2",
      value: "b2"
    },
  ],
];
export default defineComponent({
  setup() {
    const state = reactive({
      options: exampleOptions,
      selections: ['a2','b1'],
    });
    return {
      ...toRefs(state),
    };
  }
});
</script>
```

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
