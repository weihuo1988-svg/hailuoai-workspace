 = 'block';
  await wait(1800);
  startChat();
}

// ===== 对话 =====
// 问题池（18道，6类）
var QPOOL = [
  function(e){return '我看到这幅画里有"'+(e[0]||'这里')+'"！能给这幅画起个名字吗？🎨';},
  function(){return '这幅画画的是什么场景呀？给我讲讲吧 🌈';},
  function(){return '你画这个的时候，最先想画的是什么？✨';},
  function(){return '你最喜欢哪个部分？为什么最喜欢它？✨';},
  function(){return '哪个颜色是你自己选的？为什么选这个？🎨';},
  function(){return '这部分花了多长时间画的？💪';},
  function(){return '画里这个小家伙在做什么？它开心吗？🌈';},
  function(){return '这幅画的故事，是什么时候发生的呀？☀️';},
  function(){return '如果画里的东西能动起来，会发生什么？🦄';},
  function(){return '你画这幅画的时候，心情怎么样？😊';},
  function(){return '画完之后，你满意吗？最满意哪一点？🌟';},
  function(){return '这幅画你想给谁看呀？为什么？💌';},
  function(){return '下次再画类似的，还想加点什么？🚀';},
  function(){return '画里有没有什么是你自己想象出来的？✨';},
  function(){return '如果下雨了，画里会变成什么样？☔';},
  function(){return '画的时候遇到困难了吗？怎么解决的？💡';},
  function(){return '和以前画的比起来，这幅有什么不一样？🌱';},
  function(){return '你觉得自己是个有想象力的小画家吗？💜';},
];

function pickQ() {
  var avail = [];
  for (var i = 0; i < QPOOL.length; i++) if (usedQ.indexOf(i) < 0) avail.push(i);
  if (avail.length === 0) { usedQ = []; return pickQ(); }
  var idx = avail[Math.floor(Math.random() * avail.length)];
  usedQ.push(idx);
  return QPOOL[idx](S.els);
}

function startChat() {
  document.getElementById('step2').classList.remove('on');
  document.getElementById('step3').classList.add('on');
  goStep(3);
  S.qCount = 0; S.conv = []; usedQ = []; S.sumReady = false;
  document.getElementById('chatMsgs').innerHTML = '';
  document.getElementById('historyItems').innerHTML = '';
  document.getElementById('historyBox').classList.remove('on');
  document.getElementById('sumBtn').style.display = 'none';

  var els = S.els.slice(0, 3).join('和');
  var intro = S.els.length > 0 && S.els[0] !== '画里的有趣内容'
    ? '这幅画好有意思！我看到里面有"' + els + '"呢，好想知道更多！'
    : '这幅画太有想象力了！让我来问你几个问题，探索你画里的小世界吧 🎨';
  addMsg(intro, 'intro');
  setTimeout(function() { askQ(); }, 1000);
}

function askQ() {
  var txt = pickQ();
  S.curQ = txt; S.qCount++;
  document.getElementById('chatStatus').textContent = '问题 ' + S.qCount;
  updTip(S.qCount);
  addMsg(txt, 'question');
}

function addMsg(text, type) {
  var msgs = document.getElementById('chatMsgs');
  var d = document.createElement('div');
  d.className = type === 'question' ? 'ma' : 'ma';
  var q = type === 'question' ? '<div class="mb-q">'+text+'</div>' : '<div>'+text+'</div>';
  var h = type === 'question' ? '<div class="mb-h">💡 请爸爸妈妈帮忙输入孩子的回答</div>' : '';
  d.innerHTML = '<div class="ma-a">🤖</div><div class="mb">'+q+h+'</div>';
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
}

async function sendAnswer() {
  var inp = document.getElementById('answerInput');
  var ans = inp.value.trim();
  if (!ans) return;
  var msgs = document.getElementById('chatMsgs');
  var pd = document.createElement('div'); pd.className = 'mp';
  pd.innerHTML = '<div class="mp-a">👨‍👩‍👧</div><div class="mb">'+ escHtml(ans) +'</div>';
  msgs.appendChild(pd); msgs.scrollTop = msgs.scrollHeight;
  inp.value = ''; inp.style.height = 'auto';
  S.conv.push({ q: S.curQ, a: ans });
  updHist();
  document.getElementById('sumBtn').style.display = '';
  S.sumReady = true;
  document.getElementById('chatStatus').textContent = '🤔 在想下一个问题…';
  await wait(700);
  var fu = genFu(S.curQ, ans);
  S.curQ = fu; S.qCount++;
  document.getElementById('chatStatus').textContent = '问题 ' + S.qCount;
  var fd = document.createElement('div'); fd.className = 'ma';
  fd.innerHTML = '<div class="ma-a">🤖</div><div class="mb"><div class="mb-q">'+fu+'</div><div class="mb-h">💡 请爸爸妈妈帮忙输入孩子的回答</div></div>';
  msgs.appendChild(fd); msgs.scrollTop = msgs.scrollHeight;
}

