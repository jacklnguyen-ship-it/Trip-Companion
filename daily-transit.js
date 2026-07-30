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
      summary:"This is the longest transit morning, with a London Underground connection, an intercity train and a local bus.",
      steps:[
        "Walk about 8 minutes to Aldgate East.",
        "Take the Hammersmith & City line westbound to King’s Cross St Pancras, then follow signs to St Pancras International.",
        "Take the booked/selected East Midlands Railway service to Sheffield.",
        "From Sheffield Interchange, take bus 218 toward Bakewell and get off at Chatsworth House."
      ],
      time:"About 3 hr each way",
      leave:"Target 04:35–04:45 for the 10:30 entry",
      destination:"Chatsworth House, Bakewell",
      origin:"Wombat's City Hostel London, 7 Dock Street, London",
      note:"The House entry is confirmed for 10:30 and you should aim to arrive by 10:15. Confirm the intercity train and bus 218 schedules shortly before travel; the bus is much less frequent than London transit."
    },
    "Sept 10":{
      title:"Wombat’s → Wimbledon",
      summary:"The District line offers the cleanest cross-city route; make sure the destination display says Wimbledon.",
      steps:[
        "Walk about 8 minutes to Aldgate East.",
        "Take a westbound District line train whose destination is Wimbledon.",
        "At Wimbledon station, take bus 493 toward Richmond and get off near the All England Lawn Tennis Club.",
        "Walk to the museum and tour entrance shown on the ticket."
      ],
      time:"About 65–80 min",
      leave:"Allow 90 min before the tour",
      destination:"All England Lawn Tennis Club, Church Road, London",
      origin:"Wombat's City Hostel London, 7 Dock Street, London"
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
    return "https://www.google.com/maps/dir/?api=1&origin="+
      encodeURIComponent(route.origin)+"&destination="+
      encodeURIComponent(route.destination)+"&travelmode="+mode;
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
    section.innerHTML=
      '<p class="daily-transit__eyebrow">First journey of the day</p>'+
      '<h3>🚇 '+escapeHtml(route.title)+'</h3>'+
      '<p class="daily-transit__summary">'+escapeHtml(route.summary)+'</p>'+
      '<ol class="daily-transit__steps">'+route.steps.map(function(step){return "<li>"+escapeHtml(step)+"</li>";}).join("")+"</ol>"+
      '<div class="daily-transit__meta"><span>⏱ '+escapeHtml(route.time)+'</span><span>🕒 '+escapeHtml(route.leave)+'</span></div>'+
      (route.note?'<p class="daily-transit__note"><strong>Check before leaving:</strong> '+escapeHtml(route.note)+'</p>':"")+
      '<a class="daily-transit__link" target="_blank" rel="noopener" href="'+directionsUrl(route)+'">Open live directions →</a>';
    heading.insertAdjacentElement("afterend",section);
  });
})();
