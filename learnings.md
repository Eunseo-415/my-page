# 학습 정리 — 포트폴리오 웹사이트 만들며 배운 것들

과제를 진행하면서 코드를 하나씩 뜯어보고 질문하며 정리한 내용입니다. 실제 프로젝트 코드(`index.html`, `css/style.css`, `js/main.js`)를 예시로 씁니다.

---

## 1. Nav (네비게이션)

### 1-1. 기본 구조
```html
<header class="nav" id="nav">
  <div class="nav-inner">
    <a class="nav-brand">...</a>
    <nav class="nav-menu" id="navMenu">...메뉴 4개...</nav>
    <div class="nav-tools">
      <button id="themeToggle">...</button>
      <button id="hamburger">...</button>
    </div>
  </div>
</header>
```
`nav-inner`가 `display: flex; justify-content: space-between`으로 되어 있어서 로고는 왼쪽, 메뉴/버튼은 오른쪽으로 배치된다.

**Q. CSS 없으면 3개(로고/메뉴/버튼)가 세로로 쌓이는 거 맞아?**
→ 맞다. `a`, `nav`, `div`는 기본적으로 block 계열이라 CSS 없이는 세로로 쌓인다. `.nav-inner { display: flex }` 하나가 이걸 가로 배치로 바꾸는 핵심 스위치다. `justify-content: space-between`이 양끝 정렬, `align-items: center`가 세로 중앙 정렬을 담당한다.

### 1-2. `position: static`의 역할
`.nav-menu`는 모바일에서 `position: absolute`(오버레이로 뜸), 데스크톱(768px↑) 미디어쿼리에서 `position: static`으로 바뀐다.

- `absolute`는 요소를 정상 흐름에서 **완전히 빼내고**, `top/left/right`로 좌표 지정 가능하게 만든다. 기준점은 가장 가까운 `position: static`이 아닌 조상(`.nav`의 `position: fixed`).
- `static`으로 되돌리면 `top/left/right` 지정이 무효가 되고, 다시 부모(`nav-inner`)의 flex 흐름에 정상적으로 복귀한다.

**Q. `display:none`이었던 걸 다시 포지셔닝한 거라고 봐도 돼?**
→ 아니다. `display`(존재 여부)와 `position`(위치 방식)은 별개의 속성이다. 데스크톱 미디어쿼리는 `display: none→flex`(항상 보이게)와 `position: absolute→static`(정상 흐름 복귀)을 **동시에, 각각** 덮어쓰는 것이지 하나가 다른 하나의 결과는 아니다.

### 1-3. 디버깅 사례 1 — `.nav-tool` 오타
```css
.nav-tool { display: flex; ... }  /* 실제 class는 nav-tools(복수) */
```
class 선택자는 **완전히 일치**해야 매칭된다. `s` 하나 빠진 것만으로 해당 규칙은 조용히 무시되고(에러 없음), `nav-tools` 요소는 기본 `display: block`으로 남아 flex가 적용되지 않는다. → 개발자도구 Styles 패널에서 의도한 규칙이 아예 안 뜨는지 확인하는 습관이 필요.

### 1-4. 디버깅 사례 2 — 햄버거는 토글되는데 메뉴가 안 나옴
1차 원인: `.nav-menu`에 대한 CSS 블록(`display:none` 기본값 + `.nav-menu.active { display:flex }`)이 통째로 빠져 있었음. JS의 `classList.toggle('active')`는 클래스만 붙이고, "그 클래스일 때 어떻게 보일지"는 CSS 담당이므로 CSS가 없으면 아무 일도 안 일어난다.

2차 원인(CSS를 다시 추가한 뒤에도 안 보임): `.nav`의 `position: fixed`가 빠져 있었음. `.nav-menu`의 `top: 100%`는 **가장 가까운 positioned 조상**을 기준으로 계산되는데, 그 조상이 없으면 기준점이 문서 전체로 튀어서 메뉴가 화면 훨씬 아래(안 보이는 위치)에 렌더링된다. `display`는 정상 작동해서 안 보이는 이유를 못 찾는 흔한 함정이었다.

