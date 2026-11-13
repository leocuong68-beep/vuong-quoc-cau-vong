<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    :explanation="'mia_' + stageId"
    :current-level="1"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene">
        <template v-if="scene.kind === 'face'">
          <div class="face-tap">
            <img :src="'img/princess/mia_face.webp'" class="no-drag" alt="Mia" />
            <button
              v-for="(spot, index) in choices"
              :key="questionId + '-' + index"
              type="button"
              class="spot"
              :data-choice="spot.id"
              :style="{ left: spot.x - spot.r + '%', top: spot.y - spot.r + '%', width: spot.r * 2 + '%', height: spot.r * 2 + '%' }"
              @click="pick(spot)"
            />
          </div>
        </template>
        <template v-else-if="scene.kind === 'people'">
          <div class="people" :style="{ '--n': scene.people.length }">
            <img
              v-for="(person, index) in scene.people"
              :key="questionId + '-' + index"
              :src="person.src"
              class="person no-drag"
              :style="{ '--h': person.h }"
              alt=""
            />
          </div>
        </template>
        <template v-else-if="scene.kind === 'chars'">
          <div class="mia" :class="'mood-' + mood" :style="{ height: miaHeight + '%' }">
            <img :src="miaSrc" class="no-drag" alt="Mia" />
          </div>
          <div class="pony" :class="'mood-' + mood" :style="{ height: buddy.height + '%' }" :data-buddy="buddyId">
            <img :src="buddy.src" class="no-drag" :alt="buddy.en" />
          </div>
        </template>
        <template v-else>
          <div class="pony side" :class="'mood-' + mood" :data-buddy="buddyId">
            <img :src="buddy.src" class="no-drag" :alt="buddy.en" />
          </div>
          <div class="board" data-test="board">
            <template v-if="scene.kind === 'items'">
              <template v-for="(group, groupIndex) in scene.groups" :key="questionId + '-' + groupIndex">
                <span v-if="groupIndex > 0" class="plus">+</span>
                <img
                  v-for="n in group"
                  :key="questionId + '-' + groupIndex + '-' + n"
                  :src="scene.src"
                  class="item no-drag"
                  :class="{ eaten: scene.eaten && n > group - scene.eaten }"
                  :style="{ animationDelay: n * 0.07 + 's' }"
                  alt=""
                />
              </template>
            </template>
            <template v-else-if="scene.kind === 'picture'">
              <img :key="questionId" :src="scene.src" class="picture no-drag" :style="scene.scale ? { transform: 'scale(' + scene.scale + ')' } : null" alt="" />
            </template>
            <template v-else-if="scene.kind === 'clock'">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span :key="questionId" class="clock" v-html="clock(scene.hour)" />
            </template>
            <template v-else-if="scene.kind === 'mix'">
              <!-- eslint-disable vue/no-v-html -->
              <span class="blob" v-html="blob(scene.a)" />
              <span class="plus">+</span>
              <span class="blob" v-html="blob(scene.b)" />
              <span class="plus">=</span>
              <span v-if="isBusy" class="blob" v-html="blob(scene.result)" />
              <span v-else class="mystery">?</span>
              <!-- eslint-enable vue/no-v-html -->
            </template>
            <template v-else-if="scene.kind === 'numbers'">
              <span
                v-for="(n, index) in scene.sequence"
                :key="questionId + '-' + index"
                class="number-box"
                :class="{ mystery: n === null }"
              >
                {{ n === null ? '?' : n }}
              </span>
            </template>
            <template v-else>
              <img
                v-for="(src, index) in scene.sequence"
                :key="questionId + '-' + index"
                :src="src"
                class="item no-drag"
                :style="{ animationDelay: index * 0.07 + 's' }"
                alt=""
              />
              <span class="mystery">?</span>
            </template>
          </div>
        </template>
      </div>
      <div class="ask">
        <button type="button" class="ask-line" data-test="repeat" @click="repeat">
          <em class="fas fa-volume-up" />
          <span>{{ prompt }}</span>
        </button>
        <LangToggle @change="repeat" />
      </div>
      <div class="choices">
        <template v-if="!isGameOver">
          <button
            v-for="choice in buttonChoices"
            :key="questionId + '-' + choice.id"
            type="button"
            class="choice"
            :class="{ shake: wrongId === choice.id, wide: choice.kind === 'group', big: question && question.big }"
            :data-choice="choice.id"
            @click="pick(choice)"
          >
            <img
              v-if="choice.kind === 'img'"
              :src="choice.src"
              class="no-drag"
              :class="{ silhouette: choice.shadow }"
              :style="choice.scale ? { transform: 'scale(' + choice.scale + ')' } : null"
              alt=""
            />
            <span v-else-if="choice.kind === 'text'">{{ choice.text }}</span>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-else-if="choice.kind === 'shape'" class="shape" v-html="shape(choice)" />
            <span v-else class="group">
              <img v-for="n in choice.count" :key="n" :src="choice.src" class="no-drag" alt="" />
            </span>
          </button>
        </template>
        <button v-else type="button" class="done" data-test="next" @click="goToPath">
          <em class="fas fa-arrow-right" />
        </button>
      </div>
      <div class="dots">
        <span v-for="n in rounds" :key="n" :class="{ on: n <= finished }" />
      </div>
    </div>
    <ErrorAnimation ref="errorAnimation" />
  </Game>
