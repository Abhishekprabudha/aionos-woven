(() => {
  const ui = {
    video: document.getElementById('film'), cover: document.getElementById('coverArt'),
    start: document.getElementById('startCard'), play: document.getElementById('playBtn'),
    restart: document.getElementById('restartBtn'), next: document.getElementById('nextBtn'),
    timeline: document.getElementById('timeline'), elapsed: document.getElementById('elapsed'),
    remaining: document.getElementById('remaining'), chapter: document.getElementById('sceneChapter'),
    title: document.getElementById('sceneTitle'), kicker: document.getElementById('sceneKicker'),
    caption: document.getElementById('captionText'), rail: document.getElementById('outcomeRail'),
    grid: document.getElementById('agentGrid'), counter: document.getElementById('sceneCounter'),
    chapterLabel: document.getElementById('chapterLabel'), browser: document.getElementById('chapterBrowser'),
    narrationToggle: document.getElementById('narrationToggle'), captionToggle: document.getElementById('captionToggle'),
    voice: document.getElementById('voiceSelect'), fullscreen: document.getElementById('fullscreenBtn'),
    stage: document.getElementById('filmStage'), narrationPanel: document.getElementById('narrationPanel'),
    ticks: document.getElementById('chapterTicks')
  };

  let story, scenes, index = 0, playing = false, sceneStart = 0, sceneTimer = null;
  let elapsedBeforeScene = 0, voices = [], chosenVoice = null;
  const allAgents = ['HR Ground Ops','Last Mile','NX Hero','Procurement','UniFleet','Warehouse Vision','Dashcam Intelligence','Journey Agent','Signal Agent','Annotation','Policy Engine','No-code Flow'];

  const pad = n => String(n).padStart(2,'0');
  const fmt = s => `${pad(Math.floor(s/60))}:${pad(Math.floor(s%60))}`;
  const durationTo = i => scenes.slice(0,i).reduce((a,s)=>a+s.duration,0);
  const totalDuration = () => scenes.reduce((a,s)=>a+s.duration,0);

  async function init(){
    story = await fetch('data/story.json').then(r=>r.json());
    scenes = story.scenes;
    buildBrowser(); buildTicks(); populateVoices();
    speechSynthesis.addEventListener?.('voiceschanged', populateVoices);
    showScene(0, false);
    requestAnimationFrame(updateClock);
  }

  function populateVoices(){
    voices = speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('en'));
    if(!voices.length) return;
    const preferred = ['Microsoft Aria','Microsoft Guy','Google UK English Female','Google US English','Samantha'];
    chosenVoice = preferred.map(p=>voices.find(v=>v.name.includes(p))).find(Boolean) || voices[0];
    ui.voice.innerHTML = voices.map((v,i)=>`<option value="${i}" ${v===chosenVoice?'selected':''}>${v.name}</option>`).join('');
  }

  function buildBrowser(){
    ui.browser.innerHTML = scenes.map((s,i)=>`<button class="chapter-button" data-index="${i}"><b>${s.chapter}</b><span>${s.title}</span></button>`).join('');
    ui.browser.addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) jumpTo(+b.dataset.index); });
  }
  function buildTicks(){ ui.ticks.innerHTML = scenes.map(()=>'<i></i>').join(''); }

  function showScene(i, autoPlay = playing){
    clearTimeout(sceneTimer); speechSynthesis.cancel();
    index = Math.max(0, Math.min(i, scenes.length-1));
    const s = scenes[index]; elapsedBeforeScene = durationTo(index); sceneStart = performance.now();
    ui.chapter.textContent = s.chapter; ui.chapterLabel.textContent = s.chapter;
    ui.title.textContent = s.title; ui.kicker.textContent = s.kicker; ui.caption.textContent = s.narration;
    ui.counter.textContent = `${pad(index+1)} / ${pad(scenes.length)}`;
    ui.rail.innerHTML = s.outcomes.map(o=>`<span class="outcome-pill">${o}</span>`).join('');
    ui.grid.innerHTML = allAgents.slice(0,8).map(a=>`<div class="agent-chip ${s.activeAgents.some(x=>x.toLowerCase().includes(a.split(' ')[0].toLowerCase())) || s.activeAgents.includes('All agents') ? 'active':''}">${a}</div>`).join('');
    document.querySelectorAll('.chapter-button').forEach((b,n)=>b.classList.toggle('active',n===index));
    if(s.video){
      ui.cover.style.opacity = '0'; ui.video.style.opacity = '1';
      if(!ui.video.src.endsWith(s.video.replace(/^.*\//,''))) ui.video.src = s.video;
      ui.video.currentTime = 0; ui.video.load();
    } else {
      ui.video.pause(); ui.video.removeAttribute('src'); ui.video.load();
      ui.video.style.opacity = '0'; ui.cover.style.opacity = '1';
    }
    if(autoPlay) playCurrent(); else updatePlayButton();
  }

  function playCurrent(){
    playing = true; ui.start.classList.add('is-hidden'); updatePlayButton();
    const s = scenes[index]; sceneStart = performance.now();
    if(s.video) ui.video.play().catch(()=>{});
    speak(s.narration);
    sceneTimer = setTimeout(()=>advance(), s.duration*1000);
  }

  function pause(){
    playing = false; ui.video.pause(); speechSynthesis.pause(); clearTimeout(sceneTimer); updatePlayButton();
  }
  function resume(){
    playing = true; ui.video.play().catch(()=>{}); speechSynthesis.resume();
    const s=scenes[index]; const remaining=Math.max(500,(s.duration-ui.video.currentTime)*1000);
    sceneTimer=setTimeout(()=>advance(),remaining); updatePlayButton();
  }
  function toggle(){ playing ? pause() : (ui.video.currentTime>0 ? resume() : playCurrent()); }
  function advance(){
    if(index < scenes.length-1) showScene(index+1,true); else { playing=false; updatePlayButton(); }
  }
  function jumpTo(i){ showScene(i,playing); if(playing) playCurrent(); }
  function restart(){ showScene(0,true); }

  function speak(text){
    if(!ui.narrationToggle.checked || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = chosenVoice; u.rate = 1.06; u.pitch = 0.96; u.volume = 1;
    speechSynthesis.speak(u);
  }
  function updatePlayButton(){ ui.play.textContent = playing ? 'Ⅱ' : '▶'; }

  function updateClock(){
    const sceneElapsed = playing ? Math.min(scenes[index].duration,(performance.now()-sceneStart)/1000) : (ui.video.currentTime||0);
    const absolute = Math.min(totalDuration(),elapsedBeforeScene+sceneElapsed);
    ui.timeline.value = Math.round(absolute/totalDuration()*1000);
    ui.elapsed.textContent = fmt(absolute); ui.remaining.textContent = `-${fmt(totalDuration()-absolute)}`;
    requestAnimationFrame(updateClock);
  }

  ui.start.addEventListener('click',()=>playCurrent()); ui.play.addEventListener('click',toggle);
  ui.restart.addEventListener('click',restart); ui.next.addEventListener('click',advance);
  ui.voice.addEventListener('change',()=>{ chosenVoice=voices[+ui.voice.value]||voices[0]; });
  ui.captionToggle.addEventListener('change',()=>ui.narrationPanel.style.opacity=ui.captionToggle.checked?'1':'0');
  ui.narrationToggle.addEventListener('change',()=>{ if(!ui.narrationToggle.checked) speechSynthesis.cancel(); else if(playing) speak(scenes[index].narration); });
  ui.fullscreen.addEventListener('click',()=>ui.stage.requestFullscreen?.());
  ui.timeline.addEventListener('change',()=>{
    const target=(+ui.timeline.value/1000)*totalDuration(); let acc=0,i=0;
    for(;i<scenes.length;i++){ if(target<acc+scenes[i].duration) break; acc+=scenes[i].duration; }
    showScene(Math.min(i,scenes.length-1),playing); if(playing) playCurrent();
  });
  document.addEventListener('keydown',e=>{ if(e.code==='Space'){e.preventDefault();toggle();} if(e.key==='ArrowRight')advance(); if(e.key==='Home')restart(); });
  init().catch(err=>{ ui.caption.textContent='Unable to load the story configuration. Run through a local web server or GitHub Pages.'; console.error(err); });
})();
