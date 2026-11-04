<template>
  <div :class="store.mobileOpenState ? 'left hidden' : 'left'">
    <Message />
    <SocialLinks />
    <div class="enter-share-wrap">
      <button class="enter-share-btn" @click="goShare" title="前往精选分享">
        <span class="sparkle">✦</span>
        <span class="text">进入分享</span>
        <span class="arrow">→</span>
        <span class="sparkle">✦</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { mainStore } from "@/store";
import Message from "@/components/Message.vue";
import SocialLinks from "@/components/SocialLinks.vue";

const store = mainStore();
const router = useRouter();

const goShare = () => {
  router.push("/share");
};
</script>

<style lang="scss" scoped>
.left {
  width: 50%;
  margin-right: 10px;
  transform: translateY(20px);
  display: flex;
  flex-direction: column;

  &.hidden {
    display: none;
  }

  .enter-share-wrap {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-start;
    animation: fade 0.5s;

    .enter-share-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 2rem;
      border-radius: 50px;
      font-size: 1.05rem;
      font-weight: 500;
      letter-spacing: 1.5px;
      color: #ffffff;
      background: linear-gradient(135deg, rgba(0, 229, 201, 0.25), rgba(38, 208, 206, 0.45));
      border: 1px solid rgba(0, 229, 201, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 4px 24px rgba(0, 229, 201, 0.25);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      .sparkle {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .arrow {
        transition: transform 0.25s ease;
      }

      &:hover {
        background: linear-gradient(135deg, rgba(0, 229, 201, 0.45), rgba(38, 208, 206, 0.7));
        border-color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 6px 30px rgba(0, 229, 201, 0.45);
        transform: translateY(-2px);

        .arrow {
          transform: translateX(4px);
        }
      }

      &:active {
        transform: translateY(1px) scale(0.97);
      }
    }
  }

  @media (max-width: 720px) {
    margin-right: 0;
    width: 100%;
    transform: none;
    align-items: center;
    justify-content: flex-start;
    flex: 0 0 auto;
    min-height: 0;
    padding: 0;

    &.hidden {
      display: none;
    }

    .enter-share-wrap {
      margin-top: 1.5rem;
      justify-content: center;
      width: 100%;

      .enter-share-btn {
        width: 100%;
        max-width: 280px;
        padding: 0.85rem 1.5rem;
        font-size: 1rem;
        min-height: 48px;
      }
    }
  }
}
</style>
