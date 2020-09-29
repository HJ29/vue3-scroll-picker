# vue3-scroll-picker

Vue 3 scroll picker plugin.

### Demo
[Demo](https://hj29.github.io/vue3-scroll-picker/)

[Demo Code](https://github.com/HJ29/vue3-scroll-picker/tree/master/example/src/)

### Install
```bash
yarn add vue3-scroll-picker
npm i --save vue3-scroll-picker
```

### Register Global Component
```js
import { createApp } from 'vue';
import App from './App.vue'
import ScrollPicker from 'vue3-scroll-picker';

const app = createApp(App);
app.use(ScrollPicker);
app.mount('#app')
```

### Register Local Component
```js
import ScrollPicker from 'vue3-scroll-picker';

export default {
  components: {
    ScrollPicker,
  },
};
```

### Example
```vue
<template>
  <scroll-picker  
    :options="options" 
    v-model="selections"
  />
</template>
```
```vue
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

## Project setup
```
yarn
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
