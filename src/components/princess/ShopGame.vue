<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_shop"
    :current-level="1"
    @restart="restart"
  >
    <div class="shop" :style="{ backgroundImage: 'url(img/shop/market.webp)' }">
      <div class="trips">
        <span v-for="n in rounds" :key="n" :class="{ on: n <= trip }">🛒</span>
      </div>

      <!-- 1. shopping: find what is on the list -->
      <template v-if="phase === 'list'">
        <div class="list paper" data-test="list">
          <div class="list-title">📝 {{ t(TXT.list) }}</div>
          <div v-for="id in want" :key="id" class="list-item" :class="{ got: basket.includes(id) }" :data-want="id">
            <img :src="P[id].src" alt="" class="no-drag" />
            <span class="tick">{{ basket.includes(id) ? '✔' : '' }}</span>
          </div>
        </div>
        <div class="shelf">
          <button
            v-for="id in shelf"
            :key="id"
            type="button"
            class="product"
            :class="{ taken: basket.includes(id), shake: wrongId === id }"
            :data-product="id"
            :disabled="basket.includes(id)"
            @click="take(id)"
          >
            <img :src="P[id].src" alt="" class="no-drag" />
          </button>
        </div>
        <div class="basket">
          <img :src="'img/princess/thing_basket.webp'" class="basket-img no-drag" alt="" />
          <img v-for="id in basket" :key="id" :src="P[id].src" class="in-basket no-drag" alt="" />
        </div>
      </template>

      <!-- 2. paying: count the coins -->
      <template v-else-if="phase === 'pay'">
        <div class="counter">
          <img :src="'img/princess/mommy.webp'" class="cashier no-drag" alt="" />
          <div class="bill paper">
            <div v-for="id in want" :key="id" class="bill-row">
              <img :src="P[id].src" alt="" class="no-drag" />
              <span class="price">
                <img v-for="k in P[id].price" :key="k" :src="'img/shop/coin.webp'" class="mini no-drag" alt="" />
              </span>
            </div>
            <div class="total" data-test="total">= {{ total }}</div>
          </div>
        </div>
        <div class="pay-row">
          <button type="button" class="purse" data-test="coin" @click="addCoin">
            <img :src="'img/shop/coin.webp'" alt="" class="no-drag" />
            <span>+1</span>
          </button>
          <div class="tray" data-test="tray">
            <button v-for="(c, i) in paid" :key="c" type="button" class="paid-coin" :data-paid="i" @click="removeCoin(i)">
              <img :src="'img/shop/coin.webp'" alt="" class="no-drag" />
            </button>
            <span class="count">{{ paid.length }}</span>
          </div>
          <button type="button" class="pay-btn" data-test="pay" @click="pay">💳 {{ t(TXT.pay) }}</button>
        </div>
      </template>

      <template v-else>
        <div class="happy-end">
          <img :src="'img/princess/mommy.webp'" class="cashier big no-drag" alt="" />
          <button v-if="isGameOver" type="button" class="done" data-test="next" @click="goToPath">
            <em class="fas fa-arrow-right" />
          </button>
        </div>
      </template>

      <div class="ask">
        <button type="button" class="ask-line" data-test="repeat" @click="repeat">
          <em class="fas fa-volume-up" />
          <span>{{ prompt }}</span>
        </button>
        <LangToggle @change="repeat" />
      </div>
    </div>
    <canvas v-if="party" ref="fx" class="fx" />
  </Game>
</template>