function genFu(q, a) {
  var s = a.trim();
  if (s.length < 6) return '还有呢？还有吗？😊';
  if (q.indexOf('名字') > -1) return '这个名字好棒！有什么特别的意思吗？✨';
  if (q.indexOf('颜色') > -1) return '这个颜色好特别！为什么选它呀？🎨';
  if (q.indexOf('心情') > -1 || q.indexOf('开心') > -1) return '听起来你很享受！最有意思的是哪一步？🌟';
  if (q.indexOf('想象') > -1) return '这个创意是你自己想出来的吗？💡';
  if (q.indexOf('困难') > -1) return '真棒！遇到困难还能想办法，下次想更上一层楼吗？🚀';
  if (q.indexOf('给谁') > -1) return '收到这份礼物的ta一定会很开心！想说点什么吗？💌';
  var ds = ['你这样说好有意思！能再多说一点吗？😊','还有呢？还有吗？🌟','为什么会这样想呀？💡','听起来好有创意！是从哪里得到灵感的？✨'];
  return ds[Math.floor(Math.random() * ds.length)];
}

function updHist() {
  document.getElementById('historyBox').classList.add('on');
  var h = '';
  for (var i = 0; i < S.conv.length; i++) {
    var q = escHtml(S.conv[i].q).slice(0, 20);
    var a = escHtml(S.conv[i].a);
    h += '<div class="hi"><div class="hiq">'+q+'…</div><div class="hia">'+a+'</div></div>';
  }
  document.getElementById('historyItems').innerHTML = h;
}

function updTip(n) {
  var ts = [
    {s:'🎯 描述技巧',t:'先让孩子自己说，不急着评价对错'},
    {s:'🔍 聚焦技巧',t:'带孩子注意细节："这部分的形状好特别！它是什么形状的？"'},
    {s:'📖 叙事技巧',t:'引导描述故事发展："然后呢？发生了什么？结果呢？结局是什么？"'},
    {s:'💜 感受技巧',t:'共情创作感受："我感觉到你很享受！这是你想象中的世界吗？其中藏了什么秘密？"'},
    {s:'🚀 创意技巧',t:'打开想象空间，不设限："如果…会怎样？还可以怎么改进？其中你最喜欢哪部分？"'},
    {s:'🌱 回顾技巧',t:'鼓励反思与成长，肯定努力过程'},
  ];
  var t = ts[(n - 1) % ts.length];
  document.getElementById('tipStage').textContent = t.s;
  document.getElementById('tipContent').innerHTML =
    '<div class="ti"><div class="tii">👀</div><div class="tit">'+t.t+'</div></div>'+
    '<div class="ti"><div class="tii">🌟</div><div class="tit">多用"还有呢？还有吗？"延续对话</div></div>'+
    '<div class="ti"><div class="tii">💜</div><div class="tit">肯定孩子的表达，不否定、不修改</div></div>';
}

document.getElementById('newQBtn').onclick = askQ;
document.getElementById('sendBtn').onclick = sendAnswer;
document.getElementById('answerInput').onkeydown = function(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); sendAnswer(); }
};

