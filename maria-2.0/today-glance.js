(function(){
  "use strict";

  function escapeHtml(value){
    return String(value==null?"":value).replace(/[&<>"']/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function routeForHeading(routes,heading){
    var text=heading.textContent||"";
    return Object.keys(routes).reduce(function(found,key){
      return found||(text.indexOf(key)>-1?routes[key]:null);
    },null);
  }

  function firstStatus(ticketsHtml){
    if(!ticketsHtml)return null;
    var box=document.createElement("div");
    box.innerHTML=ticketsHtml;
    var span=box.querySelector(".day-status");
    if(!span)return null;
    return {
      text:span.textContent.trim(),
      warn:span.className.indexOf("action")>-1
    };
  }

  function mapSearchUrl(place){
    return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(place);
  }

  function build(){
    var routes=window.TripRoutes,days=window.TripDays,headings=window.TripItineraryHeadings;
    if(!routes||!days||!headings)return;

    headings.forEach(function(heading,i){
      var day=days[i];
      var route=routeForHeading(routes,heading);
      if(!day&&!route)return;

      var status=day?firstStatus(day.tickets):null;
      var meal=(day&&day.food&&day.food[0])?day.food[0]:null;

      var card=document.createElement("div");
      card.className="today-glance";

      var rows="";

      if(route){
        rows+='<div class="today-glance__row"><span class="today-glance__icon" aria-hidden="true">🕒</span><div><span class="today-glance__label">First departure</span><span class="today-glance__value">'+escapeHtml(route.leave)+"</span></div></div>";
        rows+='<div class="today-glance__row"><span class="today-glance__icon" aria-hidden="true">📍</span><div><span class="today-glance__label">First stop</span><span class="today-glance__value">'+escapeHtml(route.destination)+"</span></div></div>";
        rows+='<div class="today-glance__row"><span class="today-glance__icon" aria-hidden="true">🚇</span><div><span class="today-glance__label">Route</span><span class="today-glance__value">'+escapeHtml(route.title)+" · "+escapeHtml(route.time)+"</span></div></div>";
      }
      if(status){
        rows+='<div class="today-glance__row"><span class="today-glance__icon" aria-hidden="true">'+(status.warn?"⚠️":"✅")+'</span><div><span class="today-glance__label">Reservation</span><span class="today-glance__value'+(status.warn?" today-glance__value--warn":"")+'">'+escapeHtml(status.text)+"</span></div></div>";
      }
      if(meal){
        rows+='<div class="today-glance__row"><span class="today-glance__icon" aria-hidden="true">🍽</span><div><span class="today-glance__label">Next meal</span><span class="today-glance__value">'+escapeHtml(meal[0])+"</span></div></div>";
      }

      if(!rows)return;

      var mapTarget=route?route.destination:(meal?meal[2]:null);
      var mapLink=mapTarget?'<a class="today-glance__map" target="_blank" rel="noopener" href="'+mapSearchUrl(mapTarget)+'">Open map →</a>':"";

      card.innerHTML='<p class="today-glance__eyebrow">Today at a glance</p><div class="today-glance__grid">'+rows+"</div>"+mapLink;
      heading.insertAdjacentElement("afterend",card);
    });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",build);
  }else{
    build();
  }
})();
