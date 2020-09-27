# vue3-scroll-picker

### Install
```
yarn add vue3-scroll-picker
npm i --save vue3-scroll-picker
```

### Register Global Component
```
import { createApp } from 'vue';
import ScrollPicker from 'vue3-scroll-picker';
import App from './App.vue'

const app = createApp(App);
app.use(ScrollPicker);
app.mount('#app')
```

### Register Local Component
```
import ScrollPicker from 'vue3-scroll-picker';

export default {
  components: {
    ScrollPicker,
  },
};
```

### Props

| Name                   | Type                                             | Required | Default | Notes                                                                                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------ | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| :options               | string[][]<br>{ label: string; value: string }[][] | yes      | []      | Options use can select.<br> label value type: label as display, value to emit<br>label value example: [ [ { label: 'A1', value: 'a1' }, { label: 'A2', value: 'a2' } ], [ { label: 'B1', value: 'b1' } ] ]<br>string type: same label and value<br>string type example: [ [ 'a1', 'a2' ], [ 'b1' ] ] |
| :valueModel \| v-model | string[]                                         | yes      | []      | Array value emit<br>Example: [ 'a2', 'b1' ]                                                                                                                                                                                                                                                          |
| active-style           | string                                           | no       | ''      | css style                                                                                                                                                                                                                                                                                            |
| inactive-style         | string                                           | no       | ''      | css style                                                                                                                                                                                                                                                                                            |  |  |  |
| active-class           | string                                           | no       | ''      | css class (can't use scoped if register as global)                                                                                                                                                                                                                                                   |  |  |
| inactive-class         | string                                           | no       | ''      | css class (can't use scoped if register as global)                                                                                                                                                                                                                                                   |  |  |

### Event
| Name               | Description                |
| ------------------ | -------------------------- |
| @update:modelValue | event emit when use select |


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
