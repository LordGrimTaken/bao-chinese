/**
 * Bao Chinese — course content.
 *
 * Design rules:
 *  - Pinyin is stored in numbered form and rendered with tone marks.
 *  - Sentences are tokenized; every non-punctuation token must exist in WORDS.
 *  - A word is introduced exactly once, in a lesson's `words` array.
 *  - All content is original, written for this app, and aligned to HSK 3.0
 *    Level 1 vocabulary/grammar where practical.
 */

import { toMarks, tonesOf } from '../js/pinyin.js';
import { BONUS_WORDS } from './hsk1-extra.js';
import { EXPANSION_UNITS, EXPANSION_WORDS, EXPANSION_WORD_IDS } from './expansion.js';

export { BONUS_WORDS };

const w = (zh, py, en, extra = {}) => ({ zh, py, en, ...extra });

export const WORDS = {
  // ── Unit 1: First Hellos ─────────────────────────────────────────────
  nihao: w('你好', 'ni3 hao3', 'hello', { emoji: '👋', pos: 'phrase', note: 'The all-purpose greeting.' }),
  wo: w('我', 'wo3', 'I; me', { pos: 'pronoun' }),
  ni: w('你', 'ni3', 'you', { pos: 'pronoun' }),
  shi: w('是', 'shi4', 'to be', { pos: 'verb', note: 'Links two nouns: 我是学生.' }),
  ma: w('吗', 'ma5', '(yes/no question particle)', { pos: 'particle', note: 'Add it to the end of a statement to make a question.' }),
  bu: w('不', 'bu4', 'not', { pos: 'adverb', note: 'Negates verbs and adjectives. In speech it often becomes bú before a 4th tone.' }),
  xuesheng: w('学生', 'xue2 sheng5', 'student', { emoji: '🎒', pos: 'noun' }),
  mingzi: w('名字', 'ming2 zi5', 'name', { pos: 'noun' }),
  jiao: w('叫', 'jiao4', 'to be called; to call', { pos: 'verb' }),
  shenme: w('什么', 'shen2 me5', 'what', { pos: 'pronoun' }),
  ta: w('他', 'ta1', 'he; him', { pos: 'pronoun', note: 'Sounds exactly like 她.' }),
  ta_f: w('她', 'ta1', 'she; her', { pos: 'pronoun', note: 'Sounds exactly like 他; the character shows gender.' }),
  shei: w('谁', 'shei2', 'who', { pos: 'pronoun' }),
  xiaoming: w('小明', 'Xiao3 Ming2', 'Xiaoming (a common given name)', { pos: 'name', hidden: true }),
  renshi: w('认识', 'ren4 shi5', 'to know; to meet', { pos: 'verb' }),
  hengaoxing: w('很高兴', 'hen3 gao1 xing4', 'very happy; nice to meet you', { pos: 'phrase' }),
  xiexie: w('谢谢', 'xie4 xie5', 'thank you', { pos: 'phrase', emoji: '🙏' }),
  zaijian: w('再见', 'zai4 jian4', 'goodbye', { pos: 'phrase', emoji: '👋' }),
  bukeqi: w('不客气', 'bu4 ke4 qi5', "you're welcome", { pos: 'phrase' }),
  qing: w('请', 'qing3', 'please; to invite', { pos: 'verb', note: 'Put it before a verb to make a polite request.' }),
  qingwen: w('请问', 'qing3 wen4', 'excuse me; may I ask', { pos: 'phrase' }),

  // ── Unit 2: People & Family ───────────────────────────────────────────
  jia: w('家', 'jia1', 'home; family', { emoji: '🏠', pos: 'noun' }),
  baba: w('爸爸', 'ba4 ba5', 'dad; father', { emoji: '👨', pos: 'noun' }),
  mama: w('妈妈', 'ma1 ma5', 'mom; mother', { emoji: '👩', pos: 'noun' }),
  gege: w('哥哥', 'ge1 ge5', 'older brother', { emoji: '👦', pos: 'noun' }),
  jiejie: w('姐姐', 'jie3 jie5', 'older sister', { emoji: '👧', pos: 'noun' }),
  didi: w('弟弟', 'di4 di5', 'younger brother', { emoji: '🧒', pos: 'noun' }),
  zhe: w('这', 'zhe4', 'this', { pos: 'pronoun' }),
  pengyou: w('朋友', 'peng2 you5', 'friend', { emoji: '🫂', pos: 'noun' }),
  laoshi: w('老师', 'lao3 shi1', 'teacher', { emoji: '🧑‍🏫', pos: 'noun' }),
  ren: w('人', 'ren2', 'person; people', { pos: 'noun' }),
  you: w('有', 'you3', 'to have; there is', { pos: 'verb', note: 'Negative: 没有, never 不有.' }),
  meiyou: w('没有', 'mei2 you3', 'not have; there is no', { pos: 'verb' }),
  hen: w('很', 'hen3', 'very', { pos: 'adverb', note: 'Often links a subject to an adjective: 我很好.' }),
  zhongguo: w('中国', 'Zhong1 guo2', 'China', { emoji: '🇨🇳', pos: 'noun' }),
  zhongguoren: w('中国人', 'Zhong1 guo2 ren2', 'Chinese person', { pos: 'noun' }),
  hanyu: w('汉语', 'Han4 yu3', 'Chinese language', { pos: 'noun' }),
  shuo: w('说', 'shuo1', 'to speak; to say', { pos: 'verb', emoji: '🗣️' }),
  hui: w('会', 'hui4', 'can; to know how to', { pos: 'verb', note: 'A learned skill, like speaking a language.' }),
  yidianr: w('一点儿', 'yi1 dian3r', 'a little; a bit', { pos: 'phrase' }),

  // ── Unit 3: Numbers & Time ────────────────────────────────────────────
  yi: w('一', 'yi1', 'one', { pos: 'number' }),
  er: w('二', 'er4', 'two', { pos: 'number' }),
  san: w('三', 'san1', 'three', { pos: 'number' }),
  si: w('四', 'si4', 'four', { pos: 'number' }),
  wu: w('五', 'wu3', 'five', { pos: 'number' }),
  liu: w('六', 'liu4', 'six', { pos: 'number' }),
  ling: w('零', 'ling2', 'zero', { pos: 'number' }),
  qi: w('七', 'qi1', 'seven', { pos: 'number' }),
  ba: w('八', 'ba1', 'eight', { pos: 'number' }),
  jiu: w('九', 'jiu3', 'nine', { pos: 'number' }),
  shi10: w('十', 'shi2', 'ten', { pos: 'number' }),
  ge: w('个', 'ge4', 'general measure word', { pos: 'measure' }),
  sui: w('岁', 'sui4', 'years old', { pos: 'measure' }),
  ji: w('几', 'ji3', 'how many', { pos: 'pronoun' }),
  jintian: w('今天', 'jin1 tian1', 'today', { pos: 'noun' }),
  mingtian: w('明天', 'ming2 tian1', 'tomorrow', { pos: 'noun' }),
  xianzai: w('现在', 'xian4 zai4', 'now', { pos: 'noun' }),
  xingqi: w('星期', 'xing1 qi1', 'week', { pos: 'noun' }),
  dian: w('点', 'dian3', "o'clock; point", { pos: 'measure' }),
  fen: w('分', 'fen1', 'minute', { pos: 'measure' }),
  shihou: w('时候', 'shi2 hou5', 'time; moment', { pos: 'noun', note: '什么时候 = when?' }),

  // ── Unit 4: Food & Drink ─────────────────────────────────────────────
  shui: w('水', 'shui3', 'water', { emoji: '💧', pos: 'noun' }),
  cha: w('茶', 'cha2', 'tea', { emoji: '🍵', pos: 'noun' }),
  kafei: w('咖啡', 'ka1 fei1', 'coffee', { emoji: '☕', pos: 'noun' }),
  he_drink: w('喝', 'he1', 'to drink', { pos: 'verb' }),
  beizi: w('杯子', 'bei1 zi5', 'cup; glass', { emoji: '🥛', pos: 'noun' }),
  niunai: w('牛奶', 'niu2 nai3', 'milk', { emoji: '🥛', pos: 'noun' }),
  bei: w('杯', 'bei1', 'cup (measure word)', { pos: 'measure' }),
  mifan: w('米饭', 'mi3 fan4', 'cooked rice', { emoji: '🍚', pos: 'noun' }),
  miantiao: w('面条', 'mian4 tiao2', 'noodles', { emoji: '🍜', pos: 'noun' }),
  pingguo: w('苹果', 'ping2 guo3', 'apple', { emoji: '🍎', pos: 'noun' }),
  jidan: w('鸡蛋', 'ji1 dan4', 'egg', { emoji: '🥚', pos: 'noun' }),
  chi: w('吃', 'chi1', 'to eat', { pos: 'verb' }),
  shuiguo: w('水果', 'shui3 guo3', 'fruit', { emoji: '🍉', pos: 'noun' }),
  fan: w('饭', 'fan4', 'meal; cooked rice', { pos: 'noun' }),
  cai: w('菜', 'cai4', 'dish; vegetables', { emoji: '🥬', pos: 'noun' }),
  haochi: w('好吃', 'hao3 chi1', 'tasty; delicious', { pos: 'adjective' }),
  fanguan: w('饭馆', 'fan4 guan3', 'restaurant', { emoji: '🏮', pos: 'noun' }),
  mai: w('买', 'mai3', 'to buy', { pos: 'verb' }),
  qian: w('钱', 'qian2', 'money', { emoji: '💴', pos: 'noun' }),

  // ── Unit 5: Getting Around ───────────────────────────────────────────
  xuexiao: w('学校', 'xue2 xiao4', 'school', { emoji: '🏫', pos: 'noun' }),
  shangdian: w('商店', 'shang1 dian4', 'shop; store', { emoji: '🏪', pos: 'noun' }),
  yiyuan: w('医院', 'yi1 yuan4', 'hospital', { emoji: '🏥', pos: 'noun' }),
  qu: w('去', 'qu4', 'to go', { pos: 'verb' }),
  zai: w('在', 'zai4', 'at; in; to be located', { pos: 'verb' }),
  chaoshi: w('超市', 'chao1 shi4', 'supermarket', { emoji: '🛒', pos: 'noun' }),
  zuo_sit: w('坐', 'zuo4', 'to sit; to take (transport)', { pos: 'verb' }),
  che: w('车', 'che1', 'car; vehicle', { emoji: '🚗', pos: 'noun' }),
  huoche: w('火车', 'huo3 che1', 'train', { emoji: '🚆', pos: 'noun' }),
  feiji: w('飞机', 'fei1 ji1', 'airplane', { emoji: '✈️', pos: 'noun' }),
  beijing: w('北京', 'Bei3 jing1', 'Beijing', { pos: 'noun' }),
  chuzuche: w('出租车', 'chu1 zu1 che1', 'taxi', { emoji: '🚕', pos: 'noun' }),
  zher: w('这儿', 'zhe4r', 'here', { pos: 'noun' }),
  nar_far: w('那儿', 'na4r', 'there', { pos: 'noun' }),
  nar_q: w('哪儿', 'na3r', 'where', { pos: 'pronoun' }),
  lai: w('来', 'lai2', 'to come', { pos: 'verb' }),
  zhu: w('住', 'zhu4', 'to live; to stay', { pos: 'verb' }),
  na: w('那', 'na4', 'that', { pos: 'pronoun' }),

  // ── Unit 6: Daily Life ───────────────────────────────────────────────
  kan: w('看', 'kan4', 'to look; to watch; to read', { pos: 'verb' }),
  ting: w('听', 'ting1', 'to listen; to hear', { pos: 'verb' }),
  du: w('读', 'du2', 'to read aloud; to study', { pos: 'verb' }),
  xie: w('写', 'xie3', 'to write', { pos: 'verb' }),
  shu: w('书', 'shu1', 'book', { emoji: '📖', pos: 'noun' }),
  hanzi: w('汉字', 'han4 zi4', 'Chinese character', { emoji: '汉', pos: 'noun' }),
  xue: w('学', 'xue2', 'to learn', { pos: 'verb' }),
  xuexi: w('学习', 'xue2 xi2', 'to study; to learn', { pos: 'verb' }),
  gongzuo: w('工作', 'gong1 zuo4', 'work; to work', { emoji: '💼', pos: 'noun' }),
  zuo_do: w('做', 'zuo4', 'to do; to make', { pos: 'verb' }),
  shuijiao: w('睡觉', 'shui4 jiao4', 'to sleep', { emoji: '😴', pos: 'verb' }),
  qichuang: w('起床', 'qi3 chuang2', 'to get out of bed', { emoji: '⏰', pos: 'verb' }),
  xihuan: w('喜欢', 'xi3 huan5', 'to like', { emoji: '❤️', pos: 'verb' }),
  xiang: w('想', 'xiang3', 'to want to; to think', { pos: 'verb' }),
  yao: w('要', 'yao4', 'to want; to need', { pos: 'verb' }),
  neng: w('能', 'neng2', 'can; to be able to', { pos: 'verb' }),
  keyi: w('可以', 'ke3 yi3', 'can; may', { pos: 'verb' }),
  ai: w('爱', 'ai4', 'to love', { emoji: '💛', pos: 'verb' }),

  // ── Unit 7: Describe It ──────────────────────────────────────────────
  da: w('大', 'da4', 'big; large', { pos: 'adjective' }),
  xiao: w('小', 'xiao3', 'small', { pos: 'adjective' }),
  duo: w('多', 'duo1', 'many; much', { pos: 'adjective' }),
  shao: w('少', 'shao3', 'few; little', { pos: 'adjective' }),
  zhen: w('真', 'zhen1', 'really; true', { pos: 'adverb' }),
  hao: w('好', 'hao3', 'good; well', { pos: 'adjective' }),
  leng: w('冷', 'leng3', 'cold', { pos: 'adjective' }),
  re: w('热', 're4', 'hot', { pos: 'adjective' }),
  xin: w('新', 'xin1', 'new', { pos: 'adjective' }),
  kuai: w('快', 'kuai4', 'fast', { pos: 'adjective' }),
  man: w('慢', 'man4', 'slow', { pos: 'adjective' }),
  gaoxing: w('高兴', 'gao1 xing4', 'happy; glad', { pos: 'adjective' }),
  piaoliang: w('漂亮', 'piao4 liang5', 'pretty; beautiful', { pos: 'adjective' }),
  tai: w('太', 'tai4', 'too; excessively', { pos: 'adverb' }),
  youdianr: w('有点儿', 'you3 dian3r', 'a little; a bit', { pos: 'adverb', note: 'Usually introduces something unwelcome.' }),
  danshi: w('但是', 'dan4 shi4', 'but; however', { pos: 'conjunction' }),
  haokan: w('好看', 'hao3 kan4', 'good-looking; nice to read', { pos: 'adjective' }),
  le: w('了', 'le5', '(change-of-state particle)', { pos: 'particle', note: 'Signals a new situation: 太热了 = it has become too hot.' }),

  // ── Unit 8: Connect & Chat ───────────────────────────────────────────
  de: w('的', 'de5', "(possessive particle); of", { pos: 'particle', note: '我的书 = my book.' }),
  he_and: w('和', 'he2', 'and; with', { pos: 'conjunction', note: 'Joins nouns, not sentences.' }),
  ye: w('也', 'ye3', 'also; too', { pos: 'adverb' }),
  dou: w('都', 'dou1', 'all; both', { pos: 'adverb' }),
  zhege: w('这个', 'zhe4 ge5', 'this; this one', { pos: 'pronoun' }),
  nage: w('那个', 'na4 ge5', 'that; that one', { pos: 'pronoun' }),
  women: w('我们', 'wo3 men5', 'we; us', { pos: 'pronoun' }),
  gei: w('给', 'gei3', 'to give; for', { pos: 'verb' }),
  duibuqi: w('对不起', 'dui4 bu5 qi3', 'sorry; excuse me', { pos: 'phrase' }),
  zhidao: w('知道', 'zhi1 dao5', 'to know', { pos: 'verb' }),
  zhao: w('找', 'zhao3', 'to look for', { pos: 'verb' }),
  wen: w('问', 'wen4', 'to ask', { pos: 'verb' }),
  dianhua: w('电话', 'dian4 hua4', 'telephone; phone call', { emoji: '📱', pos: 'noun' }),
  yinwei: w('因为', 'yin1 wei4', 'because', { pos: 'conjunction' }),
  suoyi: w('所以', 'suo3 yi3', 'so; therefore', { pos: 'conjunction' }),
  xiayu: w('下雨', 'xia4 yu3', 'to rain', { emoji: '🌧️', pos: 'verb' }),
  yu: w('雨', 'yu3', 'rain', { emoji: '🌧️', pos: 'noun' }),
  tianqi: w('天气', 'tian1 qi4', 'weather', { emoji: '🌤️', pos: 'noun' }),
};

