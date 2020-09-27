<template>
  <div class="row justify-center scroll-picker-container">
    <div class="center-overlay" :style="centerStyle">
      <slot name="center-overlay">
        <div class="center-overlay-custom"/>
      </slot>
    </div>
    <div class="pad-top-overlay pad-overlay" :style="padStyle">
      <slot name="top-overlay">
        <div class="pad-top-overlay-custom"/>
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
      class="column-container">
      <div 
        class="column-overlay"
        :id="`column-${i}`"
        :ref="el => setColumnRef(el, i, 'overlay')" />
      <div
        :id="`column-${i}`"
        class="column-content"
        :ref="el => setColumnRef(el, i, 'content')"
      >
        <div class="pad" :style="padStyle " />
        <div
          v-for="(row, j) in column"
          :key="`row-${j}`"
          :id="`row-${j}`"
          class="row-options"
          :style="getIsActive(row, i) ? activeStyle : inactiveStyle"
          :class="getIsActive(row, i) ? activeClass : inactiveClass"
        >
          <slot name="option" :item="row" :active="getIsActive(row, i)">
            <div class="row-option">
              {{ getLabel(row) }}
            </div>
          </slot>
        </div>
        <div class="pad pad-bottom" :style="padStyle  " />
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

type Selection = string | number | null;

interface EventElement {
  name: string;
  handler: EventListenerOrEventListenerObject;
}

interface ColumnPane {
  overlay?: HTMLElement;
  content?: HTMLElement;
}

