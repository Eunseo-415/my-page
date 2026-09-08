
const $ = (sel) => document.querySelector(sel);
const hamburger = $('#hamburger');
const navMenu = $('#navMenu');
hamburger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('active');
  hamburger.classList.toggle('active'); 
});