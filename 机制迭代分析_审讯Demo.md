# 《审讯室》Demo 机制迭代分析
## 游戏机制与玩家体验视角

---

## 一、当前机制 vs 创意方案：差距矩阵

| 维度 | 当前 Demo（已实现） | 创意方案《心灵审讯室》 | 差距评估 |
|------|---------------------|------------------------|----------|
| **语气系统** | 4种：威压、温和、欺骗、逻辑 | 5种：严厉、温和、诱导、沉默施压、共情 | 中 gap — 缺少沉默施压与共情 |
| **犯人角色** | 3种性格：傲慢、紧张、冷静 | 6种角色：冷面、暴躁、演技、懦弱、高智商、忠诚 | 大 gap — 类型覆盖不足，重玩价值受限 |
| **结局系统** | 二元：Good End / Bad End（3种失败原因） | 多结局：Bad End + True End + 分支结局 | 大 gap — 缺乏叙事分支与结局差异感 |
| **策略维度** | 语气 + 提问关键词 | 语气 + 提问内容 + 证据出示时机 | 中 gap — 缺少证据维度，策略浅 |
| **目标判定** | 关键词精确匹配（有隐性标准答案） | 强调"自主判断、没有标准答案" | 核心矛盾 — 当前机制与设计理念冲突 |
| **情绪系统** | 0-100抗拒度，3档moodTier驱动fallback | 每轮明确阶段目标，多维度影响 | 小 gap — 框架已有，需扩展表现层 |
| **轮次机制** | 固定8轮/阶段，3次失败机会 | 审讯轮次体系，阶段目标驱动 | 基本对齐 — 需增加动态性 |

### 核心矛盾点

当前 Demo 的 **goalKeywords 精确匹配机制** 实际上创造了一个"隐性标准答案"体系——玩家虽然在表面上"自主判断"，但本质上是在猜测开发者预设的关键词。这与创意方案强调的 **"没有标准答案"** 存在设计哲学层面的冲突。

> 在无 LLM 的纯前端约束下，实现"没有标准答案"需要把判定逻辑从"关键词命中"迁移到"状态累积"。

---

## 二、Demo 级别迭代建议（按优先级排序）

### P0 — 立即实现（1-2天，纯数据/配置改动）

#### 1. 犯人角色类型扩展至 6 种（数据层）

**当前问题**：仅 3 种性格（傲慢/紧张/冷静），玩家快速摸清规律后失去探索欲。

**具体改动**：
```javascript
// data/cases.js 中扩展 personality 枚举
const PERSONALITY_TYPES = {
  cold:      { label: '冷面型',  resistIntimidate: 1.5, resistFriendly: 0.6, desc: '对威压免疫，吃共情' },
  violent:   { label: '暴躁型',  resistIntimidate: 0.3, resistFriendly: 1.2, desc: '威压会激怒，温和能降防' },
  actor:     { label: '演技型',  resistDeceive:    0.4, resistLogical:  1.3, desc: '欺骗难以奏效，逻辑能识破伪装' },
  timid:     { label: '懦弱型',  resistIntimidate: 0.2, resistFriendly: 0.8, desc: '极易被威压突破，但可能撒谎' },
  genius:    { label: '高智商型', resistLogical:    1.5, resistDeceive:  0.5, desc: '逻辑对抗会被反制，诱导更有效' },
  loyal:     { label: '忠诚型',  resistFriendly:   1.3, resistDeceive:  1.2, desc: '为保护某人而扛，需找到那个"点"' }
};
```

**引擎层最小改动**：在 `engine.js` 的 `generateReply` 中增加 personality 系数修正：
```javascript
// 在 generateReply 中
var baseDelta = Number(rule.moodDelta) || 0;
var multiplier = (stage.personalityModifiers && stage.personalityModifiers[tone]) || 1.0;
var finalDelta = Math.round(baseDelta * multiplier);
```

**玩家体验提升**：同一语气对不同犯人效果截然不同，强迫玩家阅读档案、针对性选择策略，而非固定套路。

---

#### 2. 情绪反馈即时可视化（表现层）

**当前问题**：mood 变化只体现在数字和立绘上，玩家难以感知"这句话产生了什么效果"。

**具体改动**：
- 在每条犯人回复后，追加一个 **"情绪反馈标签"**（如 ↓抗拒、↑戒备、💔松动、🔥激怒）
- 立绘变化增加过渡动画（CSS transition 0.5s）
- 当 mood 跨越 tier 阈值时，播放一次性音效 + 闪烁提示

**实现成本**：纯 CSS + 少量 DOM 操作，无需改动引擎核心。

---

#### 3. 案件档案预审讯可读（UX 层）

**当前问题**：档案按钮在案件选择界面，审讯中无法查看。玩家可能忘记关键信息。

**具体改动**：审讯室界面增加 **"档案"折叠面板**，可查看犯人背景、已知情报、阶段目标。不消耗轮次。