interface ScrollPickerState {
  wheelTimer: number | null;
  columns: ColumnPane[];
  markings: number[][];
  padStyle: ComputedRef<{}>;
  centerStyle: ComputedRef<{}>;
  events: ComputedRef<EventElement[]>;
  isTouchable: boolean;
  isMouseDown: boolean;
  isScrolling: boolean;
  mouseDownStart: {
    top: number | null;
    y: number | null;
  };
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
      default: '',
      type: String
    },
    inactiveClass: {
      default: '',
      type: String
    },
    activeStyle: {
      default: '',
      type: String
    },
    inactiveStyle: {
      default: '',
      type: String
    }
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    function getContentHeight(columns: ColumnPane[]) {
      if (columns?.length > 0) {
        const elements = document.getElementsByClassName("row-options");
        if (elements?.length > 0) {
          return elements[0].clientHeight;
        }
      }
      return 0;
    }
    function getCenterStyle(columns: ColumnPane[]) {
      const height = getContentHeight(columns);
      if (height > 0) {
        return `height: ${height}px;`;
      }
      return "";
    }
    function getPadStyle(columns: ColumnPane[]) {
      const height = getContentHeight(columns);
      if (height > 0) {
        return `height: calc(50% - ${height / 2}px);`;
      }
      return "";
    }
    function getMarkings(columns: ColumnPane[]) {
      return columns.map(column => {
        const rows: number[] = [];
        let y = 0;
        if(column.content) {
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
      const touchEvent = event as TouchEvent
      return state.isTouchable
        ? touchEvent.changedTouches[0] || touchEvent.touches[0]
        : event as MouseEvent;
    }
    function preventDefault(event: Event) {
      if (event.cancelable) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    function getContent(event: Event) {
      const index = Number((event.target as HTMLElement).id.replace('column-', ''));
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
      setSelections(columnIndex, rowIndex);
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
      setSelections(columnIndex, rowIndex);
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
      setSelections(columnIndex, rowIndex);
    }
    function handleWheel(event: Event) {
      preventDefault(event);
      const content = getContent(event);
      if(content) {
        content.scrollTop += (event as WheelEvent).deltaY;
        const { columnIndex, rowIndex } = getColumnRowIndex(content);
        if(state.wheelTimer) {
          clearTimeout(state.wheelTimer);
          state.wheelTimer = null;
        }
        state.wheelTimer = setTimeout(() => {
          setSelections(columnIndex, rowIndex);
        }, 200)
      }
    }
    function findNearest(arr: number[], value: number) {
      const nearest = arr.reduce(function(prev, curr) {
        return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
      });
      return nearest;
    }
    function getColumnRowIndex(column: HTMLElement | null) {
      if(!column) {
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
    function initializeSelections(selections: Selection[]) {
      const newSelections = [...selections].map((selection, columnIndex) => {
        if(!['string', 'number'].includes(typeof selection)) {
          return getValue(props.options[columnIndex][0]);
        }
        return selection;
      });
      nextTick(() => {
        emit('update:modelValue', newSelections);
      })
    }
    function setSelections(columnIndex: number | null, rowIndex: number | null) {
      if(typeof columnIndex === 'number' && typeof rowIndex === 'number') {
        const selection = getValue(props.options[columnIndex][rowIndex]);
        const newModelValue = [
          ...props.modelValue
        ];
        newModelValue[columnIndex] = selection;
        initializeSelections(newModelValue);
      }
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
        state.events.forEach((event) => {
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
      if(el) {
        if(!state.columns[i]) {
          state.columns[i] = {
            content: undefined,
            overlay: undefined
          }
        }
        if(type === 'overlay') {
          state.columns[i].overlay = el;
        }
        if(type === 'content') {
          state.columns[i].content = el;
        }
      }
    }
    function filterColumnsContent(columns: ColumnPane[]) {
      return columns.reduce((columns: HTMLElement[], column) => {
        if(column.overlay) {
          columns.push(column.overlay)
        }
        return columns
      }, [])
    }
    function scrollToModelValue(modelValue: Selection[]) {
      if (!state.isScrolling) {
        nextTick(() => {
          state.markings = getMarkings(state.columns);
          modelValue.forEach((value, columnIndex) => {
            if (state.markings[columnIndex] && value !== undefined && value !== null) {
              const content = state.columns[columnIndex].content;
              if(content) {
                const rowIndex = props.options[columnIndex].findIndex(row => getValue(row) === value);
                const y = state.markings[columnIndex][rowIndex];
                nextTick(() => {
                  content.scrollTo({ top: y, behavior: 'smooth' })
                  // content.animate({ scrollTop: -50})
                  // content.scrollTop = y;
                })
              }
            }
          });
        });
      }
    }
    function getIsActive(option: Option, columnIndex: number) {
      const value = getValue(option);
      return props.modelValue[columnIndex] === value
    }
    const state: UnwrapRef<ScrollPickerState> = reactive<ScrollPickerState>({
      wheelTimer: null,
      columns: [],
      markings: [],
      padStyle: computed(() => getPadStyle(state.columns)),
      centerStyle: computed(() => getCenterStyle(state.columns)),
      events: computed(() => getEvents(state.isTouchable)),
      isTouchable: false,
      isMouseDown: false,
      isScrolling: false,
      mouseDownStart: {
        top: null,
        y: null
      }
    });
    onMounted(() => {
      state.isTouchable = matchMedia("(hover: none)").matches;
      listenEvent(filterColumnsContent(state.columns));
    });
    onBeforeUnmount(() => {
      unlistenEvent(filterColumnsContent(state.columns));
    });
    watch(
      () => props.modelValue,
      modelValue => {
        scrollToModelValue(modelValue);
      }, 
      { immediate: true, deep: true });
    watch(
      () => props.options,
      (options) => {
        if(!props.modelValue || props.modelValue.length === 0) {
          initializeSelections([...new Array(options.length)]);
        }
      }, 
      { immediate: true, deep: true });
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
.row {
  display: flex;
  flex-wrap: nowrap;
}
.justify-center {
  justify-content: center;
}
.scroll-picker-container {
  height: 100%;
  position: relative;
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
.row-options {
  font-size: 24px;
}
.row-option {
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
::-webkit-scrollbar {
  width: 0px;
  height: 5px;
}
::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1); 
  border-radius: 10px;
}
</style>
