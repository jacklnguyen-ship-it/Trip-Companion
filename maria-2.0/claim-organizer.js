(function(){
  'use strict';
  var form=document.getElementById('claim-form');
  if(!form)return;
  var DB_NAME='trip-companion-claims';
  var STORE='expenses';
  var MAX_FILE_SIZE=10*1024*1024;
  var allowedTypes=['image/jpeg','image/png','image/heic','image/heif','application/pdf'];
  var dbPromise;
  function openDb(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise(function(resolve,reject){
      if(!('indexedDB' in window)){reject(new Error('Receipt storage is not supported in this browser.'));return;}
      var request=indexedDB.open(DB_NAME,1);
      request.onupgradeneeded=function(){if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE,{keyPath:'id'});};
      request.onsuccess=function(){resolve(request.result);};
      request.onerror=function(){reject(request.error||new Error('Could not open receipt storage.'));};
    });
    return dbPromise;
  }
  function requestResult(request){
    return new Promise(function(resolve,reject){
      request.onsuccess=function(){resolve(request.result);};
      request.onerror=function(){reject(request.error||new Error('Storage request failed.'));};
    });
  }
  function store(mode){return openDb().then(function(db){return db.transaction(STORE,mode).objectStore(STORE);});}
  function all(){return store('readonly').then(function(s){return requestResult(s.getAll());});}
  function put(item){return store('readwrite').then(function(s){return requestResult(s.put(item));});}
  function remove(id){return store('readwrite').then(function(s){return requestResult(s.delete(id));});}
  function clear(){return store('readwrite').then(function(s){return requestResult(s.clear());});}
  function el(tag,className,text){
    var node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  }
  function money(amount,currency){
    try{return new Intl.NumberFormat(undefined,{style:'currency',currency:currency}).format(amount);}
    catch(error){return currency+' '+Number(amount).toFixed(2);}
  }
  function setMessage(message,isError){
    var status=document.getElementById('claim-form-status');
    status.textContent=message||'';
    status.style.color=isError?'#a43d37':'';
  }
  function downloadBlob(blob,name){
    var url=URL.createObjectURL(blob);
    var link=document.createElement('a');
    link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  function csvCell(value){return '"'+String(value==null?'':value).replace(/"/g,'""')+'"';}
  function render(){
    all().then(function(items){
      items.sort(function(a,b){return (b.date||'').localeCompare(a.date||'')||b.createdAt-a.createdAt;});
      document.getElementById('claim-count').textContent=String(items.length);
      var totals={};
      items.forEach(function(item){totals[item.currency]=(totals[item.currency]||0)+Number(item.amount||0);});
      var totalsNode=document.getElementById('claim-totals');totalsNode.replaceChildren();
      var currencies=Object.keys(totals).sort();
      if(!currencies.length)totalsNode.appendChild(el('span','', 'No expenses yet'));
      currencies.forEach(function(currency){totalsNode.appendChild(el('span','claim-total',money(totals[currency],currency)));});
      var filter=document.getElementById('claim-filter').value;
      var shown=items.filter(function(item){return filter==='all'||item.status===filter;});
      var list=document.getElementById('claim-list');list.replaceChildren();
      if(!shown.length){list.appendChild(el('p','claim-empty',items.length?'No expenses match this filter.':'No saved expenses. Add the first receipt above.'));return;}
      shown.forEach(function(item){
        var card=el('article','claim-item');
        var head=el('div','claim-item-head');
        var titleWrap=el('div');titleWrap.appendChild(el('h4','',item.merchant));
        var meta=el('div','claim-meta');
        meta.appendChild(el('span','',item.date));
        meta.appendChild(el('span','',item.type));
        meta.appendChild(el('span','claim-status-badge',item.status));
        titleWrap.appendChild(meta);head.appendChild(titleWrap);head.appendChild(el('span','claim-amount',money(item.amount,item.currency)));card.appendChild(head);
        if(item.notes)card.appendChild(el('p','claim-notes',item.notes));
        var actions=el('div','claim-item-actions');
        if(item.file&&item.file.data){
          var receipt=el('button','', 'Open '+item.file.name);
          receipt.type='button';
          receipt.addEventListener('click',function(){var url=URL.createObjectURL(item.file.data);window.open(url,'_blank','noopener');setTimeout(function(){URL.revokeObjectURL(url);},60000);});
          actions.appendChild(receipt);
        }
        var statusButton=el('button','',item.status==='Submitted'?'Mark reimbursed':'Mark submitted');
        statusButton.type='button';
        statusButton.addEventListener('click',function(){item.status=item.status==='Submitted'?'Reimbursed':'Submitted';put(item).then(render);});
        actions.appendChild(statusButton);
        var deleteButton=el('button','', 'Delete');
        deleteButton.type='button';
        deleteButton.addEventListener('click',function(){if(confirm('Delete this saved expense and its attachment from this device?'))remove(item.id).then(render);});
        actions.appendChild(deleteButton);card.appendChild(actions);list.appendChild(card);
      });
    }).catch(function(error){setMessage(error.message,true);});
  }
  form.addEventListener('submit',function(event){
    event.preventDefault();setMessage('');
    var file=document.getElementById('claim-receipt').files[0]||null;
    if(file&&file.size>MAX_FILE_SIZE){setMessage('That attachment is larger than 10 MB.',true);return;}
    if(file&&allowedTypes.indexOf(file.type)===-1){setMessage('Use a JPG, PNG, HEIC or PDF attachment.',true);return;}
    var amount=Number(document.getElementById('claim-amount').value);
    if(!Number.isFinite(amount)||amount<0){setMessage('Enter a valid expense amount.',true);return;}
    var item={
      id:(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)),
      createdAt:Date.now(),
      type:document.getElementById('claim-type').value,
      date:document.getElementById('claim-date').value,
      merchant:document.getElementById('claim-merchant').value.trim(),
      amount:amount,
      currency:document.getElementById('claim-currency').value,
      status:document.getElementById('claim-status').value,
      notes:document.getElementById('claim-notes').value.trim(),
      file:file?{name:file.name,type:file.type,size:file.size,data:file}:null
    };
    put(item).then(function(){form.reset();document.getElementById('claim-currency').value='USD';document.getElementById('claim-date').value=new Date().toISOString().slice(0,10);setMessage('Expense saved on this device.');render();}).catch(function(error){setMessage(error.message,true);});
  });
  document.getElementById('claim-filter').addEventListener('change',render);
  document.getElementById('claim-export').addEventListener('click',function(){
    all().then(function(items){
      if(!items.length){setMessage('Add an expense before exporting.',true);return;}
      var rows=[['Date','Claim type','Merchant or expense','Amount','Currency','Status','Notes','Attachment']];
      items.sort(function(a,b){return (a.date||'').localeCompare(b.date||'');});
      items.forEach(function(item){rows.push([item.date,item.type,item.merchant,Number(item.amount).toFixed(2),item.currency,item.status,item.notes,item.file?item.file.name:'']);});
      var csv=rows.map(function(row){return row.map(csvCell).join(',');}).join('\r\n');
      downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),'trip-claim-expenses.csv');
      setMessage('Claim summary exported. Attachments remain saved separately on this device.');
    }).catch(function(error){setMessage(error.message,true);});
  });
  document.getElementById('claim-clear').addEventListener('click',function(){
    if(confirm('Delete every saved claim expense and receipt from this device? This cannot be undone.'))clear().then(function(){setMessage('All saved claim records were removed.');render();});
  });
  document.getElementById('claim-date').value=new Date().toISOString().slice(0,10);
  render();
})();
