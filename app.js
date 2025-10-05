
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.nav-toggle')
  const ul = document.querySelector('nav ul')
  if(btn){
    btn.addEventListener('click', ()=>{
      ul.style.display = (ul.style.display === 'block') ? 'none' : 'block'
    })
  }
})
