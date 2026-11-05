<template>
  <header class="brand-lockup">
    <img class="logo-img" src="/images/avatar.png" alt="Yunchu Studio 头像" />
    <span class="brand-divider" aria-hidden="true"></span>
    <div class="brand-copy">
      <span class="brand-orbit" aria-hidden="true"><i></i></span>
      <h1>Yunchu Studio</h1>
      <div class="brand-cn"><span>云 初 工 作 室</span></div>
      <p>探 索&nbsp; · &nbsp;分 享&nbsp; · &nbsp;记 录&nbsp; · &nbsp;创 造</p>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.brand-lockup {
  width: fit-content;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 3vw, 42px);
  color: #fff;

  .logo-img {
    width: clamp(150px, 14vw, 244px);
    height: clamp(150px, 14vw, 244px);
    flex: 0 0 auto;
    object-fit: cover;
    border: 1px solid rgba(222, 249, 255, 0.92);
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(104, 216, 255, 0.22), inset 0 0 16px rgba(255, 255, 255, 0.22);
  }

  .brand-divider {
    display: block;
    width: 1px;
    height: clamp(118px, 13vw, 176px);
    background: linear-gradient(180deg, transparent, rgba(218, 250, 255, 0.9) 18%, rgba(218, 250, 255, 0.9) 82%, transparent);
  }

  .brand-copy {
    position: relative;
    min-width: 0;
    text-align: center;
    font-family: Georgia, "Noto Serif CJK SC", "Songti SC", serif;

    h1 {
      margin: 0;
      color: #fff;
      font-size: clamp(48px, 5.5vw, 78px);
      font-weight: 400;
      line-height: 1.08;
      letter-spacing: 0.01em;
      white-space: nowrap;
      text-shadow: 0 2px 16px rgba(1, 23, 40, 0.36);
    }

    .brand-cn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-top: 9px;
      color: rgba(255, 255, 255, 0.95);
      font-size: clamp(17px, 1.9vw, 27px);
      white-space: nowrap;

      &::before,
      &::after {
        content: "";
        width: clamp(28px, 4vw, 74px);
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(222, 249, 255, 0.95));
      }

      &::after { transform: scaleX(-1); }
    }

    p {
      margin: 17px 0 0;
      color: rgba(255, 255, 255, 0.94);
      font-size: clamp(13px, 1.3vw, 18px);
      letter-spacing: 0.12em;
      white-space: nowrap;
      text-shadow: 0 2px 10px rgba(1, 23, 40, 0.36);
    }
  }

  .brand-orbit {
    position: absolute;
    top: -34px;
    left: 20%;
    width: 62%;
    height: 34px;
    border-top: 1px solid rgba(226, 250, 255, 0.9);
    border-radius: 50%;
    transform: rotate(-7deg);

    i {
      position: absolute;
      top: -7px;
      left: 51%;
      width: 12px;
      height: 12px;
      background: #f3fdff;
      box-shadow: 0 0 14px #b8faff;
      clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
    }
  }
}

@media (max-width: 720px) {
  .brand-lockup {
    width: 100%;
    gap: 13px;

    .logo-img {
      width: clamp(68px, 19vw, 88px);
      height: clamp(68px, 19vw, 88px);
    }

    .brand-divider { height: 62px; }

    .brand-copy {
      h1 { font-size: clamp(29px, 8vw, 38px); }
      .brand-cn { margin-top: 4px; gap: 7px; font-size: 12px; }
      .brand-cn::before,
      .brand-cn::after { width: 16px; }
      p { margin-top: 6px; font-size: clamp(9px, 2.5vw, 11px); letter-spacing: 0.04em; }
    }

    .brand-orbit { top: -15px; left: 22%; height: 18px; }
    .brand-orbit i { top: -5px; width: 9px; height: 9px; }
  }
}

@media (max-width: 350px) {
  .brand-lockup {
    gap: 9px;
    .logo-img { width: 62px; height: 62px; }
    .brand-copy h1 { font-size: 27px; }
    .brand-copy p { letter-spacing: 0; }
  }
}
</style>
