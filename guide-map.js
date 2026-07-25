(function(){
  var map, places=[], markers, userMarker, userLocation, initialized=false;
  var icons={attractions:'📍',food:'🍽️',coffee:'☕',drinks:'🍸',shopping:'🛍️',icecream:'🍦',afternoontea:'🫖',hotel:'🏨',art:'🎨'};
  function milesBetween(a,b){
    var r=3958.8,toRad=Math.PI/180,dLat=(b.lat-a.lat)*toRad,dLng=(b.lng-a.lng)*toRad;
    var x=Math.sin(dLat/2)**2+Math.cos(a.lat*toRad)*Math.cos(b.lat*toRad)*Math.sin(dLng/2)**2;
    return 2*r*Math.asin(Math.sqrt(x));
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
    var list=filteredPlaces(),bounds=[];
    list.forEach(function(p){
      L.marker([p.lat,p.lng],{icon:iconFor(p.category,false)}).bindPopup(popupFor(p)).addTo(markers);
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
    },function(error){
      status.textContent=error.code===1?'Location permission was declined. You can still browse every saved place.':'Your location could not be determined. You can still browse every saved place.';
      render(false);
    },{enableHighAccuracy:true,timeout:12000,maximumAge:300000});
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
  }
  function onRoute(){if(location.hash==='#page-map')setTimeout(function(){initialize();if(map)map.invalidateSize();},50);}
  window.addEventListener('hashchange',onRoute);document.addEventListener('DOMContentLoaded',onRoute);
})();
