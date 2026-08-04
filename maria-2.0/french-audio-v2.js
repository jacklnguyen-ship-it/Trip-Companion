(function(){
  var page=document.getElementById('page-french'),status=document.getElementById('french-audio-status');
  if(!page||!status)return;
  var supported='speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined',active=null;
  function setStatus(message,playing){status.textContent=message;status.classList.toggle('is-playing',Boolean(playing))}
  function reset(button){if(!button)return;button.classList.remove('playing');button.setAttribute('aria-pressed','false');button.textContent='🔊'}
  function stop(message){if(supported)window.speechSynthesis.cancel();reset(active);active=null;if(message)setStatus(message,false)}
  function voice(){return window.speechSynthesis.getVoices().find(function(item){return /^fr(?:-|_)/i.test(item.lang||'')})}
  function prepare(){
    page.querySelectorAll('.phrase-play').forEach(function(button){
      var phrase=button.getAttribute('data-french')||'French phrase';
      button.type='button';button.setAttribute('aria-label','Hear French pronunciation: '+phrase);button.setAttribute('aria-pressed','false');
      if(!supported){button.disabled=true}
    });
    setStatus(supported?'Audio ready. Tap a speaker to hear a phrase; tap it again to stop.':'French audio is unavailable in this browser. The written pronunciation guides still work offline.',false);
  }
  prepare();
  page.addEventListener('click',function(event){
    var button=event.target.closest&&event.target.closest('.phrase-play');if(!button||button.disabled)return;
    if(button===active){stop('Audio stopped.');return}
    stop();active=button;
    var phrase=button.getAttribute('data-french'),utterance=new SpeechSynthesisUtterance(phrase);
    utterance.lang='fr-FR';utterance.rate=.78;utterance.pitch=1;var selected=voice();if(selected)utterance.voice=selected;
    button.classList.add('playing');button.setAttribute('aria-pressed','true');button.textContent='■';setStatus('Playing: '+phrase,true);
    utterance.onend=function(){reset(button);if(active===button)active=null;setStatus('Audio ready. Tap another phrase to continue.',false)};
    utterance.onerror=function(){reset(button);if(active===button)active=null;setStatus('Audio could not play. Check your volume, then try Safari or Chrome.',false)};
    window.speechSynthesis.speak(utterance);
  });
  addEventListener('pagehide',function(){stop()});
})();
