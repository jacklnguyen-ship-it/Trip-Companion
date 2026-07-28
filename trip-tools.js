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
    if(!tool)return;
    var amount=document.getElementById('currency-amount'),currency=document.getElementById('currency-code');
    var result=document.getElementById('currency-result'),meta=document.getElementById('currency-meta');
    var cached=storageGet('trip-fx-rates',null);
    var rates=cached&&cached.rates?cached.rates:null;
    function render(){
      var value=parseFloat(amount.value);
      if(!Number.isFinite(value)){result.textContent='$0.00';return;}
      if(!rates||!rates[currency.value]){result.textContent='Rate unavailable';return;}
      result.textContent=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value*rates[currency.value]);
    }
    amount.addEventListener('input',render);currency.addEventListener('change',render);
    if(cached){
      meta.textContent='Using saved reference rates from '+cached.date+'.';
      render();
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
        meta.textContent='ECB reference rates · '+usd.date+' · estimates only.';
        render();
      })
      .catch(function(){
        meta.textContent=rates?'Offline · using the last saved reference rates.':'Connect once to download current reference rates.';
        render();
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