<script>
  import Game from '../Game.vue';
  import LangToggle from './LangToggle.vue';
  import { gameMixin } from './gameMixin.js';
  import { Lines, SHOP_ITEMS } from './princessLines.js';
  import { ArrayUtils } from '../utils/ArrayUtils.js';
  import { sfx } from '../academy/sfx.js';

  // Go shopping (like BabyBus): find the things on the list, then pay Mommy
  // with the right number of coins.
  const P = Object.fromEntries(SHOP_ITEMS.map((p) => [p.id, p]));
  const TXT = {
    list: { vi: 'Danh sách', en: 'Shopping list' },
    pay: { vi: 'Trả tiền', en: 'Pay' },
  };

  export default {
    name: 'ShopGame',
    components: { Game, LangToggle },
    mixins: [gameMixin],
    data() {
      return { P, TXT, rounds: 3, trip: 0, phase: 'list', want: [], shelf: [], basket: [], paid: [], wrongId: null, party: false, coinId: 0 };
    },
    computed: {
      total() {
        return this.want.reduce((s, id) => s + P[id].price, 0);
      },
    },
    created() {
      this.restart();
    },
    methods: {
      t(text) {
        return text[this.lang] || text.vi;
      },
      restart() {
        this.clearTimers();
        this.trip = 0;
        this.isGameOver = false;
        this.newTrip(true);
      },
      newTrip(first) {
        const all = ArrayUtils.shuffleArray(SHOP_ITEMS.map((p) => p.id));
        const size = this.trip === 0 ? 2 : 3;
        // keep the bill small enough to count (at most 7 coins)
        let want = all.slice(0, size);
        while (want.reduce((s, id) => s + P[id].price, 0) > 7) want = ArrayUtils.shuffleArray(all).slice(0, size);
        this.want = want;
        this.shelf = ArrayUtils.shuffleArray([...want, ...all.filter((id) => !want.includes(id)).slice(0, 10 - size)]);
        this.basket = [];
        this.paid = [];
        this.phase = 'list';
        this.say(first ? Lines.shopHello() : Lines.shopList());
      },
      take(id) {
        if (this.phase !== 'list' || this.basket.includes(id)) return;
        if (!this.want.includes(id)) {
          sfx.wrong();
          this.wrongId = id;
          this.later(() => (this.wrongId = null), 500);
          this.say(Lines.shopNotOnList());
          return;
        }
        sfx.right();
        this.basket.push(id);
        this.say(Lines.shopItem(id));
        if (this.want.every((w) => this.basket.includes(w)))
          this.later(() => {
            this.phase = 'pay';
            this.say(Lines.shopPay(this.total));
          }, 1500);
      },
      addCoin() {
        if (this.paid.length >= 10) return;
        sfx.click();
        this.paid.push(++this.coinId);
        this.say(Lines.number(this.paid.length));
      },
      removeCoin(i) {
        sfx.click();
        this.paid.splice(i, 1);
      },
      pay() {
        const n = this.paid.length;
        if (n < this.total) {
          sfx.wrong();
          return this.say(Lines.shopMore());
        }
        if (n > this.total) {
          sfx.wrong();
          return this.say(Lines.shopTooMuch());
        }
        sfx.right();
        this.trip++;
        this.phase = 'thanks';
        if (this.trip >= this.rounds) {
          this.party = true;
          sfx.fanfare();
          this.finishStage('shop', Lines.shopDone());
          this.$nextTick(() => fireworks(this));
          this.later(() => (this.party = false), 5000);
          return;
        }
        this.say(Lines.shopThanks());
        this.later(() => this.newTrip(false), 2800);
      },
    },
  };

  function fireworks(vm) {
    const c = vm.$refs.fx;
    if (!c) return;
    const g = c.getContext('2d');
    const W = (c.width = window.innerWidth);
    const H = (c.height = window.innerHeight);
    const colors = ['#ff5fa2', '#ffd84a', '#7ee0ff', '#b98cff', '#7dff9a'];
    const parts = [];
    let frame = 0;
    const step = () => {
      if (!vm.party || !vm.$refs.fx) return;
      if (frame % 25 === 0 && frame < 220) {
        const x = W * (0.2 + Math.random() * 0.6);
        const y = H * (0.15 + Math.random() * 0.3);
        const col = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 70; i++) {
          const a = (Math.PI * 2 * i) / 70;
          const v = 2 + Math.random() * 3;
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 80, col });
        }
      }
      g.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 1;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        g.globalAlpha = Math.min(1, p.life / 40);
        g.fillStyle = p.col;
        g.fillRect(p.x - 3, p.y - 3, 7, 7);
      }
      frame += 1;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
</script>