**교훈**: "클래스가 실제로 토글되는가(JS 문제 아님) → 해당 클래스에 매칭되는 CSS 규칙이 있는가 → 그 규칙이 계산한 위치가 화면 안에 있는가" 순서로 좁혀가며 디버깅하면 빠르다.

---

## 2. HTML 속성 기초

### 2-1. `id` vs `class`
| | `id` | `class` |
|---|---|---|
| 중복 | 페이지에 하나만 | 여러 요소에 반복 가능 |
| 용도 | JS가 특정 요소 하나를 정확히 지목 (`getElementById`, `#id`) | CSS 스타일 재사용 |

`class="icon-btn"`은 스타일 재사용, `id="themeToggle"`은 `main.js`가 그 버튼 하나만 찾아 이벤트를 걸 때 사용 — 역할이 다르다.

### 2-2. `aria-*` 속성
스크린 리더 등 보조기술 사용자를 위한 정보. 눈으로 보는 사용자에겐 스타일 변화가 없다.
- `aria-label`: 아이콘만 있고 텍스트가 없는 버튼에 대체 텍스트 제공
- `aria-expanded`: 여닫이 요소(햄버거 메뉴)의 현재 열림/닫힘 상태
- `aria-controls`: 이 버튼이 어떤 요소를 제어하는지 명시적으로 연결

CSS로 보이는 변화(아이콘 모양 등)를 스크린 리더가 이해할 수 있는 말로 통역해주는 역할.

### 2-3. 시맨틱 태그
`<div>`는 "상자"라는 뜻뿐이지만, `<header>`/`<nav>`/`<main>`/`<section>`/`<footer>`는 태그 이름 자체가 역할을 말해준다.

이 프로젝트의 기준: 반복/부가 영역(header/footer) vs 핵심 본문(main), 이동 링크 묶음(nav), 제목을 가진 독립 주제 단위(section). GitHub 카드는 "떼어내도 의미가 통하는 콘텐츠"라 `<article>`을 사용.

장점: ① 스크린 리더 탐색 지원(접근성), ② 검색엔진이 구조를 정확히 파악(SEO), ③ class 이름 추측 없이 태그만으로 구조 파악 가능(가독성).

---

## 3. 햄버거 버튼

빈 `<span>` 3개가 어떻게 ☰ 모양이 되는가:
1. `.hamburger { display: grid; gap: 5px }` — 버튼을 grid로 만들어 span 3개를 세로로 쌓음
2. `.hamburger span { width: 20px; height: 1.5px; background: ... }` — 각 span을 얇고 긴 "막대"로 그림
3. `.hamburger.active span:nth-child(1/2/3)` — 클릭 시 1·3번째는 회전+이동, 2번째는 투명화 → X자 모양으로 변형

JS는 `hamburger.addEventListener('click', () => { navMenu.classList.toggle('active'); hamburger.classList.toggle('active'); })`처럼 **클래스만 토글**하고, 실제 모양 변화는 전부 CSS가 담당하는 패턴.

---

## 4. Hero — 타이핑 효과

### 4-1. IIFE (즉시 실행 함수)
```js
(function typewriter() { ... })();
```
함수를 정의하자마자 그 자리에서 즉시 실행하는 문법. `(함수)()`처럼 괄호로 감싸고 바로 호출하면, 함수 안의 변수(`wordIndex`, `charIndex`, `deleting`)가 **전역에 노출되지 않고 그 스코프 안에서만** 존재한다 — 다른 기능과 변수 이름이 겹쳐도 충돌하지 않도록.

### 4-2. 클로저(closure)
안쪽의 `tick()` 함수는 바깥 `typewriter()`의 변수(`el`, `wordIndex` 등)를 계속 읽고 바꿀 수 있다 — `tick`이 몇 번 재호출되든 이 변수들은 사라지지 않고 값을 유지한다.

