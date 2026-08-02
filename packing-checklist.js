(function(){
  var STORAGE_KEY='tripCompanionPackingChecklist';
  var DEFAULTS=[
    {id:"docs",name:"Documents and money",items:[
      {t:"Passports (check validity 6+ months out)",d:false},
      {t:"UK ETA confirmation",d:false},
      {t:"France entry requirements checked",d:false},
      {t:"Flight, train, Eurostar confirmations (downloaded/offline)",d:false},
      {t:"Theater and opera tickets",d:false},
      {t:"Travel insurance details",d:false},
      {t:"Chase Sapphire Preferred and Venture X cards",d:false},
      {t:"Backup cash (GBP and EUR)",d:false},
      {t:"Airalo eSIM set up",d:false}
    ]},
    {id:"clothing",name:"Clothing",items:[
      {t:"Everyday walking outfits (layer-friendly, early Sept weather)",d:false},
      {t:"Light rain jacket",d:false},
      {t:"Comfortable walking shoes (broken in)",d:false},
      {t:"Elegant outfit for evening shows (Sept 10, 14, 16)",d:false},
      {t:"Warm layer for evenings (Sainte-Chapelle, Versailles gardens)",d:false},
      {t:"Football-appropriate casual outfit (Sept 12)",d:false},
      {t:"Sleepwear",d:false},
      {t:"Undergarments and socks for full trip",d:false}
    ]},
    {id:"chatsworth",name:"Chatsworth day (Sept 9 prep)",items:[
      {t:"Snacks and water from Sainsbury's Local (Leman Street) the night before",d:false},
      {t:"Comfortable shoes for long walking day",d:false},
      {t:"Portable phone charger",d:false},
      {t:"Layers for outdoor gardens",d:false}
    ]},
    {id:"electronics",name:"Electronics",items:[
      {t:"Phone chargers",d:false},
      {t:"UK/EU plug adapters",d:false},
      {t:"Portable battery pack",d:false},
      {t:"Headphones",d:false},
      {t:"Camera (optional)",d:false}
    ]},
    {id:"toiletries",name:"Toiletries and health",items:[
      {t:"Toothbrush and toothpaste",d:false},
      {t:"Any prescription medications",d:false},
      {t:"Basic first aid (band-aids, pain reliever)",d:false},
      {t:"Sunscreen",d:false},
      {t:"Travel-size toiletries",d:false}
    ]},
    {id:"misc",name:"Miscellaneous",items:[
      {t:"Daypack for daily excursions",d:false},
      {t:"Reusable water bottle",d:false},
      {t:"Umbrella (compact)",d:false},
      {t:"Laundry bag for used clothes",d:false},
      {t:"Book or entertainment for flights",d:false}
    ]}
  ];

  var launcher=document.getElementById('packing-launcher');
  var dialog=document.getElementById('packing-dialog');
  var closeBtn=document.getElementById('packing-dialog-close');
  var resetBtn=document.getElementById('packing-reset');
  var categoriesEl=document.getElementById('packing-categories');
  var progressEl=document.getElementById('packing-progress-text');
  var newCatInput=document.getElementById('packing-new-category-input');
  var newCatBtn=document.getElementById('packing-new-category-btn');
  if(!launcher||!dialog)return;

  var data=null;

  function load(){
    try{
      var raw=localStorage.getItem(STORAGE_KEY);
      if(raw){
        var parsed=JSON.parse(raw);
        if(Array.isArray(parsed)&&parsed.length)return parsed;
      }
    }catch(error){}
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
  function save(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(error){}
  }
  function countProgress(){
    var total=0,done=0;
    data.forEach(function(cat){cat.items.forEach(function(i){total++;if(i.d)done++;});});
    return{total:total,done:done};
  }
  function updateProgressText(){
    var p=countProgress();
    progressEl.textContent=p.total?p.done+' of '+p.total+' packed':'No items yet — add some below.';
  }
  function escapeHtml(text){
    var div=document.createElement('div');
    div.textContent=text;
    return div.innerHTML;
  }
  function render(){
    categoriesEl.innerHTML='';
    data.forEach(function(cat,ci){
      var wrap=document.createElement('div');
      wrap.className='packing-category';

      var head=document.createElement('div');
      head.className='packing-category-head';
      var catDone=cat.items.filter(function(i){return i.d;}).length;
      head.innerHTML='<p>'+escapeHtml(cat.name)+'</p><span>'+catDone+'/'+cat.items.length+'</span>';
      wrap.appendChild(head);

      var list=document.createElement('div');
      list.className='packing-list';

      cat.items.forEach(function(item,ii){
        var row=document.createElement('div');
        row.className='packing-row'+(item.d?' is-done':'');

        var cbId='packing-cb-'+ci+'-'+ii;
        var cb=document.createElement('input');
        cb.type='checkbox';
        cb.id=cbId;
        cb.checked=item.d;
        cb.addEventListener('change',function(){
          data[ci].items[ii].d=cb.checked;
          row.classList.toggle('is-done',cb.checked);
          save();
          updateProgressText();
          head.querySelector('span').textContent=cat.items.filter(function(i){return i.d;}).length+'/'+cat.items.length;
        });

        var label=document.createElement('label');
        label.setAttribute('for',cbId);
        label.textContent=item.t;

        var delBtn=document.createElement('button');
        delBtn.type='button';
        delBtn.setAttribute('aria-label','Remove item');
        delBtn.textContent='\u00d7';
        delBtn.addEventListener('click',function(){
          data[ci].items.splice(ii,1);
          save();
          render();
        });

        row.appendChild(cb);
        row.appendChild(label);
        row.appendChild(delBtn);
        list.appendChild(row);
      });

      var addRow=document.createElement('div');
      addRow.className='packing-add-row';
      var addInput=document.createElement('input');
      addInput.type='text';
      addInput.placeholder='Add item\u2026';
      var addBtn=document.createElement('button');
      addBtn.type='button';
      addBtn.textContent='+';
      addBtn.setAttribute('aria-label','Add item to '+cat.name);
      function doAdd(){
        var v=addInput.value.trim();
        if(!v)return;
        data[ci].items.push({t:v,d:false});
        addInput.value='';
        save();
        render();
      }
      addBtn.addEventListener('click',doAdd);
      addInput.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doAdd();}});
      addRow.appendChild(addInput);
      addRow.appendChild(addBtn);
      list.appendChild(addRow);

      wrap.appendChild(list);
      categoriesEl.appendChild(wrap);
    });
    updateProgressText();
  }

  function openDialog(){
    if(!data)data=load();
    render();
    dialog.hidden=false;
    document.addEventListener('keydown',onKeydown);
  }
  function closeDialog(){
    dialog.hidden=true;
    document.removeEventListener('keydown',onKeydown);
  }
  function onKeydown(e){
    if(e.key==='Escape')closeDialog();
  }

  launcher.addEventListener('click',openDialog);
  if(closeBtn)closeBtn.addEventListener('click',closeDialog);
  dialog.addEventListener('click',function(e){
    if(e.target===dialog)closeDialog();
  });
  if(resetBtn)resetBtn.addEventListener('click',function(){
    data=JSON.parse(JSON.stringify(DEFAULTS));
    save();
    render();
  });
  if(newCatBtn)newCatBtn.addEventListener('click',function(){
    var v=newCatInput.value.trim();
    if(!v)return;
    data.push({id:'cat-'+Date.now(),name:v,items:[]});
    newCatInput.value='';
    save();
    render();
  });
  if(newCatInput)newCatInput.addEventListener('keydown',function(e){
    if(e.key==='Enter'){e.preventDefault();if(newCatBtn)newCatBtn.click();}
  });
})();
