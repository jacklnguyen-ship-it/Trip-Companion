(function(){
  "use strict";

  var routes={
    "Sept 8":{
      title:"Heathrow → Wombat’s City Hostel",
      summary:"The Elizabeth line is the simplest arrival route and avoids dragging luggage through multiple interchanges.",
      steps:[
        "Follow signs at Heathrow to the Elizabeth line.",
        "Take an eastbound train toward Shenfield or Abbey Wood and get off at Whitechapel.",
        "Walk about 12–15 minutes to Wombat’s, 7 Dock Street. Use a taxi for the final leg if the bags feel heavy."
      ],
      time:"About 60–75 min",
      leave:"After immigration and bags",
      destination:"Wombat's City Hostel London, 7 Dock Street, London",
      origin:"London Heathrow Airport"
    },
    "Sept 9":{
      title:"Wombat’s → Chatsworth House",
      summary:"This is the longest transit morning, with a London Underground connection, an intercity train with one change, and a local bus.",
      steps:[
        "Walk about 8 minutes to Aldgate East.",
        "Take the Hammersmith & City line westbound to King’s Cross St Pancras, then follow signs to St Pancras International.",
        "Take the 06:05 East Midlands Railway service to Leicester (arrive 07:17).",
        "Change trains at Leicester — 26 min transfer. Take the 07:43 East Midlands Railway service to Chesterfield (arrive 08:32).",
        "From Chesterfield Railway Station, take bus 170 toward Bakewell at 09:26 (or walk 10 min into town and catch the same bus at the New Beetwell Street stop at 09:38 for a coffee/breakfast window) and get off at Chatsworth House at 10:10."
      ],
      time:"About 2h30m each way",
      leave:"Target 05:35–05:45 to catch the 06:05 train",
      destination:"Chatsworth House, Bakewell",
      origin:"Wombat's City Hostel London, 7 Dock Street, London",
      legs:[
        {label:"Train out",detail:"06:05 St Pancras → 08:32 Chesterfield (one change en route)"},
        {label:"Bus out",detail:"09:26 Chesterfield → 10:10 Chatsworth House (bus 170)"},
        {label:"Bus back",detail:"5:09 PM Chatsworth House → 5:50 PM Chesterfield"},
        {label:"Train back",detail:"7:13 PM Chesterfield → 9:08 PM St Pancras (direct)"}
      ],
      note:"The House entry is confirmed for 11:00 and you should aim to arrive by 10:45. The 5:50pm–7:13pm window in Chesterfield is a good stretch for dinner (Spa Lane Vaults, The Rectory, or The Railway Inn near the station)."
    },
    "Sept 10":{
      title:"Wombat’s → Wimbledon",
      summary:"Choose the direct District line for the simplest trip, or take the Waterloo route if you would like to add Leake Street Tunnel without adding much time.",
      steps:[
        "Walk about 5 minutes to Tower Hill station.",
        "Take a westbound District line train whose destination display says Wimbledon — no changes required.",
        "At Wimbledon station, take bus 493 toward Richmond and get off near the All England Lawn Tennis Club.",
        "Walk to the museum and tour entrance shown on the ticket."
      ],
      time:"Direct District line: about 47 min to Wimbledon, no changes",
      leave:"Allow 90 min before the tour",
      destination:"All England Lawn Tennis Club, Church Road, London",
      origin:"Wombat's City Hostel London, 7 Dock Street, London",
      alternatives:[{
        title:"Via Waterloo + Leake Street Tunnel",
        summary:"A similarly timed option with a free, colorful street-art detour directly behind Waterloo station.",
        steps:[
          "Walk about 5 minutes from Wombat’s to Tower Hill station.",
          "Take the District line from Tower Hill to Embankment.",
          "Change at Embankment to the Northern line for one stop to Waterloo.",
          "Optional: walk a few minutes to Leake Street Tunnel, the legal graffiti tunnel directly behind Waterloo station.",
          "Return to Waterloo and take a direct South Western Railway train to Wimbledon — about 15 minutes, with no changes.",
          "Continue by local bus or on foot to the All England Lawn Tennis Club, following the ticket directions."
        ],
        time:"About 45–50 min door-to-door including the tunnel stop",
        fare:"Tower Hill → Waterloo: about £2.70 · Waterloo → Wimbledon: about 15 min",
        mapLegs:[
          {
            title:"Part 1: Wombat’s → Leake Street Tunnel",
            origin:"Wombat's City Hostel London, 7 Dock Street, London",
            destination:"Leake Street Tunnel, London"
          },
          {
            title:"Part 2: Leake Street Tunnel → Wimbledon",
            origin:"Leake Street Tunnel, London",
            destination:"All England Lawn Tennis Club, Church Road, London"
          }
        ]
      }]
    },
    "Sept 11":{
      title:"Wombat’s → London Waterloo",
      summary:"Your Winchester train leaves at 07:03, so this is a firm early departure.",
      steps:[
        "Walk about 8 minutes to Aldgate East.",
        "Take the District line westbound to Westminster.",
        "Change to the Jubilee line eastbound for one stop to Waterloo.",
        "Follow National Rail signs and check the departure board for the 07:03 Winchester train."
      ],
      time:"About 35–45 min",
      leave:"Leave by 05:55–06:05",
      destination:"London Waterloo Station",
      origin:"Wombat's City Hostel London, 7 Dock Street, London",
      note:"Build in at least 20 minutes at Waterloo to find the platform; long-distance platforms can be a substantial walk."
    },
    "Sept 12":{
      title:"Wombat’s → Camden Market",
      summary:"Start at Camden Town for the canal walk, then continue north through the market toward the Stables.",
      steps:[
        "Walk about 8 minutes to Aldgate East.",
        "Take the Hammersmith & City line westbound to King’s Cross St Pancras.",
        "Change to the Northern line northbound and get off at Camden Town.",
        "Walk toward Camden Lock and continue into Camden Market."
      ],
      time:"About 35–45 min",
      leave:"08:45 as planned",
      destination:"Camden Market, London",
      origin:"Wombat's City Hostel London, 7 Dock Street, London"
    },
    "Sept 13":{
      title:"Wombat’s → St Pancras International",
      summary:"This is your Eurostar morning; station check-in and security require substantially more time than a normal train.",
      steps:[
        "Walk about 8 minutes to Aldgate East.",
        "Take the Hammersmith & City line westbound directly to King’s Cross St Pancras.",
        "Follow signs through the station to St Pancras International and Eurostar departures.",
        "Have both passports and digital tickets ready before joining the Eurostar queue."
      ],
      time:"About 30–40 min",
      leave:"Leave around 09:15–09:30",
      destination:"St Pancras International, London",
      origin:"Wombat's City Hostel London, 7 Dock Street, London",
      note:"Recheck Eurostar’s recommended arrival time before the trip; do not treat this like a regular domestic train."
    },
    "Sept 14":{
      title:"Paris accommodation → Musée Picasso",
      summary:"No train is needed—the first stop is close enough that walking is faster and simpler.",
      steps:[
        "Leave 8 Rue du Pont aux Choux and walk west through the Marais.",
        "Continue toward Rue de Thorigny and the Hôtel Salé.",
        "Enter Musée Picasso at 5 Rue de Thorigny and have the timed ticket ready."
      ],
      time:"About 10–12 min walking",
      leave:"Leave around 09:10",
      destination:"Musée Picasso Paris, 5 Rue de Thorigny, Paris",
      origin:"8 Rue du Pont aux Choux, Paris",
      mode:"walking"
    },
    "Sept 15":{
      title:"Paris accommodation → Palace of Versailles",
      summary:"Metro line 8 to Invalides followed by RER C is the most straightforward rail route from your Marais base.",
      steps:[
        "Walk about 6 minutes to Chemin Vert station.",
        "Take Metro line 8 toward Balard and get off at Invalides.",
        "Follow signs to RER C and take a westbound train serving Versailles Château–Rive Gauche.",
        "From Versailles Château–Rive Gauche, walk about 10 minutes to the Palace entrance."
      ],
      time:"About 70–85 min",
      leave:"Allow 90 min plus entry buffer",
      destination:"Palace of Versailles, Place d'Armes, Versailles",
      origin:"8 Rue du Pont aux Choux, Paris",
      note:"Confirm the RER C destination on the platform display. Buy the correct Versailles fare—an ordinary central-Paris Metro ticket is not sufficient."
    },
    "Sept 16":{
      title:"Paris accommodation → Musée de la Vie Romantique",
      summary:"Two short Metro rides bring you to Pigalle, followed by a brief walk to the museum.",
      steps:[
        "Walk about 6 minutes to Chemin Vert station.",
        "Take Metro line 8 toward Balard and change at Madeleine.",
        "Take Metro line 12 toward Mairie d’Aubervilliers and get off at Pigalle.",
        "Walk about 7–9 minutes to 16 Rue Chaptal."
      ],
      time:"About 30–35 min",
      leave:"Leave around 08:50",
      destination:"Musée de la Vie Romantique, 16 Rue Chaptal, Paris",
      origin:"8 Rue du Pont aux Choux, Paris"
    },
    "Sept 17":{
      title:"Paris accommodation → Charles de Gaulle Airport",
      summary:"Your morning is flexible, but the first fixed journey is to CDG for the 16:00 flight.",
      steps:[
        "Walk about 12 minutes to République station.",
        "Take Metro line 5 toward Bobigny–Pablo Picasso and get off at Gare du Nord.",
        "Follow signs to RER B and board a train serving Aéroport Charles de Gaulle.",
        "Use the terminal shown in the Delta app or boarding pass; do not rely on an older saved terminal."
      ],
      time:"About 65–80 min",
      leave:"Leave around 11:15–11:30",
      destination:"Paris Charles de Gaulle Airport",
      origin:"8 Rue du Pont aux Choux, Paris",
      note:"RER B can be disrupted. Check the route that morning and switch to a taxi if service problems threaten the three-hour airport buffer."
    }
  };

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g,function(character){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character];
    });
  }

  function directionsUrl(route){
    var mode=route.mode||"transit";
    var url="https://www.google.com/maps/dir/?api=1&origin="+
      encodeURIComponent(route.origin)+"&destination="+
      encodeURIComponent(route.destination)+"&travelmode="+mode;
    if(route.waypoints&&route.waypoints.length)url+="&waypoints="+encodeURIComponent(route.waypoints.join("|"));
    return url;
  }

  var coordsLookup={
    "London Heathrow Airport":[51.4700,-0.4543],
    "Wombat's City Hostel London, 7 Dock Street, London":[51.5092,-0.0722],
    "Chatsworth House, Bakewell":[53.2275,-1.6108],
    "All England Lawn Tennis Club, Church Road, London":[51.4337,-0.2141],
    "London Waterloo Station":[51.5031,-0.1132],
    "Tower Hill Underground Station, London":[51.5105,-0.0762],
    "Leake Street Tunnel, London":[51.5010,-0.1123],
    "Camden Market, London":[51.5415,-0.1466],
    "St Pancras International, London":[51.5320,-0.1233],
    "8 Rue du Pont aux Choux, Paris":[48.8578,2.3625],
    "Musée Picasso Paris, 5 Rue de Thorigny, Paris":[48.8596,2.3624],
    "Palace of Versailles, Place d'Armes, Versailles":[48.8049,2.1204],
    "Musée de la Vie Romantique, 16 Rue Chaptal, Paris":[48.8826,2.3334],
    "Paris Charles de Gaulle Airport":[49.0097,2.5479]
  };

  function citymapperUrl(route){
    var s=coordsLookup[route.origin];
    var e=coordsLookup[route.destination];
    var url="https://citymapper.com/directions?";
    if(s) url+="startcoord="+s[0]+"%2C"+s[1]+"&";
    url+="startname="+encodeURIComponent(route.origin)+"&";
    if(e) url+="endcoord="+e[0]+"%2C"+e[1]+"&";
    url+="endname="+encodeURIComponent(route.destination);
    return url;
  }

  function routeForHeading(heading){
    var text=heading.textContent||"";
    return Object.keys(routes).reduce(function(found,key){
      return found||(text.indexOf(key)>-1?routes[key]:null);
    },null);
  }

  var itinerary=document.getElementById("page-itinerary");
  if(!itinerary)return;

  Array.prototype.forEach.call(itinerary.querySelectorAll(":scope > h2"),function(heading){
    var route=routeForHeading(heading);
    if(!route)return;
    var section=document.createElement("section");
    section.className="daily-transit";
    section.setAttribute("aria-label","Getting to the first scheduled stop");
    var legsHtml="";
    if(route.legs&&route.legs.length){
      legsHtml='<div class="daily-transit__legs">'+route.legs.map(function(leg){
        return '<div class="daily-transit__leg"><span class="daily-transit__leg-label">'+escapeHtml(leg.label)+'</span><span class="daily-transit__leg-detail">'+escapeHtml(leg.detail)+'</span></div>';
      }).join("")+"</div>";
    }
    var alternativesHtml="";
    if(route.alternatives&&route.alternatives.length){
      alternativesHtml='<div class="daily-transit__alternatives">'+route.alternatives.map(function(alternative){
        var mapLegsHtml=(alternative.mapLegs||[]).map(function(leg){
          return '<div class="daily-transit__map-leg"><strong>'+escapeHtml(leg.title)+'</strong>'+
            '<div class="daily-transit__map-actions">'+
            '<a class="daily-transit__link daily-transit__alternative-link" target="_blank" rel="noopener" href="'+directionsUrl(leg)+'">🗺 Google Maps</a>'+
            '<a class="daily-transit__link daily-transit__link--citymapper" target="_blank" rel="noopener" href="'+citymapperUrl(leg)+'">🚇 Citymapper</a></div></div>';
        }).join('');
        return '<details class="daily-transit__alternative"><summary>'+escapeHtml(alternative.title)+'</summary>'+
          '<div class="daily-transit__alternative-body"><p>'+escapeHtml(alternative.summary)+'</p>'+
          '<ol>'+alternative.steps.map(function(step){return '<li>'+escapeHtml(step)+'</li>';}).join('')+'</ol>'+
          '<div class="daily-transit__meta"><span>⏱ '+escapeHtml(alternative.time)+'</span>'+
          (alternative.fare?'<span>🎟 '+escapeHtml(alternative.fare)+'</span>':'')+'</div>'+
          mapLegsHtml+'</div></details>';
      }).join('')+'</div>';
    }
    section.innerHTML=
      '<p class="daily-transit__eyebrow">First journey of the day</p>'+
      '<h3>🚇 '+escapeHtml(route.title)+'</h3>'+
      '<p class="daily-transit__summary">'+escapeHtml(route.summary)+'</p>'+
      legsHtml+
      '<ol class="daily-transit__steps">'+route.steps.map(function(step){return "<li>"+escapeHtml(step)+"</li>";}).join("")+"</ol>"+
      '<div class="daily-transit__meta"><span>⏱ '+escapeHtml(route.time)+'</span><span>🕒 '+escapeHtml(route.leave)+'</span></div>'+
      alternativesHtml+
      (route.note?'<p class="daily-transit__note"><strong>Check before leaving:</strong> '+escapeHtml(route.note)+'</p>':"")+
      '<div class="daily-transit__map-actions">'+
      '<a class="daily-transit__link" target="_blank" rel="noopener" href="'+directionsUrl(route)+'">🗺 '+(route.alternatives?'Direct route in Google Maps':'Google Maps')+' →</a>'+
      '<a class="daily-transit__link daily-transit__link--citymapper" target="_blank" rel="noopener" href="'+citymapperUrl(route)+'">🚇 '+(route.alternatives?'Direct route in Citymapper':'Citymapper')+' →</a></div>';
    heading.insertAdjacentElement("afterend",section);
  });
  window.TripRoutes=routes;
})();
