<template>
  <h3>Basic Example</h3 >
  <scroll-picker 
    :wheel-speed="wheelSpeed"
    :options="options" 
    v-model="selections" />
  <div style="margin-top: 30px;">
    {{ selections }}
  </div>
  <div style="padding-top: 30px;">
    <span style="font-size: 14px; padding-right: 10px;">Wheel Speed:</span>
    <input v-model="wheelSpeed">
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

interface Option {
  label: string;
  value: string;
}

export default defineComponent({
  name: 'Basic',
  setup() {
    const state = reactive({
      options: mockOptions,
      selections: [] as string[],
      wheelSpeed: 1
    });
    function random(number: number) {
      return Math.floor(Math.random() * number);  
    }
    function getValue(option: Option) {
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
