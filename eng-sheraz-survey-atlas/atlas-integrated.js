// Integrate the original engineering workspace into the new Atlas shell.
(function(){
 const workspaceLinks=document.querySelectorAll('[data-workspace]');
 function openWorkspace(e){
  e.preventDefault();
  const section=e.currentTarget.getAttribute('data-workspace');
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id==='workspace'));
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n===e.currentTarget));
  document.getElementById('pageTitle').textContent='Engineering Workspace';
  document.getElementById('subtitle').textContent='Layers · Daily Survey · Cut/Fill · WIR · Reports';
  const frame=document.getElementById('engineeringFrame');
  function navigate(){try{
   const doc=frame.contentDocument;
   const items=[...doc.querySelectorAll('#nav button, #nav a, #mobileMenu button')];
   const targets={layers:/layer/i,survey:/survey/i,quantities:/quantit|cut.*fill/i,reports:/report|progress/i};
   const target=targets[section];
   if(target){const item=items.find(x=>target.test(x.textContent));if(item)item.click()}
  }catch(err){console.warn('Workspace navigation:',err)}}
  if(frame.contentDocument?.readyState==='complete')navigate();else frame.addEventListener('load',navigate,{once:true});
  window.scrollTo({top:0,behavior:'smooth'});
 }
 workspaceLinks.forEach(link=>link.addEventListener('click',openWorkspace));
})();
