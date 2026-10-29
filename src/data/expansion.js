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
  {
    id: 'u10',
    number: 10,
    title: 'School & Work',
    subtitle: 'Classrooms, jobs, and taking care of yourself',
    color: 'lime',
    emoji: '🎓',
    lessons: [
      {
        id: 'u10l1',
        title: 'School days',
        kicker: 'Talk about school levels and classmates',
        words: ['hsk_da_xue', 'hsk_da_xue_sheng', 'hsk_zhong_xue', 'hsk_zhong_xue_sheng', 'hsk_xiao_xue', 'hsk_xiao_xue_sheng', 'hsk_tong_xue'],
        sentences: [
          s(['我', '是', '大学生', '。'], 'I am a university student.'),
          s(['他', '是', '中学生', '。'], 'He is a middle school student.'),
          s(['我', '的', '同学', '在', '大学', '。'], 'My classmate is at university.'),
          s(['这', '是', '小学', '。'], 'This is a primary school.'),
          s(['小学生', '在', '小学', '上课', '。'], 'Primary school pupils have class at primary school.'),
          s(['中学', '在', '大学', '后', '边', '。'], 'The middle school is behind the university.'),
        ],
        grammar: {
          title: 'School levels and the people',
          pattern: '大学 / 中学 / 小学 + 生',
          body: '大学 = university, 中学 = middle school, 小学 = primary school. Add 生 for the person: 大学生, 中学生, 小学生. 同学 means classmate.',
        },
      },
      {
        id: 'u10l2',
        title: 'In class',
        kicker: 'Class starts, class ends, and polite titles',
        words: ['hsk_ke', 'hsk_shang_ke', 'hsk_xia_ke', 'hsk_xian_sheng', 'hsk_n_shi', 'hsk_da_jia', 'hsk_hai_zi'],
        sentences: [
          s(['我们', '上课', '。'], 'We are having class.'),
          s(['现在', '下课', '。'], 'Class ends now.'),
          s(['这', '是', '我', '的', '课', '。'], 'This is my class.'),
          s(['先生', '，', '你', '好', '！'], 'Hello, sir.'),
          s(['女士', '，', '你', '好', '！'], 'Hello, madam.'),
          s(['大家', '好', '！'], 'Hello everyone.'),
          s(['孩子', '在', '上课', '。'], 'The child is in class.'),
        ],
        grammar: {
          title: '上课, 下课, and polite address',
          pattern: '上课 / 下课 · 先生 / 女士',
          body: '上课 means class starts or “have class”; 下课 means class ends. 先生 and 女士 are polite titles. 大家 means everyone, and 孩子 is a child.',
        },
      },
      {
        id: 'u10l3',
        title: 'Work & health',
        kicker: 'Jobs, commutes, and seeing a doctor',
        words: ['hsk_gong_si', 'hsk_shang_ban', 'hsk_xia_ban', 'hsk_yi_sheng', 'hsk_bing', 'hsk_sheng_bing', 'hsk_kan_bing', 'hsk_xiu_xi'],
        sentences: [
          s(['我', '在', '公司', '上班', '。'], 'I work at a company.'),
          s(['爸爸', '在', '公司', '上班', '。'], 'Dad works at a company.'),
          s(['我', '五', '点', '下班', '。'], 'I get off work at five.'),
          s(['妈妈', '是', '医生', '。'], 'Mom is a doctor.'),
          s(['我', '病', '了', '。'], 'I am sick.'),
          s(['今天', '我', '生病', '了', '。'], 'I got sick today.'),
          s(['我', '去', '医院', '看病', '。'], 'I go to the hospital to see a doctor.'),
          s(['我', '在', '家', '休息', '。'], 'I rest at home.'),
        ],
        grammar: {
          title: 'Work and health',
          pattern: '上班 / 下班 · 生病 / 看病 / 休息',
          body: '上班 = go to work, 下班 = get off work. 生病 = get sick, 看病 = see a doctor, 休息 = rest. 医生 is a doctor; 公司 is a company.',
        },
      },
    ],
  },
  {
    id: 'u11',
    number: 11,
    title: 'Time & Dates',
    subtitle: 'Days, meals, durations, and the calendar',
    color: 'ocean',
    emoji: '⏰',
    lessons: [
      {
        id: 'u11l1',
        title: 'Times of day',
        kicker: 'Morning, noon, afternoon, and night',
        words: ['hsk_zao', 'hsk_wan_2', 'hsk_zao_shang', 'hsk_shang_wu', 'hsk_zhong_wu', 'hsk_xia_wu', 'hsk_wan_shang', 'hsk_bai_tian'],
        sentences: [
          s(['你', '早', '！'], 'Good morning!'),
          s(['现在', '很', '晚', '。'], 'It is very late now.'),
          s(['早上', '我', '喝', '茶', '。'], 'I drink tea in the morning.'),
          s(['上午', '我', '上课', '。'], 'I have class in the morning.'),
          s(['中午', '我', '吃', '午饭', '。'], 'At noon I eat lunch.'),
          s(['下午', '我', '在', '家', '。'], 'I am at home in the afternoon.'),
          s(['晚上', '我', '看', '书', '。'], 'I read in the evening.'),
          s(['白天', '我', '工作', '。'], 'I work during the day.'),
        ],
        grammar: {
          title: 'Times of day',
          pattern: '早上 / 上午 / 中午 / 下午 / 晚上',
          body: '早上 = early morning, 上午 = morning before noon, 中午 = noon, 下午 = afternoon, 晚上 = evening/night. 白天 = daytime. 早 and 晚 can also mean “early” and “late”.',
        },
      },
      {
        id: 'u11l2',
        title: 'Meals & minutes',
        kicker: 'Breakfast, lunch, dinner, and duration',
        words: ['hsk_zao_fan', 'hsk_wu_fan', 'hsk_wan_fan', 'hsk_fen_zhong', 'hsk_xiao_shi', 'hsk_ban', 'hsk_shi_jian'],
        sentences: [
          s(['我', '吃', '早饭', '。'], 'I eat breakfast.'),
          s(['午饭', '很', '好', '吃', '。'], 'Lunch is delicious.'),
          s(['晚上', '我', '吃', '晚饭', '。'], 'I eat dinner in the evening.'),
          s(['我', '学习', '了', '三', '十', '分钟', '。'], 'I studied for thirty minutes.'),
          s(['我', '工作', '八', '小时', '。'], 'I work eight hours.'),
          s(['我', '学习', '了', '半', '小时', '。'], 'I studied for half an hour.'),
          s(['我', '没有', '时间', '。'], 'I have no time.'),
        ],
        grammar: {
          title: 'Meals and duration',
          pattern: 'Number + 分钟/小时 · 半 + 小时',
          body: '早饭 = breakfast, 午饭 = lunch, 晚饭 = dinner. 分钟 means minute and 小时 means hour. 半 means half: 半小时 = half an hour. 时间 means time.',
        },
      },
      {
        id: 'u11l3',
        title: 'Years & dates',
        kicker: 'This year, next year, and calendar dates',
        words: ['hsk_jin_nian', 'hsk_ming_nian', 'hsk_qu_nian', 'hsk_nian', 'hsk_yue', 'hsk_ri', 'hsk_hao', 'hsk_zuo_tian', 'hsk_xing_qi_tian'],
        sentences: [
          s(['今年', '我', '学习', '汉语', '。'], 'This year I study Chinese.'),
          s(['明年', '我', '去', '中国', '。'], 'Next year I am going to China.'),
          s(['去年', '我', '在', '北京', '。'], 'Last year I was in Beijing.'),
          s(['今年', '是', '二', '零', '二', '六', '年', '。'], 'This year is 2026.'),
          s(['这个', '月', '我', '在', '家', '。'], 'This month I am at home.'),
          s(['今天', '是', '几', '号', '？'], 'What is the date today?'),
          s(['今天', '是', '十', '月', '三', '日', '。'], 'Today is October 3rd.'),
          s(['昨天', '是', '星期天', '。'], 'Yesterday was Sunday.'),
        ],
        grammar: {
          title: 'Years, months, and dates',
          pattern: '年 / 月 / 日 / 号',
          body: '今年 = this year, 明年 = next year, 去年 = last year. Dates run biggest to smallest: 2026 年 10 月 3 日. 号 is the spoken date number; 日 is the written form.',
        },
      },
    ],
  },
  {
    id: 'u12',
    number: 12,
    title: 'Shopping & Food',
    subtitle: 'Clothes, prices, money, and buying a meal',
    color: 'clay',
    emoji: '🛍️',
    lessons: [
      {
        id: 'u12l1',
        title: 'Clothes & shops',
        kicker: 'What you wear and where you buy it',
        words: ['hsk_yi_fu', 'hsk_chuan', 'hsk_gui', 'hsk_pian_yi', 'hsk_mai', 'hsk_dian', 'hsk_shu_dian', 'hsk_fan_dian'],
        sentences: [
          s(['这', '是', '我', '的', '衣服', '。'], 'This is my clothing.'),
          s(['今天', '我', '穿', '衣服', '。'], 'Today I wear clothes.'),
          s(['这个', '很', '贵', '。'], 'This one is expensive.'),
          s(['那个', '很', '便宜', '。'], 'That one is cheap.'),
          s(['我', '卖', '衣服', '。'], 'I sell clothes.'),
          s(['店', '在', '哪儿', '？'], 'Where is the shop?'),
          s(['书店', '在', '这儿', '。'], 'The bookshop is here.'),
          s(['饭店', '在', '那儿', '。'], 'The restaurant is over there.'),
        ],
        grammar: {
          title: 'Clothes and shops',
          pattern: '穿 + 衣服 · 贵 / 便宜',
          body: '衣服 means clothing, and 穿 means “to wear”. 贵 is expensive; 便宜 is cheap. 店 is a shop: 书店 = bookshop, 饭店 = restaurant/hotel.',
        },
      },
      {
        id: 'u12l2',
        title: 'Money & prices',
        kicker: 'Ask how much and talk about yuan',
        words: ['hsk_kuai', 'hsk_yuan', 'hsk_bai', 'hsk_qian', 'hsk_liang', 'hsk_duo_shao'],
        sentences: [
          s(['苹果', '三', '块', '。'], 'The apples are three yuan.'),
          s(['这个', '多少', '钱', '？'], 'How much is this?'),
          s(['这个', '五', '元', '。'], 'This one is five yuan.'),
          s(['一', '百', '块', '。'], 'One hundred yuan.'),
          s(['一', '千', '块', '。'], 'One thousand yuan.'),
          s(['我', '有', '两', '个', '苹果', '。'], 'I have two apples.'),
        ],
        grammar: {
          title: 'Yuan, hundred, thousand',
          pattern: 'Number + 块/元 · 两 + Measure word',
          body: '块 is the colloquial word for yuan; 元 is the formal one. 百 = hundred, 千 = thousand. Use 两 instead of 二 before a measure word: 两个苹果.',
        },
      },
      {
        id: 'u12l3',
        title: 'Buying food',
        kicker: 'Bread, baozi, dumplings, and noodles',
        words: ['hsk_mian_bao', 'hsk_bao_zi', 'hsk_jiao_zi', 'hsk_mian_tiaor'],
        sentences: [
          s(['我', '吃', '面包', '。'], 'I eat bread.'),
          s(['我', '吃', '包子', '。'], 'I eat baozi.'),
          s(['我', '吃', '饺子', '。'], 'I eat dumplings.'),
          s(['我', '吃', '面条儿', '。'], 'I eat noodles.'),
          s(['饭店', '的', '饺子', '很', '好吃', '。'], 'The restaurant’s dumplings are delicious.'),
        ],
        grammar: {
          title: 'Everyday foods',
          pattern: '饭店 + 的 + Food',
          body: '面包 = bread, 包子 = steamed buns, 饺子 = dumplings, 面条儿 = noodles. 饭店的饺子 means “the restaurant’s dumplings”.',
        },
      },
    ],
  },
];

export const EXPANSION_WORDS = [...new Set(EXPANSION_UNITS.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.words)))]
  .map((id) => BONUS_BY_ID.get(id))
  .filter(Boolean);

export const EXPANSION_WORD_IDS = new Set(EXPANSION_WORDS.map((word) => word.id));