### 4-3. `setTimeout` vs `setInterval`
- `setInterval`: 한 번 건 간격을 **고정으로 계속 반복**. 간격을 상황마다 바꾸기 어렵고, 느린 콜백이 다음 타이밍과 겹칠 위험이 있음.
- `setTimeout` 재귀 호출(`tick` 안에서 다시 `setTimeout(tick, ...)`): 매번 **다른 간격**을 줄 수 있고, 한 번의 실행이 완전히 끝나야 다음이 예약되므로 겹침이 없음.

타이핑(90ms)/삭제(45ms)/문장유지(1600ms)/다음단어대기(320ms)처럼 **상황마다 간격이 다 다르기 때문에** `setInterval` 하나로는 표현이 안 되고 `setTimeout` 재귀 방식을 쓴 것.

### 4-4. 캐럿(커서) 깜빡임은 순수 CSS
```css
.caret { animation: blink 900ms step-end infinite; }
```
JS와 무관하게 CSS 애니메이션만으로 깜빡임 구현.

---

## 5. Contact 폼

### 5-1. 검증 로직
```js
const rules = {
  name: (v) => (!v.trim() ? '이름을 입력해 주세요.' : ''),
  email: (v) => !v.trim() ? '...' : !EMAIL_RE.test(v.trim()) ? '...' : '',
  message: (v) => !v.trim() ? '...' : v.trim().length < 10 ? '...' : '',
};
```
`rules`는 **필드 이름(string) → 검증 함수**를 담은 객체. 각 함수는 값을 받아 에러 메시지(문제 있음) 또는 빈 문자열(문제 없음)을 반환.

**Q. 이벤트를 생성한다는 게 무슨 뜻이야?**
→ 정확히는 "이벤트를 생성"하는 게 아니라 "이벤트 리스너를 등록"하는 것. 이벤트(타이핑, 포커스 이탈 등)는 브라우저가 발생시키고, `addEventListener`는 "이 이벤트가 발생하면 이 함수를 실행해줘"라고 **미리 예약**해두는 것뿐이다. 또한 `addEventListener`는 `rules[id]` 함수가 아니라 **input DOM 요소**에 붙는다 — `rules[id]`는 그 콜백 안에서 값을 검사하는 도구로 쓰일 뿐, 이벤트가 붙는 대상이 아니다.

### 5-2. 실시간 검증 이벤트
- `blur`(포커스 이탈): 항상 검증 — "입력을 마쳤다"고 볼 수 있는 시점
- `input`(타이핑): **이미 invalid 상태였을 때만** 재검증 — 처음부터 매 글자마다 에러를 띄우면 거슬리므로, 한 번 틀린 뒤 "고쳐지는 과정"만 실시간으로 보여줌

### 5-3. 제출 처리
`event.preventDefault()`로 기본 동작(새로고침)을 막고, 전체 필드 재검증 → 첫 에러 필드에 `.focus()` → 통과 시 폼 초기화 + 성공 메시지.

### 5-4. Formspree 연동
- `<form action="https://formspree.io/f/xxxx">` + `fetch(form.action, { method:'POST', body:new FormData(form) })`
- **받는 사람(To)**: Formspree에 등록한 이메일
- **보낸사람(From)**: Formspree 시스템 주소 (유저 이메일이 아님 — 스팸 방지를 위한 표준 관행)
- **답장 대상(Reply-To)**: 폼의 `name="email"` 필드값 → 자동으로 여기 매핑되어, "답장" 누르면 유저 이메일로 감

**Q. 왜 Formspree에서 이메일이 안 와?**
→ 확인 순서: ① 스팸함 확인, ② Formspree 대시보드 Submissions 탭에서 실제 도달 여부 확인, ③ 첫 제출 시 오는 "폼 활성화 확인 메일"과 "실제 제출 알림(New submission) 메일"을 헷갈리지 않기. 제목이 "New submission"이면 정상적으로 온 실제 알림 메일이다.

