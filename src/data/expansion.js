/**
 * Expansion pack 1 — Unit 9: Home & Tech.
 *
 * These lessons pull 20 words out of the HSK 1 deck and give them sentences,
 * grammar notes, and production practice. The remaining deck words stay in
 * the vocabulary deck until their unit is authored.
 */

import { BONUS_WORDS } from './hsk1-extra.js';

const BONUS_BY_ID = new Map(BONUS_WORDS.map((word) => [word.id, word]));

const s = (tokens, en) => ({ tokens, en });

export const EXPANSION_UNITS = [
  {
    id: 'u9',
    number: 9,
    title: 'Home & Tech',
    subtitle: 'Your room, your screens, and where things are',
    color: 'rose',
    emoji: '🏠',
    lessons: [
      {
        id: 'u9l1',
        title: 'At home',
        kicker: 'Talk about the things in your room',
        words: ['hsk_zhuo_zi', 'hsk_yi_zi', 'hsk_fang_jian', 'hsk_dong_xi', 'hsk_li', 'hsk_shang', 'hsk_xia'],
        sentences: [
          s(['桌子', '在', '房间', '里', '。'], 'The table is in the room.'),
          s(['椅子', '上', '有', '书', '。'], 'There is a book on the chair.'),
          s(['我', '的', '东西', '在', '桌子', '上', '。'], 'My things are on the table.'),
          s(['房间', '里', '有', '桌子', '，', '也', '有', '椅子', '。'], 'There is a table and a chair in the room.'),
          s(['书', '在', '椅子', '下', '。'], 'The book is under the chair.'),
        ],
        grammar: {
          title: '在 + place, and 里/上/下',
          pattern: 'Noun + 里/上/下',
          body: '在 means “at/in/on”. Location words come after the noun: 房间里 = in the room, 桌子上 = on the table, 椅子下 = under the chair.',
        },
      },
      {
        id: 'u9l2',
        title: 'Screens & songs',
        kicker: 'Talk about phones, movies, and music',
        words: ['hsk_dian_nao', 'hsk_dian_shi', 'hsk_shou_ji', 'hsk_dian_ying', 'hsk_dian_ying_yuan', 'hsk_chang', 'hsk_ge'],
        sentences: [
          s(['我', '的', '电脑', '在', '桌子', '上', '。'], 'My computer is on the table.'),
          s(['我', '看', '电视', '。'], 'I watch TV.'),
          s(['你', '的', '手机', '在', '哪儿', '？'], 'Where is your phone?'),
          s(['我们', '去', '看', '电影', '。'], 'We are going to see a movie.'),
          s(['电影院', '在', '这儿', '。'], 'The cinema is here.'),
          s(['我', '喜欢', '唱', '歌', '。'], 'I like to sing songs.'),
        ],
        grammar: {
          title: 'Screens, films, and songs',
          pattern: '看 + 电视/电影 · 唱 + 歌',
          body: '看 works for watching TV and movies. 唱 means “to sing”, and 歌 is a song. 电影院 is a cinema; 电脑 is a computer; 手机 is a mobile phone.',
        },
      },
      {
        id: 'u9l3',
        title: 'Where is it?',
        kicker: 'Use here, there, and position words',
        words: ['hsk_wai_bian', 'hsk_bian', 'hsk_qian_2', 'hsk_hou', 'hsk_na_bian', 'hsk_zhe_bian'],
        sentences: [
          s(['学校', '在', '外边', '。'], 'The school is outside.'),
          s(['学校', '在', '那边', '。'], 'The school is over there.'),
          s(['我', '家', '在', '这边', '。'], 'My home is over here.'),
          s(['桌子', '前', '边', '有', '椅子', '。'], 'There is a chair in front of the table.'),
          s(['椅子', '后', '边', '是', '桌子', '。'], 'Behind the chair is the table.'),
          s(['外边', '的', '天气', '很', '好', '。'], 'The weather outside is nice.'),
        ],
        grammar: {
          title: 'Here, there, and position words',
          pattern: '前边 / 后边 / 外边 / 这边 / 那边',
          body: 'These words describe where something is. 前边 = in front, 后边 = behind, 外边 = outside, 这边 = over here, 那边 = over there. Put the phrase after 在: 学校在那边.',
        },
      },
    ],
  },
];

export const EXPANSION_WORDS = [...new Set(EXPANSION_UNITS.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.words)))]
  .map((id) => BONUS_BY_ID.get(id))
  .filter(Boolean);

export const EXPANSION_WORD_IDS = new Set(EXPANSION_WORDS.map((word) => word.id));
