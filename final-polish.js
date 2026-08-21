(function(){
  var menu=document.getElementById('menu-toggle'),toggle=document.querySelector('.hamburger');
  if(menu&&toggle){
    var menuLocked=false,menuScrollY=0;
    function lockMenuScroll(){
      if(menuLocked||!matchMedia('(max-width: 860px)').matches)return;
      menuScrollY=window.scrollY;menuLocked=true;document.documentElement.classList.add('mobile-menu-open');
      document.body.classList.add('mobile-menu-open');
    }
    function unlockMenuScroll(restore){
      if(!menuLocked)return;
      document.documentElement.classList.remove('mobile-menu-open');document.body.classList.remove('mobile-menu-open');menuLocked=false;
      if(restore!==false){var targetY=menuScrollY;setTimeout(function(){if(!menu.checked)window.scrollTo(0,targetY)},0)}
    }
    function sync(){var navigationClose=menu.dataset.closeReason==='navigation';delete menu.dataset.closeReason;toggle.setAttribute('aria-expanded',menu.checked?'true':'false');toggle.setAttribute('aria-label',menu.checked?'Close menu':'Open menu');if(menu.checked)lockMenuScroll();else unlockMenuScroll(!navigationClose)}
    toggle.addEventListener('keydown',function(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();menu.checked=!menu.checked;menu.dispatchEvent(new Event('change'))}});
    menu.addEventListener('change',sync);sync();
    addEventListener('resize',function(){if(!matchMedia('(max-width: 860px)').matches&&menuLocked){menu.checked=false;sync()}});
  }
  function syncCurrent(){
    var hash=location.hash||'#page-home';
    document.querySelectorAll('a.navlink').forEach(function(link){
      if(link.getAttribute('href')===hash)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
  }
  addEventListener('hashchange',syncCurrent);syncCurrent();
  document.querySelectorAll('.filter-chips').forEach(function(group){group.setAttribute('role','group')});
  var modal=document.getElementById('day-modal'),previousFocus=null;
  if(modal){
    new MutationObserver(function(){if(modal.classList.contains('open'))previousFocus=previousFocus||document.activeElement;else if(previousFocus&&document.contains(previousFocus)){previousFocus.focus();previousFocus=null}}).observe(modal,{attributes:true,attributeFilter:['class']});
  }
})();