---

### P1 — 短期实现（3-5天，需引擎小改）

#### 4. 目标判定机制重构：从"关键词命中"到"突破值累积"

**这是最关键的机制改动**，直接解决"隐性标准答案"问题。

**当前机制的问题**：
```javascript
// 当前：玩家必须说出某个特定词
isGoalAchieved(dialogue, stage) {
  return matchRule(allText, stage.goalKeywords); // 有标准答案
}
```

**新机制设计（纯前端可实现）**：

引入三维隐藏值系统：
- **突破值（Breakthrough）**：0-100，表示犯人心理防线被削弱程度
- **误导值（Misleading）**：0-100，表示玩家被犯人带偏的程度
- **信任值（Trust）**：0-100，表示犯人对玩家的开口意愿

```javascript
// engine.js 新核心逻辑
function calculateStateDelta(stage, tone, playerText, mood, personality) {
  var bt = 0, ml = 0, tr = 0;
  
  // 1. 语气-性格相克表产生基础值
  var toneEffect = TONE_PERSONALITY_MATRIX[personality][tone]; // {bt, ml, tr}
  
  // 2. 关键词匹配产生额外值（不再直接判定目标，而是累积状态）
  stage.keywordEffects.forEach(function(effect) {
    if (matchRule(playerText, effect.keywords)) {
      bt += effect.btDelta || 0;
      ml += effect.mlDelta || 0;
      tr += effect.trDelta || 0;
    }
  });
  
  // 3. mood 作为放大器
  var moodMultiplier = mood < 30 ? 1.5 : (mood > 70 ? 0.5 : 1.0);
  
  return {
    btDelta: Math.round(bt * moodMultiplier),
    mlDelta: Math.round(ml),
    trDelta: Math.round(tr * moodMultiplier),
    reply: selectReply(stage, tone, playerText, mood)
  };
}
```

**目标判定新规则**：
```javascript
function isGoalAchieved(state, stage) {
  // 不再看关键词，看三维状态
  var btThreshold = stage.breakthroughThreshold || 60;
  var mlCeiling = stage.misleadingCeiling || 40;
  
  return state.breakthrough >= btThreshold && state.misleading < mlCeiling;
}
```

**玩家体验变化**：
- 不再"猜关键词"，而是"管理审讯态势"
- 同一个目标可以通过多种路径达成（高信任低突破 / 低信任高突破 都可以）
- 真正实现了"没有标准答案"
- 误导值过高时，即使突破值够了也不能判定成功（犯人可能在演戏/假招供）

---

#### 5. 引入"审讯笔记"面板（信息层）

**与新机制配套**：给玩家一个半透明的信息面板，显示：
- 本轮情绪变化趋势（↑↓图表）
- 已触发的"关键话题"（非标准答案，只是提示"这个话题犯人反应强烈"）
- 当前突破值/误导值的 **模糊描述**（如"犯人似乎有所松动" / "你感觉被带偏了"）

**实现**：基于对话历史计算，纯前端，不暴露精确数值。

---

#### 6. 结局分支细化（案件级多结局）

**当前**：Good/Bad 二元。

**新设计（纯规则驱动）**：
```javascript
function determineEnding(caseId, stageResults) {
  var totalRounds = stageResults.reduce(function(s, r) { return s + r.roundsUsed; }, 0);
  var totalFails = stageResults.reduce(function(s, r) { return s + r.failCount; }, 0);
  var avgMood = stageResults.reduce(function(s, r) { return s + r.finalMood; }, 0) / stageResults.length;
  
  if (totalFails >= 3) return 'bad_wrongful';      // 冤假错案：你逼供过度
  if (totalRounds <= 12) return 'true_perfect';     // True End：高效审讯，真相大白
  if (avgMood < 30) return 'good_broken';           // 犯人崩溃认罪，但手段存疑
  if (totalRounds > 20) return 'good_delayed';      // 拖延过久，证据链受损
  return 'good_standard';                           // 标准破案
}
```

**玩家体验**：同一案件可以打出不同评级，鼓励重玩优化。

---

### P2 — 中期实现（1-2周，需新增系统）

#### 7. 简单证据系统（新增维度）

**设计**：每个案件配置 2-4 个证据，审讯中可随时出示（消耗 0 轮次或 0.5 轮次）。

```javascript
// cases.js 新增
evidence: [
  { id: 'bank_record', name: '银行流水', unlockStage: 1, effect: { bt: +20, mood: +10 } },
  { id: 'witness_photo', name: '目击照片', unlockStage: 2, effect: { bt: +30, ml: +15 } }
]
```

**出示效果**：
- 立即改变犯人 mood（通常是升高抗拒或崩溃）
- 解锁新的 responseRules（犯人面对铁证时的特殊反应）
- 时机不当（如误导值高时出示）可能导致犯人翻供

