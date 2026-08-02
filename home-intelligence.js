(function(){
  var tripStart=new Date(2026,8,7,0,0,0),tripEnd=new Date(2026,8,18,0,0,0);
  var cards=Array.prototype.slice.call(document.querySelectorAll('.home-day[data-open-day]'));
  var nextCard=document.getElementById('home-next-up'),nextTitle=document.getElementById('home-next-title');
  var nextCountdown=document.getElementById('home-next-countdown'),nextTime=document.getElementById('home-next-time');
  var nextDetail=document.getElementById('home-next-detail'),eventsNode=document.getElementById('home-events');
  var alertBox=document.getElementById('kickoff-alert'),dismiss=document.getElementById('kickoff-dismiss');
  var dinnerAlert=document.getElementById('dinner-review-alert'),dinnerDismiss=document.getElementById('dinner-review-dismiss');
  var chatsworthAlert=document.getElementById('chatsworth-time-alert'),chatsworthDismiss=document.getElementById('chatsworth-time-dismiss');
  var events=[];
  var transitExpanded=false,lastNextAt=null;

  function now(){
    if(window.__TRIP_COMPANION_TEST_NOW__)return new Date(window.__TRIP_COMPANION_TEST_NOW__);
    var params=new URLSearchParams(window.location.search),testDate=params.get('testDate');
    var isLocalPreview=window.location.hostname==='127.0.0.1'||window.location.hostname==='localhost';
    if(isLocalPreview&&testDate){
      var previewDate=new Date(testDate);
      if(!Number.isNaN(previewDate.getTime()))return previewDate;
    }
    return new Date();
  }
  function dayIndex(date){
    if(date<tripStart||date>=tripEnd)return-1;
    return Math.floor((new Date(date.getFullYear(),date.getMonth(),date.getDate())-tripStart)/86400000);
  }
  function parseEvents(){
    if(!eventsNode)return[];
    try{
      return JSON.parse(eventsNode.textContent).map(function(event){
        event.at=new Date(event.at);
        return event;
      }).filter(function(event){return!Number.isNaN(event.at.getTime());}).sort(function(a,b){return a.at-b.at;});
    }catch(error){
      if(nextCard){
        nextCard.hidden=false;
        nextTitle.textContent='Schedule unavailable';
        nextCountdown.textContent='Check itinerary';
        nextTime.textContent='The live countdown could not be loaded.';
        nextDetail.textContent='Your full day-by-day itinerary is still available below.';
      }
      return[];
    }
  }
  function formatCountdown(milliseconds){
    var minutes=Math.max(0,Math.ceil(milliseconds/60000));
    if(minutes>=2880){
      var days=Math.floor(minutes/1440),hours=Math.floor((minutes%1440)/60);
      return days+'d '+hours+'h';
    }
    if(minutes>=60)return Math.floor(minutes/60)+'h '+(minutes%60)+'m';
    return minutes+' min';
  }
  function formatEventTime(date){
    return new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(date);
  }
  function escapeHtml(text){
    var div=document.createElement('div');
    div.textContent=text;
    return div.innerHTML;
  }
  function renderToday(current){
    var active=dayIndex(current);
    cards.forEach(function(card,index){
      card.classList.toggle('is-today',index===active);
      card.removeAttribute('aria-current');
      var old=card.querySelector('.today-badge');
      if(old)old.remove();
      if(index===active){
        card.setAttribute('aria-current','date');
        var badge=document.createElement('span');
        badge.className='today-badge';
        badge.textContent='Today';
        card.appendChild(badge);
      }
    });
  }
  function renderNext(current){
    if(!nextCard||!events.length)return;
    var next=events.find(function(event){return event.at>current;});
    nextCard.hidden=false;
    if(current>=tripEnd){
      nextTitle.textContent='Trip complete';
      nextCountdown.textContent='Welcome home';
      nextTime.textContent='Your London and Paris memories are ready to revisit.';
      nextDetail.innerHTML='Use the guide to review favorite places and notes from the trip.';
      return;
    }
    if(!next){
      nextTitle.textContent=current<tripStart?'Your trip begins September 7':'No more timed events';
      nextCountdown.textContent=current<tripStart?'Coming soon':'Enjoy the moment';
      nextTime.textContent=current<tripStart?'Your first live countdown will appear here.':'Check today’s card for flexible plans.';
      nextDetail.innerHTML='';
      return;
    }
    if(lastNextAt!==next.at.getTime()){
      transitExpanded=false;
      lastNextAt=next.at.getTime();
    }
    nextTitle.textContent=next.title;
    nextCountdown.textContent=formatCountdown(next.at-current);
    nextTime.textContent=formatEventTime(next.at);
    var html=escapeHtml(next.detail||'');
    if(next.transit&&next.transit.length){
      html+=' <button type="button" class="home-next-transit-toggle" aria-expanded="'+(transitExpanded?'true':'false')+'">'+(transitExpanded?'Hide full transit details \u2212':'Show full transit details +')+'</button>';
      html+='<ol class="home-next-transit-list"'+(transitExpanded?'':' hidden')+'>'+next.transit.map(function(step){return'<li>'+escapeHtml(step)+'</li>';}).join('')+'</ol>';
    }
    nextDetail.innerHTML=html;
  }
  function alertWasDismissed(){
    try{return sessionStorage.getItem('tripCompanionKickoffAlertDismissed')==='1';}catch(error){return false;}
  }
  function initAlert(){
    if(!alertBox)return;
    alertBox.hidden=alertWasDismissed();
    if(dismiss)dismiss.addEventListener('click',function(){
      alertBox.hidden=true;
      try{sessionStorage.setItem('tripCompanionKickoffAlertDismissed','1');}catch(error){}
    });
  }
  function initDinnerAlert(){
    if(!dinnerAlert)return;
    var dismissed=false;
    try{dismissed=sessionStorage.getItem('tripCompanionDinnerReviewDismissed')==='1';}catch(error){}
    dinnerAlert.hidden=dismissed;
    if(dinnerDismiss)dinnerDismiss.addEventListener('click',function(){
      dinnerAlert.hidden=true;
      try{sessionStorage.setItem('tripCompanionDinnerReviewDismissed','1');}catch(error){}
    });
  }
  function initChatsworthAlert(){
    if(!chatsworthAlert)return;
    var dismissed=false;
    try{dismissed=sessionStorage.getItem('tripCompanionChatsworthTimeDismissed')==='1';}catch(error){}
    chatsworthAlert.hidden=dismissed;
    if(chatsworthDismiss)chatsworthDismiss.addEventListener('click',function(){
      chatsworthAlert.hidden=true;
      try{sessionStorage.setItem('tripCompanionChatsworthTimeDismissed','1');}catch(error){}
    });
  }
  function initTransitToggle(){
    if(!nextDetail)return;
    nextDetail.addEventListener('click',function(e){
      var btn=e.target.closest?e.target.closest('.home-next-transit-toggle'):null;
      if(!btn)return;
      transitExpanded=!transitExpanded;
      render();
    });
  }
  function render(){
    var current=now();
    renderToday(current);
    renderNext(current);
  }

  events=parseEvents();
  initAlert();
  initDinnerAlert();
  initChatsworthAlert();
  initTransitToggle();
  render();
  setInterval(render,60000);
})();
