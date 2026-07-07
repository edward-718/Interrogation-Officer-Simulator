/* ====================================================================
   《审讯室》对话引擎 — Dialogue Engine
   关键词匹配 / 语气选择 / 回复生成 / 目标判断
   ==================================================================== */
window.ENGINE = (function () {
  'use strict';

  var TONE_MAP = {
    intimidate: '【威压】',
    friendly:   '【温和】',
    deceive:    '【欺骗】',
    logical:    '【逻辑】'
  };

  function moodTier(mood) {
    var m = Number(mood);
    if (isNaN(m)) return 'mid';
    if (m >= 70) return 'high';
    if (m >= 40) return 'mid';
    return 'low';
  }

  function normalizeText(text) {
    if (typeof text !== 'string') return '';
    return text.trim().toLowerCase().replace(/\s+/g, '');
  }

  function matchRule(text, keywords) {
    if (!text || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return false;
    }
    var t = normalizeText(text);
    if (!t) return false;

    // 否定检测：若文本包含否定词，则关键词匹配视为无效
    var negationWords = ['不', '没', '无', '非', '没有', '不是', '并未', '别', '不要', '不能', '不会'];
    var hasNegation = negationWords.some(function (w) { return t.includes(w); });

    return keywords.some(function (kw) {
      if (typeof kw !== 'string' || !kw) return false;
      var matched = t.includes(normalizeText(kw));
      if (matched && hasNegation) return false;
      return matched;
    });
  }

  function toneLabel(tone) {
    return TONE_MAP[tone] || '【？】';
  }

  function expandKeywords(keywords) {
    if (!Array.isArray(keywords)) return keywords;
    var expanded = [];
    keywords.forEach(function (kw) {
      expanded.push(kw);
      if (window.SYNONYMS && window.SYNONYMS[kw]) {
        window.SYNONYMS[kw].forEach(function (syn) {
          if (expanded.indexOf(syn) === -1) expanded.push(syn);
        });
      }
    });
    return expanded;
  }

  function estimateTruthLevel(moodDelta, isCross, isFallback) {
    var base = 50;
    if (isFallback) {
      base = 30 + Math.floor(Math.random() * 40); // 30-70
    } else if (isCross) {
      base = 25 + Math.floor(Math.random() * 30); // 25-55
    } else {
      // moodDelta 越负（越松动），truthLevel 越高
      base = 50 + (moodDelta * -2.5);
      base = Math.max(10, Math.min(95, base));
      base += Math.floor(Math.random() * 16) - 8; // ±8 随机波动
    }
    return Math.max(5, Math.min(98, Math.round(base)));
  }

  function applyPersonalityModifier(moodDelta, tone, personalityMatrix) {
    if (!personalityMatrix || typeof personalityMatrix !== 'object') return moodDelta;
    var factor = personalityMatrix[tone];
    if (typeof factor === 'number') return Math.round(moodDelta * factor);
    return moodDelta;
  }

  function applyToneHistoryPenalty(moodDelta, tone, toneHistory) {
    if (!Array.isArray(toneHistory) || toneHistory.length < 3) return moodDelta;
    var last3 = toneHistory.slice(-3);
    var allSame = last3.every(function (t) { return t === tone; });
    if (allSame) return Math.round(moodDelta * 0.7);
    return moodDelta;
  }

  function generateReply(stage, tone, playerText, mood, toneHistory, personalityMatrix) {
    if (!stage) {
      return { reply: '……', moodDelta: 0, unlocked: [] };
    }

    // "最后一句话"机制：不检查语气，优先匹配
    if (stage.endingLine) {
      var endKws = ['结束', '就这样', '走吧', '可以了', '到此为止', '离开', '起身'];
      if (matchRule(playerText, endKws)) {
        return {
          reply: stage.endingLine,
          moodDelta: 0,
          truthLevel: estimateTruthLevel(0, false),
          unlocked: []
        };
      }
    }

    var rules = stage.responseRules || [];
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (!rule || rule.tone !== tone) continue;
      var matchKws = expandKeywords(rule.matchKeywords);
      if (matchRule(playerText, matchKws)) {
        var md = Number(rule.moodDelta) || 0;
        md = applyPersonalityModifier(md, tone, personalityMatrix);
        md = applyToneHistoryPenalty(md, tone, toneHistory);
        var truthLevel = estimateTruthLevel(md, false);
        return {
          reply: rule.reply || '……',
          moodDelta: md,
          truthLevel: truthLevel,
          unlocked: Array.isArray(rule.unlocks) ? rule.unlocks : []
        };
      }
    }

    // 交叉反应规则：正常规则未命中时，检查是否有适合当前语气的交叉反应
    var crossRules = stage.crossRules || [];
    for (var j = 0; j < crossRules.length; j++) {
      var cr = crossRules[j];
      if (!cr || cr.tone !== tone) continue;
      var crossKws = expandKeywords(cr.matchKeywords);
      if (matchRule(playerText, crossKws)) {
        var cmd = Number(cr.moodDelta) || 0;
        cmd = applyPersonalityModifier(cmd, tone, personalityMatrix);
        cmd = applyToneHistoryPenalty(cmd, tone, toneHistory);
        var crossTruth = estimateTruthLevel(cmd, true);
        return {
          reply: cr.reply || '……',
          moodDelta: cmd,
          truthLevel: crossTruth,
          unlocked: Array.isArray(cr.unlocks) ? cr.unlocks : []
        };
      }
    }

    var tier = moodTier(mood);
    var fallback = stage.fallback || {};
    var pool = fallback[tier] || ['……'];
    if (!Array.isArray(pool) || pool.length === 0) pool = ['……'];
    var reply = pool[Math.floor(Math.random() * pool.length)];

    // 口头禅：根据 personalityMatrix 推断性格并添加口癖前缀
    if (personalityMatrix) {
      var pfx = '';
      if (personalityMatrix.intimidate < 0.6 && personalityMatrix.logical > 1.1) {
        // 冷静型
        var calmTicks = ['（停顿）', '（推了推眼镜）', '（平静地）'];
        pfx = calmTicks[Math.floor(Math.random() * calmTicks.length)];
      } else if (personalityMatrix.intimidate > 1.2) {
        // 紧张型
        var nervousTicks = ['（抽泣）', '（颤抖）', '（低头）'];
        pfx = nervousTicks[Math.floor(Math.random() * nervousTicks.length)];
      } else if (personalityMatrix.intimidate < 0.8 && personalityMatrix.friendly > 1.1) {
        // 傲慢型
        var arrogantTicks = ['（冷笑）', '（不屑）', '（眯眼）'];
        pfx = arrogantTicks[Math.floor(Math.random() * arrogantTicks.length)];
      }
      if (pfx && reply.indexOf(pfx) !== 0 && reply.indexOf('（') !== 0) {
        reply = pfx + ' ' + reply;
      }
    }

    var fbTruth = estimateTruthLevel(0, false, true);
    return {
      reply: reply,
      moodDelta: 0,
      truthLevel: fbTruth,
      unlocked: []
    };
  }

  function isGoalAchieved(dialogue, stage) {
    if (!stage || !Array.isArray(dialogue)) return false;
    var goalKeywords = stage.goalKeywords;
    if (!Array.isArray(goalKeywords) || goalKeywords.length === 0) return false;

    var allText = dialogue
      .filter(function (d) { return d && (d.role === 'player' || d.role === 'prisoner'); })
      .map(function (d) { return d.text || ''; })
      .join(' / ');
    return matchRule(allText, goalKeywords);
  }

  function isTrapped(dialogue, stage) {
    if (!stage || !Array.isArray(dialogue)) return false;
    var trapKeywords = stage.trapKeywords;
    if (!Array.isArray(trapKeywords) || trapKeywords.length === 0) return false;

    var playerText = dialogue
      .filter(function (d) { return d && d.role === 'player'; })
      .map(function (d) { return d.text || ''; })
      .join('');

    if (!matchRule(playerText, trapKeywords)) return false;
    if (isGoalAchieved(dialogue, stage)) return false;
    return true;
  }

  function mergeUnlocks(existing, newOnes) {
    var merged = Array.isArray(existing) ? existing.slice() : [];
    var toAdd = Array.isArray(newOnes) ? newOnes : [];
    toAdd.forEach(function (tag) {
      if (tag && merged.indexOf(tag) === -1) merged.push(tag);
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