const s = (tokens, en) => ({ tokens, en });

const lesson = (id, title, kicker, words, sentences, grammar) => ({
  id,
  title,
  kicker,
  words,
  sentences,
  grammar,
});

const unit = (id, number, title, subtitle, color, emoji, lessons) => ({
  id,
  number,
  title,
  subtitle,
  color,
  emoji,
  lessons,
});

export const UNITS = [
  unit('u1', 1, 'First Hellos', 'Greet someone and say who you are', 'coral', '👋', [
    lesson(
      'u1l1',
      'Hello!',
      'Say hello and introduce yourself',
      ['nihao', 'wo', 'ni', 'shi', 'ma', 'bu', 'xuesheng'],
      [
        s(['你好', '！'], 'Hello!'),
        s(['我', '是', '学生', '。'], 'I am a student.'),
        s(['你', '好', '吗', '？'], 'How are you?'),
        s(['你', '是', '学生', '吗', '？'], 'Are you a student?'),
        s(['我', '不', '是', '学生', '。'], 'I am not a student.'),
      ],
      {
        title: '是, 吗, and 不',
        pattern: 'Subject + 是 + Noun',
        body: '是 links two nouns. Add 吗 to the end to make a yes/no question. Put 不 before 是 to negate it.',
      }
    ),
    lesson(
      'u1l2',
      "What's your name?",
      'Ask and answer names',
      ['mingzi', 'jiao', 'shenme', 'ta', 'ta_f', 'shei'],
      [
        s(['你', '叫', '什么', '名字', '？'], 'What is your name?'),
        s(['我', '叫', '小明', '。'], 'My name is Xiaoming.'),
        s(['他', '叫', '什么', '名字', '？'], 'What is his name?'),
        s(['她', '是', '谁', '？'], 'Who is she?'),
        s(['他', '是', '学生', '。'], 'He is a student.'),
      ],
      {
        title: '叫 and question words',
        pattern: '你 + 叫 + 什么 + 名字？',
        body: '叫 means “to be called”. Question words like 什么 and 谁 take the place of the answer. 他 and 她 sound identical.',
      }
    ),
    lesson(
      'u1l3',
      'Nice to meet you',
      'Be polite and say goodbye',
      ['renshi', 'hengaoxing', 'xiexie', 'zaijian', 'bukeqi', 'qing', 'qingwen'],
      [
        s(['很高兴', '认识', '你', '。'], 'Nice to meet you.'),
        s(['谢谢', '你', '！'], 'Thank you!'),
        s(['不客气', '。'], "You're welcome."),
        s(['请问', '，', '你', '叫', '什么', '名字', '？'], 'Excuse me, what is your name?'),
        s(['再见', '！'], 'Goodbye!'),
      ],
      {
        title: 'Polite phrases',
        pattern: '很高兴认识你',
        body: '很高兴认识你 literally means “very happy to know you”. 请 makes a request polite, and 不客气 is the standard reply to 谢谢.',
      }
    ),
  ]),

  unit('u2', 2, 'People & Family', 'Talk about the people in your life', 'jade', '👨‍👩‍👧', [
    lesson(
      'u2l1',
      'My family',
      'Introduce your family',
      ['jia', 'baba', 'mama', 'gege', 'jiejie', 'didi', 'zhe'],
      [
        s(['这', '是', '我', '爸爸', '。'], 'This is my dad.'),
        s(['这', '是', '我', '妈妈', '。'], 'This is my mom.'),
        s(['我', '有', '一', '个', '哥哥', '。'], 'I have an older brother.'),
        s(['我', '没有', '弟弟', '。'], 'I do not have a younger brother.'),
        s(['我', '家', '有', '四', '个', '人', '。'], 'There are four people in my family.'),
        s(['这', '是', '我', '姐姐', '。'], 'This is my older sister.'),
      ],
      {
        title: 'Possession without 的',
        pattern: '我 + 爸爸',
        body: 'With close family you usually drop 的: 我爸爸, not 我的爸爸. 这 points to “this”: 这是我爸爸.',
      }
    ),
    lesson(
      'u2l2',
      'Friends & teachers',
      'Talk about people you know',
      ['pengyou', 'laoshi', 'ren', 'you', 'meiyou', 'hen'],
      [
        s(['他', '是', '我', '朋友', '。'], 'He is my friend.'),
        s(['她', '是', '老师', '。'], 'She is a teacher.'),
        s(['你', '有', '朋友', '吗', '？'], 'Do you have friends?'),
        s(['我', '没有', '朋友', '。'], 'I do not have friends.'),
        s(['我', '很', '好', '。'], 'I am very well.'),
        s(['人', '很', '多', '。'], 'There are many people.'),
      ],
      {
        title: '有 and 没有',
        pattern: 'Subject + 有 / 没有 + Noun',
        body: '有 means “to have”. Its negative is 没有 — never 不有. 很 often links a subject to an adjective: 我很好.',
      }
    ),
    lesson(
      'u2l3',
      'Where are you from?',
      'Nationality and languages',
      ['zhongguo', 'zhongguoren', 'hanyu', 'shuo', 'hui', 'yidianr'],
      [
        s(['我', '是', '中国人', '。'], 'I am Chinese.'),
        s(['我', '会', '说', '汉语', '。'], 'I can speak Chinese.'),
        s(['你', '会', '说', '汉语', '吗', '？'], 'Can you speak Chinese?'),
        s(['我', '会', '说', '一点儿', '汉语', '。'], 'I can speak a little Chinese.'),
        s(['我', '说', '汉语', '。'], 'I speak Chinese.'),
      ],
      {
        title: '会 and 说',
        pattern: '会 + 说 + Language',
        body: '会 means “can” for a learned skill. 说 takes a language as its object. 一点儿 means “a little”.',
      }
    ),
  ]),

  unit('u3', 3, 'Numbers & Time', 'Count, say your age, and tell the time', 'gold', '🔢', [
    lesson(
      'u3l1',
      'One to ten',
      'Count from 1 to 10',
      ['yi', 'er', 'san', 'si', 'wu', 'liu', 'ling'],
      [
        s(['一', '，', '二', '，', '三', '，', '四', '，', '五', '，', '六', '。'], 'One, two, three, four, five, six.'),
        s(['我', '有', '三', '个', '朋友', '。'], 'I have three friends.'),
        s(['我', '家', '有', '六', '个', '人', '。'], 'There are six people in my family.'),
        s(['零', '。'], 'Zero.'),
      ],
      {
        title: 'Numbers 1–10',
        pattern: '一 二 三 四 五 六 七 八 九 十',
        body: 'Chinese numbers are beautifully regular. Learn 1–10 and you can build almost any number.',
      }
    ),
    lesson(
      'u3l2',
      'How old are you?',
      'Numbers, age, and measure words',
      ['qi', 'ba', 'jiu', 'shi10', 'ge', 'sui', 'ji'],
      [
        s(['我', '十', '岁', '。'], 'I am ten years old.'),
        s(['你', '几', '岁', '？'], 'How old are you?'),
        s(['我', '有', '八', '个', '朋友', '。'], 'I have eight friends.'),
        s(['七', '，', '八', '，', '九', '，', '十', '。'], 'Seven, eight, nine, ten.'),
      ],
      {
        title: 'Age and measure words',
        pattern: 'Number + 个 + Noun · Number + 岁',
        body: '个 is the general measure word. Use 岁 for age and 几 to ask “how many”. 11–99 is built with 十: 二十 = twenty.',
      }
    ),
    lesson(
      'u3l3',
      'Today & tomorrow',
      'Days and clock time',
      ['jintian', 'mingtian', 'xianzai', 'xingqi', 'dian', 'fen', 'shihou'],
      [
        s(['今天', '星期', '几', '？'], 'What day of the week is it today?'),
        s(['现在', '几', '点', '？'], 'What time is it now?'),
        s(['现在', '三', '点', '十', '分', '。'], 'It is 3:10 now.'),
        s(['你', '什么', '时候', '来', '？'], 'When are you coming?'),
        s(['明天', '我', '在', '家', '。'], 'Tomorrow I will be at home.'),
      ],
      {
        title: 'Days and clock time',
        pattern: '星期 + Number · Number + 点 + Number + 分',
        body: '星期 + a number gives the day of the week. 点 is “o’clock” and 分 is “minute”. 现在 means “now”.',
      }
    ),
  ]),

  unit('u4', 4, 'Food & Drink', 'Order, eat, and talk about food', 'sky', '🍜', [
    lesson(
      'u4l1',
      'Tea, please',
      'Drinks and cups',
      ['shui', 'cha', 'kafei', 'he_drink', 'beizi', 'niunai', 'bei'],
      [
        s(['我', '喝', '茶', '。'], 'I drink tea.'),
        s(['你', '喝', '水', '吗', '？'], 'Do you drink water?'),
        s(['我', '不', '喝', '咖啡', '。'], 'I do not drink coffee.'),
        s(['我', '喝', '牛奶', '。'], 'I drink milk.'),
        s(['我', '喝', '一', '杯', '茶', '。'], 'I drink a cup of tea.'),
        s(['杯子', '在', '哪儿', '？'], 'Where is the cup?'),
      ],
      {
        title: 'Drinks and 杯',
        pattern: '喝 + Drink · 一 + 杯 + Drink',
        body: '喝 means “to drink”. 杯 is the measure word for cups: 一杯茶. 杯子 is the physical cup.',
      }
    ),
    lesson(
      'u4l2',
      'Rice & noodles',
      'Everyday foods',
      ['mifan', 'miantiao', 'pingguo', 'jidan', 'chi', 'shuiguo'],
      [
        s(['我', '吃', '米饭', '。'], 'I eat rice.'),
        s(['你', '吃', '苹果', '吗', '？'], 'Do you eat apples?'),
        s(['我', '吃', '鸡蛋', '。'], 'I eat eggs.'),
        s(['我', '喜欢', '吃', '水果', '。'], 'I like eating fruit.'),
        s(['我', '不', '吃', '面条', '。'], 'I do not eat noodles.'),
      ],
      {
        title: 'Eating',
        pattern: '吃 + Food',
        body: '吃 means “to eat”. To say you like doing something, use 喜欢 + verb: 我喜欢吃水果.',
      }
    ),
    lesson(
      'u4l3',
      'At the restaurant',
      'Food, money, and buying',
      ['fan', 'cai', 'haochi', 'fanguan', 'mai', 'qian'],
      [
        s(['菜', '很', '好吃', '。'], 'The food is delicious.'),
        s(['我们', '去', '饭馆', '吃', '饭', '。'], 'We go to a restaurant to eat.'),
        s(['你', '买', '什么', '？'], 'What are you buying?'),
        s(['我', '没有', '钱', '。'], 'I do not have money.'),
        s(['我', '买', '水果', '。'], 'I am buying fruit.'),
      ],
      {
        title: 'Adjective sentences',
        pattern: 'Subject + 很 + Adjective',
        body: 'Adjectives can be predicates without 是: 菜很好吃. 钱 is money, 买 is to buy, and 饭馆 is a restaurant.',
      }
    ),
  ]),

  unit('u5', 5, 'Getting Around', 'Places, transport, and where things are', 'plum', '🚕', [
    lesson(
      'u5l1',
      'Places',
      'School, shops, and the hospital',
      ['xuexiao', 'shangdian', 'yiyuan', 'qu', 'zai', 'chaoshi'],
      [
        s(['我', '去', '学校', '。'], 'I go to school.'),
        s(['他', '在', '医院', '。'], 'He is at the hospital.'),
        s(['我', '去', '超市', '买', '水果', '。'], 'I go to the supermarket to buy fruit.'),
        s(['你', '在', '家', '吗', '？'], 'Are you at home?'),
        s(['学校', '在', '哪儿', '？'], 'Where is the school?'),
        s(['商店', '在', '哪儿', '？'], 'Where is the shop?'),
      ],
      {
        title: '在 and 去',
        pattern: 'Subject + 在/去 + Place',
        body: '在 means “to be at/in”; 去 means “to go to”. The place comes after the verb: 我去学校.',
      }
    ),
    lesson(
      'u5l2',
      'By train or plane',
      'Transport and travel',
      ['zuo_sit', 'che', 'huoche', 'feiji', 'beijing', 'chuzuche'],
      [
        s(['我', '坐', '火车', '去', '北京', '。'], 'I take a train to Beijing.'),
        s(['你', '坐', '飞机', '吗', '？'], 'Are you taking a plane?'),
        s(['我', '坐', '出租车', '去', '学校', '。'], 'I take a taxi to school.'),
        s(['我', '坐', '车', '去', '商店', '。'], 'I take a car to the store.'),
      ],
      {
        title: '坐 + transport',
        pattern: '坐 + Transport + 去 + Place',
        body: '坐 literally means “sit”, but with transport it means “take”: 坐火车 = take the train.',
      }
    ),
    lesson(
      'u5l3',
      'Where is it?',
      'Here, there, and everywhere',
      ['zher', 'nar_far', 'nar_q', 'lai', 'zhu', 'na'],
      [
        s(['你', '在', '这儿', '吗', '？'], 'Are you here?'),
        s(['我', '在', '这儿', '。'], 'I am here.'),
        s(['学校', '在', '哪儿', '？'], 'Where is the school?'),
        s(['他', '来', '我', '家', '。'], 'He comes to my home.'),
        s(['我', '住', '这儿', '。'], 'I live here.'),
        s(['那', '是', '学校', '。'], 'That is a school.'),
        s(['那儿', '是', '学校', '。'], 'The school is over there.'),
      ],
      {
        title: 'Here and there',
        pattern: '这儿 / 那儿 / 哪儿',
        body: '这儿 = here, 那儿 = there, 哪儿 = where. 来 means “come” and 住 means “live”.',
      }
    ),
  ]),

  unit('u6', 6, 'Daily Life', 'Study, work, and say what you like', 'teal', '📚', [
    lesson(
      'u6l1',
      'Read & write',
      'Books, characters, and media',
      ['kan', 'ting', 'du', 'xie', 'shu', 'hanzi'],
      [
        s(['我', '看', '书', '。'], 'I read books.'),
        s(['你', '听', '什么', '？'], 'What are you listening to?'),
        s(['我', '读', '汉语', '。'], 'I read Chinese.'),
        s(['我', '写', '汉字', '。'], 'I write Chinese characters.'),
        s(['我', '听', '汉语', '。'], 'I listen to Chinese.'),
      ],
      {
        title: 'Verb + object',
        pattern: 'Subject + Verb + Object',
        body: 'Chinese verbs do not change form. 看书, 写汉字, 听汉语 — just put the verb before its object.',
      }
    ),
    lesson(
      'u6l2',
      'Work & rest',
      'Daily routines',
      ['xue', 'xuexi', 'gongzuo', 'zuo_do', 'shuijiao', 'qichuang'],
      [
        s(['我', '学习', '汉语', '。'], 'I study Chinese.'),
        s(['你', '做', '什么', '工作', '？'], 'What work do you do?'),
        s(['我', '工作', '。'], 'I work.'),
        s(['我', '睡觉', '。'], 'I sleep.'),
        s(['我', '起床', '。'], 'I get up.'),
        s(['我', '学', '汉语', '。'], 'I learn Chinese.'),
      ],
      {
        title: 'Routines',
        pattern: 'Subject + Verb (+ Object)',
        body: '学习 = study, 工作 = work, 睡觉 = sleep, 起床 = get up. No conjugation is needed.',
      }
    ),
    lesson(
      'u6l3',
      'I like, I want',
      'Preferences and permission',
      ['xihuan', 'xiang', 'yao', 'neng', 'keyi', 'ai'],
      [
        s(['我', '喜欢', '汉语', '。'], 'I like Chinese.'),
        s(['我', '想', '喝', '茶', '。'], 'I want to drink tea.'),
        s(['我', '要', '一', '个', '苹果', '。'], 'I want an apple.'),
        s(['你', '能', '来', '吗', '？'], 'Can you come?'),
        s(['我', '可以', '坐', '这儿', '吗', '？'], 'May I sit here?'),
        s(['我', '爱', '中国', '。'], 'I love China.'),
      ],
      {
        title: 'Modal verbs',
        pattern: '想 / 要 / 能 / 可以 + Verb',
        body: '想 = want to, 要 = want, 能/可以 = can or may. Put the modal verb before the main verb: 我想喝茶.',
      }
    ),
  ]),

  unit('u7', 7, 'Describe It', 'Size, weather, feelings, and opinions', 'orange', '🌤️', [
    lesson(
      'u7l1',
      'Big & small',
      'Size and quantity',
      ['da', 'xiao', 'duo', 'shao', 'zhen'],
      [
        s(['苹果', '很', '大', '。'], 'The apple is big.'),
        s(['我', '家', '很', '小', '。'], 'My home is small.'),
        s(['人', '很', '多', '。'], 'There are many people.'),
        s(['学生', '很', '少', '。'], 'There are few students.'),
        s(['真', '好吃', '！'], 'Really delicious!'),
      ],
      {
        title: 'Adjectives with 很',
        pattern: 'Subject + 很 + Adjective',
        body: '很 often links a subject to an adjective; it does not always mean “very”. 真 means “really”.',
      }
    ),
    lesson(
      'u7l2',
      'Hot & cold',
      'Weather and descriptions',
      ['hao', 'leng', 're', 'xin', 'kuai', 'man'],
      [
        s(['今天', '很', '冷', '。'], 'Today is cold.'),
        s(['茶', '很', '热', '。'], 'The tea is hot.'),
        s(['书', '很', '新', '。'], 'The book is new.'),
        s(['你', '很', '快', '。'], 'You are fast.'),
        s(['我', '很', '慢', '。'], 'I am slow.'),
        s(['你', '好', '！'], 'Hello!'),
      ],
      {
        title: 'Opposites',
        pattern: '冷 ↔ 热 · 新 ↔ 旧 · 快 ↔ 慢',
        body: 'Adjectives can be complete sentences with 很: 今天很冷. Learn words in pairs to remember them faster.',
      }
    ),
    lesson(
      'u7l3',
      'How do you feel?',
      'Feelings and opinions',
      ['gaoxing', 'piaoliang', 'tai', 'youdianr', 'danshi', 'haokan', 'le'],
      [
        s(['我', '很', '高兴', '。'], 'I am very happy.'),
        s(['她', '很', '漂亮', '。'], 'She is pretty.'),
        s(['今天', '有点儿', '冷', '。'], 'It is a little cold today.'),
        s(['今天', '太', '热', '了', '。'], 'It is too hot today.'),
        s(['书', '很', '好看', '。'], 'The book is very nice to read.'),
        s(['今天', '很', '冷', '，', '但是', '我', '不', '冷', '。'], 'It is cold today, but I am not cold.'),
      ],
      {
        title: '太…了 and 有点儿',
        pattern: '太 + Adj + 了 · 有点儿 + Adj',
        body: '太…了 = “too…”. 有点儿 + adjective = “a little” (usually about something unwelcome). 但是 = but.',
      }
    ),
  ]),

  unit('u8', 8, 'Connect & Chat', 'Possession, requests, and reasons', 'indigo', '🔗', [
    lesson(
      'u8l1',
      'This is mine',
      'Possession and joining ideas',
      ['de', 'he_and', 'ye', 'dou', 'zhege', 'nage', 'women'],
      [
        s(['这', '是', '我', '的', '书', '。'], 'This is my book.'),
        s(['我', '和', '朋友', '去', '学校', '。'], 'I go to school with a friend.'),
        s(['我', '也', '喜欢', '茶', '。'], 'I also like tea.'),
        s(['我们', '都', '是', '学生', '。'], 'We are all students.'),
        s(['这个', '苹果', '很', '好吃', '。'], 'This apple is delicious.'),
        s(['那个', '菜', '很', '好吃', '。'], 'That dish is delicious.'),
      ],
      {
        title: '的, 和, 也, 都',
        pattern: '我的 + Noun · A 和 B · 也 · 都',
        body: '的 marks possession (我的书). 和 joins nouns. 也 = also, 都 = all/both.',
      }
    ),
    lesson(
      'u8l2',
      'May I?',
      'Polite requests and questions',
      ['gei', 'duibuqi', 'zhidao', 'zhao', 'wen', 'dianhua'],
      [
        s(['请', '给', '我', '一', '杯', '茶', '。'], 'Please give me a cup of tea.'),
        s(['对不起', '，', '我', '不', '知道', '。'], 'Sorry, I do not know.'),
        s(['我', '找', '你', '。'], 'I am looking for you.'),
        s(['我', '问', '老师', '。'], 'I ask the teacher.'),
        s(['我', '没有', '电话', '。'], 'I do not have a phone.'),
      ],
      {
        title: 'Requests',
        pattern: '给 + Person + Thing',
        body: '给 means “to give”: 给我一杯茶. 请问 = excuse me, 对不起 = sorry, 知道 = to know.',
      }
    ),
    lesson(
      'u8l3',
      'Because...',
      'Reasons and weather',
      ['yinwei', 'suoyi', 'xiayu', 'yu', 'tianqi'],
      [
        s(['因为', '下雨', '，', '所以', '我', '不', '去', '。'], 'Because it is raining, I am not going.'),
        s(['今天', '天气', '很', '好', '。'], 'The weather is nice today.'),
        s(['我', '喜欢', '雨', '。'], 'I like rain.'),
        s(['下雨', '的', '时候', '，', '我', '在', '家', '。'], 'When it rains, I am at home.'),
        s(['因为', '今天', '很', '冷', '，', '所以', '我', '不', '去', '。'], 'Because it is cold today, I am not going.'),
      ],
      {
        title: 'Because... so...',
        pattern: '因为 + Reason，所以 + Result',
        body: 'Chinese often uses both halves of the pair: 因为…所以… . 下雨 = to rain; 天气 = weather.',
      }
    ),
  ]),
];

