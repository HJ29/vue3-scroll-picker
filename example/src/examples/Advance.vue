<template>
  <h3>Advance Example</h3 >
  <scroll-picker 
    :options="options" 
    v-model="selections"
    inactive-style="color: lightgrey; font-size: 20px;"
    active-style="color: red; font-size: 30px;">
    <template v-slot:option="prop" >
      <div style="padding: 10px 20px;">
        {{ prop.item.label }}
      </div>
    </template>
    <template v-slot:top-overlay>
      <div class="top-overlay"></div>
    </template>
    <template v-slot:bottom-overlay>
      <div class="bottom-overlay"></div>
    </template>
    <template v-slot:center-overlay>
      <div class="center-overlay"></div>
    </template>
  </scroll-picker>
  <div style="margin-top: 30px;">
    {{ selections }}
  </div>
  <button style="margin-top: 30px;" @click="onClickRandom">
    Random
  </button>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';

const mockOptions = [
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
    {
      label: "B3",
      value: "b3"
    },
  ],
  [
    {
      label: "C1",
      value: "c1"
    },
    {
      label: "C2",
      value: "c2"
    },
    {
      label: "C3",
      value: "c3"
    },
    {
      label: "C4",
      value: "c4"
    }
  ]
];

export default defineComponent({
  name: 'Advance',
  setup() {
    const state = reactive({
      options: mockOptions,
      selections: ['a2','b2','c1'],
    });
    function random(number: number) {
      return Math.floor(Math.random() * number);  
    }
    function getValue(option) {
      return typeof option === "string" ? option : option.value;
    }
    function onClickRandom() {
      state.selections = state.options.map(option => {
        return getValue(option[random(option.length)]);
      })
    }
    return {
      ...toRefs(state),
      onClickRandom,
    };
  }
});
</script>

<style scoped>
.center-overlay {
  height: 100%;
  border-style: solid;
  border-width: 1px 0px 1px 0px;
  border-color: blue;
}
.top-overlay {
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0),
    rgba(0, 0, 255, 0.2)
  );
}
.bottom-overlay {
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(0, 0, 255, 0.2)
  );
}
</style>
