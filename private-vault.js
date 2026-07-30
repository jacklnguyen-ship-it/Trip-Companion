(function(){
  'use strict';
  var page=document.getElementById('page-vault');
  if(!page)return;
  var guideKey=document.body.getAttribute('data-vault-guide')||'index';
  var DB_NAME='trip-companion-private-vault';
  var STORE_NAME='vaults';
  var ITERATIONS=600000;
  var AUTO_LOCK_MS=5*60*1000;
  var encoder=new TextEncoder(),decoder=new TextDecoder();
  var activeKey=null,activeEnvelope=null,records=[],lockTimer=null,failedAttempts=0,blockedUntil=0;
  var setupPanel=document.getElementById('vault-setup');
  var unlockPanel=document.getElementById('vault-unlock');
  var openPanel=document.getElementById('vault-open');
  var setupForm=document.getElementById('vault-setup-form');
  var unlockForm=document.getElementById('vault-unlock-form');
  var recordForm=document.getElementById('vault-record-form');
  var recordDialog=document.getElementById('vault-record-dialog');
  var recordsBox=document.getElementById('vault-records');
  var status=document.getElementById('vault-status');
  var recordStatus=document.getElementById('vault-record-status');
  function bytesToBase64(bytes){
    var out='',chunk=0x8000;
    for(var i=0;i<bytes.length;i+=chunk)out+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));
    return btoa(out);
  }
  function base64ToBytes(value){
    var raw=atob(value),bytes=new Uint8Array(raw.length);
    for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    return bytes;
  }
  function randomBytes(length){var bytes=new Uint8Array(length);crypto.getRandomValues(bytes);return bytes;}
  function setMessage(node,message,type){node.textContent=message||'';node.className='vault-message'+(type?' '+type:'');}
  function openDb(){
    return new Promise(function(resolve,reject){
      var request=indexedDB.open(DB_NAME,1);
      request.onupgradeneeded=function(){if(!request.result.objectStoreNames.contains(STORE_NAME))request.result.createObjectStore(STORE_NAME);};
      request.onsuccess=function(){resolve(request.result);};request.onerror=function(){reject(request.error);};
    });
  }
  async function readEnvelope(){
    var db=await openDb();
    return new Promise(function(resolve,reject){
      var tx=db.transaction(STORE_NAME,'readonly'),request=tx.objectStore(STORE_NAME).get(guideKey);
      request.onsuccess=function(){resolve(request.result||null);};request.onerror=function(){reject(request.error);};
      tx.oncomplete=function(){db.close();};
    });
  }
  async function writeEnvelope(envelope){
    var db=await openDb();
    return new Promise(function(resolve,reject){
      var tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).put(envelope,guideKey);
      tx.oncomplete=function(){db.close();resolve();};tx.onerror=function(){db.close();reject(tx.error);};
    });
  }
  async function deleteEnvelope(){
    var db=await openDb();
    return new Promise(function(resolve,reject){
      var tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).delete(guideKey);
      tx.oncomplete=function(){db.close();resolve();};tx.onerror=function(){db.close();reject(tx.error);};
    });
  }
  async function deriveKey(password,salt,iterations){
    var material=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function encryptVault(key,salt,data){
    var iv=randomBytes(12);
    var ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},key,encoder.encode(JSON.stringify(data)));
    return{format:'trip-companion-vault',version:1,kdf:'PBKDF2-SHA-256',iterations:ITERATIONS,salt:bytesToBase64(salt),cipher:'AES-256-GCM',iv:bytesToBase64(iv),ciphertext:bytesToBase64(new Uint8Array(ciphertext)),updatedAt:new Date().toISOString()};
  }
  async function decryptVault(password,envelope){
    if(!validEnvelope(envelope))throw new Error('Invalid encrypted vault');
    var salt=base64ToBytes(envelope.salt);
    var key=await deriveKey(password,salt,envelope.iterations);
    var plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:base64ToBytes(envelope.iv)},key,base64ToBytes(envelope.ciphertext));
    var data=JSON.parse(decoder.decode(plaintext));
    if(!data||!Array.isArray(data.records))throw new Error('Invalid vault contents');
    return{key:key,salt:salt,data:data};
  }
  function validEnvelope(value){
    return value&&value.format==='trip-companion-vault'&&value.version===1&&value.kdf==='PBKDF2-SHA-256'&&value.cipher==='AES-256-GCM'&&Number.isInteger(value.iterations)&&value.iterations>=300000&&typeof value.salt==='string'&&typeof value.iv==='string'&&typeof value.ciphertext==='string';
  }
  function starterRecords(){
    var shared=[
      ['flight','Virgin Atlantic VS24','2026-09-07','23:15','LAX → London Heathrow'],
      ['lodging','Wombat’s City Hostel London','2026-09-08','','7 Dock Street, London'],
      ['attraction','Chatsworth House','2026-09-09','','Derbyshire'],
      ['attraction','Wimbledon Lawn Tennis Museum','2026-09-10','','London'],
      ['train','London Waterloo → Winchester','2026-09-11','07:03','London Waterloo'],
      ['tour','Celtic Horizons private tour','2026-09-11','','Winchester → Chawton → Bath'],
      ['attraction','Roman Baths','2026-09-11','16:45','Bath'],
      ['restaurant','Sally Lunn’s dinner','2026-09-11','18:15','Bath'],
      ['train','Bath Spa → London Paddington','2026-09-11','21:13','Bath Spa'],
      ['performance','Tottenham v Everton','2026-09-12','','Tottenham Hotspur Stadium'],
      ['train','Eurostar London → Paris','2026-09-13','','St Pancras International'],
      ['lodging','Paris lodging','2026-09-13','','Le Marais, Paris'],
      ['attraction','Musée Picasso','2026-09-14','','Paris'],
      ['attraction','Palace of Versailles','2026-09-15','','Versailles'],
      ['flight','Delta DL291','2026-09-17','16:00','Paris CDG → LAX']
    ];
    var privateEvenings=[
      ['performance','Private evening reservation','2026-09-10','','Details shared by Jack'],
      ['performance','Private evening reservation','2026-09-14','20:00','Details shared by Jack'],
      ['performance','Private evening reservation','2026-09-16','','Details shared by Jack']
    ];
    return shared.concat(privateEvenings).map(function(item,index){
      return{id:'starter-'+index,category:item[0],title:item[1],date:item[2],time:item[3],location:item[4],confirmation:'',notes:'',ticket:null};
    });
  }
  async function persist(){
    if(!activeKey||!activeEnvelope)throw new Error('Vault is locked');
    activeEnvelope=await encryptVault(activeKey,base64ToBytes(activeEnvelope.salt),{records:records});
    await writeEnvelope(activeEnvelope);
    resetLockTimer();
  }
  function showState(state){
    setupPanel.hidden=state!=='setup';unlockPanel.hidden=state!=='locked';openPanel.hidden=state!=='open';
    document.getElementById('vault-lock-state').textContent=state==='open'?'Unlocked on this device':state==='locked'?'Locked and encrypted':'Not set up on this device';
  }
  function resetLockTimer(){
    clearTimeout(lockTimer);
    if(activeKey)lockTimer=setTimeout(function(){lockVault('Vault locked automatically after five minutes.');},AUTO_LOCK_MS);
  }
  function lockVault(message){
    activeKey=null;activeEnvelope=null;records=[];clearTimeout(lockTimer);renderRecords();showState('locked');
    document.getElementById('vault-password').value='';
    setMessage(status,message||'Vault locked.','success');
  }
  function escapeText(value){return String(value||'');}
  function renderRecords(){
    recordsBox.replaceChildren();
    if(!records.length){var empty=document.createElement('div');empty.className='vault-empty';empty.textContent='No private travel records yet.';recordsBox.appendChild(empty);return;}
    records.slice().sort(function(a,b){return (a.date+a.time+a.title).localeCompare(b.date+b.time+b.title);}).forEach(function(record){
      var card=document.createElement('article');card.className='vault-record';
      var head=document.createElement('div');head.className='vault-record-head';
      var copy=document.createElement('div'),category=document.createElement('span'),title=document.createElement('h3'),meta=document.createElement('div');
      category.className='vault-category';category.textContent=record.category||'other';title.textContent=escapeText(record.title);
      meta.className='vault-record-meta';meta.textContent=[record.date,record.time,record.location].filter(Boolean).join(' · ');
      copy.append(category,title,meta);head.appendChild(copy);card.appendChild(head);
      var privateBox=document.createElement('div');privateBox.className='vault-private';
      var ref=document.createElement('div'),refLabel=document.createElement('span'),refValue=document.createElement('strong');
      refLabel.textContent='Confirmation';refValue.textContent=record.confirmation||'Not added';ref.append(refLabel,refValue);
      var note=document.createElement('div'),noteLabel=document.createElement('span'),noteValue=document.createElement('strong');
      noteLabel.textContent='Private notes';noteValue.textContent=record.notes||'None';note.append(noteLabel,noteValue);
      privateBox.append(ref,note);card.appendChild(privateBox);
      if(record.ticket&&record.ticket.data&&record.ticket.type&&record.ticket.type.indexOf('image/')===0){var image=document.createElement('img');image.className='vault-ticket';image.src=record.ticket.data;image.alt='Uploaded ticket or QR code for '+record.title;card.appendChild(image);}
      var actions=document.createElement('div');actions.className='vault-actions';
      if(record.confirmation){actions.appendChild(actionButton('Copy confirmation',function(){navigator.clipboard.writeText(record.confirmation).then(function(){setMessage(status,'Confirmation copied.','success');});},'secondary'));}
      if(record.ticket&&record.ticket.data){actions.appendChild(actionButton('Open ticket',function(){openTicket(record.ticket);},'secondary'));}
      actions.appendChild(actionButton('Edit',function(){openRecordDialog(record);},'secondary'));
      actions.appendChild(actionButton('Delete',function(){if(confirm('Delete this encrypted record?')){records=records.filter(function(item){return item.id!==record.id;});persist().then(renderRecords).catch(handleError);}},'danger'));
      card.appendChild(actions);recordsBox.appendChild(card);
    });
  }
  function actionButton(label,handler,kind){var button=document.createElement('button');button.type='button';button.className='vault-button '+(kind||'');button.textContent=label;button.addEventListener('click',handler);return button;}
  function openTicket(ticket){
    if(ticket.type==='application/pdf'){var link=document.createElement('a');link.href=ticket.data;link.target='_blank';link.rel='noopener';link.click();return;}
    var win=window.open('','_blank','noopener');if(win){var image=win.document.createElement('img');image.src=ticket.data;image.alt='Ticket or QR code';image.style.maxWidth='100%';win.document.body.appendChild(image);}
  }
  function openRecordDialog(record){
    recordForm.reset();recordForm.elements.id.value=record?record.id:'';
    ['category','title','date','time','location','confirmation','notes'].forEach(function(name){recordForm.elements[name].value=record&&record[name]||'';});
    recordForm.dataset.existingTicket=record&&record.ticket?JSON.stringify(record.ticket):'';
    document.getElementById('vault-record-title').textContent=record?'Edit private record':'Add private record';
    setMessage(recordStatus,'');recordDialog.hidden=false;recordForm.elements.title.focus();
  }
  function closeRecordDialog(){recordDialog.hidden=true;recordForm.reset();setMessage(recordStatus,'');}
  function fileToData(file){
    return new Promise(function(resolve,reject){
      if(!file){resolve(null);return;}if(file.size>4*1024*1024){reject(new Error('Ticket files must be 4 MB or smaller.'));return;}
      if(!/^image\/(png|jpeg|webp)$/.test(file.type)&&file.type!=='application/pdf'){reject(new Error('Use a PNG, JPEG, WebP, or PDF ticket file.'));return;}
      var reader=new FileReader();reader.onload=function(){resolve({name:file.name,type:file.type,data:reader.result});};reader.onerror=function(){reject(reader.error);};reader.readAsDataURL(file);
    });
  }
  function handleError(error){setMessage(status,error&&error.message?error.message:'The vault could not complete that action.','error');}
  setupForm.addEventListener('submit',async function(event){
    event.preventDefault();var password=setupForm.elements.password.value,confirmPassword=setupForm.elements.confirmPassword.value;
    if(password.length<12){setMessage(status,'Use a passphrase of at least 12 characters.','error');return;}
    if(password!==confirmPassword){setMessage(status,'The passphrases do not match.','error');return;}
    try{
      setMessage(status,'Creating your encrypted vault…');var salt=randomBytes(16);activeKey=await deriveKey(password,salt,ITERATIONS);records=starterRecords();
      activeEnvelope=await encryptVault(activeKey,salt,{records:records});await writeEnvelope(activeEnvelope);setupForm.reset();showState('open');renderRecords();resetLockTimer();setMessage(status,'Encrypted vault created on this device. Add your private confirmation numbers and ticket files below.','success');
    }catch(error){activeKey=null;handleError(error);}
  });
  unlockForm.addEventListener('submit',async function(event){
    event.preventDefault();
    if(Date.now()<blockedUntil){setMessage(status,'Too many failed attempts. Wait before trying again.','error');return;}
    try{
      setMessage(status,'Unlocking…');var result=await decryptVault(unlockForm.elements.password.value,await readEnvelope());
      activeKey=result.key;activeEnvelope=await readEnvelope();records=result.data.records;failedAttempts=0;unlockForm.reset();showState('open');renderRecords();resetLockTimer();setMessage(status,'Vault unlocked locally.','success');
    }catch(error){
      activeKey=null;failedAttempts++;if(failedAttempts>=5){blockedUntil=Date.now()+30000;failedAttempts=0;}
      setMessage(status,'Unable to unlock. Check the passphrase and try again.','error');
    }
  });
  recordForm.addEventListener('submit',async function(event){
    event.preventDefault();
    try{
      var form=new FormData(recordForm),id=form.get('id')||('record-'+Date.now()),existing=records.find(function(item){return item.id===id;});
      var uploaded=await fileToData(recordForm.elements.ticket.files[0]);
      var record={id:id,category:String(form.get('category')||'other'),title:String(form.get('title')||'').trim(),date:String(form.get('date')||''),time:String(form.get('time')||''),location:String(form.get('location')||'').trim(),confirmation:String(form.get('confirmation')||'').trim(),notes:String(form.get('notes')||'').trim(),ticket:uploaded||(existing&&existing.ticket)||null};
      if(!record.title)throw new Error('Add a title for this record.');
      records=records.filter(function(item){return item.id!==id;});records.push(record);await persist();closeRecordDialog();renderRecords();setMessage(status,'Private record encrypted and saved on this device.','success');
    }catch(error){setMessage(recordStatus,error.message||'Could not save this record.','error');}
  });
  document.getElementById('vault-add-record').addEventListener('click',function(){openRecordDialog(null);});
  document.getElementById('vault-lock').addEventListener('click',function(){lockVault('Vault locked.');});
  document.getElementById('vault-record-close').addEventListener('click',closeRecordDialog);
  document.getElementById('vault-record-cancel').addEventListener('click',closeRecordDialog);
  recordDialog.addEventListener('click',function(event){if(event.target===recordDialog)closeRecordDialog();});
  document.getElementById('vault-export').addEventListener('click',async function(){
    try{
      var envelope=await readEnvelope(),blob=new Blob([JSON.stringify(envelope,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download='trip-companion-'+guideKey+'-vault.encrypted.json';link.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);setMessage(status,'Encrypted backup downloaded. Keep its passphrase safe.','success');
    }catch(error){handleError(error);}
  });
  document.getElementById('vault-import').addEventListener('change',function(event){
    var file=event.target.files[0];if(!file)return;var reader=new FileReader();
    reader.onload=async function(){
      try{
        var envelope=JSON.parse(reader.result);if(!validEnvelope(envelope))throw new Error('That is not a valid encrypted Trip Companion vault backup.');
        if(!confirm('Replace this device’s encrypted vault with the selected backup? Export the current vault first if needed.'))return;
        await writeEnvelope(envelope);lockVault('Encrypted backup imported. Unlock it with the backup passphrase.');
      }catch(error){handleError(error);}finally{event.target.value='';}
    };reader.readAsText(file);
  });
  document.getElementById('vault-reset').addEventListener('click',async function(){
    if(!confirm('Permanently erase this encrypted vault from this device? This cannot be undone without an exported backup.'))return;
    await deleteEnvelope();activeKey=null;activeEnvelope=null;records=[];showState('setup');setMessage(status,'The encrypted vault was erased from this device.','success');
  });
  ['pointerdown','keydown'].forEach(function(name){document.addEventListener(name,function(){if(activeKey)resetLockTimer();},{passive:true});});
  document.addEventListener('visibilitychange',function(){if(document.hidden&&activeKey)resetLockTimer();});
  document.addEventListener('keydown',function(event){if(event.key==='Escape'&&!recordDialog.hidden)closeRecordDialog();});
  if(!window.crypto||!crypto.subtle||!window.indexedDB){showState('setup');setupForm.querySelector('button').disabled=true;setMessage(status,'This browser cannot provide the encryption required for the private vault. Use a current version of Safari, Chrome, or Edge.','error');return;}
  readEnvelope().then(function(envelope){showState(envelope?'locked':'setup');setMessage(status,envelope?'Enter your passphrase to decrypt this device’s vault.':'Create a private passphrase. It is never stored and cannot be recovered.');}).catch(handleError);
})();