### 5-5. 실패 UI 추가
`#formSuccess`와 똑같은 패턴으로 `#formError`(`class="error-text"`, 기본 `hidden`)를 추가하고, `try` 성공 시엔 success만, `catch`에선 error만 노출. 매 제출 시작 시 둘 다 `hidden = true`로 리셋해서 이전 상태가 남지 않게 함.

---

## 6. Projects — GitHub API 연동

### 6-1. 상태 기반 렌더링
```js
const projState = { status: 'loading', repos: [], filter: 'All' };
```
`status`(`loading`/`success`/`error`) 값 하나로 로딩 스켈레톤 / 에러+재시도 / 카드 그리드 / 빈 결과 문구, 네 가지 화면의 `hidden`을 전부 결정.

### 6-2. `fetch` + `async/await`
```js
async function loadRepos() {
  projState.status = 'loading'; renderProjects();
  try {
    const res = await fetch(`https://api.github.com/users/${CONFIG.githubUser}/repos?...`);
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = await res.json();
    projState.repos = data.filter((r) => !r.fork).slice(0, CONFIG.maxRepos);
    projState.status = 'success';
  } catch (err) { projState.status = 'error'; }
  renderProjects();
}
```
`await`은 "끝날 때까지 기다렸다가 다음 줄로"라는 뜻이며 `async` 함수 안에서만 쓸 수 있다. `try/catch`로 네트워크 실패·4xx/5xx 응답을 잡아 에러 상태로 전환.

### 6-3. 배열 메서드
- **`map`**: 저장소 객체 배열 → 카드 HTML 문자열 배열로 변환 (`repos.map(r => \`<article>...\`)`)
- **`filter`**: fork 저장소 제외(`!r.fork`), 언어별 필터링(`r.language === filter`)
- **`new Set(...)`**: 언어 목록 중복 제거

### 6-4. 구조분해 할당
```js
const { status, repos, filter } = projState;
```
객체 속성을 여러 줄 안 쓰고 한 줄로 꺼내는 문법.

### 6-5. XSS 방지 — `escapeHtml`
GitHub 저장소 설명은 **외부(유저 제어) 텍스트**이므로, `<`, `>`, `&`, `"`를 HTML 엔티티로 치환하지 않고 그대로 `innerHTML`에 넣으면 스크립트 삽입(XSS) 위험이 있다. `escapeHtml`로 이스케이프 후 삽입.

### 6-6. 이벤트 위임
필터 버튼은 매번 `innerHTML`로 새로 그려지므로, 버튼 개별이 아니라 **부모(`#filters`) 하나에만** 클릭 리스너를 걸고 `event.target.closest('.filter-btn')`으로 실제 클릭된 버튼을 찾는다. 요소가 재생성되어도 리스너를 다시 달 필요가 없다.

### 6-7. Grid 반응형
```css
.card-grid { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
```
미디어쿼리 없이 화면 폭에 따라 카드 열 개수가 자동 조정.

---

## 7. JS 문법 정리

### 7-1. `const $ = (sel) => document.querySelector(sel);`
- `document.querySelector`를 매번 길게 안 쓰려고 만든 별명 함수
- `(sel) => 식`은 화살표 함수 — `{ return ... }` 없이 식 하나만 쓰면 자동 반환(암묵적 반환)
- `$`라는 이름은 jQuery의 `$('선택자')` 관행을 따온 것 (특별한 문법 아님, 그냥 변수명으로 `$` 사용 가능)

### 7-2. 삼항 연산자
```js
charIndex += deleting ? -1 : 1;
```
`조건 ? A : B` = "조건이 참이면 A, 거짓이면 B"의 축약형.

---

## 8. "이벤트 → 상태 변경 → DOM 업데이트" 흐름 (React의 기초)

이 프로젝트를 관통하는 핵심 패턴. JS가 직접 화면을 조작하지 않고, **상태 값을 바꾼 뒤 → 그 상태를 반영하는 렌더 함수를 다시 호출**하는 구조.