// ===== 创意总结 =====
async function genSummary() {
  var mo = document.getElementById('sumMo');
  mo.classList.add('on');
  document.getElementById('sumText').textContent = '';
  document.getElementById('sumLoad').style.display = '';
  document.getElementById('sumActs').style.display = 'none';
  var apiKey = localStorage.getItem('mc_api_key');
  if (apiKey && S.conv.length > 0) {
    try {
      var qa = S.conv.map(function(c){ return '问：'+c.q.replace(/<[^>]+>/g,'')+' 答：'+c.a; }).join('\n');
      var pay = {model:'MiniMax-Text-01',stream:false,messages:[{role:'user',content:'你是一位温暖有爱的家长，根据以下对话以家长第一人称写60-90字朋友圈文案，风格阳光温暖口语化，体现孩子创造力和想象力，包含孩子说的一句话或创意细节，结尾暗示"陪伴是最好的教育"。直接输出文案不要前缀。\n'+qa}]};
      var resp = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},body:JSON.stringify(pay)});
      if (!resp.ok) throw new Error();
      var dat = await resp.json();
      curSum = ((dat.choices&&dat.choices[0]&&dat.choices[0].message&&dat.choices[0].message.content)||'').trim().replace(/^["']|["']$/g,'');
    } catch(e) { curSum = buildTpl(); }
  } else {
    await wait(1200); curSum = buildTpl();
  }
  document.getElementById('sumLoad').style.display = 'none';
  document.getElementById('sumText').textContent = curSum || '请先完成一轮对话再生成总结。';
  document.getElementById('sumActs').style.display = 'flex';
}

function buildTpl() {
  if (S.conv.length === 0) return '';
  var ans = S.conv.map(function(c){return c.a;}).join(' ');
  var ws = (ans.match(/[^\s，。！？、]{2,8}/g)||[]);
  var u = [], seen = {};
  for (var j=0;j<ws.length;j++) if (!seen[ws[j]]&&ws[j].length>=2) { seen[ws[j]]=true; u.push(ws[j]); }
  var top = u.slice(0,4);
  var el = S.els[0]||'画里的内容';
  var ts = [
    '今天陪孩子一起看了ta的画，听ta讲画里的故事——"'+(top[0]||el)+'"，每一个细节都是小小的世界。原来孩子的脑袋里，装着这么多我没想过的东西。蹲下来倾听，才能看见孩子的世界。感谢这次对话，和ta一起成长。',
    '孩子指着这幅画说"'+(top[0]||el)+'"，我追问了一下，发现ta的脑子里有一整个宇宙。简单又笃定，是我早就丢了的东西。记录这一刻，保持好奇，和孩子一起。',
    '画画的时候，孩子眼里有光。问ta为什么这样画，ta说"'+(top[0]||'因为想')+'"。简单又笃定，是我早就丢了的东西。记录这一刻，和孩子一起，保持想象。',
  ];
  return ts[Math.floor(Math.random()*ts.length)];
}

function closeSum() { document.getElementById('sumMo').classList.remove('on'); }

function copySum() {
  if (!curSum) return;
  var t = document.createElement('textarea'); t.value = curSum;
  document.body.appendChild(t); t.select(); document.execCommand('copy');
  document.body.removeChild(t); toast('创意文案已复制！去发朋友圈吧 🎉');
}

// ===== 导出 =====
function exportLog() {
  if (S.conv.length === 0) { toast('还没有对话，先聊聊吧！'); return; }
  var today = new Date().toLocaleDateString('zh-CN');
  var text = '🎨 小画家对话记录\n日期：'+today+'\n画作元素：'+S.els.join('、')+'\n'+'================================================================\n\n';
  for (var i=0;i<S.conv.length;i++) {
    text += '问题'+(i+1)+'：'+S.conv[i].q.replace(/<[^>]+>/g,'')+'\n回答'+(i+1)+'：'+S.conv[i].a+'\n\n';
  }
  text += '================================================================\n💡 引导小结：多用"为什么"和"还有呢"延续对话，倾听时保持眼神接触，肯定创作过程而非结果。\n\n由「小画家对话助手」生成';
  var t = document.createElement('textarea'); t.value = text;
  document.body.appendChild(t); t.select(); document.execCommand('copy');
  document.body.removeChild(t); toast('对话记录已复制！📋');
}

// ===== API Key =====
function skipKey() { document.getElementById('apiMo').classList.remove('on'); runAnalysis(); }
function saveKey() {
  var k = document.getElementById('apiKeyInput').value.trim();
  if (k) localStorage.setItem('mc_api_key', k);
  document.getElementById('apiMo').classList.remove('on');
  runAnalysis();
}

// ===== 工具 =====
function wait(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('on');
  setTimeout(function(){ t.classList.remove('on'); }, 2800);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

document.querySelectorAll('.mo').forEach(function(el){
  el.addEventListener('click', function(e){ if (e.target === el) el.classList.remove('on'); });
});

})();
</script>
</body>
</html>
