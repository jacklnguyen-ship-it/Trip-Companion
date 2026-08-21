(function(){
  'use strict';
  var stateKey='trip-companion-picnic-v1';
  var favoriteKey='trip-companion-french-favorites-v1';
  function load(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback;}catch(error){return fallback;}}
  function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(error){}}
  function esc(value){return String(value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}

  var everyday=[
    ['Ça marche.','That works / sounds good.','sah marsh'],['Tout à fait.','Absolutely.','too tah feh'],['Pas de souci.','No problem.','pah duh soo-see'],['Tant mieux.','That’s great / all the better.','tahn myuh'],['Tant pis.','Too bad / never mind.','tahn pee'],['Ça vaut le coup.','It’s worth it.','sah voh luh koo'],['Pourquoi pas ?','Why not?','poor-kwah pah']
  ];
  var dayPhrases={
    '2026-09-13':{title:'Paris arrival',phrases:['Bonsoir','Nous avons une réservation au nom de Nguyen.','Une table pour deux, s’il vous plaît.']},
    '2026-09-14':{title:'Le Marais & historic Paris',phrases:['Je voudrais deux croissants, s’il vous plaît.','Deux billets, s’il vous plaît.','Où sont les toilettes ?']},
    '2026-09-15':{title:'Versailles',phrases:['Ce train va à Versailles ?','Deux billets, s’il vous plaît.','Où sont les toilettes ?']},
    '2026-09-16':{title:'Picnic & Paris evening',phrases:['Nous préparons un pique-nique pour deux.','Qu’est-ce que vous recommandez ?','Pouvez-vous les emballer séparément ?']},
    '2026-09-17':{title:'Departure day',phrases:['À emporter, s’il vous plaît.','Quelle ligne pour aller à… ?','Merci beaucoup']}
  };
  function phraseCard(phrase){return '<div class="phrase-card"><div><strong class="phrase-fr">'+esc(phrase[0])+'</strong><span class="phrase-en">'+esc(phrase[1])+'</span><span class="phrase-pron">'+esc(phrase[2])+'</span></div><div class="phrase-actions"><button class="phrase-favorite" type="button" aria-pressed="false" aria-label="Save '+esc(phrase[0])+' to favorites">☆</button><button class="phrase-play" type="button" data-french="'+esc(phrase[0])+'" aria-label="Hear '+esc(phrase[0])+'">🔊</button></div></div>';}
  function enhanceFrench(){
    var page=document.getElementById('page-french'); if(!page)return;
    var note=page.querySelector('.phrase-note');
    var everydayGroup=document.createElement('details'); everydayGroup.className='phrase-group'; everydayGroup.innerHTML='<summary>💬 Everyday French</summary><div class="phrase-list">'+everyday.map(phraseCard).join('')+'</div>';
    page.insertBefore(everydayGroup,note);
    page.querySelectorAll('.phrase-card').forEach(function(card){
      if(card.querySelector('.phrase-favorite'))return;
      var play=card.querySelector('.phrase-play'); if(!play)return;
      var actions=document.createElement('div');actions.className='phrase-actions';
      var favorite=document.createElement('button');favorite.type='button';favorite.className='phrase-favorite';favorite.setAttribute('aria-pressed','false');favorite.setAttribute('aria-label','Save phrase to favorites');favorite.textContent='☆';
      play.parentNode.insertBefore(actions,play);actions.appendChild(favorite);actions.appendChild(play);
    });
    var today=document.createElement('div');today.className='today-french';today.id='today-french';
    var key=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Paris'});var selection=dayPhrases[key]||dayPhrases['2026-09-16'];
    today.innerHTML='<p class="home-kicker">Today’s French</p><h2>'+esc(selection.title)+(dayPhrases[key]?'':' preview')+'</h2><p>Useful phrases surfaced for this part of the itinerary.</p><div class="today-french-list">'+selection.phrases.map(function(phrase){return '<button class="today-french-link" type="button" data-find-phrase="'+esc(phrase)+'">'+esc(phrase)+'</button>';}).join('')+'</div><details class="phrase-group"><summary>★ Saved phrases</summary><div class="phrase-list" id="favorite-phrase-list"></div></details>';
    page.insertBefore(today,page.querySelector('.phrase-intro').nextSibling);
    var favorites=load(favoriteKey,[]);
    function renderFavorites(){
      page.querySelectorAll('.phrase-card').forEach(function(card){var text=card.querySelector('.phrase-fr').textContent.trim();var button=card.querySelector('.phrase-favorite');var active=favorites.indexOf(text)>-1;button.setAttribute('aria-pressed',String(active));button.textContent=active?'★':'☆';});
      var list=document.getElementById('favorite-phrase-list');var cards=Array.from(page.querySelectorAll('.phrase-card')).filter(function(card){return favorites.indexOf(card.querySelector('.phrase-fr').textContent.trim())>-1;});
      list.innerHTML=cards.length?cards.map(function(card){var copy=card.cloneNode(true);copy.querySelector('.phrase-favorite').remove();return copy.outerHTML;}).join(''):'<p class="favorite-empty">Tap ☆ beside any phrase to keep it here.</p>';
    }
    page.addEventListener('click',function(event){
      var favorite=event.target.closest('.phrase-favorite');if(favorite){var text=favorite.closest('.phrase-card').querySelector('.phrase-fr').textContent.trim();var index=favorites.indexOf(text);if(index>-1)favorites.splice(index,1);else favorites.push(text);save(favoriteKey,favorites);renderFavorites();return;}
      var finder=event.target.closest('[data-find-phrase]');if(finder){var wanted=finder.getAttribute('data-find-phrase');var target=Array.from(page.querySelectorAll('.phrase-fr')).find(function(node){return node.textContent.trim()===wanted;});if(target){var details=target.closest('details');if(details)details.open=true;target.closest('.phrase-card').scrollIntoView({behavior:'smooth',block:'center'});target.closest('.phrase-card').style.outline='2px solid var(--brass)';setTimeout(function(){target.closest('.phrase-card').style.outline='';},1600);}else{var utter=new SpeechSynthesisUtterance(wanted);utter.lang='fr-FR';speechSynthesis.speak(utter);}}
    });
    renderFavorites();
  }

  var cheeses=[
    ['Époisses','Burgundy','Cow','Washed rind','Silky, savory and boldly aromatic',3,'Baguette, apple; enjoy the wine later at a licensed venue'],
    ['Brillat-Savarin','Île-de-France','Cow','Triple cream','Buttery, lush and gentle',1,'Berries or pear'],
    ['Sainte-Maure de Touraine','Loire Valley','Goat','Aged log','Tangy, earthy and increasingly nutty',2,'Radish, honey, dry white wine'],
    ['Valençay','Loire Valley','Goat','Ash-ripened pyramid','Citrusy, mineral and creamy',2,'Apricot or fresh herbs'],
    ['Comté 24 mois','Jura','Cow','Hard / alpine','Nutty, caramelized and crystalline',1,'Walnuts, cornichons, baguette'],
    ['Mimolette vieille','Northern France','Cow','Hard','Butterscotch, hazelnut and firm',2,'Apple or mustard'],
    ['Bleu des Causses','Occitanie','Cow','Blue','Creamy, peppery and balanced',3,'Pear or dark bread'],
    ['Roquefort','Aveyron','Sheep','Blue','Salty, tangy and powerful',3,'Pear, walnut or honey'],
    ['Langres','Champagne','Cow','Washed rind','Creamy, meaty and aromatic',3,'Grapes and crusty bread'],
    ['Ossau-Iraty','Basque Country','Sheep','Firm','Sweet, grassy and nutty',1,'Black-cherry jam'],
    ['Coulommiers fermier','Île-de-France','Cow','Soft-ripened','Mushroomy, buttery and fuller than Brie',2,'Baguette and apple'],
    ['Munster fermier','Alsace','Cow','Washed rind','Supple, savory and assertive',3,'Cumin, bread and fruit']
  ];
  var checklist=[
    ['soft','Choose one soft or creamy cheese','Brillat-Savarin or Coulommiers is an easy anchor.'],['firm','Choose one firm or aged cheese','Comté, Mimolette or Ossau-Iraty travels well.'],['adventure','Choose one adventurous cheese','Ask what is expressive but ready to eat today.'],['quantity','Ask for 250–350 g total for two','Enough for a generous picnic with bread and accompaniments.'],['today','Ask what is best and ripe today','The cheesemonger can steer you away from cheese needing more time.'],['picnic','Say it is for a picnic','They can favor cheeses that travel and portion cleanly.'],['wrap','Ask for separate wrapping','Keeps aromas and textures from mixing.'],['rind','Ask which rinds are edible','There is no single rule for every cheese.'],['storage','Ask how long it may stay unrefrigerated','Follow the cheesemonger’s advice and keep it cool.'],['names','Keep the labels or note each name','So every cheese can be remembered and rated.'],['baguette','Buy one tradition baguette','Ask for bien cuite if you like a darker crust.'],['charcuterie','Add 150–200 g charcuterie','Jambon de Paris, saucisson sec or pâté.'],['fruit','Add two fruits or berries','Apple, pear, grapes or seasonal berries.'],['crunch','Add cornichons or nuts','Acid and crunch balance rich cheese.'],['dessert','Add one pastry to share','Choose something sturdy enough to carry.'],['water','Bring water, napkins and a small knife','Also bring a bag for every scrap of rubbish.'],['spot','Confirm the lawn is open and picnics are allowed','Follow posted signs and local instructions.'],['alcohol','Keep alcohol out of City of Paris parks and gardens','Have wine later at a licensed restaurant or wine bar.']
  ];
  function renderCompanion(){
    var cheeseMount=document.getElementById('cheese-guide-app');var picnicMount=document.getElementById('picnic-guide-app');if(!cheeseMount||!picnicMount)return;
    var state=load(stateKey,{checks:[],passport:[],preset:''});
    cheeseMount.innerHTML='<div class="companion-hero"><p class="home-kicker">Shop with confidence</p><h2>Build a three-cheese tasting</h2><p>Choose one creamy, one firm and one adventurous cheese. Ask what is perfectly ripe today instead of shopping from a rigid list.</p><div class="companion-jump"><a href="#fromagerie-checklist">Fromagerie checklist</a><a href="#cheese-passport">Cheese passport</a><a href="#page-picnic">Build the picnic</a></div></div><div class="companion-grid" id="cheese-passport">'+cheeses.map(function(c,index){return '<article class="companion-card"><h3>'+esc(c[0])+'</h3><div class="companion-meta"><span>'+esc(c[1])+'</span><span>'+esc(c[2])+' milk</span><span>'+esc(c[3])+'</span></div><p>'+esc(c[4])+'</p><p><strong>Adventurous:</strong> <span class="adventure-meter" aria-label="'+c[5]+' out of 3">'+('●'.repeat(c[5]))+('○'.repeat(3-c[5]))+'</span></p><p><strong>Picnic pairing:</strong> '+esc(c[6])+'</p><label class="passport-toggle"><input type="checkbox" data-passport="'+index+'"> <span>Try this / add to Cheese Passport</span></label></article>';}).join('')+'</div><div class="companion-callout"><strong>Simple order:</strong> “One creamy, one firm, and one surprising cheese for two people, please.” The checklist on the picnic page turns that into a complete order.</div>';
    picnicMount.innerHTML='<div class="companion-hero"><p class="home-kicker">Paris picnic for two</p><h2>Choose a style, then shop once</h2><p>Your checklist persists on this device and connects the fromagerie order to the rest of the basket.</p><div class="picnic-presets"><button class="picnic-preset" type="button" data-preset="classic">Classic French</button><button class="picnic-preset" type="button" data-preset="adventurous">Adventurous</button><button class="picnic-preset" type="button" data-preset="romantic">Romantic</button></div><p id="preset-description"></p></div><section class="companion-section" id="fromagerie-checklist"><h2>Fromagerie & picnic checklist</h2><p class="checklist-progress-label" id="picnic-progress-label"></p><div class="checklist-progress" aria-hidden="true"><span id="picnic-progress-bar"></span></div><div class="companion-checklist">'+checklist.map(function(item){return '<label class="companion-check"><input type="checkbox" data-check="'+item[0]+'"><span><strong>'+esc(item[1])+'</strong><small>'+esc(item[2])+'</small></span></label>';}).join('')+'</div><button class="companion-reset" id="picnic-reset" type="button">Reset picnic checklist</button></section><section class="companion-section"><h2>Useful at the fromagerie</h2><div class="companion-card">'+[
      ['Nous préparons un pique-nique pour deux.','We’re preparing a picnic for two.'],['Je voudrais trois fromages différents.','I’d like three different cheeses.'],['Quel fromage est prêt à manger aujourd’hui ?','Which cheese is ready to eat today?'],['Pouvez-vous les emballer séparément ?','Can you wrap them separately?'],['Est-ce que la croûte se mange ?','Is the rind edible?'],['Combien de temps peut-il rester sans réfrigération ?','How long can it remain unrefrigerated?']
    ].map(function(p){return '<div class="fromagerie-phrase"><div><strong>'+esc(p[0])+'</strong><span>'+esc(p[1])+'</span></div><button class="phrase-play" type="button" data-french="'+esc(p[0])+'" aria-label="Hear '+esc(p[0])+'">🔊</button></div>';}).join('')+'</div></section><div class="companion-callout companion-warning"><strong>Paris park rule:</strong> Individual and family picnics are allowed when the site is kept clean, but alcoholic drinks, fires and barbecues are prohibited in City of Paris parks and gardens. Check the entrance signs and lawn access before settling in. Save the wine for a licensed wine bar or restaurant.</div><div class="companion-callout"><strong>Low-friction route:</strong> Du Pain et des Idées for bread and pastry, Laurent Dubois for cheese, then the single park already chosen for Sept 16. Buy perishables last and eat promptly.</div>';
    function update(){
      document.querySelectorAll('[data-passport]').forEach(function(input){input.checked=state.passport.indexOf(input.getAttribute('data-passport'))>-1;});
      document.querySelectorAll('[data-check]').forEach(function(input){input.checked=state.checks.indexOf(input.getAttribute('data-check'))>-1;});
      document.querySelectorAll('[data-preset]').forEach(function(button){button.classList.toggle('active',button.getAttribute('data-preset')===state.preset);});
      var total=checklist.length,done=state.checks.length,percent=Math.round(done/total*100);document.getElementById('picnic-progress-label').textContent=done+' of '+total+' ready · '+percent+'%';document.getElementById('picnic-progress-bar').style.width=percent+'%';
      var descriptions={classic:'Brillat-Savarin + aged Comté + saucisson, baguette, apple, cornichons and a shared pastry.',adventurous:'Sainte-Maure + Mimolette + Époisses or blue, dark bread, pear, walnuts and honey.',romantic:'Coulommiers + Ossau-Iraty + a gentle goat cheese, berries, baguette and one beautiful pâtisserie.'};document.getElementById('preset-description').textContent=descriptions[state.preset]||'Pick a ready-made combination or build your own.';save(stateKey,state);
    }
    document.addEventListener('change',function(event){var passport=event.target.getAttribute('data-passport');var check=event.target.getAttribute('data-check');if(passport!==null){var pi=state.passport.indexOf(passport);if(event.target.checked&&pi<0)state.passport.push(passport);if(!event.target.checked&&pi>-1)state.passport.splice(pi,1);update();}if(check!==null){var ci=state.checks.indexOf(check);if(event.target.checked&&ci<0)state.checks.push(check);if(!event.target.checked&&ci>-1)state.checks.splice(ci,1);update();}});
    picnicMount.addEventListener('click',function(event){var preset=event.target.closest('[data-preset]');if(preset){state.preset=preset.getAttribute('data-preset');var base=['soft','firm','adventure','quantity','today','picnic','wrap'];base.forEach(function(item){if(state.checks.indexOf(item)<0)state.checks.push(item);});update();}if(event.target.id==='picnic-reset'){state={checks:[],passport:state.passport,preset:''};update();}});update();
  }
  function init(){enhanceFrench();renderCompanion();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
