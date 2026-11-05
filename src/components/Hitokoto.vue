<template>
  <section class="quote-card" aria-label="工作室寄语" @click="store.boxOpenState = true">
    <Quote class="quote-mark quote-mark-left" theme="filled" size="34" fill="#bceefa" />
    <p class="quote-text">在山与星之间，记录热爱，分享美好。</p>
    <p class="quote-author">——&nbsp; Yunchu Studio</p>
    <Quote class="quote-mark quote-mark-right" theme="filled" size="34" fill="#bceefa" />
  </section>
</template>

<script setup>
import { Quote } from "@icon-park/vue-next";
import { mainStore } from "@/store";

const store = mainStore();
</script>

<style lang="scss" scoped>
.quote-card {
  position: relative;
  min-height: 153px;
  padding: 28px 56px 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid rgba(202, 246, 255, 0.52);
  border-radius: 25px;
  background: linear-gradient(120deg, rgba(10, 68, 91, 0.58), rgba(27, 111, 134, 0.42));
  box-shadow: inset 0 0 24px rgba(178, 245, 255, 0.11), 0 8px 28px rgba(0, 22, 38, 0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  cursor: pointer;
  transition: border-color 0.25s ease, background 0.25s ease, transform 0.25s ease;

  &:hover {
    border-color: rgba(220, 251, 255, 0.8);
    background: linear-gradient(120deg, rgba(10, 76, 101, 0.67), rgba(27, 121, 144, 0.5));
    transform: translateY(-2px);
  }

  .quote-text {
    margin: 0;
    color: rgba(255, 255, 255, 0.98);
    text-align: center;
    font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif;
    font-size: clamp(21px, 2vw, 30px);
    line-height: 1.6;
    letter-spacing: 0.12em;
    text-shadow: 0 1px 8px rgba(0, 30, 48, 0.42);
  }

  .quote-author {
    margin: 15px 30px 0 0;
    color: rgba(255, 255, 255, 0.96);
    align-self: flex-end;
    font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif;
    font-size: 19px;
    letter-spacing: 0.02em;
  }

  .quote-mark {
    position: absolute;
    opacity: 0.92;
    filter: drop-shadow(0 0 7px rgba(161, 232, 255, 0.24));
  }

  .quote-mark-left { left: 29px; top: 23px; }
  .quote-mark-right { right: 31px; bottom: 23px; transform: rotate(180deg); }
}

@media (max-width: 720px) {
  .quote-card {
    min-height: 104px;
    padding: 17px 35px 15px;
    border-radius: 20px;

    .quote-text { font-size: clamp(16px, 4.2vw, 20px); letter-spacing: 0.04em; }
    .quote-author { margin: 8px 3px 0 0; font-size: 13px; }
    .quote-mark { width: 23px; height: 23px; }
    .quote-mark-left { left: 13px; top: 14px; }
    .quote-mark-right { right: 13px; bottom: 12px; }
  }
}

@media (max-width: 350px) {
  .quote-card { padding-inline: 29px; }
  .quote-card .quote-text { font-size: 15px; }
}
</style>
