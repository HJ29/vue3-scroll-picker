import { createApp } from 'vue'
import App from './App.vue'
import ScrollPicker from '../../dist/vue3-scroll-picker.common';

const app = createApp(App);
app.use(ScrollPicker);
app.mount('#app')