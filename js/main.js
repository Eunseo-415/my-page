
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
/* ──  스크롤 상태 →  탑 버튼 ─────── */
const toTop = $('#toTop');
function onScroll() {
  const y = window.scrollY;
  toTop.classList.toggle('visible', y > CONFIG.topBtnThreshold);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── Contact 폼 검증
   입력 → 유효성 상태 → 에러 메시지 표시/숨김 */
const form = $('#contactForm');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

// 검증 규칙
const rules = {
  name: (v) => (!v.trim() ? '이름을 입력해 주세요.' : ''),
  email: (v) =>
    !v.trim() ? '이메일을 입력해 주세요.' : !EMAIL_RE.test(v.trim()) ? '이메일 형식이 올바르지 않습니다.' : '',
  message: (v) =>
    !v.trim() ? '메시지를 입력해 주세요.' : v.trim().length < 10 ? '10자 이상 입력해 주세요.' : '',
};
//  에러 표시
function renderFieldError(id, message) {
  const input = document.getElementById(id);
  const errEl = document.getElementById(`err-${id}`);
  errEl.textContent = message;
  errEl.hidden = !message;
  input.classList.toggle('invalid', Boolean(message));
}
// 실시간 검증 이벤트
Object.keys(rules).forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener('input', () => {
    if (input.classList.contains('invalid')) renderFieldError(id, rules[id](input.value));
  });
  input.addEventListener('blur', () => renderFieldError(id, rules[id](input.value)));
});
//제출 처리
form.addEventListener('submit', async (event) => {
  event.preventDefault();  // 일단 막고
  $('#formSuccess').hidden = true;

  let firstInvalid = null;
  Object.keys(rules).forEach((id) => {
    const message = rules[id](document.getElementById(id).value);
    renderFieldError(id, message);
    if (message && !firstInvalid) firstInvalid = id;
  });

  if (firstInvalid) {
    document.getElementById(firstInvalid).focus();
    return;
  }

  // 검증 통과 → fetch로 Formspree에 전송
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error('전송 실패');
    form.reset();
    $('#formSuccess').hidden = false;
  } catch (err) {
    console.error(err);
    // 전송 실패 에러 UI 필요하면 여기 추가
  }
});