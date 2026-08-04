(function(){
  'use strict';
  var guideKey=location.pathname.toLowerCase().indexOf('maria')>-1?'maria':'jack';

  function storageGet(key,fallback){
    try{var value=localStorage.getItem(key);return value===null?fallback:JSON.parse(value);}catch(error){return fallback;}
  }
  function storageSet(key,value){
    try{localStorage.setItem(key,JSON.stringify(value));}catch(error){}
  }

  function initCurrency(){
    var tool=document.getElementById('currency-tool');
    var amount=document.getElementById('currency-amount'),currency=document.getElementById('currency-code');
    var result=document.getElementById('currency-result'),meta=document.getElementById('currency-meta');
    var fab=document.getElementById('currency-fab'),pill=document.getElementById('currency-fab-pill');
    var modal=document.getElementById('currency-shortcut-modal'),closeButton=document.getElementById('currency-shortcut-close');
    var shortcutAmount=document.getElementById('currency-shortcut-amount'),shortcutCurrency=document.getElementById('currency-shortcut-code');
    var shortcutResult=document.getElementById('currency-shortcut-result'),shortcutMeta=document.getElementById('currency-shortcut-meta');
    if(!tool&&!fab)return;
    var cached=storageGet('trip-fx-rates',null);
    var rates=cached&&cached.rates?cached.rates:null;
    var savedChoice=storageGet('trip-fx-choice',{amount:20,currency:'GBP'});
    var pillTimer=null,lastFocus=null;
    function usd(value){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);}
    function local(value,code){return new Intl.NumberFormat('en-US',{style:'currency',currency:code,maximumFractionDigits:2}).format(value);}
    function calculate(input,select,output){
      if(!input||!select||!output)return null;
      var value=parseFloat(input.value),code=select.value;
      if(!Number.isFinite(value)){output.textContent='$0.00';return null;}
      if(!rates||!rates[code]){output.textContent='Rate unavailable';return null;}
      var converted=value*rates[code];
      output.textContent=usd(converted);
      return{value:value,code:code,converted:converted};
    }
    function remember(calculation){
      if(!calculation)return;
      storageSet('trip-fx-choice',{amount:calculation.value,currency:calculation.code});
    }
    function showPill(calculation){
      if(!pill||!calculation)return;
      pill.textContent=local(calculation.value,calculation.code)+' ≈ '+usd(calculation.converted);
      pill.hidden=false;
      clearTimeout(pillTimer);
      pillTimer=setTimeout(function(){pill.hidden=true;},5000);
    }
    function renderHome(){
      var calculation=calculate(amount,currency,result);remember(calculation);return calculation;
    }
    function renderShortcut(show){
      var calculation=calculate(shortcutAmount,shortcutCurrency,shortcutResult);remember(calculation);
      if(show)showPill(calculation);
      return calculation;
    }
    function syncFromSaved(){
      var choice=storageGet('trip-fx-choice',savedChoice);
      if(amount)amount.value=choice.amount;
      if(currency)currency.value=choice.currency;
      if(shortcutAmount)shortcutAmount.value=choice.amount;
      if(shortcutCurrency)shortcutCurrency.value=choice.currency;
    }
    function setMeta(message){
      if(meta)meta.textContent=message;
      if(shortcutMeta)shortcutMeta.textContent=message;
    }
    function close(){
      if(!modal)return;
      modal.hidden=true;document.body.style.overflow='';fab.setAttribute('aria-expanded','false');
      if(lastFocus&&lastFocus.focus)lastFocus.focus();
    }
    function open(){
      if(!modal)return;
      lastFocus=document.activeElement;syncFromSaved();renderShortcut(false);
      modal.hidden=false;document.body.style.overflow='hidden';fab.setAttribute('aria-expanded','true');
      setTimeout(function(){shortcutAmount.focus();shortcutAmount.select();},0);
    }
    syncFromSaved();
    if(amount)amount.addEventListener('input',renderHome);
    if(currency)currency.addEventListener('change',renderHome);
    if(shortcutAmount)shortcutAmount.addEventListener('input',function(){renderShortcut(true);});
    if(shortcutCurrency)shortcutCurrency.addEventListener('change',function(){renderShortcut(true);});
    document.querySelectorAll('[data-currency-amount]').forEach(function(button){
      button.addEventListener('click',function(){shortcutAmount.value=button.getAttribute('data-currency-amount');renderShortcut(true);});
    });
    if(fab)fab.addEventListener('click',open);
    if(closeButton)closeButton.addEventListener('click',close);
    if(modal)modal.addEventListener('click',function(event){if(event.target===modal)close();});
    document.addEventListener('keydown',function(event){
      if(!modal||modal.hidden)return;
      if(event.key==='Escape'){close();return;}
      if(event.key==='Tab'){
        var controls=modal.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled])');
        if(!controls.length)return;
        var first=controls[0],last=controls[controls.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    });
    if(cached){
      setMeta('Using saved reference rates from '+cached.date+'.');
      renderHome();renderShortcut(false);
    }
    fetch('https://api.frankfurter.dev/v2/rates?base=EUR&quotes=USD,GBP&providers=ECB')
      .then(function(response){if(!response.ok)throw new Error('rate request failed');return response.json();})
      .then(function(data){
        var usd=data.find(function(item){return item.quote==='USD';});
        var gbp=data.find(function(item){return item.quote==='GBP';});
        if(!usd||!gbp)throw new Error('rate data incomplete');
        rates={EUR:usd.rate,GBP:usd.rate/gbp.rate};
        var saved={rates:rates,date:usd.date,source:'ECB reference rates'};
        storageSet('trip-fx-rates',saved);
        setMeta('ECB reference rates · '+usd.date+' · estimates only.');
        renderHome();renderShortcut(false);
      })
      .catch(function(){
        setMeta(rates?'Offline · using the last saved reference rates.':'Connect once to download current reference rates.');
        renderHome();renderShortcut(false);
      });
  }

  function initTodos(){
    var heading=document.getElementById('outstanding-todos');
    if(!heading)return;
    var list=heading.nextElementSibling;
    if(!list||list.tagName!=='UL')return;
    var key='trip-todos-'+guideKey,stored=storageGet(key,{checks:{},custom:[]});
    var original=Array.prototype.slice.call(list.children).map(function(li,index){
      var text=li.textContent.replace(/^\s*\[(x| )\]\s*/i,'').trim();
      return{id:'original-'+index,text:text,checked:/^\s*\[x\]/i.test(li.textContent)};
    });
    var tasks=original.concat((stored.custom||[]).map(function(item){return{id:item.id,text:item.text,checked:false,custom:true};}));
    list.classList.add('todo-list');
    var tools=document.createElement('div');tools.className='todo-tools';
    tools.innerHTML='<strong id="todo-summary"></strong><div class="todo-progress" aria-hidden="true"><span id="todo-progress-bar"></span></div><form class="todo-add" id="todo-add-form"><input id="todo-add-input" aria-label="New trip task" placeholder="Add another trip task"><button type="submit">Add task</button></form><button type="button" class="todo-reset" id="todo-reset">Reset saved changes</button>';
    heading.insertAdjacentElement('afterend',tools);
    tools.insertAdjacentElement('afterend',list);
    function render(){
      list.innerHTML='';
      tasks.forEach(function(task){
        var li=document.createElement('li'),checked=Object.prototype.hasOwnProperty.call(stored.checks,task.id)?stored.checks[task.id]:task.checked;
        li.classList.toggle('done',checked);
        var box=document.createElement('input');box.type='checkbox';box.checked=checked;box.setAttribute('aria-label',task.text);
        var text=document.createElement('span');text.textContent=task.text;
        box.addEventListener('change',function(){stored.checks[task.id]=box.checked;storageSet(key,stored);render();});
        li.appendChild(box);li.appendChild(text);list.appendChild(li);
      });
      var complete=tasks.filter(function(task){return Object.prototype.hasOwnProperty.call(stored.checks,task.id)?stored.checks[task.id]:task.checked;}).length;
      document.getElementById('todo-summary').textContent=complete+' of '+tasks.length+' complete';
      document.getElementById('todo-progress-bar').style.width=(tasks.length?Math.round(complete/tasks.length*100):0)+'%';
    }
    document.getElementById('todo-add-form').addEventListener('submit',function(event){
      event.preventDefault();var input=document.getElementById('todo-add-input'),text=input.value.trim();if(!text)return;
      var item={id:'custom-'+Date.now(),text:text};stored.custom.push(item);storageSet(key,stored);tasks.push({id:item.id,text:item.text,checked:false,custom:true});input.value='';render();
    });
    document.getElementById('todo-reset').addEventListener('click',function(){stored={checks:{},custom:[]};storageSet(key,stored);tasks=original.slice();render();});
    render();
  }

  function initOffline(){
    if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){
      navigator.serviceWorker.register('./service-worker.js').catch(function(){});
    }
    function status(message){
      var old=document.querySelector('.offline-status');if(old)old.remove();
      var note=document.createElement('div');note.className='offline-status';note.setAttribute('role','status');note.textContent=message;document.body.appendChild(note);
      setTimeout(function(){note.remove();},2800);
    }
    window.addEventListener('offline',function(){status('Offline mode · saved guide remains available');});
    window.addEventListener('online',function(){status('Back online');});
  }

  initCurrency();initTodos();initOffline();
})();
