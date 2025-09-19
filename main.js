const scrollBoxes = document.getElementsByClassName('scrollbox')

const CARDWIDTH = 355
const CARDGAP = 16


var scrollAmount = (CARDGAP+CARDWIDTH)*(Math.floor(window.innerWidth / 371))

window.addEventListener('resize', ()=> {
    scrollAmount = (CARDGAP+CARDWIDTH)*(Math.floor(window.innerWidth / 371))
})


Array.from(scrollBoxes).forEach(scrollbox => {
  const prev = scrollbox.parentElement.querySelector('.prev');
  const next = scrollbox.parentElement.querySelector('.next');

  prev.addEventListener('click', () => {
    scrollbox.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  next.addEventListener('click', () => {
    scrollbox.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
});





