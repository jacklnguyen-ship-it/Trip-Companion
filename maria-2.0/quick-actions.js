(function(){
  "use strict";
  var openButton=document.getElementById("quick-actions-open");
  var modal=document.getElementById("quick-actions-modal");
  var closeButton=document.getElementById("quick-actions-close");
  var nextStopLabel=document.getElementById("qa-next-stop-label");
  var nextStopTime=document.getElementById("qa-next-stop-time");
  var directionsLink=document.getElementById("qa-directions-link");
  if(!openButton||!modal||!closeButton)return;

  var tripStart=new Date(2026,8,7,0,0,0);

  function now(){
    if(window.__TRIP_COMPANION_TEST_NOW__)return new Date(window.__TRIP_COMPANION_TEST_NOW__);
    var params=new URLSearchParams(window.location.search),testDate=params.get("testDate");
    var isLocalPreview=window.location.hostname==="127.0.0.1"||window.location.hostname==="localhost";
    if(isLocalPreview&&testDate){
      var previewDate=new Date(testDate);
      if(!Number.isNaN(previewDate.getTime()))return previewDate;
    }
    return new Date();
  }

  function dayLabel(date){
    var diff=Math.floor((new Date(date.getFullYear(),date.getMonth(),date.getDate())-new Date(tripStart.getFullYear(),tripStart.getMonth(),tripStart.getDate()))/86400000);
    if(diff<0||diff>10)return null;
    var d=new Date(tripStart.getFullYear(),tripStart.getMonth(),tripStart.getDate()+diff);
    return "Sept "+d.getDate();
  }

  function directionsUrl(route){
    var mode=route.mode||"transit";
    return "https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(route.origin)+"&destination="+encodeURIComponent(route.destination)+"&travelmode="+mode;
  }

  function renderNextStop(){
    if(!nextStopLabel||!nextStopTime||!directionsLink)return;
    var routes=window.TripRoutes;
    var label=dayLabel(now());
    var route=label&&routes?routes[label]:null;
    if(route){
      nextStopLabel.textContent=route.destination;
      nextStopTime.textContent=route.leave;
      directionsLink.href=directionsUrl(route);
      directionsLink.setAttribute("aria-disabled","false");
    }else{
      nextStopLabel.textContent="Check the itinerary";
      nextStopTime.textContent="No timed departure logged for today";
      directionsLink.href="#page-map";
      directionsLink.removeAttribute("target");
    }
  }

  var lastFocus=null;
  function close(){
    modal.hidden=true;
    document.body.style.overflow="";
    openButton.setAttribute("aria-expanded","false");
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  function open(){
    renderNextStop();
    lastFocus=document.activeElement;
    modal.hidden=false;
    document.body.style.overflow="hidden";
    openButton.setAttribute("aria-expanded","true");
    closeButton.focus();
  }

  openButton.setAttribute("aria-expanded","false");
  openButton.addEventListener("click",function(){if(modal.hidden)open();else close();});
  closeButton.addEventListener("click",close);
  modal.addEventListener("click",function(event){if(event.target===modal)close();});
  document.querySelectorAll(".quick-actions-modal a").forEach(function(link){
    link.addEventListener("click",function(){close();});
  });
  document.addEventListener("keydown",function(event){
    if(event.key==="Escape"&&!modal.hidden)close();
  });
})();
