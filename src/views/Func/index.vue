<template>
  <!-- 功能区域 -->
  <div :class="store.mobileFuncState ? 'function mobile' : 'function'">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="left">
          <Hitokoto />
          <Music v-if="playerHasId" />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="right cards">
          <div class="time">
            <div class="date">
              <span>{{ currentTime.year }}&nbsp;年&nbsp;</span>
              <span>{{ currentTime.month }}&nbsp;月&nbsp;</span>
              <span>{{ currentTime.day }}&nbsp;日&nbsp;</span>
              <span class="sm-hidden">{{ currentTime.weekday }}</span>
            </div>
            <div class="text">
              <span> {{ currentTime.hour }}:{{ currentTime.minute }}:{{ currentTime.second }}</span>
            </div>
          </div>
          <Weather />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { getCurrentTime } from "@/utils/getTime";
import { mainStore } from "@/store";
import Music from "@/components/Music.vue";
import Hitokoto from "@/components/Hitokoto.vue";
import Weather from "@/components/Weather.vue";

const store = mainStore();

// 当前时间
const currentTime = ref({});
const timeInterval = ref(null);

// 播放器 id
const playerHasId = import.meta.env.VITE_SONG_ID;

// 更新时间
const updateTimeData = () => {
  currentTime.value = getCurrentTime();
};

onMounted(() => {
  updateTimeData();
  timeInterval.value = setInterval(updateTimeData, 1000);
});

onBeforeUnmount(() => {
  clearInterval(timeInterval.value);
});
</script>

<style lang="scss" scoped>
.function {
  height: 165px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  &.mobile {
    .el-row {
      .el-col {
        &:nth-of-type(1) {
          display: contents;
        }
        &:nth-of-type(2) {
          display: none;
        }
      }
    }
  }

  .el-row {
    height: 100%;
    width: 100%;
    margin: 0 !important;

    .el-col {
      &:nth-of-type(1) {
        padding-left: 0 !important;
      }
      &:nth-of-type(2) {
        padding-right: 0 !important;
      }

      @media (max-width: 910px) {
        &:nth-of-type(1) {
          display: none;
        }
        &:nth-of-type(2) {
          padding: 0 !important;
          flex: none;
          max-width: none;
          width: 100%;
        }
      }
    }

    .left,
    .right {
      width: 100%;
      height: 100%;
    }

    .right {
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      animation: fade 0.5s;

      .time {
        font-size: 1.1rem;
        text-align: center;

        .date {
          text-overflow: ellipsis;
          overflow-x: hidden;
          white-space: nowrap;
        }

        .text {
          margin-top: 10px;
          font-size: 3.25rem;
          letter-spacing: 2px;
          font-family: "UnidreamLED";
        }

        @media (min-width: 1201px) and (max-width: 1280px) {
          font-size: 1rem;
        }

        @media (min-width: 911px) and (max-width: 992px) {
          font-size: 1rem;
          .text {
            font-size: 2.75rem;
          }
        }

        // ── MOBILE ONLY (≤ 768px) ───────────────────────────────────────────
        // At this breakpoint col-2 is already 100% wide (see ≤910px rule above).
        // The only remaining issue is the date line overflowing its container
        // and the clock digit size being slightly large for narrow screens.
        @media (max-width: 768px) {
          // Slightly tighter date text so the full date fits without clipping
          font-size: 0.95rem;

          .text {
            // Scale the LED clock down just enough to stay within the card
            // on a 375 px phone while remaining the clear focal element.
            font-size: 2.6rem;
            // Tighten letter-spacing so the 8-char HH:MM:SS string
            // doesn't overflow on very narrow devices (< 360 px)
            letter-spacing: 1px;
          }
        }
      }

      // ── MOBILE ONLY (≤ 768px) ─────────────────────────────────────────────
      @media (max-width: 768px) {
        // Reduce horizontal padding so the card content isn't squeezed
        // against the glassmorphism border on narrow phones
        padding: 14px 12px;
      }
    }
  }

  // ── MOBILE ONLY (≤ 768px) ───────────────────────────────────────────────
  // The outer .function wrapper has a fixed 165px height.
  // On mobile the date + clock + weather can exceed this, so we lift the cap
  // and let the card grow naturally to contain everything without overflow.
  @media (max-width: 768px) {
    height: auto;
    min-height: 165px; // preserve the minimum visual weight of the card
  }
}
</style>
