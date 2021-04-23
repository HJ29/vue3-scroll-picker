<template>
  <div class="scroll-picker-container" ref="self">
    <div class="center-overlay" :style="centerStyle">
      <slot name="center-overlay">
        <div class="center-overlay-custom" />
      </slot>
    </div>
    <div class="pad-top-overlay pad-overlay" :style="padStyle">
      <slot name="top-overlay">
        <div class="pad-top-overlay-custom" />
      </slot>
    </div>
    <div class="pad-bottom-overlay pad-overlay" :style="padStyle">
      <slot name="bottom-overlay">
        <div class="pad-bottom-overlay-custom" />
      </slot>
    </div>
    <div
      v-for="(column, i) in options"
      :key="`column-${i}`"
      class="column-container"
    >
      <div
        class="column-overlay"
        :id="`column-${i}`"
        :ref="el => setColumnRef(el, i, 'overlay')"
      />
      <div
        :id="`column-${i}`"
        class="column-content"
        :ref="el => setColumnRef(el, i, 'content')"
      >
        <div class="pad" :style="padStyle" />
        <div
          v-for="(row, j) in column"
          :key="`row-${j}`"
          :id="`row-${j}`"
          class="row-option"
          :style="getIsActive(row, i) ? activeStyle : inactiveStyle"
          :class="
            getIsActive(row, i)
              ? `active-row-option ${activeClass}`
              : inactiveClass
          "
        >
          <slot name="option" :item="row" :active="getIsActive(row, i)">
            <div class="row-option-custom">
              {{ getLabel(row) }}
            </div>
          </slot>
        </div>
        <div class="pad pad-bottom" :style="padStyle" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  ComputedRef,
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  reactive,
  toRefs,
  UnwrapRef,
  watch
} from "vue";
import { defineComponent } from "vue";

export type Selection = string | number | null;

interface EventElement {
  name: string;
  handler: EventListenerOrEventListenerObject;
}

interface ColumnPane {
  overlay?: HTMLElement;
  content?: HTMLElement;
}

interface ScrollPickerState {
  self: any;
  timer: any;
  columns: ColumnPane[];
  markings: number[][];
  padStyle: ComputedRef<string>;
  centerStyle: ComputedRef<string>;
  events: ComputedRef<EventElement[]>;
  isTouchable: boolean;
  isMouseDown: boolean;
  isScrolling: boolean;
  mouseDownStart: {
    top: number | null;
    y: number | null;
  };
  activeOptionHeight: number;
}

export interface Option {
  label: string;
  value: string;
}