// Authored expansion units extend the original 8-unit starter course.
UNITS.push(...EXPANSION_UNITS);

/** Lookup helpers shared by the engine, UI, and tests. */
export const WORD_LIST = Object.entries(WORDS).map(([id, word]) => ({
  id,
  ...word,
  pinyin: toMarks(word.py),
  tones: tonesOf(word.py),
}));
export const DRILL_WORDS = WORD_LIST.filter((word) => !word.hidden);

/** All words that are introduced by a lesson (starter + authored expansions). */
export const COURSE_WORDS = [...DRILL_WORDS, ...EXPANSION_WORDS];
export const WORD_BY_ZH = new Map(
  [...WORD_LIST, ...EXPANSION_WORDS].map((word) => [word.zh, word])
);
export const WORD_BY_ID = new Map(
  [...WORD_LIST, ...EXPANSION_WORDS].map((word) => [word.id, word])
);

/** The HSK 1 deck minus words that now have dedicated lessons. */
export const BONUS_ONLY_WORDS = BONUS_WORDS.filter((word) => !EXPANSION_WORD_IDS.has(word.id));

/** Course words + the remaining HSK 1 vocabulary deck. */
export const ALL_WORDS = [...COURSE_WORDS, ...BONUS_ONLY_WORDS];
export const ALL_WORD_BY_ZH = new Map([
  ...WORD_BY_ZH,
  ...BONUS_ONLY_WORDS.map((word) => [word.zh, word]),
]);
export const ALL_WORD_BY_ID = new Map(ALL_WORDS.map((word) => [word.id, word]));