| 기능 | 이벤트 | 상태 변경 | 렌더 함수 |
|---|---|---|---|
| 다크모드 | 토글 클릭 | `themeState.theme` | `renderTheme()` |
| 프로젝트 | fetch 완료 | `projState.status` | `renderProjects()` |
| 폼 검증 | input/blur | 필드별 에러 메시지 | `renderFieldError()` |
| 필터 | 버튼 클릭 | `projState.filter` | `renderProjects()` 재호출 |

React는 "상태가 바뀌면 자동으로 다시 렌더링"되는 게 핵심인데, 여기선 그 "자동"을 수동으로 구현한 것 — 상태를 바꾼 다음 항상 렌더 함수를 명시적으로 재호출해야 한다. 이 패턴에 익숙해지면 React의 `useState` + 리렌더링 개념이 자연스럽게 이어진다.

---

## 9. Flexbox vs Grid — 선택 기준

| | Flexbox | Grid |
|---|---|---|
| 차원 | 1차원 (한 줄/한 열) | 2차원 (행+열 동시) |
| 이 프로젝트 예 | `.nav-inner`(로고-메뉴 한 줄 배치), `.hero-cta` | `.card-grid`(카드 개수 가변, 화면폭 따라 행/열 자동 계산) |
| 선택 기준 | "한 방향으로 나열 + 정렬"만 필요할 때 | "행과 열을 동시에 계획"해야 할 때 (개수 가변 + 반응형) |

---

## 10. 스크롤 관련 기능

### 10-1. 부드러운 스크롤 + 고정 헤더 보정
```js
const top = target.getBoundingClientRect().top + window.scrollY - 72;
window.scrollTo({ top, behavior: 'smooth' });
```
CSS `scroll-behavior: smooth`만으로도 부드러운 스크롤은 되지만, **고정 네비 높이(72px)만큼 보정**이 안 되면 목표 섹션 제목이 헤더에 가려진다. 그래서 `event.preventDefault()`로 브라우저 기본 점프를 막고, `getBoundingClientRect().top + scrollY`로 문서 기준 절대 좌표를 구한 뒤 `-72`만큼 빼서 JS가 직접 스크롤 위치를 계산한다.

### 10-2. 스크롤 상태 → 네비 스타일 / 탑 버튼
```js
nav.classList.toggle('scrolled', y > CONFIG.navThreshold);   // 60px
toTop.classList.toggle('visible', y > CONFIG.topBtnThreshold); // 300px
```
스크롤 위치(상태)에 따라 클래스만 토글하고, 실제 배경색 변화·블러·버튼 노출은 CSS가 담당.

### 10-3. Intersection Observer (스크롤 등장 애니메이션)
`.reveal` 요소가 뷰포트에 20%(threshold: 0.2) 이상 들어오면 `.in-view` 클래스를 붙이고 관찰을 해제(1회만 실행) — `scroll` 이벤트로 매번 위치를 계산하는 것보다 성능이 좋은 방식.

---

## 11. 과제 학습 목표 — 최종 정리

1. **시맨틱 태그**: 태그 이름이 역할을 말해줌 → 접근성/SEO/가독성을 위해 header·nav·main·section·footer·article로 구조화
2. **Flexbox vs Grid**: 1차원 나열엔 Flexbox(네비), 2차원 반응형 배치엔 Grid(카드)
3. **querySelector + addEventListener**: 요소를 먼저 찾고(`querySelector`) → 이벤트 발생 시 실행할 콜백을 등록(`addEventListener`)하는 2단계 흐름
4. **화살표 함수/구조분해/map·filter**: 짧고 읽기 쉬운 문법으로 콜백 작성, 객체 값 추출, 배열 변환·필터링을 표현
5. **fetch + async/await**: 비동기 요청 결과를 기다렸다가(`await`) 성공/실패를 `try/catch`로 나누고, `status` 상태값으로 로딩/성공/에러 UI를 전환
6. **이벤트 → 상태 → 렌더링**: 모든 인터랙션이 "이벤트 발생 → 상태 객체 변경 → 렌더 함수 재호출"이라는 동일한 패턴을 따름 — React의 상태-렌더링 흐름의 수동 버전
