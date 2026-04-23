(function () {
  /* ── Animal data ── */
  const ANIMALS = [
    { min: 0, emoji: '🐢', label: 'Turtle', flavor: 'Slow and steady… mostly just slow.' },
    { min: 3, emoji: '🐌', label: 'Snail', flavor: 'Leaving a trail of mediocrity.' },
    { min: 4, emoji: '🐇', label: 'Rabbit', flavor: 'Hopping along nicely!' },
    { min: 6, emoji: '🐆', label: 'Cheetah', flavor: 'Getting faster every day!' },
    { min: 8, emoji: '🦅', label: 'Eagle', flavor: 'Soaring above the average!' },
    { min: 10, emoji: '⚡', label: 'Lightning', flavor: 'Electrifyingly fast!' },
    { min: 12, emoji: '🚀', label: 'Rocket', flavor: 'Are you even human?!' },
  ];
  function getAnimal(sps) {
    let r = ANIMALS[0];
    for (const a of ANIMALS) { if (sps >= a.min) r = a; }
    return r;
  }

  /* ── Constants ── */
  const CIRCUM = 157.08;

  /* ── State ── */
  let totalTime = 10, timeLeft = 10, count = 0;
  let running = false, done = false;
  let interval = null, startTime = null;
  let history = JSON.parse(localStorage.getItem('sb_hist_v3') || '[]');

  /* ── Elements ── */
  const $ = id => document.getElementById(id);
  const pressArea = $('sb-pressArea');
  const label = $('sb-label');
  const countVal = $('sb-countVal');
  const countBox = $('sb-countBox');
  const timerTxt = $('sb-timerTxt');
  const arc = $('sb-arc');
  const spsVal = $('sb-spsVal');
  const result = $('sb-result');
  const emoji = $('sb-emoji');
  const score = $('sb-score');
  const desc = $('sb-desc');
  const animalLbl = $('sb-animalLbl');
  const flavor = $('sb-flavor');
  const resetBtn = $('sb-resetBtn');
  const shareBtn = $('sb-shareBtn');
  const progWrap = $('sb-progWrap');
  const progBar = $('sb-progBar');
  const rippleC = $('sb-rippleC');
  const accordion = $('sb-accordion');
  const accHeader = $('sb-accHeader');
  const badge = $('sb-badge');
  const histTable = $('sb-histTable');
  const histBody = $('sb-histBody');
  const emptyHist = $('sb-emptyHist');
  const clearBtn = $('sb-clearBtn');
  const timeBtns = document.querySelectorAll('.sb-time-btn');

  /* ── Time buttons ── */
  timeBtns.forEach(b => b.addEventListener('click', () => {
    if (running) return;
    totalTime = +b.dataset.time;
    timeLeft = totalTime;
    timerTxt.textContent = totalTime;
    arc.style.strokeDashoffset = 0;
    timeBtns.forEach(x => x.classList.toggle('active', x === b));
  }));

  /* ── Accordion ── */
  accHeader.addEventListener('click', () => accordion.classList.toggle('open'));

  /* ── Clear ── */
  clearBtn.addEventListener('click', () => {
    history = [];
    localStorage.setItem('sb_hist_v3', '[]');
    renderHistory();
  });

  /* ── Ripple ── */
  function ripple(e) {
    const r = document.createElement('div');
    r.className = 'sb-ripple';
    const rect = rippleC.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 0.5;
    let x = rect.width / 2 - size / 2, y = rect.height / 2 - size / 2;
    if (e && e.clientX) { x = e.clientX - rect.left - size / 2; y = e.clientY - rect.top - size / 2; }
    r.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px`;
    rippleC.appendChild(r);
    setTimeout(() => r.remove(), 650);
  }

  /* ── Start ── */
  function startTest() {
    running = true; done = false;
    count = 0; timeLeft = totalTime; startTime = Date.now();
    pressArea.className = 'sb-press-area active';
    progWrap.style.display = 'block';
    result.classList.remove('show');
    countVal.textContent = '0';
    spsVal.textContent = '0.0';
    timerTxt.textContent = totalTime;
    arc.style.strokeDashoffset = 0;
    arc.style.stroke = 'var(--accent)';
    label.textContent = 'Keep pressing ';
    const s1 = document.createElement('strong');
    s1.textContent = 'Space';
    label.appendChild(s1);
    label.appendChild(document.createTextNode('!'));

    interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      timeLeft = totalTime - elapsed;
      if (timeLeft <= 0) { timeLeft = 0; endTest(); return; }
      const frac = timeLeft / totalTime;
      arc.style.strokeDashoffset = CIRCUM * (1 - frac);
      arc.style.stroke = frac < .33 ? 'var(--danger)' : frac < .6 ? '#f5a623' : 'var(--accent)';
      timerTxt.textContent = Math.ceil(timeLeft);
      progBar.style.width = ((1 - frac) * 100) + '%';
      spsVal.textContent = (count / elapsed).toFixed(1);
    }, 60);
  }

  /* ── Press ── */
  function press(e) {
    if (done) { reset(); return; }
    if (!running) startTest();
    count++;
    countVal.textContent = count;
    countBox.classList.remove('bump');
    void countBox.offsetWidth;
    countBox.classList.add('bump');
    pressArea.classList.add('pressed');
    setTimeout(() => pressArea.classList.remove('pressed'), 80);
    ripple(e);
  }

  /* ── End ── */
  function endTest() {
    clearInterval(interval);
    running = false; done = true;
    timerTxt.textContent = '0';
    arc.style.strokeDashoffset = CIRCUM;
    progBar.style.width = '100%';
    progWrap.style.display = 'none';
    pressArea.className = 'sb-press-area done';
    label.textContent = 'Done! Click or press ';
    const s2 = document.createElement('strong');
    s2.textContent = 'Space';
    label.appendChild(s2);
    label.appendChild(document.createTextNode(' to try again.'));

    const sps = count / totalTime;
    const animal = getAnimal(sps);
    spsVal.textContent = sps.toFixed(1);
    emoji.textContent = animal.emoji;
    score.textContent = count;
    desc.textContent = `${sps.toFixed(2)} presses/sec · ${totalTime}s test`;
    animalLbl.textContent = `You are a ${animal.label}!`;
    flavor.textContent = animal.flavor;
    result.classList.add('show');

    const now = new Date();
    history.unshift({
      dt: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        + ', ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      mode: `${totalTime}s`,
      hps: sps.toFixed(2),
      count
    });
    if (history.length > 50) history.pop();
    localStorage.setItem('sb_hist_v3', JSON.stringify(history));
    renderHistory();
  }

  /* ── Reset ── */
  function reset() {
    clearInterval(interval);
    running = done = false; count = 0;
    countVal.textContent = '0';
    spsVal.textContent = '0.0';
    timerTxt.textContent = totalTime;
    arc.style.strokeDashoffset = 0;
    arc.style.stroke = 'var(--accent)';
    label.textContent = 'Click here or press ';
    const s3 = document.createElement('strong');
    s3.textContent = 'Spacebar';
    label.appendChild(s3);
    label.appendChild(document.createTextNode(' to start!'));
    pressArea.className = 'sb-press-area';
    progWrap.style.display = 'none';
    progBar.style.width = '0%';
    result.classList.remove('show');
  }

  /* ── History ── */
  function renderHistory() {
    badge.textContent = history.length;
    if (!history.length) {
      emptyHist.style.display = 'block';
      histTable.style.display = 'none';
      return;
    }
    emptyHist.style.display = 'none';
    histTable.style.display = 'table';
    histBody.textContent = '';
    history.forEach((r, i) => {
      const tr = document.createElement('tr');
      
      const td1 = document.createElement('td');
      td1.textContent = i + 1;
      tr.appendChild(td1);
      
      const td2 = document.createElement('td');
      td2.textContent = r.dt;
      tr.appendChild(td2);
      
      const td3 = document.createElement('td');
      const span = document.createElement('span');
      span.className = 'sb-mode-badge';
      span.textContent = r.mode;
      td3.appendChild(span);
      tr.appendChild(td3);
      
      const td4 = document.createElement('td');
      td4.style.color = 'var(--success)';
      td4.style.fontWeight = '700';
      td4.textContent = r.hps;
      tr.appendChild(td4);
      
      const td5 = document.createElement('td');
      td5.textContent = r.count;
      tr.appendChild(td5);
      
      histBody.appendChild(tr);
    });
  }

  /* ── Events ── */
  pressArea.addEventListener('click', e => press(e));
  pressArea.addEventListener('touchstart', e => { e.preventDefault(); press(e); }, { passive: false });

  /* Only capture spacebar when focus is INSIDE the tool */
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space') return;
    /* If the user is typing in an input/textarea elsewhere, ignore */
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    /* Check focus is within sb-tool or no element is focused */
    const tool = document.getElementById('sb-tool');
    if (document.activeElement && !tool.contains(document.activeElement)
      && document.activeElement !== document.body) return;
    e.preventDefault();
    press(null);
  });

  resetBtn.addEventListener('click', reset);
  shareBtn.addEventListener('click', () => {
    if (!done) return;
    const sps = (count / totalTime).toFixed(1);
    const a = getAnimal(+sps);
    const txt = `I scored ${count} presses in ${totalTime}s (${sps}/sec)! I'm a ${a.emoji} ${a.label}! Can you beat me?`;
    if (navigator.share) navigator.share({ title: 'Spacebar Speed Test', text: txt });
    else navigator.clipboard.writeText(txt).then(() => {
      shareBtn.textContent = '✅ Copied!';
      setTimeout(() => shareBtn.textContent = 'Share Result', 2200);
    });
  });

  /* ── Init ── */
  timerTxt.textContent = totalTime;
  renderHistory();
})();
