<template>
  <div class="crypto-ticker">
    <div class="marquee">
      <div class="marquee-content">
        <span class="item">
          <span class="symbol">BTC:</span>
          <span class="price">${{ btcPrice }}</span>
          <span :class="['change', btcChange >= 0 ? 'up' : 'down']">
            {{ btcChange >= 0 ? '+' : '' }}{{ btcChange.toFixed(2) }}%
          </span>
        </span>
        <span class="item">
          <span class="symbol">ETH:</span>
          <span class="price">${{ ethPrice }}</span>
          <span :class="['change', ethChange >= 0 ? 'up' : 'down']">
            {{ ethChange >= 0 ? '+' : '' }}{{ ethChange.toFixed(2) }}%
          </span>
        </span>
        <span class="item">...MARKET DATA LIVE FROM COINGECKO...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const btcPrice = ref('0,000');
const btcChange = ref(0);
const ethPrice = ref('0,000');
const ethChange = ref(0);

const fetchData = async () => {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
    const data = await res.json();
    btcPrice.value = data.bitcoin.usd.toLocaleString();
    btcChange.value = data.bitcoin.usd_24h_change;
    ethPrice.value = data.ethereum.usd.toLocaleString();
    ethChange.value = data.ethereum.usd_24h_change;
  } catch (e) {
    // fetch failed, silently ignore
  }
};

onMounted(() => {
  fetchData();
  setInterval(fetchData, 60000); // 每分钟更新一次
});
</script>

<style lang="scss" scoped>
.crypto-ticker {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  padding: 5px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  font-family: 'JetBrains Mono', monospace;

  .marquee {
    display: flex;
    overflow: hidden;
    white-space: nowrap;

    .marquee-content {
      display: inline-block;
      animation: scroll 20s linear infinite;
      
      .item {
        margin: 0 40px;
        font-size: 0.85rem;
        color: #e2e8f0;

        .symbol { opacity: 0.6; margin-right: 5px; }
        .price { font-weight: bold; }
        .change {
          margin-left: 8px;
          &.up { color: #4ade80; text-shadow: 0 0 5px rgba(74, 222, 128, 0.3); }
          &.down { color: #f87171; }
        }
      }
    }
  }
}

@keyframes scroll {
  from { transform: translateX(100%); }
  to { transform: translateX(-100%); }
}
</style>