</template>

<script>
  import Game from '../Game.vue';
  import ErrorAnimation from '../ErrorAnimation.vue';
  import LangToggle from './LangToggle.vue';
  import { ArrayUtils } from '../utils/ArrayUtils.js';
  import { BUDDIES, COLORS, Lines } from './princessLines.js';
  import { buddyOf, stageById, shapeSvg, clockSvg } from './stages.js';
  import { gameMixin } from './gameMixin.js';
  import { Profiles } from './state.js';

  export default {
    name: 'QuizGame',
    components: { Game, ErrorAnimation, LangToggle },
    mixins: [gameMixin],
    data() {
      return {
        stageId: '',
        rounds: 5,
        finished: 0,
        questionId: 0,
        question: null,
        wrongId: null,
        dressColor: 'pink',
        miaOverride: null,
      };
    },
    computed: {
      buddyId() {
        return buddyOf(stageById(this.stageId)) || 'pony';
      },
      buddy() {
        return BUDDIES[this.buddyId];
      },
      miaSrc() {
        if (Profiles.isBoy) return 'img/princess/tintin.webp';
        return this.miaOverride || 'img/princess/mia_' + this.dressColor + '.webp';
      },
      miaHeight() {
        // Mia is the smallest of the family, but taller than Pony
        if (Profiles.isBoy) return this.buddyId === 'pony' ? 96 : 86;
        return this.buddyId === 'pony' ? 96 : 74;
      },
      scene() {
        return this.question ? this.question.scene : { kind: 'chars' };
      },
      choices() {
        return this.question ? this.question.choices : [];
      },
      buttonChoices() {
        return this.choices.filter((c) => c.kind !== 'spot');
      },
    },
    created() {
      this.stageId = (this.$route && this.$route.params.id) || '';
      if (!stageById(this.stageId) || !stageById(this.stageId).make) {
        this.goToPath();
        return;
      }
      this.restart();
    },
    methods: {
      blob(hex) {
        return shapeSvg('circle', hex);
      },
      clock(hour) {
        return clockSvg(hour);
      },
      shape(choice) {
        return shapeSvg(choice.shape, choice.hex);
      },
      restart() {
        this.clearTimers();
        this.finished = 0;
        this.isGameOver = false;
        this.isBusy = false;
        this.mood = 'idle';
        this.dressColor = ArrayUtils.getRandomArrayElement(COLORS).id;
        this.question = null;
        this.miaOverride = null;
        if (this.buddyId === 'pony') {
          this.nextQuestion();
        } else {
          this.isBusy = true;
          this.say(Lines.buddyHello(this.buddyId));
          this.later(() => {
            this.isBusy = false;
            this.nextQuestion();
          }, 2600);
        }
      },
      nextQuestion() {
        const make = stageById(this.stageId).make;
        const previous = this.question;
        let next = make();
        // avoid asking the very same thing twice in a row
        for (let i = 0; i < 6 && previous && next.line.key + next.answerId === previous.line.key + previous.answerId; i++) {
          next = make();
        }
        this.question = next;
        this.questionId++;
        this.say(next.line);
      },
      pick(choice) {
        if (this.isBusy || this.isGameOver) return;
        if (choice.id !== this.question.answerId) {
          this.wrongId = choice.id;
          this.later(() => (this.wrongId = null), 500);
          this.setMood('oops', 900);
          const wrong = this.question.wrongLine(choice);
          this.$refs.errorAnimation.showError(() => this.say(wrong));
          return;
        }
        this.isBusy = true;
        this.finished++;
        if (this.question.miaAfter) this.miaOverride = this.question.miaAfter;
        this.setMood('happy');
        this.say(this.question.okLine);
        this.later(() => {
          this.isBusy = false;
          if (this.finished >= this.rounds) {
            this.question = null;
            this.finishStage(
              this.stageId,
              this.buddyId === 'pony' ? Lines.praise(this.questionId) : Lines.buddyDone(this.buddyId)
            );
          } else {
            this.nextQuestion();
          }
        }, 2400);
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';
</style>
