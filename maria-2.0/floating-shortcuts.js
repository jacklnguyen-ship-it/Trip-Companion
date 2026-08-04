(function(){
  'use strict';
  var openButton=document.getElementById('audio-shortcut');
  var modal=document.getElementById('audio-shortcut-modal');
  var closeButton=document.getElementById('audio-shortcut-close');
  var list=document.getElementById('audio-shortcut-list');
  var guideNames={
    'audioguide-chatsworth':'Chatsworth House',
    'audioguide-versailles':'Palace of Versailles'
  };
  if(!openButton||!modal||!closeButton||!list)return;
  var lastFocus=null;
  function text(node){return (node&&node.textContent||'').replace(/^🎧\s*Audio Guide:?\s*/i,'').trim();}
  function close(){
    modal.hidden=true;
    document.body.style.overflow='';
    openButton.setAttribute('aria-expanded','false');
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  function open(){
    lastFocus=document.activeElement;
    modal.hidden=false;
    document.body.style.overflow='hidden';
    openButton.setAttribute('aria-expanded','true');
    closeButton.focus();
  }
  function goToGuide(guide){
    var page=guide.closest('.page');
    close();
    if(page&&page.id)location.hash='#'+page.id;
    setTimeout(function(){guide.scrollIntoView({behavior:'smooth',block:'start'});var firstPlay=guide.querySelector('.audio-play-btn');if(firstPlay)firstPlay.focus({preventScroll:true});},80);
  }
  document.querySelectorAll('.audio-guide').forEach(function(guide,index){
    if(!guide.id)guide.id='audio-guide-'+(index+1);
    var page=guide.closest('.page');
    var pageHeading=page&&page.querySelector('h1');
    var guideHeading=guide.querySelector('h2');
    var stops=[];
    try{stops=JSON.parse(guide.getAttribute('data-stops')||'[]');}catch(error){}
    var button=document.createElement('button');
    button.type='button';button.className='audio-shortcut-item';
    var icon=document.createElement('span');icon.className='audio-shortcut-icon';icon.setAttribute('aria-hidden','true');icon.textContent='♫';
    var copy=document.createElement('span');
    var strong=document.createElement('strong');strong.textContent=guideNames[guide.id]||text(guideHeading)||('Audio guide '+(index+1));
    var small=document.createElement('small');small.textContent=(pageHeading?text(pageHeading)+' · ':'')+stops.length+' stops';
    var arrow=document.createElement('span');arrow.className='audio-shortcut-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='›';
    copy.appendChild(strong);copy.appendChild(small);button.appendChild(icon);button.appendChild(copy);button.appendChild(arrow);
    button.addEventListener('click',function(){goToGuide(guide);});
    list.appendChild(button);
  });
  openButton.setAttribute('aria-expanded','false');
  openButton.addEventListener('click',function(){if(modal.hidden)open();else close();});
  document.querySelectorAll('.floating-shortcuts a').forEach(function(link){
    link.addEventListener('click',function(){if(!modal.hidden)close();});
  });
  closeButton.addEventListener('click',close);
  modal.addEventListener('click',function(event){if(event.target===modal)close();});
  document.addEventListener('keydown',function(event){
    if(event.key==='Escape'&&!modal.hidden)close();
    if(event.key==='Tab'&&!modal.hidden){
      var controls=document.querySelectorAll('.floating-shortcuts a,.floating-shortcuts button,#audio-shortcut-modal button:not([disabled])');
      if(!controls.length)return;
      var first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
})();