export default defineComponent({
  name: "ScrollPicker",
  props: {
    modelValue: {
      default: [],
      type: Array as PropType<Selection[]>
    },
    options: {
      default: [],
      type: Array as PropType<Option[][]>
    },
    activeClass: {
      default: "",
      type: String
    },
    inactiveClass: {
      default: "",
      type: String
    },
    activeStyle: {
      default: "",
      type: String
    },
    inactiveStyle: {
      default: "",
      type: String
    },
    wheelSpeed: {
      default: 1,
      type: Number
    }
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    function waitForElement(element: Element) {
      return new Promise(resolve => {
        const waitForElement = () => {
          if (element.clientHeight > 0) {
            resolve(element);
          } else {
            window.requestAnimationFrame(waitForElement);
          }
        };
        waitForElement();
      });
    }
    async function setActiveOptionHeight(columns: ColumnPane[]) {
      if (columns?.length > 0) {
        const elements = state.self.getElementsByClassName("active-row-option");
        if (elements?.length > 0) {
          await waitForElement(elements[0]);
          state.activeOptionHeight = elements[0].clientHeight;
        }
      }
    }
    function getCenterStyle() {
      if (state.activeOptionHeight > 0) {
        return `height: ${state.activeOptionHeight}px;`;
      }
      return "";
    }
    function getPadStyle() {
      if (state.activeOptionHeight > 0) {
        return `height: calc(50% - ${state.activeOptionHeight / 2}px);`;
      }
      return "";
    }
    function getMarkings(columns: ColumnPane[]) {
      return columns.map(column => {
        const rows: number[] = [];
        let y = 0;
        if (column.content) {
          for (let i = 0; i < column.content.children.length; i++) {
            const row = column.content.children[i];
            if (row.id.includes("row-")) {
              rows.push(y);
              y += row.clientHeight;
            }
          }
        }
        return rows;
      });
    }
    function getTouchInfo(event: Event): MouseEvent | Touch {
      const touchEvent = event as TouchEvent;
      return state.isTouchable
        ? touchEvent.changedTouches[0] || touchEvent.touches[0]
        : (event as MouseEvent);
    }
    function preventDefault(event: Event) {
      if (event.cancelable) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    function getContent(event: Event) {
      const index = Number(
        (event.target as HTMLElement).id.replace("column-", "")
      );
      return state.columns[index].content || null;
    }
    function handleStart(event: Event) {
      preventDefault(event);
      const content = getContent(event);
      const overlay = event.target as HTMLElement;
      const touchInfo = getTouchInfo(event as TouchEvent);
      state.mouseDownStart.y = touchInfo?.clientY || null;
      state.mouseDownStart.top = content?.scrollTop || null;
      if (!state.isTouchable) {
        state.isMouseDown = true;
        if (overlay) overlay.style.cursor = "grabbing";
      }
      state.isScrolling = true;
    }
    function handleMove(event: Event) {
      preventDefault(event);
      const content = getContent(event);
      if (state.isTouchable || state.isMouseDown) {
        const touchInfo = getTouchInfo(event);
        const dy = touchInfo.clientY - (state.mouseDownStart.y || 0);
        if (content) content.scrollTop = (state.mouseDownStart.top || 0) - dy;
      }
      const { columnIndex, rowIndex } = getColumnRowIndex(content);
      const newSelections = getSelections(columnIndex, rowIndex);
      setSelections(newSelections);
    }
    function handleEnd(event: Event) {
      preventDefault(event);
      const content = getContent(event);
      const overlay = event.target as HTMLElement;
      if (!state.isTouchable && state.isMouseDown) {
        state.isMouseDown = false;
        state.mouseDownStart.y = null;
        state.mouseDownStart.top = null;
        if (overlay) overlay.style.cursor = "grab";
      }
      state.isScrolling = false;
      const { columnIndex, rowIndex } = getColumnRowIndex(content);
      const newSelections = getSelections(columnIndex, rowIndex);
      setSelections(newSelections);
      scrollToModelValue(props.modelValue);
    }
    function handleCancel(event: Event) {
      preventDefault(event);
      const content = getContent(event);
      const overlay = event.target as HTMLElement;
      if (!state.isTouchable && state.isMouseDown) {
        state.isMouseDown = false;
        state.mouseDownStart.y = null;
        state.mouseDownStart.top = null;
        if (overlay) overlay.style.cursor = "grab";
      }
      state.isScrolling = false;
      const { columnIndex, rowIndex } = getColumnRowIndex(content);
      const newSelections = getSelections(columnIndex, rowIndex);
      setSelections(newSelections);
      scrollToModelValue(props.modelValue);
    }
    function handleWheel(event: Event) {
      preventDefault(event);
      const content = getContent(event);
      if (content) {
        content.scrollTop += (event as WheelEvent).deltaY * props.wheelSpeed;
        const { columnIndex, rowIndex } = getColumnRowIndex(content);
        const newSelections = getSelections(columnIndex, rowIndex);
        setSelections(newSelections);
        if (state.timer) {
          clearTimeout(state.timer);
          state.timer = null;
        }
        state.timer = setTimeout(() => {
          scrollToModelValue(props.modelValue);
        }, 250);
      }
    }
    function findNearest(arr: number[], value: number) {
      const nearest = arr.reduce(function(prev, curr) {
        return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
      });
      return nearest;
    }
    function getColumnRowIndex(column: HTMLElement | null) {
      if (!column) {
        return {
          columnIndex: null,
          rowIndex: null
        };
      }
      const columnIndex = Number(column.id.replace("column-", ""));
      const markings = state.markings[columnIndex];
      if (markings?.length > 0) {
        const nearest = findNearest(markings, column.scrollTop);
        const rowIndex = markings.findIndex(v => v === nearest);
        return { columnIndex, rowIndex };
      }
      return {
        columnIndex: null,
        rowIndex: null
      };
    }
    function modelValueHasChange(
      newModelValue: Selection[],
      oldModelValue: Selection[]
    ) {
      if (newModelValue.length !== oldModelValue.length) {
        return true;
      }
      for (let i = 0; i < newModelValue.length; i++) {
        const newValue = newModelValue[i];
        const oldValue = oldModelValue[i];
        if (newValue !== oldValue) {
          return true;
        }
      }
      return false;
    }
    function setSelections(selections: Selection[]) {
      const newSelections = props.options.map((rows, columnIndex) => {
        const selection = selections[columnIndex];
        const rowIndex = rows.findIndex(row => row.value === selection);
        if ((selection === undefined || rowIndex < 0) && rows.length > 0) {
          return getValue(rows[0]);
        }
        return selection;
      });
      const hasChange = modelValueHasChange(newSelections, props.modelValue);
      if (hasChange) {
        emit("update:modelValue", newSelections);
      }
    }
    function getSelections(
      columnIndex: number | null,
      rowIndex: number | null
    ) {
      const newModelValue = [...props.modelValue];
      if (typeof columnIndex === "number" && typeof rowIndex === "number") {
        const selection = getValue(props.options[columnIndex][rowIndex]);
        newModelValue[columnIndex] = selection;
      }
      return newModelValue;
    }
    function getEvents(isTouchable: boolean): EventElement[] {
      return [
        {
          name: isTouchable ? "touchstart" : "mousedown",
          handler: handleStart
        },
        {
          name: isTouchable ? "touchmove" : "mousemove",
          handler: handleMove
        },
        {
          name: isTouchable ? "touchend" : "mouseup",
          handler: handleEnd
        },
        {
          name: isTouchable ? "touchcancel" : "mouseleave",
          handler: handleCancel
        },
        {
          name: "wheel",
          handler: handleWheel
        }
      ];
    }
    function listenEvent(elements: HTMLElement[]) {
      elements.forEach(element => {
        state.events.forEach(event => {
          element.removeEventListener(event.name, event.handler, false);
          element.addEventListener(event.name, event.handler, false);
        });
      });
    }
    function unlistenEvent(elements: HTMLElement[]) {
      elements.forEach(element => {
        state.events.forEach(event => {
          element.removeEventListener(event.name, event.handler, false);
        });
      });
    }
    function getLabel(option: Option | string) {
      return typeof option === "string" ? option : option.label;
    }
    function getValue(option: Option | string) {
      return typeof option === "string" ? option : option.value;
    }
    function setColumnRef(el: HTMLElement, i: number, type: string) {
      if (el) {
        if (!state.columns[i]) {
          state.columns[i] = {
            content: undefined,
            overlay: undefined
          };
        }
        if (type === "overlay") {
          state.columns[i].overlay = el;
        }
        if (type === "content") {
          state.columns[i].content = el;
        }
      }
    }
    function filterColumnsContent(columns: ColumnPane[]) {
      return columns.reduce((columns: HTMLElement[], column) => {
        if (column.overlay) {
          columns.push(column.overlay);
        }
        return columns;
      }, []);
    }
    function scrollToModelValue(modelValue: Selection[]) {
      if (!state.isScrolling) {
        nextTick(() => {
          modelValue.forEach((value, columnIndex) => {
            if (state.markings[columnIndex] && value !== undefined) {
              const content = state.columns[columnIndex].content;
              if (content) {
                const rowIndex = props.options[columnIndex].findIndex(
                  row => getValue(row) === value
                );
                const y = state.markings[columnIndex][rowIndex];
                nextTick(() => {
                  content.scrollTo({ top: y, behavior: "smooth" });
                });
              }
            }
          });
        });
      }
    }
    function getIsActive(option: Option, columnIndex: number) {
      const value = getValue(option);
      return props.modelValue[columnIndex] === value;
    }
    const state: UnwrapRef<ScrollPickerState> = reactive<ScrollPickerState>({
      self: null,
      timer: null,
      columns: [],
      markings: [],
      padStyle: computed(() => getPadStyle()),
      centerStyle: computed(() => getCenterStyle()),
      events: computed(() => getEvents(state.isTouchable)),
      isTouchable: false,
      isMouseDown: false,
      isScrolling: false,
      mouseDownStart: {
        top: null,
        y: null
      },
      activeOptionHeight: 0
    });
    onMounted(() => {
      state.isTouchable = 
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.msMaxTouchPoints > 0;
      listenEvent(filterColumnsContent(state.columns));
    });
    onBeforeUnmount(() => {
      unlistenEvent(filterColumnsContent(state.columns));
    });
    watch(
      () => props.modelValue,
      async () => {
        nextTick(async () => {
          await setActiveOptionHeight(state.columns);
          state.markings = getMarkings(state.columns);
          scrollToModelValue(props.modelValue);
        });
      },
      { immediate: true, deep: true }
    );
    watch(
      () => props.options,
      options => {
        if (!props.modelValue || props.modelValue.length === 0) {
          setSelections([...new Array(options.length)]);
        }
      },
      { immediate: true, deep: true }
    );
    return {
      ...toRefs(state),
      setColumnRef,
      getLabel,
      getIsActive
    };
  }
});
</script>

<style>
.scroll-picker-container {
  height: 150px;
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
}
.column-content::-webkit-scrollbar {
  width: 0px;
  height: 5px;
}
.column-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.column-container {
  position: relative;
}
.column-overlay {
  z-index: 1;
  position: absolute;
  cursor: grab;
  user-select: none;
  top: 0px;
  bottom: 0px;
  height: 100%;
  width: 100%;
}
.column-content {
  height: 100%;
  overflow-y: auto;
}
.row-option {
  font-size: 20px;
}
.row-option-custom {
  padding: 10px;
}
.center-overlay {
  z-index: 1;
  position: absolute;
  width: 100%;
  top: 0px;
  bottom: 0px;
  margin: auto;
}
.center-overlay-custom {
  height: 100%;
  border-style: solid;
  border-width: 1px 0px 1px 0px;
  border-color: lightgray;
}
.pad-overlay {
  z-index: 1;
  position: absolute;
  width: 100%;
}
.pad-top-overlay {
  top: 0px;
}
.pad-top-overlay-custom {
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 1)
  );
}
.pad-bottom-overlay {
  bottom: 0px;
}
.pad-bottom-overlay-custom {
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 1)
  );
}
</style>
