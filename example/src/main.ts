import { createApp } from 'vue'
import App from './App.vue'
import ScrollPicker from '../../src/main'

const app = createApp(App);
app.use(ScrollPicker);
app.mount('#app')