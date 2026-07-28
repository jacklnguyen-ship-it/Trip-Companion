(function(){
  var menu=document.getElementById('menu-toggle'),toggle=document.querySelector('.hamburger');
  if(menu&&toggle){
    function sync(){toggle.setAttribute('aria-expanded',menu.checked?'true':'false');toggle.setAttribute('aria-label',menu.checked?'Close menu':'Open menu')}
    toggle.addEventListener('keydown',function(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();menu.checked=!menu.checked;menu.dispatchEvent(new Event('change'))}});
    menu.addEventListener('change',sync);sync();
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
