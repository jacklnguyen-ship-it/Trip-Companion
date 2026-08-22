(function(){
  'use strict';
  var stops=[
    {title:'House of Stories: A Literary Chatsworth',script:'As you move through Chatsworth today, keep an eye out for House of Stories: Tales from the Chatsworth Library. This is not a separate gallery at the end of the route. The exhibition is woven through the house, pairing rare books and manuscripts with rooms, portraits and family history. The Devonshires have assembled this library over five centuries, and these objects reveal them not just as collectors, but as readers, writers, patrons and friends of authors. Let the literary pieces slow you down: they are a second story running through the familiar grandeur of Chatsworth.'},
    {title:'Jane Austen at Pemberley',script:'For an Austen lover, this is one of the day’s special moments. House of Stories includes two first editions of Pride and Prejudice: one a plainly bound copy that looks made for reading rather than display, and one once owned by Lady Caroline Lamb, on loan from Jane Austen’s House in Chawton. There is also an illustrated Sense and Sensibility belonging to Duchess Mary, marked as a gift from her mother on her fifteenth birthday. Here, inside the house associated with Pemberley, Austen’s books become physical objects with their own lives, readers and family histories.'},
    {title:'Lady Caroline Lamb and Georgiana',script:'Lady Caroline Lamb was the niece of Georgiana, Duchess of Devonshire, and the exhibition gives her a more intimate presence than the usual Regency gossip. Look for her mourning book for Georgiana: its black cover frames a lock of Georgiana’s hair, and its pages combine poems, watercolours, sketches and an unfinished Gothic story. Nearby, her copy of Pride and Prejudice connects two very different literary worlds: Austen’s sharp social comedy and Lamb’s turbulent, Byronic imagination. It is a poignant reminder that the women around Chatsworth were not only muses or hostesses; they were readers and writers in their own right.'},
    {title:'The Devonshires’ Literary Circle',script:'The exhibition ranges far beyond Austen. There are early works by Chaucer, a first edition of Robinson Crusoe, and materials connected with Dickens, Elizabeth Gaskell, Charlotte Brontë and Lord Byron. One especially telling item is a letter from Gaskell to the sixth Duke, sent with a letter from Charlotte Brontë. Another is the sixth Duke’s scrapbook recording his friendship with Dickens. Together these pieces make Chatsworth feel less like a sealed historic house and more like a place woven into Britain’s literary world, where books travelled, changed hands, carried memories and sparked new writing.'}
  ];
  function init(){
    var essential=document.getElementById('audioguide-chatsworth');
    if(!essential||document.getElementById('chatsworth-exhibit-audio'))return;
    var details=document.createElement('details');details.id='chatsworth-exhibit-audio';details.className='versailles-audio-group chatsworth-exhibit-audio';
    var summary=document.createElement('summary');
    var heading=document.createElement('span');heading.className='versailles-audio-group-heading';
    var eyebrow=document.createElement('small');eyebrow.textContent='Included with your ticket';
    var title=document.createElement('strong');title.textContent='House of Stories audio companion';
    var count=document.createElement('span');count.className='versailles-audio-count';count.textContent='4 stops';
    var marker=document.createElement('b');marker.setAttribute('aria-hidden','true');marker.textContent='＋';
    heading.append(eyebrow,title);summary.append(heading,count,marker);details.appendChild(summary);
    var intro=document.createElement('p');intro.className='versailles-audio-description';intro.textContent='Optional short stops for the 2026 literary exhibition, placed throughout the house route. Open this when you see the House of Stories displays.';details.appendChild(intro);
    var guide=document.createElement('div');guide.className='audio-guide versailles-deep-guide';guide.id='audioguide-chatsworth-exhibit';guide.setAttribute('data-stops',JSON.stringify(stops));
    var list=document.createElement('div');list.className='audio-stops-list';
    stops.forEach(function(stop,index){
      var item=document.createElement('div');item.className='audio-stop';item.setAttribute('data-idx',String(index));
      var head=document.createElement('div');head.className='audio-stop-head';
      var number=document.createElement('span');number.className='audio-stop-num';number.textContent=String(index+1);
      var stopTitle=document.createElement('span');stopTitle.className='audio-stop-title';stopTitle.textContent=stop.title;
      var play=document.createElement('button');play.className='audio-play-btn';play.type='button';play.setAttribute('data-page','chatsworth-exhibit');play.setAttribute('data-idx',String(index));play.setAttribute('aria-label','Play '+stop.title);play.textContent='▶';
      head.append(number,stopTitle,play);item.appendChild(head);list.appendChild(item);
    });
    guide.appendChild(list);details.appendChild(guide);essential.insertAdjacentElement('afterend',details);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
