(function(){
  var map, places=[], markers, userMarker, userLocation, initialized=false, markersByTitle={}, lastSearchedPlace=null;
  var icons={attractions:'📍',food:'🍽️',coffee:'☕',drinks:'🍸',shopping:'🛍️',icecream:'🍦',afternoontea:'🫖',hotel:'🏨',art:'🎨'};
  function milesBetween(a,b){
    var r=3958.8,toRad=Math.PI/180,dLat=(b.lat-a.lat)*toRad,dLng=(b.lng-a.lng)*toRad;
    var x=Math.sin(dLat/2)**2+Math.cos(a.lat*toRad)*Math.cos(b.lat*toRad)*Math.sin(dLng/2)**2;
    return 2*r*Math.asin(Math.sqrt(x));
  }
  function bearingBetween(a,b){
    var toRad=Math.PI/180,toDeg=180/Math.PI;
    var lat1=a.lat*toRad,lat2=b.lat*toRad,dLng=(b.lng-a.lng)*toRad;
    var y=Math.sin(dLng)*Math.cos(lat2);
    var x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLng);
    var brng=(Math.atan2(y,x)*toDeg+360)%360;
    var dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(brng/22.5)%16];
  }
  function cityFor(p){
    if(p.lat>51.2&&p.lat<51.8&&p.lng>-.65&&p.lng<.35)return'london';
    if(p.lat>48.7&&p.lat<49.05&&p.lng>2.05&&p.lng<2.65)return'paris';
    if(p.lat>50.7&&p.lat<51.65&&p.lng>-2.8&&p.lng<-.65)return'daytrips';
    return'other';
  }
  function iconFor(category,isUser){
    return L.divIcon({className:'',html:'<div class="trip-map-icon'+(isUser?' you':'')+'">'+(isUser?'●':(icons[category]||'📍'))+'</div>',iconSize:[32,32],iconAnchor:[16,16],popupAnchor:[0,-16]});
  }
  function directionsUrl(p){
    return'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(p.lat+','+p.lng)+'&travelmode=walking';
  }
  function filteredPlaces(){
    var city=document.getElementById('map-city-filter').value,category=document.getElementById('map-category-filter').value;
    return places.filter(function(p){return(city==='all'||cityFor(p)===city)&&(category==='all'||p.category===category);});
  }
  function popupFor(p){
    var distance=userLocation?'<p><strong>'+milesBetween(userLocation,p).toFixed(1)+' miles from you</strong></p>':'';
    return'<div class="trip-map-popup"><h3>'+p.title+'</h3><p>'+p.address+'</p>'+distance+'<a href="'+directionsUrl(p)+'" target="_blank" rel="noopener">Walking directions</a></div>';
  }
  function updateNearest(list){
    var box=document.getElementById('nearby-place-list');
    if(!userLocation){box.innerHTML='<p>Tap <strong>Use my location</strong> to sort places by distance.</p>';return;}
    var sorted=list.slice().sort(function(a,b){return milesBetween(userLocation,a)-milesBetween(userLocation,b);}).slice(0,8);
    box.innerHTML=sorted.map(function(p){
      var distance=milesBetween(userLocation,p);
      return'<a class="nearby-place" href="'+directionsUrl(p)+'" target="_blank" rel="noopener"><strong>'+(icons[p.category]||'📍')+' '+p.title+'</strong><span>'+distance.toFixed(distance<10?1:0)+' miles away · Directions</span></a>';
    }).join('');
  }
  function render(fit){
    if(!map)return;
    markers.clearLayers();
    markersByTitle={};
    var list=filteredPlaces(),bounds=[];
    list.forEach(function(p){
      var m=L.marker([p.lat,p.lng],{icon:iconFor(p.category,false)}).bindPopup(popupFor(p)).addTo(markers);
      markersByTitle[p.title]=m;
      bounds.push([p.lat,p.lng]);
    });
    if(userMarker){userMarker.addTo(map);bounds.push([userLocation.lat,userLocation.lng]);}
    if(fit&&bounds.length)map.fitBounds(bounds,{padding:[28,28],maxZoom:14});
    document.getElementById('trip-map-status').textContent=list.length+' curated places shown'+(userLocation?' · nearest places sorted below':'');
    updateNearest(list);
  }
  function useLocation(){
    var status=document.getElementById('trip-map-status');
    if(!navigator.geolocation){status.textContent='Location is not available in this browser.';return;}
    status.textContent='Finding your location…';
    navigator.geolocation.getCurrentPosition(function(position){
      userLocation={lat:position.coords.latitude,lng:position.coords.longitude};
      if(userMarker)map.removeLayer(userMarker);
      userMarker=L.marker([userLocation.lat,userLocation.lng],{icon:iconFor('',true)}).bindPopup('<strong>You are here</strong>');
      var nearbyCity=['london','paris','daytrips'].map(function(city){
        var cityPlaces=places.filter(function(p){return cityFor(p)===city;});
        return{city:city,distance:Math.min.apply(null,cityPlaces.map(function(p){return milesBetween(userLocation,p);} ))};
      }).sort(function(a,b){return a.distance-b.distance;})[0];
      if(nearbyCity&&nearbyCity.distance<80)document.getElementById('map-city-filter').value=nearbyCity.city;
      render(true);
      userMarker.openPopup();
      if(lastSearchedPlace)selectPlace(lastSearchedPlace);
    },function(error){
      status.textContent=error.code===1?'Location permission was declined. You can still browse every saved place.':'Your location could not be determined. You can still browse every saved place.';
      render(false);
    },{enableHighAccuracy:true,timeout:12000,maximumAge:300000});
  }
  function selectPlace(p){
    lastSearchedPlace=p;
    var suggestions=document.getElementById('map-search-suggestions'),input=document.getElementById('map-search-input'),result=document.getElementById('map-search-result');
    suggestions.hidden=true;suggestions.innerHTML='';
    input.value=p.title;
    document.getElementById('map-city-filter').value='all';
    document.getElementById('map-category-filter').value='all';
    render(false);
    var distanceHtml;
    if(userLocation){
      var dist=milesBetween(userLocation,p),dir=bearingBetween(userLocation,p);
      distanceHtml='<p><strong>'+dist.toFixed(dist<10?1:0)+' miles '+dir+'</strong> of where you are now</p>';
    }else{
      distanceHtml='<p class="map-search-hint">Tap “Use my location” above to see distance and direction to this pin.</p>';
    }
    result.hidden=false;
    result.innerHTML='<div class="map-search-found"><strong>✓ Already on your list</strong><h4>'+(icons[p.category]||'📍')+' '+p.title+'</h4><p>'+p.address+'</p>'+distanceHtml+'</div>';
    var marker=markersByTitle[p.title];
    if(marker&&map){
      map.setView([p.lat,p.lng],16);
      marker.openPopup();
      var el=marker.getElement();
      if(el){el.classList.add('trip-map-highlight');setTimeout(function(){el.classList.remove('trip-map-highlight');},2600);}
    }
  }
  function showNotFound(query){
    var result=document.getElementById('map-search-result');
    document.getElementById('map-search-suggestions').hidden=true;
    result.hidden=false;
    result.innerHTML='<div class="map-search-notfound"><strong>✗ Not on your list yet</strong><p>No saved place matches “'+query+'”. Ask to have it researched and added.</p></div>';
  }
  function initSearch(){
    var input=document.getElementById('map-search-input'),suggestions=document.getElementById('map-search-suggestions');
    if(!input||input.dataset.bound)return;
    input.dataset.bound='1';
    input.addEventListener('input',function(){
      var q=input.value.trim().toLowerCase();
      document.getElementById('map-search-result').hidden=true;
      if(q.length<2){suggestions.hidden=true;suggestions.innerHTML='';return;}
      var matches=places.filter(function(p){return p.title.toLowerCase().indexOf(q)!==-1;}).slice(0,8);
      suggestions.hidden=false;
      if(!matches.length){suggestions.innerHTML='<div class="map-search-empty">No match found in your saved places.</div>';return;}
      suggestions.innerHTML=matches.map(function(p,i){return'<button type="button" class="map-search-item" data-idx="'+i+'">'+(icons[p.category]||'📍')+' '+p.title+'</button>';}).join('');
      Array.prototype.forEach.call(suggestions.querySelectorAll('.map-search-item'),function(btn,i){
        btn.addEventListener('click',function(){selectPlace(matches[i]);});
      });
    });
    input.addEventListener('keydown',function(e){
      if(e.key!=='Enter')return;
      var q=input.value.trim();
      if(!q)return;
      var qLower=q.toLowerCase();
      var exact=places.find(function(p){return p.title.toLowerCase()===qLower;});
      var partial=places.filter(function(p){return p.title.toLowerCase().indexOf(qLower)!==-1;});
      if(exact)selectPlace(exact);
      else if(partial.length===1)selectPlace(partial[0]);
      else if(partial.length===0)showNotFound(q);
    });
    document.addEventListener('click',function(e){
      if(e.target!==input&&!suggestions.contains(e.target))suggestions.hidden=true;
    });
  }
  async function initialize(){
    if(initialized||!document.getElementById('trip-map'))return;
    initialized=true;
    map=L.map('trip-map',{zoomControl:true}).setView([50.35,1.05],6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    markers=L.layerGroup().addTo(map);
    try{
      var response=await fetch(document.body.dataset.mapData);
      places=await response.json();
      render(true);
    }catch(error){document.getElementById('trip-map-status').textContent='The saved place map could not be loaded. Please refresh while online.';}
    document.getElementById('map-locate').addEventListener('click',useLocation);
    document.getElementById('map-show-all').addEventListener('click',function(){
      document.getElementById('map-city-filter').value='all';document.getElementById('map-category-filter').value='all';render(true);
    });
    document.getElementById('map-city-filter').addEventListener('change',function(){render(true);});
    document.getElementById('map-category-filter').addEventListener('change',function(){render(true);});
    initSearch();
  }
  function onRoute(){if(location.hash==='#page-map')setTimeout(function(){initialize();if(map)map.invalidateSize();},50);}
  window.addEventListener('hashchange',onRoute);document.addEventListener('DOMContentLoaded',onRoute);
})();