**纯前端实现**：证据是静态配置，出示即触发预配置效果。

---

#### 8. "沉默施压"作为第 5 种语气

**设计**：玩家选择"沉默"不输入任何内容，跳过本轮。

**效果**：
- 不消耗输入机会（但算 1 轮）
- 犯人根据当前 mood 做出反应：
  - mood > 70：犯人得意（"没话说了？"）
  - mood 40-70：犯人不自在（开始说话填补沉默）
  - mood < 40：犯人恐慌（可能自白）
- 连续沉默有叠加效果

**实现**：新增 tone = 'silence'，特殊处理逻辑。

---

#### 9. 犯人"演技型"专属机制：真假陈述系统

**为演技型犯人设计**：
- 部分回复标记为 `isFake: true`
- 玩家需要通过"逻辑"语气追问才能识破（连续 2 轮逻辑追问同一话题，犯人露馅）
- 被假陈述误导会增加误导值

**实现**：responseRules 增加 `isFake` 标记，引擎增加"连续追问同一话题"检测。

---

## 三、数值与规则调整建议

### 3.1 情绪系统数值重调

| 参数 | 当前值 | 建议值 | 理由 |
|------|--------|--------|------|
| mood 阈值 high | ≥70 | ≥65 | 让 high 态更常见，增加前期对抗感 |
| mood 阈值 mid | ≥40 | ≥30 | 扩宽 mid 区间，避免过快突破 |
| mood 变化幅度 | ±3 ~ ±30 | ±5 ~ ±25（受性格修正） | 压缩极端值，减少单句翻盘 |
| 单阶段轮次 | 固定 8 | 6~10 动态 | 简单阶段 6 轮，复杂阶段 10 轮 |
| 失败机会 | 固定 3 | 2~4 动态 | 难度分级：简单案 4 次，困难案 2 次 |

### 3.2 性格-语气相克系数表（示例）

| 性格 | 威压 | 温和 | 诱导 | 逻辑 | 沉默 |
|------|------|------|------|------|------|
| 冷面型 | ×0.3 | ×1.0 | ×1.2 | ×1.0 | ×1.5 |
| 暴躁型 | ×1.5 | ×0.8 | ×0.6 | ×0.8 | ×1.0 |
| 演技型 | ×1.0 | ×0.8 | ×0.3 | ×1.5 | ×0.5 |
| 懦弱型 | ×1.5 | ×1.0 | ×1.2 | ×0.8 | ×1.3 |
| 高智商型 | ×0.8 | ×1.0 | ×1.5 | ×0.3 | ×1.0 |
| 忠诚型 | ×1.0 | ×0.3 | ×1.2 | ×1.0 | ×1.5 |

> 系数作用于突破值变化幅度。例如：对冷面型使用威压，突破值只产生 30% 效果，且可能反向增加误导值。

### 3.3 陷阱关键词机制改进

**当前**：触发 trapKeywords → 直接判错，消耗失败机会。

**改进**：
- 第 1 次触发：系统提示 "【警觉】嫌疑人的陈述似乎有矛盾，你是否被误导了？" — 不消耗失败机会
- 第 2 次触发同一陷阱：消耗 1 次机会
- 如果在误导值 > 50 时触发陷阱：直接判错（玩家已被深度带偏）

**玩家体验**：给玩家一次纠错机会，降低挫败感，同时保留策略深度。

### 3.4 新增"连续同语气惩罚"

**规则**：同一语气连续使用 3 次以上，效果递减（系数 ×0.7），犯人产生"抗体"。

**理由**：防止玩家找到最优套路后重复刷，强制策略多样化。

---

## 四、迭代路线图（Demo 阶段）

```
Week 1
├── Day 1-2: P0 — 6种性格数据配置 + 情绪反馈可视化
├── Day 3-5: P1 — 突破值/误导值系统替换关键词判定
└── Day 6-7: P1 — 审讯笔记面板 + 多结局规则

Week 2
├── Day 8-10: P2 — 证据系统（2-3个案件试点）
├── Day 11-12: P2 — 沉默施压机制
└── Day 13-14: 全案件数据重构 + 测试调优
```

---

## 五、关键设计原则（约束内最大化体验）

1. **无 LLM ≠ 无深度**：用隐藏状态机 + 多维数值 + 性格相克创造涌现式策略空间
2. **信息透明但不完全**：给玩家"感觉"和"趋势"，不给精确数字，保持直觉判断
3. **失败要有信息**：Bad End 时复盘"你的误导值过高" / "突破时机未到"，让玩家学到东西
4. **重玩即内容**：同一案件通过不同语气路径获得不同对话内容，重玩不是重复
5. **证据克制**：证据不要变成"万能钥匙"，而是"改变博弈态势的变量"

---

*分析完成。以上所有建议均可在纯前端、无 LLM、无后端的约束下实现，核心依赖静态数据配置 + 规则引擎的状态机扩展。*
