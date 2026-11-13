<template>
  <div class="content-window">
    <router-view />
  </div>
</template>

<script>
  export default {
    name: 'App',
  };
</script>

<style lang="scss">
  $generalPaddingRight: 10pt;
  $generalPaddingLeft: 10pt;

  // Room the tablet's own bars take (status bar on top, task bar below), so they never cover the game.
  :root {
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left: env(safe-area-inset-left, 0px);
    --safe-right: env(safe-area-inset-right, 0px);
  }

  // Android app shell that draws under the system bars but does not report their size
  :root.under-system-bars {
    --safe-top: max(env(safe-area-inset-top, 0px), 30px);
    --safe-bottom: max(env(safe-area-inset-bottom, 0px), 62px);
  }

  .content-window {
    box-sizing: border-box;
    height: calc(100% - var(--safe-top) - var(--safe-bottom));
    max-height: calc(100% - var(--safe-top) - var(--safe-bottom));
    padding-right: calc(#{$generalPaddingRight} + var(--safe-right));
    padding-left: calc(#{$generalPaddingLeft} + var(--safe-left));
    width: 100%;
    max-width: 100%;
    top: var(--safe-top);
    left: 0;
    position: absolute;
    margin: 0;
    background-color: #37373e;
  }

  .content {
    position: relative;
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
  }

  .clickable-elements,
  .game-button {
    color: #ffffff;
    background-color: #4385f4f0;
    border-radius: 5pt;
    touch-action: manipulation;
  }

  .game-button {
    height: 30pt;
    width: 40pt;
    font-size: 1.7rem;
    display: flex;
    justify-content: center;
    align-items: center;
    // apple ignores touch-action: manipulation on input fields... therefore this will work on divs only
    touch-action: manipulation;
  }

  .game-button > a {
    color: inherit;
    text-decoration: none;
    touch-action: manipulation;
  }

  html {
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    min-height: 100%;
    width: 100%;
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    background-color: #37373e;
  }

  body {
    display: flex;
    height: 100%;
    max-height: 100%;
    min-height: 100%;
    width: 100%;
    background-color: #37373e;
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    touch-action: manipulation;
  }

  .no-drag {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
  }
</style>
