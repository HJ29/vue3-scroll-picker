import { App } from 'vue';
import ScrollPicker from './ScrollPicker.vue'

export default {
  install: (app: App) => {
    app.component('scroll-picker', ScrollPicker)
  }
};