<style scoped lang="scss">
  .shop {
    position: relative;
    display: grid;
    grid-template-columns: 12rem 1fr;
    grid-template-rows: auto 1fr auto auto;
    gap: 0.6rem;
    height: 100%;
    padding: 0.6rem 0.9rem 0.8rem;
    border-radius: 1.2rem;
    background-size: cover;
    background-position: center;
    font-family: 'Baloo 2', system-ui, sans-serif;
    color: #4a2a57;
  }
  .paper {
    background: rgba(255, 255, 255, 0.92);
    border-radius: 1rem;
    box-shadow: 0 6px 14px rgba(74, 42, 87, 0.2);
  }
  .trips {
    grid-column: 1 / -1;
    display: flex;
    gap: 0.4rem;
    justify-content: center;
    font-size: 1.8rem;
    filter: grayscale(1);
  }
  .trips .on {
    filter: none;
  }
  .trips span {
    opacity: 0.5;
  }
  .trips .on {
    opacity: 1;
  }
  .list {
    grid-row: 2 / 4;
    padding: 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-self: start;
  }
  .list-title {
    font-weight: 800;
    font-size: 1.1rem;
    text-align: center;
  }
  .list-item {
    position: relative;
    display: grid;
    place-items: center;
    height: 5.5rem;
    border-radius: 0.8rem;
    background: #fff6e6;
  }
  .list-item img {
    max-height: 80%;
    max-width: 80%;
  }
  .list-item.got img {
    opacity: 0.45;
  }
  .tick {
    position: absolute;
    right: 0.3rem;
    top: 0;
    font-size: 2.2rem;
    color: #2fb36a;
    font-weight: 900;
  }
  .shelf {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.6rem;
    align-content: center;
    padding: 0.6rem;
    background: rgba(255, 255, 255, 0.55);
    border-radius: 1rem;
  }
  .product {
    aspect-ratio: 1;
    border: 0;
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0 4px 0 #e6c9d8;
    cursor: pointer;
    padding: 0.4rem;
  }
  .product img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .product.taken {
    opacity: 0.25;
  }
  .product.shake {
    animation: shake 0.45s;
  }
  @keyframes shake {
    25% {
      transform: translateX(-8px);
    }
    75% {
      transform: translateX(8px);
    }
  }
  .basket {
    position: relative;
    grid-column: 2;
    justify-self: center;
    width: 12rem;
    height: 7rem;
  }
  .basket-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    z-index: 2;
  }
  .in-basket {
    position: relative;
    width: 3.6rem;
    margin: 0 -0.4rem;
    top: -1.2rem;
    animation: drop 0.4s ease-out;
    z-index: 1;
  }
  @keyframes drop {
    from {
      transform: translateY(-120px) scale(1.4);
    }
  }
  .counter {
    grid-column: 1 / -1;
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    justify-content: center;
    min-height: 0;
  }
  .cashier {
    height: 100%;
    max-height: 22rem;
    object-fit: contain;
  }
  .cashier.big {
    max-height: 26rem;
    animation: drop 0.6s ease-out;
  }
  .bill {
    padding: 0.8rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-self: center;
  }
  .bill-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .bill-row > img {
    width: 3.6rem;
    height: 3.6rem;
    object-fit: contain;
  }
  .mini {
    width: 2rem;
  }
  .total {
    font-size: 2.6rem;
    font-weight: 900;
    text-align: right;
  }
  .pay-row {
    grid-column: 1 / -1;
    display: flex;
    gap: 0.8rem;
    align-items: center;
    justify-content: center;
  }
  .purse,
  .pay-btn {
    border: 0;
    border-radius: 1rem;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }
  .purse {
    width: 6rem;
    height: 6rem;
    background: #fff;
    display: grid;
    place-items: center;
    box-shadow: 0 4px 0 #e0b24a;
  }
  .purse img {
    width: 3.6rem;
  }
  .tray {
    flex: 1;
    max-width: 30rem;
    min-height: 5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;
    align-items: center;
    padding: 0.4rem 3rem 0.4rem 0.6rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 1rem;
    position: relative;
  }
  .paid-coin {
    border: 0;
    background: none;
    padding: 0;
    cursor: pointer;
    animation: drop 0.3s ease-out;
  }
  .paid-coin img {
    width: 2.8rem;
  }
  .count {
    position: absolute;
    right: 0.7rem;
    font-size: 2.2rem;
    font-weight: 900;
  }
  .pay-btn {
    padding: 1rem 1.4rem;
    font-size: 1.3rem;
    color: #fff;
    background: #5fd38d;
    box-shadow: 0 4px 0 #3a9a62;
  }
  .happy-end {
    grid-column: 1 / -1;
    grid-row: 2 / 4;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }
  .done {
    border: 0;
    border-radius: 999px;
    width: 5rem;
    height: 5rem;
    font-size: 2rem;
    color: #fff;
    background: #5fd38d;
    cursor: pointer;
  }
  .ask {
    grid-column: 1 / -1;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .ask-line {
    flex: 1;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    border: 0;
    background: #fff;
    border-radius: 999px;
    padding: 0.5rem 0.9rem;
    font: inherit;
    font-weight: 700;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }
  .fx {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 60;
  }
</style>
