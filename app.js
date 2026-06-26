/* ====================================================================
   《审讯室》主应用 — Main App
   视图管理 / 状态 / 交互 / 语音输入 / SVG 立绘
   ==================================================================== */
(function () {
  'use strict';

  /* =================== 全局状态 =================== */
  var state = {
    currentCase: null,
    currentStage: null,
    mood: 50,
    round: 0,
    maxRounds: 8,
    failedAttempts: 0,      // 失败尝试次数
    maxFailedAttempts: 3,   // 最大失败机会
    dialogue: [],
    unlocked: [],
    currentTone: null,
    status: 'idle', // idle | playing | good | bad
    badReason: '',
    recognition: null,
    isRecording: false
  };

  /* =================== 进度存档 =================== */
  var STORAGE_KEY = 'interrogation-room-progress-v1';

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  function saveProgress(caseId, stageIndex, status) {
    var progress = loadProgress();
    progress[caseId] = progress[caseId] || { completed: 0, total: 0, status: 'idle', lastStage: 0 };
    progress[caseId].lastStage = stageIndex;
    if (status === 'good') {
      progress[caseId].completed = Math.max(progress[caseId].completed || 0, stageIndex);
    }
    progress[caseId].status = status;
    if (!progress[caseId].total) {
      var c = window.CASES_DATA.find(function (x) { return x.id === caseId; });
      progress[caseId].total = c ? c.stages.length : 0;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) { /* 忽略容量错误 */ }
  }

  /* =================== 工具函数 =================== */
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'style') e.style.cssText = attrs[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'html') e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    if (children) (Array.isArray(children) ? children : [children]).forEach(function (c) {
      if (c == null) return;
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  }

  function switchView(name) {
    $$('.view').forEach(function (v) { v.classList.remove('view-active'); });
    var target = $('#view-' + name);
    if (target) target.classList.add('view-active');
  }

  function flash(type) {
    var f = $('#flash-overlay');
    f.className = 'flash-overlay flash-' + type;
    setTimeout(function () { f.className = 'flash-overlay'; }, 500);
  }

  function showModal(title, body, onOk) {
    $('#modal-title').textContent = title;
    $('#modal-body').textContent = body;
    $('#modal-mask').classList.add('show');
    var okBtn = $('#modal-ok');
    function close() {
      $('#modal-mask').classList.remove('show');
      okBtn.removeEventListener('click', close);
      if (onOk) onOk();
    }
    okBtn.addEventListener('click', close);
  }

  function confirmExit() {
    if (state.status === 'playing') {
      showModal('退出审讯', '当前审讯尚未结束，退出后进度将不会保存。\n确定要退出吗？', function () {
        backToLobby();
      });
    } else {
      backToLobby();
    }
  }

  function backToLobby() {
    state.status = 'idle';
    state.currentCase = null;
    state.currentStage = null;
    if (state.recognition && state.isRecording) {
      try { state.recognition.stop(); } catch (e) {}
    }
    renderLobby();
    switchView('lobby');
  }

  /* =================== SVG 立绘生成 =================== */
  function renderPortrait(prisoner, mood) {
    var seed = prisoner.avatarSeed;
    var personality = prisoner.personality;
    var moodTier = window.ENGINE.moodTier(mood);

    // 表情参数
    var mouthPath, eyeY, browAngle, faceColor;
    if (moodTier === 'high') {
      // 抗拒/傲慢
      mouthPath = 'M40 75 Q50 70 60 75';
      browAngle = -8;
      faceColor = '#C9A876';
    } else if (moodTier === 'mid') {
      // 警惕
      mouthPath = 'M40 75 L60 75';
      browAngle = -2;
      faceColor = '#D8C99B';
    } else {
      // 松动/认罪
      mouthPath = 'M40 80 Q50 75 60 80';
      browAngle = 5;
      faceColor = '#E5D4A6';
    }

    // 性格细节
    var detail = '';
    if (personality === 'arrogant') {
      detail = '<path d="M30 35 L25 25 M70 35 L75 25" stroke="#3a2a1a" stroke-width="2" fill="none"/>' +
              '<text x="50" y="20" text-anchor="middle" font-family="Special Elite" font-size="8" fill="#A4262C" opacity="0.7">傲慢</text>';
    } else if (personality === 'nervous') {
      detail = '<circle cx="25" cy="60" r="2" fill="#5C7A89" opacity="0.6"/>' +
              '<circle cx="75" cy="60" r="2" fill="#5C7A89" opacity="0.6"/>' +
              '<text x="50" y="20" text-anchor="middle" font-family="Special Elite" font-size="8" fill="#5C7A89" opacity="0.7">紧张</text>';
    } else if (personality === 'calm') {
      detail = '<rect x="35" y="90" width="30" height="3" fill="#3a2a1a" opacity="0.5"/>' +
              '<text x="50" y="20" text-anchor="middle" font-family="Special Elite" font-size="8" fill="#3F4E4F" opacity="0.7">冷静</text>';
    }

    var svg = '' +
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="face' + seed + '" cx="50%" cy="40%">' +
            '<stop offset="0%" stop-color="' + faceColor + '"/>' +
            '<stop offset="100%" stop-color="#8C7424"/>' +
          '</radialGradient>' +
        '</defs>' +
        // 身体轮廓
        '<ellipse cx="50" cy="105" rx="32" ry="18" fill="#1a1a21" opacity="0.8"/>' +
        // 脸
        '<circle class="face-circle" cx="50" cy="50" r="28" fill="url(#face' + seed + ')" stroke="#3a2a1a" stroke-width="1"/>' +
        // 头发（依 seed 不同）
        (seed === 'shenmo' ?
          '<path d="M22 42 Q25 25 50 22 Q75 25 78 42 Q75 35 50 33 Q25 35 22 42" fill="#1a1410" stroke="#0a0805" stroke-width="0.5"/>' :
         seed === 'linwan' ?
          '<path d="M22 45 Q20 20 50 18 Q80 20 78 45 Q75 30 50 28 Q25 30 22 45" fill="#3a2820" stroke="#1a0f0a" stroke-width="0.5"/>' :
          '<path d="M22 40 Q28 22 50 20 Q72 22 78 40 Q72 30 50 28 Q28 30 22 40" fill="#4a3a28" stroke="#2a1a10" stroke-width="0.5"/>'
        ) +
        // 眉毛
        '<line x1="38" y1="42" x2="46" y2="' + (42 + browAngle * 0.3) + '" stroke="#1a1410" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="54" y1="' + (42 + browAngle * 0.3) + '" x2="62" y2="42" stroke="#1a1410" stroke-width="1.5" stroke-linecap="round"/>' +
        // 眼睛
        '<circle cx="42" cy="48" r="2" fill="#1a1410"/>' +
        '<circle cx="58" cy="48" r="2" fill="#1a1410"/>' +
        // 鼻
        '<path d="M50 52 L48 58 L52 58 Z" fill="#8C7424" opacity="0.5"/>' +
        // 嘴
        '<path d="' + mouthPath + '" stroke="#1a1410" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
        // 下巴阴影
        '<path d="M30 70 Q50 80 70 70" stroke="#8C7424" stroke-width="0.5" fill="none" opacity="0.4"/>' +
        // 性格细节
        detail +
        // 编号印章
        '<text x="92" y="95" text-anchor="end" font-family="Special Elite" font-size="6" fill="#A4262C" opacity="0.5">' + prisoner.initials + '</text>' +
      '</svg>';

    $('#portrait-svg').innerHTML = svg;
  }

  /* =================== 大厅渲染 =================== */
  function renderLobby() {
    var grid = $('#case-grid');
    grid.innerHTML = '';
    var progress = loadProgress();

    window.CASES_DATA.forEach(function (c) {
      var p = progress[c.id] || { completed: 0, total: c.stages.length };
      var completedStages = p.completed || 0;
      var totalStages = c.stages.length;
      var pct = Math.round((completedStages / totalStages) * 100);
      var isCompleted = completedStages >= totalStages;

      var card = el('div', { class: 'case-card' + (isCompleted ? ' completed' : '') });
      card.appendChild(el('div', { class: 'case-card-num' }, c.number));
      card.appendChild(el('div', { class: 'case-card-title' }, c.title));
      card.appendChild(el('div', { class: 'case-card-subtitle' }, c.subtitle));

      var prisonerBox = el('div', { class: 'case-card-prisoner' });
      prisonerBox.appendChild(el('div', { class: 'case-card-prisoner-avatar' }, c.prisoner.initials));
      var pinfo = el('div', { class: 'case-card-prisoner-info' });
      pinfo.appendChild(el('div', { class: 'case-card-prisoner-name' }, c.prisoner.name + ' · ' + c.prisoner.age + '岁'));
      pinfo.appendChild(el('div', { class: 'case-card-prisoner-meta' }, c.prisoner.type + ' · ' + c.prisoner.personalityLabel));
      prisonerBox.appendChild(pinfo);
      card.appendChild(prisonerBox);

      card.appendChild(el('div', { class: 'case-card-briefing' }, c.briefing));

      var footer = el('div', { class: 'case-card-footer' });
      var progBox = el('div', { class: 'case-card-progress' });
      progBox.innerHTML = '进度 ' + completedStages + '/' + totalStages +
        ' <span class="progress-bar"><i style="width:' + pct + '%"></i></span>';
      footer.appendChild(progBox);

      var ctaText = isCompleted ? '✓ 已结案 · 重玩' : (completedStages > 0 ? '继续审讯 →' : '开始审讯 →');
      var cta = el('button', { class: 'case-card-cta' }, ctaText);
      cta.addEventListener('click', function (e) {
        e.stopPropagation();
        startCase(c, completedStages);
      });
      footer.appendChild(cta);
      card.appendChild(footer);

      // 档案按钮
      var dossierBtn = el('button', { class: 'btn-ghost', style: 'position:absolute;top:24px;left:24px;font-size:10px;padding:2px 8px;' }, '档案');
      dossierBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openDossier(c);
      });
      card.appendChild(dossierBtn);

      card.addEventListener('click', function () {
        startCase(c, completedStages);
      });
      grid.appendChild(card);
    });
  }

  /* =================== 案件开始 =================== */
  function startCase(c, fromStage) {
    state.currentCase = c;
    state.currentStage = fromStage || 0;
    state.mood = c.stages[state.currentStage].initialMood;
    state.round = 0;
    state.maxRounds = c.stages[state.currentStage].maxRounds || 8;
    state.failedAttempts = 0;      // 重置失败尝试次数
    state.dialogue = [];
    state.unlocked = [];
    state.status = 'playing';
    state.currentTone = null;

    renderRoom();
    switchView('room');

    // 播放阶段开场白
    setTimeout(function () {
      addMessage('system', c.stages[state.currentStage].sceneIntro);
      setTimeout(function () {
        addMessage('prisoner', c.stages[state.currentStage].openingLines[
          Math.floor(Math.random() * c.stages[state.currentStage].openingLines.length)
        ]);
      }, 600);
    }, 300);
  }

  /* =================== 审讯室渲染 =================== */
  function renderRoom() {
    var c = state.currentCase;
    var s = c.stages[state.currentStage];
    $('#room-case-badge').textContent = c.number;
    $('#room-stage-badge').textContent = '阶段 ' + (state.currentStage + 1) + ' / ' + c.stages.length;
    $('#round-counter').textContent = '轮次 ' + state.round + ' / ' + state.maxRounds;
    updateFailedAttemptsDisplay();

    $('#prisoner-name').textContent = c.prisoner.name;
    $('#prisoner-bio').textContent = c.prisoner.bio;

    var tagsBox = $('#prisoner-tags');
    tagsBox.innerHTML = '';
    tagsBox.appendChild(el('span', { class: 'prisoner-tag' }, c.prisoner.type));
    tagsBox.appendChild(el('span', { class: 'prisoner-tag personality' }, c.prisoner.personalityLabel));
    tagsBox.appendChild(el('span', { class: 'prisoner-tag' }, c.prisoner.age + '岁'));

    $('#goal-text').textContent = s.goal;
    $('#hint-text').textContent = s.hint;

    renderPortrait(c.prisoner, state.mood);
    updateMoodMeter();
    renderUnlockedTags();
    renderDialogue();

    // 重置语气选择
    $$('.tone-btn').forEach(function (b) { b.classList.remove('active'); });
    state.currentTone = null;

    $('#player-input').value = '';
    $('#btn-send').disabled = true;
    $('#player-input').focus();
  }

  function updateMoodMeter() {
    var v = Math.max(0, Math.min(100, state.mood));
    $('#mood-value').textContent = v;
    $('#mood-bar-fill').style.width = v + '%';
    renderPortrait(state.currentCase.prisoner, v);
  }

  function updateFailedAttemptsDisplay() {
    var remaining = state.maxFailedAttempts - state.failedAttempts;
    var dots = '';
    for (var i = 0; i < state.maxFailedAttempts; i++) {
      if (i < remaining) {
        dots += '<span>●</span>';
      } else {
        dots += '<span class="used">●</span>';
      }
    }
    $('#attempts-counter').innerHTML = '机会: ' + dots;
  }

  function renderUnlockedTags() {
    var box = $('#unlocked-tags');
    box.innerHTML = '';
    if (state.unlocked.length === 0) {
      box.appendChild(el('span', { class: 'prisoner-tag', style: 'opacity:0.4;' }, '尚无情报'));
    } else {
      state.unlocked.forEach(function (tag) {
        box.appendChild(el('span', { class: 'unlocked-tag' }, '★ ' + tag));
      });
    }
  }

  function renderDialogue() {
    var stream = $('#dialogue-stream');
    stream.innerHTML = '';
    state.dialogue.forEach(function (m) {
      var msgEl = el('div', { class: 'msg msg-' + m.role });
      if (m.role !== 'system') {
        var meta = el('span', { class: 'msg-meta' },
          m.role === 'player' ? '你 · ' + window.ENGINE.toneLabel(m.tone) : c_prisonerName()
        );
        msgEl.appendChild(meta);
      }
      msgEl.appendChild(document.createTextNode(m.text));
      stream.appendChild(msgEl);
    });
    stream.scrollTop = stream.scrollHeight;
  }

  function c_prisonerName() {
    return state.currentCase.prisoner.name;
  }

  function addMessage(role, text, tone) {
    var m = { role: role, text: text };
    if (tone) m.tone = tone;
    state.dialogue.push(m);
    renderDialogue();
  }

  function addTypingIndicator() {
    var stream = $('#dialogue-stream');
    var ind = el('div', { class: 'typing-indicator', id: '__typing' });
    ind.appendChild(el('span'));
    ind.appendChild(el('span'));
    ind.appendChild(el('span'));
    stream.appendChild(ind);
    stream.scrollTop = stream.scrollHeight;
  }

  function removeTypingIndicator() {
    var ind = $('#__typing');
    if (ind) ind.remove();
  }

  /* =================== 玩家输入处理 =================== */
  function sendPlayerMessage() {
    var text = $('#player-input').value.trim();
    if (!text) return;
    if (!state.currentTone) {
      showModal('提示', '请先选择一种语气。');
      return;
    }
    if (state.status !== 'playing') return;

    var tone = state.currentTone;
    addMessage('player', text, tone);
    $('#player-input').value = '';
    $('#btn-send').disabled = true;
    $$('.tone-btn').forEach(function (b) { b.classList.remove('active'); });
    state.currentTone = null;

    state.round++;
    $('#round-counter').textContent = '轮次 ' + state.round + ' / ' + state.maxRounds;

    addTypingIndicator();

    setTimeout(function () {
      var s = state.currentCase.stages[state.currentStage];
      var result = window.ENGINE.generateReply(s, tone, text, state.mood);
      removeTypingIndicator();

      // 应用情绪变化
      state.mood = Math.max(0, Math.min(100, state.mood + (result.moodDelta || 0)));
      updateMoodMeter();

      addMessage('prisoner', result.reply);

      // 解锁标签
      if (result.unlocked && result.unlocked.length > 0) {
        state.unlocked = window.ENGINE.mergeUnlocks(state.unlocked, result.unlocked);
        renderUnlockedTags();
      }

      // 轮次用尽但未达成目标 → 错失目标 Bad End
      if (state.round >= state.maxRounds) {
        setTimeout(function () {
          var achieved = window.ENGINE.isGoalAchieved(state.dialogue, s);
          if (!achieved) {
            triggerBadEnd('round-exhausted');
          } else {
            showModal('轮次用尽', '本阶段轮次已用尽，但目标已达成。\n点击"继续"完成本阶段。', function () {
              advanceStage();
            });
          }
        }, 800);
      }
    }, 800 + Math.random() * 600);
  }

  /* =================== 判断 =================== */
  function judge(claimAchieved) {
    if (state.status !== 'playing') return;
    var s = state.currentCase.stages[state.currentStage];
    var actual = window.ENGINE.isGoalAchieved(state.dialogue, s);

    if (claimAchieved) {
      if (actual) {
        // 正确判断
        flash('green');
        addMessage('system', '【判定正确】目标已达成。');
        setTimeout(function () {
          advanceStage();
        }, 1000);
      } else {
        // 误判：声称达成但实际未达成 → 消耗一次失败机会
        state.failedAttempts++;
        updateFailedAttemptsDisplay();
        
        flash('red');
        addMessage('system', '【判定错误】目标尚未达成。剩余机会：' + (state.maxFailedAttempts - state.failedAttempts));
        
        if (state.failedAttempts >= state.maxFailedAttempts) {
          // 失败次数用尽
          setTimeout(function () {
            triggerBadEnd('misjudge');
          }, 800);
        }
      }
    } else {
      if (actual) {
        // 漏判：实际已达成但玩家选择继续 → 消耗一次失败机会
        state.failedAttempts++;
        updateFailedAttemptsDisplay();
        
        showModal('漏判', '你的问话中其实已经包含了关键信息。\n错过了判断时机，但可以继续。\n剩余机会：' + (state.maxFailedAttempts - state.failedAttempts), function () {});
      } else {
        // 正确：未达成 → 继续
        addMessage('system', '【继续审讯】');
      }
    }
  }

  function advanceStage() {
    var c = state.currentCase;
    var next = state.currentStage + 1;
    if (next >= c.stages.length) {
      // Good End
      triggerGoodEnd();
      return;
    }
    // 进入下一阶段
    state.currentStage = next;
    state.mood = c.stages[next].initialMood;
    state.round = 0;
    state.maxRounds = c.stages[next].maxRounds || 8;
    state.failedAttempts = 0;      // 重置失败尝试次数
    state.dialogue = [];
    state.unlocked = [];
    state.currentTone = null;

    renderRoom();

    setTimeout(function () {
      addMessage('system', c.stages[state.currentStage].sceneIntro);
      setTimeout(function () {
        addMessage('prisoner', c.stages[state.currentStage].openingLines[
          Math.floor(Math.random() * c.stages[state.currentStage].openingLines.length)
        ]);
      }, 600);
    }, 200);
  }

  function triggerGoodEnd() {
    state.status = 'good';
    saveProgress(state.currentCase.id, state.currentCase.stages.length, 'good');
    var c = state.currentCase;
    var totalRounds = 0; // 简化：实际可累加每阶段轮次
    renderEnding(true, c);
    switchView('ending');
  }

  function triggerBadEnd(reason) {
    state.status = 'bad';
    state.badReason = reason;
    saveProgress(state.currentCase.id, state.currentStage, 'bad');
    renderEnding(false, state.currentCase, reason);
    switchView('ending');
  }

  /* =================== 结算页 =================== */
  function renderEnding(isGood, c, reason) {
    var stamp = $('#ending-stamp');
    var title = $('#ending-title');
    var subtitle = $('#ending-subtitle');
    var story = $('#ending-story');
    var stats = $('#ending-stats');

    if (isGood) {
      stamp.textContent = 'CASE CLOSED';
      stamp.className = 'ending-stamp';
      title.textContent = '✓ 案件告破';
      subtitle.textContent = c.number + ' · ' + c.title;
      var stageCount = c.stages.length;
      var storyText = '经过 ' + stageCount + ' 个阶段的审讯，' + c.prisoner.name + '最终承认了所有犯罪事实。\n\n';
      c.stages.forEach(function (s) {
        storyText += '【阶段 ' + s.index + ' · ' + s.title + '】\n' + s.goal + '\n\n';
      });
      storyText += '案件移交检察院。警灯在深夜的走廊里拉出长长的影子。\n你合上案卷，长舒一口气。';
      story.textContent = storyText;
      stats.innerHTML = '<div><span class="stat-value">' + stageCount + '</span>阶段</div>' +
                        '<div><span class="stat-value">✓</span>全判定正确</div>' +
                        '<div><span class="stat-value">' + c.prisoner.name + '</span>认罪</div>';
    } else {
      stamp.textContent = 'WRONG JUDGMENT';
      stamp.className = 'ending-stamp bad';
      title.textContent = '✗ 误 判';
      var reasonText = reason === 'misjudge' ? '你错误地宣称目标已达成。' : '本阶段轮次耗尽，目标未达成。';
      subtitle.textContent = c.number + ' · 阶段 ' + (state.currentStage + 1) + ' · ' + c.stages[state.currentStage].title;
      story.textContent = reasonText + '\n\n嫌疑人的嘴角露出一丝冷笑。\n\n"' + (reason === 'misjudge' ? '警官，你太急了。' : '我早就说过了，你们抓错人了。') + '"\n\n案件陷入僵局，' + c.prisoner.name + '依然没有认罪。';
      stats.innerHTML = '<div><span class="stat-value">✗</span>误判</div>' +
                        '<div><span class="stat-value">阶段 ' + (state.currentStage + 1) + '</span>中断</div>' +
                        '<div><span class="stat-value">' + c.prisoner.name + '</span>未认罪</div>';
    }
  }

  function replayCurrentCase() {
    if (!state.currentCase) return;
    startCase(state.currentCase, 0);
  }

  /* =================== 档案页 =================== */
  function openDossier(c) {
    var progress = loadProgress();
    var p = progress[c.id] || { completed: 0, total: c.stages.length };

    $('#dossier-title').textContent = c.prisoner.name + ' · 嫌疑人档案';
    var content = $('#dossier-content');
    content.innerHTML = '';

    // 基本信息
    var basicSection = el('div', { class: 'dossier-section' });
    basicSection.appendChild(el('div', { class: 'dossier-section-title' }, '基础信息'));
    var basicContent = el('div', { class: 'dossier-section-content' });
    basicContent.innerHTML =
      '<p><b>姓名：</b>' + c.prisoner.name + (c.prisoner.alias ? '（' + c.prisoner.alias + '）' : '') + '</p>' +
      '<p><b>年龄：</b>' + c.prisoner.age + ' 岁</p>' +
      '<p><b>案件：</b>' + c.title + '（' + c.number + '）</p>' +
      '<p><b>涉嫌罪名：</b>' + c.prisoner.crime + '</p>' +
      '<p><b>案件类型：</b>' + c.prisoner.type + '</p>' +
      '<p><b>性格画像：</b>' + c.prisoner.personalityLabel + '</p>';
    basicSection.appendChild(basicContent);
    content.appendChild(basicSection);

    // 背景
    var bioSection = el('div', { class: 'dossier-section' });
    bioSection.appendChild(el('div', { class: 'dossier-section-title' }, '人物背景'));
    bioSection.appendChild(el('div', { class: 'dossier-section-content' }, c.prisoner.bio));
    content.appendChild(bioSection);

    // 案件简报
    var briefSection = el('div', { class: 'dossier-section' });
    briefSection.appendChild(el('div', { class: 'dossier-section-title' }, '案件简报'));
    briefSection.appendChild(el('div', { class: 'dossier-section-content' }, c.briefing));
    content.appendChild(briefSection);

    // 剧情阶段
    var stageSection = el('div', { class: 'dossier-section' });
    stageSection.appendChild(el('div', { class: 'dossier-section-title' }, '审讯阶段'));
    var stageList = el('ol', { class: 'dossier-stages-list' });
    c.stages.forEach(function (s) {
      var li = el('li');
      li.appendChild(el('div', null, s.title));
      var done = (p.completed || 0) >= s.index;
      if (done) li.classList.add('done');
      stageList.appendChild(li);
      var goalLi = el('li', { class: 'goal' });
      goalLi.textContent = s.goal;
      stageList.appendChild(goalLi);
    });
    stageSection.appendChild(stageList);
    content.appendChild(stageSection);

    // 进度
    var progSection = el('div', { class: 'dossier-section' });
    progSection.appendChild(el('div', { class: 'dossier-section-title' }, '结案进度'));
    var progContent = el('div', { class: 'dossier-section-content' });
    progContent.innerHTML = '<p>已完成 <b>' + (p.completed || 0) + '</b> / ' + c.stages.length + ' 阶段</p>' +
      '<div class="dossier-progress-bar">' +
      c.stages.map(function (_, i) {
        return '<span class="' + ((p.completed || 0) >= i + 1 ? 'done' : '') + '"></span>';
      }).join('') + '</div>';
    progSection.appendChild(progContent);
    content.appendChild(progSection);

    switchView('dossier');
  }

  /* =================== 语音输入 =================== */
  function setupSpeech() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var btn = $('#btn-mic');
    if (!SR) {
      btn.title = '当前浏览器不支持语音识别';
      btn.addEventListener('click', function () {
        showModal('不支持语音', '您的浏览器不支持 Web Speech API。\n推荐使用 Chrome 或 Edge。\n您仍可手动输入文字。');
      });
      return;
    }
    var recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = false;
    state.recognition = recognition;

    var baseText = '';

    recognition.onresult = function (e) {
      var interim = '';
      var final = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      $('#player-input').value = baseText + (final || interim);
      $('#btn-send').disabled = !$('#player-input').value.trim();
    };

    recognition.onstart = function () {
      state.isRecording = true;
      btn.classList.add('recording');
      baseText = $('#player-input').value;
    };

    recognition.onend = function () {
      state.isRecording = false;
      btn.classList.remove('recording');
    };

    recognition.onerror = function (e) {
      state.isRecording = false;
      btn.classList.remove('recording');
      if (e.error === 'not-allowed') {
        showModal('麦克风被拒绝', '请在浏览器设置中允许使用麦克风。');
      } else if (e.error === 'no-speech') {
        showModal('未检测到语音', '请重试并确保对着麦克风说话。');
      }
    };

    btn.addEventListener('click', function () {
      if (!state.isRecording) {
        try { recognition.start(); }
        catch (e) {
          showModal('无法启动', '语音识别启动失败：' + e.message);
        }
      } else {
        try { recognition.stop(); } catch (e) {}
      }
    });
  }

  /* =================== 事件绑定 =================== */
  function bindEvents() {
    // 语气选择
    $$('.tone-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.status !== 'playing') return;
        $$('.tone-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.currentTone = btn.dataset.tone;
      });
    });

    // 发送
    $('#btn-send').addEventListener('click', sendPlayerMessage);
    $('#player-input').addEventListener('input', function () {
      $('#btn-send').disabled = !this.value.trim();
    });
    $('#player-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!$('#btn-send').disabled) sendPlayerMessage();
      }
    });

    // 判断
    $('#btn-judge-yes').addEventListener('click', function () { judge(true); });
    $('#btn-judge-no').addEventListener('click', function () { judge(false); });

    // 退出
    $('#btn-exit').addEventListener('click', confirmExit);

    // 结算页
    $('#btn-ending-replay').addEventListener('click', replayCurrentCase);
    $('#btn-ending-lobby').addEventListener('click', backToLobby);

    // 档案页
    $('#btn-dossier-back').addEventListener('click', function () {
      switchView('lobby');
    });

    // 模态点击外部关闭
    $('#modal-mask').addEventListener('click', function (e) {
      if (e.target === this) this.classList.remove('show');
    });
  }

  /* =================== 启动 =================== */
  function init() {
    bindEvents();
    setupSpeech();
    renderLobby();
    switchView('lobby');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
