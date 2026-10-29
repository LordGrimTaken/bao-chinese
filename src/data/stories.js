import { WORD_BY_ZH } from './course.js';
import { toMarks } from '../js/pinyin.js';

const PUNCT = new Set(['，', '。', '！', '？', '：', '、', '“', '”', '…']);
const s = (speaker, tokens, en) => ({ speaker, tokens, en });

export const STORIES = [
  {
    id: 's1',
    title: '早上好',
    titleEn: 'Good morning',
    emoji: '🌅',
    color: 'orange',
    blurb: 'A small breakfast scene at home.',
    lines: [
      s('妈妈', ['你', '早', '！'], 'Good morning!'),
      s('我', ['妈妈', '，', '早上', '好', '！'], 'Good morning, Mom!'),
      s('妈妈', ['你', '吃', '早饭', '吗', '？'], 'Are you eating breakfast?'),
      s('我', ['我', '吃', '。', '我', '吃', '面包', '。'], 'I am. I am eating bread.'),
      s('妈妈', ['你', '喝', '牛奶', '吗', '？'], 'Are you drinking milk?'),
      s('我', ['我', '喝', '。', '谢谢', '妈妈', '！'], 'I am. Thanks, Mom!'),
    ],
    questions: [
      {
        prompt: '我吃什么？',
        en: 'What does the child eat?',
        options: [
          { zh: '面包', correct: true },
          { zh: '饺子' },
          { zh: '米饭' },
        ],
      },
      {
        prompt: '我喝什么？',
        en: 'What does the child drink?',
        options: [
          { zh: '茶' },
          { zh: '牛奶', correct: true },
          { zh: '水' },
        ],
      },
    ],
  },
  {
    id: 's2',
    title: '买东西',
    titleEn: 'At the shop',
    emoji: '🛍️',
    color: 'clay',
    blurb: 'Ask the price and try a little bargaining.',
    lines: [
      s('女士', ['你', '好', '！', '你', '要', '什么', '？'], 'Hello! What would you like?'),
      s('我', ['我', '要', '这个', '。', '多少', '钱', '？'], 'I want this one. How much?'),
      s('女士', ['五', '十', '块', '。'], 'Fifty yuan.'),
      s('我', ['太', '贵', '了', '！', '便宜', '一点儿', '吧', '。'], 'That is too expensive! A little cheaper, please.'),
      s('女士', ['好', '，', '四', '十', '块', '。'], 'Okay, forty yuan.'),
      s('我', ['谢谢', '！'], 'Thank you!'),
    ],
    questions: [
      {
        prompt: '女士开始要多少钱？',
        en: 'What price did the shopkeeper ask first?',
        options: [
          { zh: '三十块' },
          { zh: '四十块' },
          { zh: '五十块', correct: true },
        ],
      },
      {
        prompt: '最后多少钱？',
        en: 'What was the final price?',
        options: [
          { zh: '四十块', correct: true },
          { zh: '五十块' },
          { zh: '六十块' },
        ],
      },
    ],
  },
  {
    id: 's3',
    title: '找猫',
    titleEn: 'Looking for the cat',
    emoji: '🐱',
    color: 'lilac',
    blurb: 'A cat, a table, and a chair.',
    lines: [
      s('我', ['我', '的', '猫', '在', '哪儿', '？'], 'Where is my cat?'),
      s('他', ['猫', '在', '桌子', '下', '边', '。'], 'The cat is under the table.'),
      s('我', ['没有', '猫', '。'], 'There is no cat.'),
      s('他', ['猫', '在', '椅子', '上', '边', '。'], 'The cat is on the chair.'),
      s('我', ['看见', '了', '！', '它', '在', '睡觉', '。'], 'I see it! It is sleeping.'),
      s('他', ['它', '很', '喜欢', '那个', '椅子', '。'], 'It really likes that chair.'),
    ],
    questions: [
      {
        prompt: '猫在哪儿？',
        en: 'Where is the cat?',
        options: [
          { zh: '桌子下边' },
          { zh: '椅子上边', correct: true },
          { zh: '外边' },
        ],
      },
      {
        prompt: '猫在做什么？',
        en: 'What is the cat doing?',
        options: [
          { zh: '吃饭' },
          { zh: '玩' },
          { zh: '睡觉', correct: true },
        ],
      },
    ],
  },
  {
    id: 's4',
    title: '星期天',
    titleEn: 'Sunday plans',
    emoji: '🎬',
    color: 'ocean',
    blurb: 'Make a simple plan to see a movie.',
    lines: [
      s('旁白', ['今天', '是', '星期天', '。'], 'Today is Sunday.'),
      s('我', ['我们', '去', '看', '电影', '吧', '！'], 'Let’s go see a movie!'),
      s('她', ['好', '！', '电影院', '在', '那边', '。'], 'Okay! The cinema is over there.'),
      s('我', ['我们', '几', '点', '去', '？'], 'What time are we going?'),
      s('她', ['下午', '三', '点', '。'], 'Three in the afternoon.'),
      s('我', ['好', '，', '下午', '见', '！'], 'Okay, see you in the afternoon!'),
    ],
    questions: [
      {
        prompt: '今天是星期几？',
        en: 'What day is it today?',
        options: [
          { zh: '星期六' },
          { zh: '星期天', correct: true },
          { zh: '星期一' },
        ],
      },
      {
        prompt: '她们几点去？',
        en: 'What time are they going?',
        options: [
          { zh: '两点' },
          { zh: '三点', correct: true },
          { zh: '四点' },
        ],
      },
    ],
  },
];

function enrich(line, story, index) {
  const pinyin = line.tokens
    .map((token) => (WORD_BY_ZH.has(token) ? toMarks(WORD_BY_ZH.get(token).py) : token))
    .join(' ')
    .replace(/\s+([，。！？、：])/g, '$1');
  return {
    ...line,
    id: `${story.id}l${index + 1}`,
    zh: line.tokens.join(''),
    pinyin,
    storyId: story.id,
  };
}

for (const story of STORIES) {
  story.lines = story.lines.map((line, index) => enrich(line, story, index));
}

export const STORY_BY_ID = new Map(STORIES.map((story) => [story.id, story]));
export const STORY_LINE_BY_ZH = new Map();
for (const story of STORIES) {
  for (const line of story.lines) {
    if (!STORY_LINE_BY_ZH.has(line.zh)) STORY_LINE_BY_ZH.set(line.zh, line.id);
  }
}

export const TOTAL_STORIES = STORIES.length;
