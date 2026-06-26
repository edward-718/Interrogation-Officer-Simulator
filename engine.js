/* ====================================================================
   《审讯室》对话引擎 — Dialogue Engine
   关键词匹配 / 语气选择 / 回复生成 / 目标判断
   ==================================================================== */
window.ENGINE = (function () {
  'use strict';

  /* ---------- 情绪档位 ---------- */
  function moodTier(mood) {
    if (mood >= 70) return 'high';
    if (mood >= 40) return 'mid';
    return 'low';
  }

  /* ---------- 关键词匹配 ---------- */
  function matchRule(text, keywords) {
    const t = text.trim().toLowerCase();
    return keywords.some(function (kw) {
      return t.includes(kw.toLowerCase());
    });
  }

  /* ---------- 获取语气标签（人类可读） ---------- */
  function toneLabel(tone) {
    var map = {
      intimidate: '【威压】',
      friendly:   '【温和】',
      deceive:    '【欺骗】',
      logical:    '【逻辑】'
    };
    return map[tone] || '【？】';
  }

  /* ---------- 生成嫌疑人回复 ---------- */
  function generateReply(stage, tone, playerText, mood) {
    var rules = stage.responseRules || [];
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.tone === tone && matchRule(playerText, rule.matchKeywords)) {
        return {
          reply: rule.reply,
          moodDelta: rule.moodDelta,
          unlocked: rule.unlocks || []
        };
      }
    }
    // 兜底回复
    var tier = moodTier(mood);
    var pool = stage.fallback && stage.fallback[tier] || ['……'];
    return {
      reply: pool[Math.floor(Math.random() * pool.length)],
      moodDelta: 0,
      unlocked: []
    };
  }

  /* ---------- 判断目标是否达成 ----------
     玩家问话 OR 嫌疑人回复 中出现关键词即视为达成。
     这样玩家可以选择：直接问出关键词 / 或通过语气策略让嫌疑人主动承认。 */
  function isGoalAchieved(dialogue, stage) {
    var allText = dialogue
      .filter(function (d) { return d.role === 'player' || d.role === 'prisoner'; })
      .map(function (d) { return d.text; })
      .join(' / ');
    return matchRule(allText, stage.goalKeywords);
  }

  /* ---------- 判断是否误判陷阱 ---------- */
  function isTrapped(dialogue, stage) {
    var allText = dialogue
      .filter(function (d) { return d.role === 'player'; })
      .map(function (d) { return d.text; })
      .join('');
    return matchRule(allText, stage.trapKeywords);
  }

  /* ---------- 解锁标签去重 ---------- */
  function mergeUnlocks(existing, newOnes) {
    var merged = existing.slice();
    newOnes.forEach(function (tag) {
      if (merged.indexOf(tag) === -1) merged.push(tag);
    });
    return merged;
  }

  return {
    generateReply: generateReply,
    isGoalAchieved: isGoalAchieved,
    isTrapped: isTrapped,
    moodTier: moodTier,
    toneLabel: toneLabel,
    mergeUnlocks: mergeUnlocks
  };
})();