export const LESSONS = UNITS.flatMap((unit) =>
  unit.lessons.map((lesson) => ({
    ...lesson,
    unitId: unit.id,
    unitNumber: unit.number,
    unitTitle: unit.title,
    unitColor: unit.color,
    hsk: 'HSK 1',
  }))
);
export const LESSON_BY_ID = new Map(LESSONS.map((lesson) => [lesson.id, lesson]));

/** Enrich sentences with ids, hanzi, and readable pinyin. */
function enrichSentences(lesson) {
  return lesson.sentences.map((sentence, index) => {
    const zh = sentence.tokens.join('');
    const pinyin = sentence.tokens
      .map((token) => (WORD_BY_ZH.has(token) ? toMarks(WORD_BY_ZH.get(token).py) : token))
      .join(' ')
      .replace(/\s+([，。！？、])/g, '$1');
    return {
      ...sentence,
      id: `${lesson.id}s${index + 1}`,
      lessonId: lesson.id,
      zh,
      pinyin,
    };
  });
}

for (const lesson of LESSONS) {
  lesson.sentences = enrichSentences(lesson);
}

export const SENTENCES = LESSONS.flatMap((lesson) => lesson.sentences);
export const SENTENCE_BY_ID = new Map(SENTENCES.map((sentence) => [sentence.id, sentence]));
export const SENTENCE_BY_ZH = new Map(SENTENCES.map((sentence) => [sentence.zh, sentence]));

/** Which lesson introduces each word (used by the vocabulary screen). */
export const WORD_LESSON = new Map();
for (const lesson of LESSONS) {
  for (const wordId of lesson.words) {
    if (!WORD_LESSON.has(wordId)) WORD_LESSON.set(wordId, lesson);
  }
}

export const COURSE = {
  id: 'bao-hsk1',
  title: 'Chinese',
  level: 'HSK 1',
  units: UNITS,
  lessons: LESSONS,
  words: ALL_WORDS,
  courseWords: COURSE_WORDS,
  bonusWords: BONUS_ONLY_WORDS,
  sentences: SENTENCES,
};

export const TOTAL_WORDS = DRILL_WORDS.length;
export const TOTAL_COURSE_WORDS = COURSE_WORDS.length;
export const TOTAL_DICTIONARY_WORDS = ALL_WORDS.length;
export const TOTAL_BONUS_WORDS = BONUS_ONLY_WORDS.length;
export const TOTAL_LESSONS = LESSONS.length;
