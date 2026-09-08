
const CONFIG = {
  githubUser: 'Eunseo-415',   // GitHub 사용자명
  maxRepos: 6,
  navThreshold: 60,           // 네비 스타일 변경 기준 (px)
  topBtnThreshold: 300,       // 스크롤 탑 버튼 노출 기준 (px)
  revealThreshold: 0.2,       // Intersection Observer threshold
  typeSpeed: 90,              // 타이핑 속도 (ms/글자)
  typeHold: 1600,             // 단어 유지 시간 (ms)
  typeWords: ['Flutter 앱 개발자입니다', '자바 백엔드 개발자입니다', '가르치며 배우는 개발자입니다'],
};


const $ = (sel) => document.querySelector(sel);
const hamburger = $('#hamburger');
const navMenu = $('#navMenu');
hamburger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('active');
  hamburger.classList.toggle('active'); 
});

/* ──  타이핑 효과 ─────────────────────────────── */
(function typewriter() {
  const el = $('#typed');
  let wordIndex = 0; //지금 몇번째 단어인지
  let charIndex = 0; //지금 몇글자까지 보여줬는지
  let deleting = false;

  function tick() {
    const word = CONFIG.typeWords[wordIndex];
    charIndex += deleting ? -1 : 1;
    el.textContent = word.slice(0, charIndex);

    if (!deleting && charIndex === word.length) {
      deleting = true;
      return setTimeout(tick, CONFIG.typeHold); //다 쳤으면 잠깐 홀드
    }
    if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % CONFIG.typeWords.length; //다음 단어로
      return setTimeout(tick, 320);
    }
    setTimeout(tick, deleting ? CONFIG.typeSpeed / 2 : CONFIG.typeSpeed);
  }
  tick();
})();
