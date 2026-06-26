/* ====================================================================
   《审讯室》案件数据 — Cases Data
   3 个犯人 × 3 阶段（每阶段独立目标）
   tone: intimidate | friendly | deceive | logical
   ==================================================================== */
window.CASES_DATA = [
  /* =====================================================
     案件 1 — 沈墨 / 银行运钞车抢劫案
     类型：暴力犯罪（抢劫）    性格：傲慢
     ===================================================== */
  {
    id: 'case-001',
    number: 'CASE #2026-001',
    title: '运钞车大劫案',
    subtitle: 'EAST CITY BANK HEIST',
    crime: '持枪抢劫运钞车',
    briefing: '三个月前，城东发生一起持枪抢劫运钞车案。两名押运员重伤，1300 万现金被劫。监控显示共有三人参与，沈墨被列为头号嫌疑人，但拒绝开口。',
    prisoner: {
      name: '沈墨',
      alias: '沈老板',
      age: 38,
      crime: '持枪抢劫运钞车',
      personality: 'arrogant',
      personalityLabel: '傲慢型',
      type: '暴力犯罪',
      bio: '前拳击手，现经营一家拳馆。三年前因故意伤害入狱，去年刚出狱。行事狠辣，但讲"江湖规矩"。',
      avatarSeed: 'shenmo',
      initials: '沈'
    },
    stages: [
      /* ---------- 阶段 1：承认主谋身份 ---------- */
      {
        index: 1,
        title: '谁是主谋',
        goal: '让沈墨承认自己就是这起抢劫案的主谋 / 策划者',
        goalKeywords: ['主谋', '策划', '组织者', '指使', '我策划', '是我策划', '我组织的', '我指挥', '我是主谋'],
        trapKeywords: ['老大', '老大是', '他策划'],
        maxRounds: 8,
        initialMood: 75,
        sceneIntro: '【审讯室 · 22:14】沈墨被押入铁椅，双手交叠。他抬头扫了你一眼，嘴角一撇。',
        hint: '威压可能让他更抗拒；温和或欺骗或许能撬开他的江湖话术。',
        openingLines: [
          '警官，该说的我都说了。我就是个开拳馆的，那天在馆里教学生。',
          '你们抓错人了。',
          '我拒绝回答任何问题，我等我的律师。'
        ],
        responseRules: [
          /* === 威压 === */
          { tone: 'intimidate', matchKeywords: ['指使', '主谋', '策划', '带头', '幕后'], moodDelta: 5, reply: '哈，指使？老子是那种被人指使的人吗？我看你是没挨过揍。' },
          { tone: 'intimidate', matchKeywords: ['同伙', '一起', '参与'], moodDelta: 3, reply: '同伙？我沈墨做事，向来一个人。你们查清楚再来跟我说话。' },
          { tone: 'intimidate', matchKeywords: ['运钞车', '抢劫', '1300', '1300万'], moodDelta: 8, reply: '1300 万？哼，那又怎样？就算天上掉钱，也不是我捡的。' },
          { tone: 'intimidate', matchKeywords: ['证据', '指纹', 'DNA', '监控'], moodDelta: -5, reply: '（眯起眼）你们有什么证据？没有证据就别跟我来这套。' },
          { tone: 'intimidate', matchKeywords: ['刑期', '坐牢', '无期', '死刑'], moodDelta: 12, reply: '死刑？吓我？老子在号子里待过，比你狠的人我见多了。' },
          /* === 温和 === */
          { tone: 'friendly', matchKeywords: ['拳馆', '拳击', '学员', '馆长'], moodDelta: -15, reply: '……拳馆是我这辈子最骄傲的事。那里面的孩子，都是我手把手教出来的。' },
          { tone: 'friendly', matchKeywords: ['老婆', '孩子', '家人', '母亲', '女儿'], moodDelta: -12, reply: '（沉默片刻）……我女儿今年要高考了。她不知道她爸是干什么的。' },
          { tone: 'friendly', matchKeywords: ['出狱', '改过', '重新', '过去'], moodDelta: -10, reply: '我知道你们想听什么"改过自新"的故事。但我沈墨出来，就是想站着把钱挣了。' },
          { tone: 'friendly', matchKeywords: ['理解', '知道', '明白', '懂你'], moodDelta: -8, reply: '……你懂？没人懂。这世道，不狠就被人吃。' },
          /* === 欺骗 === */
          { tone: 'deceive', matchKeywords: ['同伙', '已经', '招了', '交代', '供出', '抓了'], moodDelta: -18, reply: '（猛地抬头）谁招了？那个姓赵的还是姓孙的？他们凭什么咬我？！' },
          { tone: 'deceive', matchKeywords: ['减刑', '立功', '宽大', '从轻'], moodDelta: -8, reply: '减刑？我沈墨从不为这种事低头。' },
          { tone: 'deceive', matchKeywords: ['同案', '另一案', '别的案子'], moodDelta: -6, reply: '别的案子？跟这案子有什么关系？' },
          { tone: 'deceive', matchKeywords: ['举报', '匿名', '线人', '情报'], moodDelta: -10, reply: '线人？江湖上谁敢点我沈墨的名？' },
          /* === 逻辑 === */
          { tone: 'logical', matchKeywords: ['运钞车路线', '时间', '几点', '路线'], moodDelta: -3, reply: '路线是公开的。知道的人多了去了。' },
          { tone: 'logical', matchKeywords: ['资金', '转账', '存款', '洗钱', '花钱'], moodDelta: -5, reply: '我银行账户里有多少钱，你们去查。干净得很。' },
          { tone: 'logical', matchKeywords: ['枪', '枪支', '武器', '弹药'], moodDelta: 4, reply: '枪？我一个开拳馆的，拳头就是枪。' },
          { tone: 'logical', matchKeywords: ['动机', '为什么', '理由'], moodDelta: -4, reply: '我有什么动机？我那拳馆一年流水几百万，我图什么？' },
          /* === 低情绪下的认罪规则 === */
          { tone: 'friendly', matchKeywords: ['给个机会', '求你', '讲义气', '认了'], moodDelta: -30, reply: '……（沉默良久）好吧。我是主谋。这事是我策划的。从踩点到分赃，全是我。' },
          { tone: 'logical', matchKeywords: ['分工', '谁负责', '安排', '指挥'], moodDelta: -25, reply: '……（捂脸）是我组织的。我指挥他们两个。我沈墨做事，向来自己扛。' },
          { tone: 'deceive', matchKeywords: ['全部', '都招', '铁证', '人证物证'], moodDelta: -28, reply: '（低头）行……我认。这事是我策划的，我主谋。他们只是按我说的做。' }
        ],
        fallback: {
          high:   ['你问的这些问题很无聊。', '我不回答假设性问题。', '换个话题。'],
          mid:    ['我已经说了，我那天在拳馆。', '你查不到任何东西。', '我要见我的律师。'],
          low:    ['……（低头沉默）', '你……你是认真的？', '（眼睛看向别处）']
        }
      },
      /* ---------- 阶段 2：套出同伙人数 ---------- */
      {
        index: 2,
        title: '同伙人数',
        goal: '确认这起抢劫案有 3 名同伙（沈墨 + 2 人）',
        goalKeywords: ['三个', '三个人', '3个人', '三人', '两个人', '两个同伙', '还有两个', '总共三个', '共三人', '加我三个', '我们三个', '就我们三个'],
        trapKeywords: ['一群人', '很多人', '团伙'],
        maxRounds: 8,
        initialMood: 60,
        sceneIntro: '【审讯室 · 第二天 10:02】你把一份"同伙已落网"的伪造报告放在沈墨面前。他眼皮微抬。',
        hint: '沈墨讲义气——若让他觉得"兄弟已经扛不住"，可能松口。',
        openingLines: [
          '（瞥了一眼报告）警官，你这些小把戏，我见得多了。',
          '想诈我？省省吧。',
          '我一个人干的事，凭什么扯别人？'
        ],
        responseRules: [
          { tone: 'deceive', matchKeywords: ['已经', '招了', '交代', '供出', '咬你', '供述'], moodDelta: -22, reply: '（握拳）谁？！他们凭什么招？！说好的兄弟呢？' },
          { tone: 'deceive', matchKeywords: ['视频', '监控', '录像', '拍到', '看见'], moodDelta: -15, reply: '拍到又怎样？监控里又看不清脸。' },
          { tone: 'deceive', matchKeywords: ['指认', '认出', '辨认', '见过'], moodDelta: -18, reply: '指认？他们连我长什么样都说不清楚。' },
          { tone: 'intimidate', matchKeywords: ['罪名', '主犯', '从犯', '责任', '扛'], moodDelta: 10, reply: '主犯从犯？我沈墨做事，自己扛！但——我扛什么？根本没我！' },
          { tone: 'intimidate', matchKeywords: ['家属', '老婆', '孩子', '女儿', '家人'], moodDelta: 8, reply: '别拿我家人的事威胁我。' },
          { tone: 'friendly', matchKeywords: ['兄弟', '朋友', '哥们', '道上'], moodDelta: -15, reply: '（沉默良久）……我跟你们讲个江湖规矩——出来混，可以死，不能出卖兄弟。' },
          { tone: 'friendly', matchKeywords: ['后悔', '当时', '现在想想'], moodDelta: -10, reply: '（叹气）后悔？我后悔没把事情做干净。' },
          { tone: 'logical', matchKeywords: ['运钞车', '一个人', '押运', '两个人'], moodDelta: -12, reply: '……一个人？运钞车两个押运员，还有铁箱、铁锁。一个人能搞定？' },
          { tone: 'logical', matchKeywords: ['分赃', '分钱', '分账', '分到', '分了多少'], moodDelta: -8, reply: '……我要是参与，我能分多少？这个数没个百十来万，谁干？' },
          { tone: 'logical', matchKeywords: ['怎么分', '怎么拿', '分赃方式'], moodDelta: -10, reply: '怎么分？……哼，要是真有这事，肯定是我们三个——算了，我什么都没说。' },
          { tone: 'logical', matchKeywords: ['总共', '一共', '几个人', '多少人'], moodDelta: -8, reply: '（犹豫）……这种事，撑死就那么两三个核心的人。多了分不均，也容易出事。' },
          { tone: 'friendly', matchKeywords: ['责任', '扛下', '背'], moodDelta: -6, reply: '（摇头）我不是不想扛。是这事本来就不是我一个人能扛下来的。' }
        ],
        fallback: {
          high:   ['你别想套我的话。', '我不知道你在说什么。', '（双手抱胸）'],
          mid:    ['（沉默）……', '就算有，也不关你的事。', '（看向别处）'],
          low:    ['我……我真不该趟这浑水。', '（低声）事情已经发生了。', '（长叹）你说得对。']
        }
      },
      /* ---------- 阶段 3：找到赃款藏匿地 ---------- */
      {
        index: 3,
        title: '钱在哪',
        goal: '找到赃款藏匿地点：东港码头 7 号仓库的集装箱内',
        goalKeywords: ['东港', '码头', '7号仓库', '七号仓库', '七号', '7号', '集装箱', '港口', '港务局', '外滩码头', '东港码头'],
        trapKeywords: ['地下室', '老家', '老家地窖'],
        maxRounds: 8,
        initialMood: 45,
        sceneIntro: '【审讯室 · 第二天下午 16:30】你已经拿到银行账户冻结令。沈墨明显开始坐立不安。',
        hint: '赃款是他们最在乎的"命门"。抓住这点施压。',
        openingLines: [
          '（舔了舔嘴唇）……警官，钱我真没见着。',
          '你要是能找到钱，我跟你姓。',
          '就算天塌了，我也不会说出钱在哪。'
        ],
        responseRules: [
          { tone: 'logical', matchKeywords: ['账户', '冻结', '银行卡', '转账', '流水'], moodDelta: -15, reply: '……（冒冷汗）你们查我账户了？里面干净得很！' },
          { tone: 'logical', matchKeywords: ['现金', '现钞', '1300', '1300万'], moodDelta: -8, reply: '（咬牙）1300 万现钞？运钞车运的是这个数？……反正我没拿。' },
          { tone: 'intimidate', matchKeywords: ['藏匿', '窝藏', '藏起来', '转移'], moodDelta: 5, reply: '藏？笑话，我又没拿，藏什么藏？' },
          { tone: 'intimidate', matchKeywords: ['查封', '搜查', '抄家', '拳馆'], moodDelta: 10, reply: '（暴怒）你敢动我的拳馆？！那是我全部的心血！' },
          { tone: 'friendly', matchKeywords: ['退赃', '交出来', '还回去', '退赃款'], moodDelta: -10, reply: '退赃？我没赃可退。' },
          { tone: 'friendly', matchKeywords: ['自首', '立功', '戴罪'], moodDelta: -8, reply: '（犹豫）……就算我想立功，钱也不在我手上。' },
          { tone: 'deceive', matchKeywords: ['东港', '码头', '港口', '仓库', '集装箱'], moodDelta: -25, reply: '（猛地站起，被铁椅铐住）你们怎么知道东港？！——我没说！我什么都没说！' },
          { tone: 'deceive', matchKeywords: ['线人', '举报', '同伙供出', '他们说了'], moodDelta: -22, reply: '他们招了？……那帮孙子！说好不出卖彼此的！' },
          { tone: 'logical', matchKeywords: ['交通', '运钞车', '开车', '路线', '监控'], moodDelta: -6, reply: '（眼神闪躲）……路线的事，跟我无关。' },
          { tone: 'logical', matchKeywords: ['地点', '位置', '在哪', '藏哪里'], moodDelta: -12, reply: '（低声）……我只能说，那地方靠海。潮湿得很。' },
          { tone: 'friendly', matchKeywords: ['老婆', '孩子', '女儿', '高考', '未来'], moodDelta: -18, reply: '（终于崩溃，抹脸）我女儿……我闺女她什么都不知道。我只想让她好好考学，离开这个烂地方……' }
        ],
        fallback: {
          high:   ['钱不在我这。', '你别想套出位置。', '就算抓我回去也找不到。'],
          mid:    ['……这案子，我就是个局外人。', '（咽了咽口水）我不能说。', '（沉默）'],
          low:    ['（小声）……我说，我说。', '（双手颤抖）警官，我招。', '……求你给我女儿一条活路。']
        }
      }
    ]
  },

  /* =====================================================
     案件 2 — 林婉 / 杀猪盘诈骗案
     类型：经济犯罪（电信诈骗）    性格：紧张
     ===================================================== */
  {
    id: 'case-002',
    number: 'CASE #2026-002',
    title: '甜蜜的陷阱',
    subtitle: 'THE HONEY TRAP',
    crime: '电信网络诈骗（杀猪盘）',
    briefing: '一场涉案 800 万的"杀猪盘"骗局。受害人是 53 岁的退休教师，被一个自称"海归金融男"的角色骗走了全部积蓄。诈骗团伙的"客服"角色已被锁定为林婉。',
    prisoner: {
      name: '林婉',
      alias: '小婉',
      age: 26,
      crime: '电信网络诈骗',
      personality: 'nervous',
      personalityLabel: '紧张型',
      type: '经济犯罪',
      bio: '刚毕业两年的大专生。家里母亲重病，急用钱。经熟人介绍进了一家"金融科技公司"，直到被抓才知道自己干的是诈骗。',
      avatarSeed: 'linwan',
      initials: '林'
    },
    stages: [
      /* ---------- 阶段 1：承认自己扮演"客服"角色 ---------- */
      {
        index: 1,
        title: '我的角色',
        goal: '让林婉承认自己扮演的是"客服 / 客户经理"角色',
        goalKeywords: ['客服', '客户经理', '话务员', '客户', '扮演', '假冒', '冒充', '我是客服', '我做客服', '我当客服', '我演客服', '我假装客服'],
        trapKeywords: ['销售', '业务员', '推销'],
        maxRounds: 8,
        initialMood: 70,
        sceneIntro: '【审讯室 · 14:30】林婉低着头，双手紧紧攥着衣角。眼睛不敢看你。',
        hint: '她很紧张。温和地切入能让她放松。逻辑追问则会让她更不安。',
        openingLines: [
          '（声音很轻）我……我就是个打工的……',
          '我真的什么都不知道……',
          '我只是……我只是想赚钱给我妈看病……'
        ],
        responseRules: [
          { tone: 'friendly', matchKeywords: ['妈妈', '母亲', '看病', '生病', '医院'], moodDelta: -25, reply: '（眼眶红了）我妈她……她需要透析。每个月都要钱。我没办法……' },
          { tone: 'friendly', matchKeywords: ['毕业', '学校', '专业', '学历', '大专'], moodDelta: -10, reply: '（低头）我……我只是个普通学校毕业的。找工作找了很久。' },
          { tone: 'friendly', matchKeywords: ['第一次', '知道', '以为是', '正规'], moodDelta: -18, reply: '我刚进去的时候，真的以为是正规金融公司……后来才知道不是。' },
          { tone: 'intimidate', matchKeywords: ['800万', '金额', '数目', '数字'], moodDelta: 12, reply: '（颤抖）八、八百万？我不知道有这么多……我真不知道！' },
          { tone: 'intimidate', matchKeywords: ['坐牢', '判刑', '刑期', '进去'], moodDelta: 15, reply: '（哭）不要……不要让我坐牢……我妈还躺在医院里……' },
          { tone: 'intimidate', matchKeywords: ['从犯', '主犯', '责任'], moodDelta: 10, reply: '我不是主犯！我真的只是个小角色……' },
          { tone: 'logical', matchKeywords: ['电话', '通话', '微信', '聊天', '语音'], moodDelta: -5, reply: '（结巴）我……我每天打很多电话。' },
          { tone: 'logical', matchKeywords: ['工作', '公司', '业务', '岗位'], moodDelta: -8, reply: '（犹豫）公司叫"鑫达金融科技"……我的岗位是……是……' },
          { tone: 'deceive', matchKeywords: ['老板', '主管', '上线', '他们'], moodDelta: -10, reply: '老板……老板姓王。我们都叫他王总。' },
          { tone: 'friendly', matchKeywords: ['骗子', '诈骗', '骗'], moodDelta: -12, reply: '（捂脸哭）我也不想骗人……可是我妈的病……' },
          { tone: 'logical', matchKeywords: ['角色', '身份', '假冒', '扮演', '假装'], moodDelta: -15, reply: '（小声）我……我在电话里装作是客服。说自己是"客户经理"。' }
        ],
        fallback: {
          high:   ['（抽泣）我不知道……', '你问我我也说不清楚……', '（摇头）我真的不清楚'],
          mid:    ['（低头）我什么都不知道。', '让我想想……', '我只是想赚点钱而已。'],
          low:    ['我承认……', '（抽泣）我都说。', '我愿意配合。求你让我戴罪立功。']
        }
      },
      /* ---------- 阶段 2：套出"老板"真实身份 ---------- */
      {
        index: 2,
        title: '王总',
        goal: '确认"老板"真实身份：王志刚',
        goalKeywords: ['王志刚', '王总', '志刚', '老板姓王', '他姓王', '真名王', '本名王'],
        trapKeywords: ['王', '老板是王', '姓王的'],
        maxRounds: 8,
        initialMood: 55,
        sceneIntro: '【审讯室 · 第二天 09:00】林婉的状态比昨天稍稳。你暗示她"如果你不提供有价值的信息，同案的人就不会帮你说话"。',
        hint: '她最怕"被同伙抛弃"——可以从这里突破。',
        openingLines: [
          '（咬着嘴唇）……警官，我真的只知道他姓王。',
          '其他的我什么都不知道……',
          '我真的没见过他几次……'
        ],
        responseRules: [
          { tone: 'deceive', matchKeywords: ['同伙', '他们', '其他人', '已经', '招了'], moodDelta: -15, reply: '（紧张）其他人招了？他们……他们凭什么先招？！' },
          { tone: 'deceive', matchKeywords: ['手机', '微信', '朋友圈', '照片'], moodDelta: -12, reply: '（慌乱）王总的朋友圈都是海外生活……我以为他真的在国外……' },
          { tone: 'friendly', matchKeywords: ['同伙', '他们', '不讲义气', '出卖'], moodDelta: -10, reply: '（委屈）他们凭什么不帮我说话？我只是个打工人……' },
          { tone: 'friendly', matchKeywords: ['戴罪', '立功', '宽大', '从轻'], moodDelta: -8, reply: '（擦泪）我……我可以说的。你们想知道什么？' },
          { tone: 'intimidate', matchKeywords: ['包庇', '窝藏', '隐瞒'], moodDelta: 8, reply: '（颤抖）我没有包庇！我真的只知道姓王！' },
          { tone: 'intimidate', matchKeywords: ['主犯', '主谋', '核心'], moodDelta: 10, reply: '王总才是主犯！我真的只是打工的！' },
          { tone: 'logical', matchKeywords: ['名字', '全名', '叫什么', '大名'], moodDelta: -12, reply: '（犹豫）我……我只知道别人都叫他王总。' },
          { tone: 'logical', matchKeywords: ['公司', '注册', '地址', '办公'], moodDelta: -8, reply: '公司注册地在……我记不清……好像在城南一个写字楼。' },
          { tone: 'logical', matchKeywords: ['老家', '哪里人', '籍贯', '出生'], moodDelta: -10, reply: '（思索）他说话带点……带点北边口音。东北的？' },
          { tone: 'logical', matchKeywords: ['照片', '视频', '开会', '见面'], moodDelta: -6, reply: '（小声）我有一次开会见过他……他四十多岁，有点秃顶。' },
          { tone: 'friendly', matchKeywords: ['妈妈', '医院', '病'], moodDelta: -15, reply: '（流泪）求求你们，我妈的透析不能再停了……我愿意说。' },
          /* === 低情绪下的认罪规则 === */
          { tone: 'friendly', matchKeywords: ['我全说', '都告诉你', '我配合', '保护我'], moodDelta: -30, reply: '（咬牙）王总的全名……他叫王志刚。深圳人，身份证号我记不全，但我见过他的名片。' },
          { tone: 'deceive', matchKeywords: ['同伙', '其他人', '同案'], moodDelta: -22, reply: '（崩溃）他们不仁我不义！老板叫王志刚，我们都叫他王总。他老婆孩子都在香港。' },
          { tone: 'logical', matchKeywords: ['真实姓名', '全名', '身份证', '大名'], moodDelta: -25, reply: '（小声）王志刚。我有一次帮他订机票时看到过身份证……他本名就叫王志刚。' }
        ],
        fallback: {
          high:   ['（摇头）我不知道……', '我说的是真话。', '（抽泣）你别逼我……'],
          mid:    ['（犹豫）……让我再想想。', '（低声）我怕……', '我说了会不会被报复？'],
          low:    ['（下定决心）王总的全名……我听人提过。', '我可以说。', '求你们保护我。']
        }
      },
      /* ---------- 阶段 3：找到受害者打款账户 ---------- */
      {
        index: 3,
        title: '钱去了哪',
        goal: '找到受害者打款的账户：某对公账户（工行 3349 尾号）',
        goalKeywords: ['对公账户', '公司账户', '工行', '工商银行', '3349', '尾号3349', '公户'],
        trapKeywords: ['个人账户', '私人账户', '我妈的卡'],
        maxRounds: 8,
        initialMood: 40,
        sceneIntro: '【审讯室 · 第二天下午 17:00】你告诉她：钱追回来才算真正"立功"。她咬了咬嘴唇。',
        hint: '受害人的钱流向是破案关键。她作为"客服"应该见过打款信息。',
        openingLines: [
          '（沉默很久）……那笔钱，是受害人自己打进来的。',
          '我没经手过转账。',
          '我只是……我只是教他怎么"投资"……'
        ],
        responseRules: [
          { tone: 'logical', matchKeywords: ['账户', '打款', '转账', '打钱', '收钱'], moodDelta: -10, reply: '（小声）受害人打钱……打到一个对公账户。' },
          { tone: 'logical', matchKeywords: ['银行', '工行', '建行', '招行', '哪个银行'], moodDelta: -12, reply: '（回忆）工商银行的。我记得客户截过图给我看……' },
          { tone: 'logical', matchKeywords: ['尾号', '账号', '卡号'], moodDelta: -15, reply: '（犹豫）尾号……好像是 3349？还是 3349 开头？' },
          { tone: 'logical', matchKeywords: ['公司', '对公', '公户'], moodDelta: -18, reply: '对、对公账户。公司账户。叫……叫"鑫达"什么商贸。' },
          { tone: 'friendly', matchKeywords: ['受害人', '老师', '退休'], moodDelta: -10, reply: '（哽咽）那个老师……他真的以为我会嫁给他。他跟我表白过……' },
          { tone: 'friendly', matchKeywords: ['配合', '立功', '戴罪', '减刑'], moodDelta: -12, reply: '（擦泪）我愿意配合。只要能减轻我妈的负担。' },
          { tone: 'intimidate', matchKeywords: ['800万', '钱', '金额'], moodDelta: 8, reply: '我真没经手那么多钱！我一个月工资才 5000！' },
          { tone: 'intimidate', matchKeywords: ['追缴', '退赔', '退还'], moodDelta: 10, reply: '我没钱退！我所有的钱都给我妈看病了！' },
          { tone: 'deceive', matchKeywords: ['王总', '老板', '上线'], moodDelta: -8, reply: '这些账户都是王总让我发给客户的……我只是个传话的。' },
          { tone: 'deceive', matchKeywords: ['其他', '另外', '别的'], moodDelta: -6, reply: '（犹豫）其实……受害人还不止一个……还有两三个账户……' }
        ],
        fallback: {
          high:   ['我真的不知道账户具体是哪个。', '（摇头）让王总自己说。', '我已经说了很多了。'],
          mid:    ['（小声）让我再想想……', '我怕报复……', '（犹豫）……'],
          low:    ['（下定决心）我全说。', '只要能立功，我都说。', '（开始陈述）……']
        }
      }
    ]
  },

  /* =====================================================
     案件 3 — 老 K / 入室杀人案
     类型：暴力犯罪（故意杀人）    性格：冷静
     ===================================================== */
  {
    id: 'case-003',
    number: 'CASE #2026-003',
    title: '深夜的访客',
    subtitle: 'THE MIDNIGHT VISITOR',
    crime: '入室抢劫转化故意杀人',
    briefing: '城北高档小区一住宅内，55 岁的赵姓男主人被发现死于自家客厅。现场没有强行闯入痕迹，但缺失一只名贵腕表。嫌疑人老 K 曾在案发小区做过短期水电工。',
    prisoner: {
      name: '李崇',
      alias: '老 K',
      age: 52,
      crime: '故意杀人',
      personality: 'calm',
      personalityLabel: '冷静型',
      type: '暴力犯罪',
      bio: '前国企下岗工人。早年丧偶，独自抚养一个儿子。儿子三年前因意外去世，从此性格大变。案发前几个月曾到死者所在小区做过临时水电工。',
      avatarSeed: 'laok',
      initials: '李'
    },
    stages: [
      /* ---------- 阶段 1：承认当晚进入过死者家 ---------- */
      {
        index: 1,
        title: '当晚的行踪',
        goal: '让老 K 承认案发当晚进入过死者家中',
        goalKeywords: ['进去过', '进过', '当晚在场', '我在场', '去过他家', '我进过', '我确实进过', '我去过', '去过他家', '他家我进过'],
        trapKeywords: ['小区', '路过', '经过'],
        maxRounds: 8,
        initialMood: 65,
        sceneIntro: '【审讯室 · 21:00】老 K 戴着银边眼镜，神态平静。给你倒了一杯水，自己也喝了一口。',
        hint: '他很冷静——逻辑和欺骗都难撼动他。但每个冷静的人都有一个绕不过去的"点"。',
        openingLines: [
          '（语气平淡）警官，抽烟吗？',
          '我那天在小区里做了点零活，结束就回家了。',
          '你们抓错人了。我跟赵先生无冤无仇。'
        ],
        responseRules: [
          { tone: 'logical', matchKeywords: ['当晚', '那晚', '几点', '时间', '行踪'], moodDelta: -5, reply: '当晚八点多干完活，九点回到自己出租屋。你们可以查监控。' },
          { tone: 'logical', matchKeywords: ['钥匙', '门禁', '密码', '门锁'], moodDelta: -8, reply: '（停顿）……我以前给他家做过水电，留了一把备用钥匙。但那是很久以前的事了。' },
          { tone: 'logical', matchKeywords: ['小区', '监控', '摄像头'], moodDelta: -6, reply: '小区监控坏了大半年了，你们查不到什么的。' },
          { tone: 'intimidate', matchKeywords: ['故意', '谋杀', '蓄意'], moodDelta: 3, reply: '（摘下眼镜擦了擦）故意？警官，这话得有证据。' },
          { tone: 'intimidate', matchKeywords: ['死刑', '无期', '极刑'], moodDelta: 0, reply: '（平静）我这条命，早就不值钱了。' },
          { tone: 'friendly', matchKeywords: ['儿子', '孩子', '小凯', '家人'], moodDelta: -25, reply: '（第一次动容）……小凯。我儿子。三年前没了。车祸。' },
          { tone: 'friendly', matchKeywords: ['下岗', '工作', '零活', '生活'], moodDelta: -10, reply: '（叹气）国企倒了，我打零工养家。现在就我一个人，有什么好图的？' },
          { tone: 'deceive', matchKeywords: ['指纹', 'DNA', '血迹', '痕迹'], moodDelta: -12, reply: '（眼神微动）……指纹？什么指纹？我去他家做水电的时候留的？' },
          { tone: 'deceive', matchKeywords: ['目击者', '证人', '看见', '邻居'], moodDelta: -8, reply: '（冷冷一笑）那个小区一半住户都不认识我。证人？' },
          { tone: 'logical', matchKeywords: ['进过', '进去过', '去过', '进屋'], moodDelta: -15, reply: '（沉默半晌）……是，我那天进过他家。但只是为了拿回我借他的工具。' }
        ],
        fallback: {
          high:   ['（平静地喝水）我没什么可说的。', '我那天在出租屋睡觉。', '我要求见律师。'],
          mid:    ['（停顿）……我得想想。', '（摘下眼镜）你问到点上了。', '这事……不像你想的那么简单。'],
          low:    ['（低声）我那天确实进过他家。', '（叹气）我说了，你也不一定信。', '（落寞）我本来不想走到这一步。']
        }
      },
      /* ---------- 阶段 2：找到凶器下落 ---------- */
      {
        index: 2,
        title: '凶器',
        goal: '找到凶器下落：被扔进城北护城河桥下',
        goalKeywords: ['护城河', '河里', '扔河里', '沉入河', '桥下', '城北护城河', '城北河', '城北的河', '扔进河', '丢进河'],
        trapKeywords: ['扔了', '丢掉了'],
        maxRounds: 8,
        initialMood: 50,
        sceneIntro: '【审讯室 · 第二天 11:00】你让法医把伤口照片放大了放在他面前。他盯着看了很久。',
        hint: '凶器是他的"罪证"。再冷静的人，谈及毁灭证据时也会松动。',
        openingLines: [
          '（看了一眼照片）……这刀法，很利落。',
          '警官想让我认什么？',
          '我不知道什么凶器。'
        ],
        responseRules: [
          { tone: 'logical', matchKeywords: ['凶器', '刀', '工具', '利器'], moodDelta: -8, reply: '（沉默）……你们找到了？' },
          { tone: 'logical', matchKeywords: ['法医', '伤口', '痕迹', '血迹'], moodDelta: -5, reply: '（看照片）……我干水电活，常用美工刀。但那种刀，到处都买得到。' },
          { tone: 'intimidate', matchKeywords: ['销毁', '毁掉', '灭迹'], moodDelta: 3, reply: '（扶了扶眼镜）警官，你这话里有话。' },
          { tone: 'intimidate', matchKeywords: ['现场', '尸体', '还原', '模拟'], moodDelta: 5, reply: '我不想看这些。你们别再放了。' },
          { tone: 'friendly', matchKeywords: ['冲动', '一时', '情绪', '失控'], moodDelta: -10, reply: '（低头）……是一时冲动。我本来没想这样。' },
          { tone: 'friendly', matchKeywords: ['后悔', '对不起', '忏悔'], moodDelta: -12, reply: '我这条命……早就该没了。小凯走了之后，我活着没意思。' },
          { tone: 'deceive', matchKeywords: ['监控', '目击', '看见', '拍到'], moodDelta: -8, reply: '（冷冷地）那晚没月亮，也没人看见。' },
          { tone: 'deceive', matchKeywords: ['桥', '河', '水', '护城', '城北'], moodDelta: -15, reply: '（手微微抖）……你……你从哪儿听来的？' },
          { tone: 'logical', matchKeywords: ['扔', '丢', '处理', '藏', '销毁'], moodDelta: -18, reply: '（落寞）……城北护城河，桥下。早该烂在河里了。' },
          { tone: 'deceive', matchKeywords: ['同事', '工友', '一起干活'], moodDelta: -5, reply: '那天是单独去拿工具的。工友不知道。' }
        ],
        fallback: {
          high:   ['我不知道什么凶器。', '（平静）这案子跟我无关。', '我没杀人。'],
          mid:    ['（停顿很久）……', '（摘下眼镜擦拭）你问到这了。', '我需要想想。'],
          low:    ['（低声）我说。', '（叹气）反正我也活腻了。', '你想知道什么，我都说。']
        }
      },
      /* ---------- 阶段 3：套出杀人动机 ---------- */
      {
        index: 3,
        title: '为什么',
        goal: '套出杀人动机：死者曾欠老 K 二十万元工钱',
        goalKeywords: ['欠我钱', '欠我工钱', '二十万', '200000', '工钱', '欠债', '讨债', '他还欠我', '他欠我', '讨薪', '要钱', '债务'],
        trapKeywords: ['恨他', '仇恨', '报复', '钱', '因为钱'],
        maxRounds: 8,
        initialMood: 35,
        sceneIntro: '【审讯室 · 第二天下午 19:30】你告诉他：动机是法庭量刑的关键。是"激情杀人"还是"图财害命"，差别很大。',
        hint: '他最在意的是儿子的死——但这跟"钱"无关。死者的"债"才是这案子真正的导火索。',
        openingLines: [
          '（闭眼）……动机？我没杀人，谈什么动机。',
          '我跟他无冤无仇。',
          '他死了，跟我无关。'
        ],
        responseRules: [
          { tone: 'logical', matchKeywords: ['动机', '为什么', '原因', '理由'], moodDelta: -5, reply: '（睁眼）……为什么？我也想知道为什么。' },
          { tone: 'logical', matchKeywords: ['债务', '欠钱', '欠款', '工钱', '账'], moodDelta: -15, reply: '（冷笑）他欠我的钱？他说我做工不合格。二十万，说没就没了。' },
          { tone: 'logical', matchKeywords: ['二十万', '20万', '多少钱', '金额'], moodDelta: -12, reply: '（颤抖）二十万。我儿子小凯出事那晚，我在医院。他打电话来——说工程款"出问题"了。' },
          { tone: 'logical', matchKeywords: ['讨债', '要钱', '还钱', '催'], moodDelta: -18, reply: '我讨了多少次。他躲着我。我儿子下葬那天，他连个人影都没有。' },
          { tone: 'intimidate', matchKeywords: ['激情', '故意', '蓄意', '预谋'], moodDelta: 3, reply: '（摇头）不是预谋。我那天就是去要钱。' },
          { tone: 'friendly', matchKeywords: ['儿子', '小凯', '孩子', '车祸'], moodDelta: -25, reply: '（哽咽）小凯出事那天……我在医院签字，签的是"放弃抢救"……我连他最后一面都没见到。' },
          { tone: 'friendly', matchKeywords: ['孤独', '一个人', '孤寡', '晚年'], moodDelta: -10, reply: '我老婆十年前就走了。小凯也走了。我一个人活着，跟行尸走肉一样。' },
          { tone: 'deceive', matchKeywords: ['仇恨', '恨他', '报复'], moodDelta: -8, reply: '恨？谈不上。我只是……气。' },
          { tone: 'deceive', matchKeywords: ['同伙', '帮手', '一起'], moodDelta: -3, reply: '（摇头）没有帮手。这种事，一个人就够了。' },
          { tone: 'friendly', matchKeywords: ['理解', '懂你', '知道', '明白'], moodDelta: -20, reply: '（落泪）你真的懂？……我这辈子，没求过谁。我只要回我的工钱。' }
        ],
        fallback: {
          high:   ['（平静）我没什么可说的。', '我那天在出租屋。', '让证据说话。'],
          mid:    ['（沉默良久）……', '你问到这个了。', '我需要一支烟。'],
          low:    ['（低声）我全说。', '反正我也不想活了。', '（摘下眼镜）警官，我认罪。']
        }
      }
    ]
  }
];
