
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

/* ──  스크롤 상태 → 네비게이션 배경 ───────────── */
const nav = $('#nav');
function onNavScroll() {
  nav.classList.toggle('scrolled', window.scrollY > CONFIG.navThreshold);
}
window.addEventListener('scroll', onNavScroll, { passive: true });
onNavScroll();

/* ──  스크롤 상태 → 등장 애니메이션 (Intersection Observer) ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: CONFIG.revealThreshold });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ── 메뉴 닫기 ───────────── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ──  다크 모드 ───────────────────────────────
   상태(theme) → localStorage 저장 → data-theme 속성 → 전체 스타일 */
const themeState = { theme: localStorage.getItem('theme') || 'light' };

function renderTheme() {
  document.documentElement.setAttribute('data-theme', themeState.theme);
  $('#themeIcon').textContent = themeState.theme === 'dark' ? '☀' : '☾';
  $('#themeToggle').setAttribute(
    'aria-label',
    themeState.theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'
  );
  localStorage.setItem('theme', themeState.theme);
}

$('#themeToggle').addEventListener('click', () => {
  themeState.theme = themeState.theme === 'dark' ? 'light' : 'dark';
  renderTheme();
});
renderTheme();



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
    $('#formError').hidden = false;  
  }
});

/* ──  Projects — GitHub API
   상태(status/repos/filter) → 로딩·에러·성공 렌더링 */
const projState = { status: 'loading', repos: [], filter: 'All' };

const els = {
  loading: $('#projLoading'),
  error: $('#projError'),
  grid: $('#projGrid'),
  empty: $('#projEmpty'),
  filters: $('#filters'),
};
// 화면 그리기
function renderProjects() {
  const { status, repos, filter } = projState;

  els.loading.hidden = status !== 'loading';
  els.error.hidden = status !== 'error';
  els.grid.hidden = status !== 'success';
  els.filters.hidden = status !== 'success';
  els.empty.hidden = true;

  if (status !== 'success') return;

  // 필터 버튼
  const langs = ['All', ...new Set(repos.map((r) => r.language).filter(Boolean))];
  els.filters.innerHTML = langs
    .map(
      (l) =>
        `<button type="button" class="filter-btn${l === filter ? ' active' : ''}" data-lang="${l}">${l}</button>`
    )
    .join('');

  const visible = filter === 'All' ? repos : repos.filter((r) => r.language === filter);
  els.empty.hidden = visible.length > 0;
  //  카드 그리기
  els.grid.innerHTML = visible
    .map(
      (r) => `
      <article class="card">
        <p class="card-kicker">${r.language || 'Repository'}</p>
        <h3 class="card-title"><a href="${r.html_url}" target="_blank" rel="noopener">${r.name}</a></h3>
        <p class="card-body">${r.description ? escapeHtml(r.description) : '설명이 없는 저장소입니다.'}</p>
        <p class="card-meta">
          <span><strong>★ ${r.stargazers_count}</strong> stars</span>
          <span>포크 ${r.forks_count}</span>
          <span>${new Date(r.pushed_at).toLocaleDateString('ko-KR')} 갱신</span>
        </p>
      </article>`
    )
    .join('');
}
// 설명(description)에 혹시 들어갈 html 태그를 텍스트로 읽게 하는것
function escapeHtml(str) {
  return str.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
//필터버튼 클릭 처리
els.filters.addEventListener('click', (event) => {
  const btn = event.target.closest('.filter-btn');
  if (!btn) return;
  projState.filter = btn.dataset.lang;
  renderProjects();
});
//데이터 가져오기
async function loadRepos() {
  projState.status = 'loading';
  renderProjects();
  try {
    const res = await fetch(
      `https://api.github.com/users/${CONFIG.githubUser}/repos?sort=pushed&per_page=100`
    );
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = await res.json();
    projState.repos = data.filter((r) => !r.fork).slice(0, CONFIG.maxRepos);
    projState.status = 'success';
  } catch (err) {
    console.error(err);
    projState.status = 'error';
  }
  renderProjects();
}
//재시도 버튼
$('#retryBtn').addEventListener('click', loadRepos);
loadRepos();