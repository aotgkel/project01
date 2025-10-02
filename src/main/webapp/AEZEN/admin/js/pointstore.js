// pointstore.js
// 반드시 home.js (기본 기능) 다음에 로드되어야 합니다.
document.addEventListener("DOMContentLoaded", () => {
  const topButtonsWrap = document.querySelector(".top-buttons");
  const feedButtonsWrap = document.querySelector(".feed-buttons");
  const postsContainer = document.querySelector(".posts");
  const sidebar = document.querySelector(".sidebar");
  // 사이드바의 '아이템구매' (pointshop.html) 링크와 '상품응모/당첨자발표' (pointstore.html) 링크
  const itemShopLink = document.querySelector('a[href="../main/pointshop.html"]');
  const pointstoreLink = document.querySelector('a[href="../main/pointstore.html"]');

  if (!topButtonsWrap || !feedButtonsWrap || !postsContainer) {
    console.warn("pointstore.js: 필수 요소(.top-buttons, .feed-buttons, .posts)를 찾지 못했습니다.");
    return;
  }

  // 원래 상태 백업 (복구용)
  const originalTopHTML = topButtonsWrap.innerHTML;
  const originalFeedHTML = feedButtonsWrap.innerHTML;
  const originalPostsHTML = postsContainer.innerHTML;

  // ---------- 유틸: 기존 home.js의 동작 일부를 재적용하기 위한 초기화 함수들 ----------

  // 1) top-buttons / feed-buttons에 active 상태 바인딩
  function bindTopAndFeedButtons() {
    const topBtns = topButtonsWrap.querySelectorAll("button");
    const feedBtns = feedButtonsWrap.querySelectorAll("button");

    // 초기 active 설정
    if (topBtns.length > 0) topBtns.forEach(b => b.classList.remove("active"));
    if (feedBtns.length > 0) feedBtns.forEach(b => b.classList.remove("active"));
    if (topBtns.length > 0) topBtns[0].classList.add("active");
    if (feedBtns.length > 0) feedBtns[0].classList.add("active");

    // 클릭 시 active 처리 (간단)
    topBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        topBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    feedBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        feedBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  }

  // 2) "검색순" 버튼에 툴팁형 검색창 바인딩 (home.js와 유사 기능 재구성)
  function bindInlineSearchUnderSearchSort() {
    // cleanup existing if any
    const existing = topButtonsWrap.querySelector(".inline-search-box");
    if (existing) existing.remove();

    const topBtns = Array.from(topButtonsWrap.querySelectorAll("button"));
    const searchBtn = topBtns.find(btn => btn.textContent && btn.textContent.includes("검색순"));
    let searchBox = null;

    if (!searchBtn) return;

    // Ensure parent positioned for absolute placement
    topButtonsWrap.style.position = topButtonsWrap.style.position || "relative";

    searchBtn.addEventListener("click", () => {
      if (searchBox) {
        searchBox.remove();
        searchBox = null;
        return;
      }

      searchBox = document.createElement("div");
      searchBox.className = "inline-search-box";
      searchBox.style.position = "absolute";
      searchBox.style.top = "100%";
      // left/width tuned to avoid horizontal scrollbar issues
      searchBox.style.left = "-12px";
      searchBox.style.width = "calc(100% + 24px)";
      searchBox.style.boxSizing = "border-box";
      searchBox.style.zIndex = 1500;
      searchBox.innerHTML = `
        <select id="inlineSearchType">
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="author">작성자</option>
          <option value="hashtag">해시태그</option>
        </select>
        <input type="text" placeholder="검색어 입력..." id="inlineSearchInput">
        <div style="display:flex; gap:6px;">
          <button id="inlineSearchSubmit">검색</button>
          <button id="inlineSearchClose">닫기</button>
        </div>
      `;

      topButtonsWrap.appendChild(searchBox);

      const typeSelect = searchBox.querySelector("#inlineSearchType");
      const input = searchBox.querySelector("#inlineSearchInput");
      const submit = searchBox.querySelector("#inlineSearchSubmit");
      const close = searchBox.querySelector("#inlineSearchClose");

      input.focus();

      submit.addEventListener("click", () => {
        const keyword = input.value.trim();
        const type = typeSelect.value;
        if (!keyword) {
          alert("검색어를 입력하세요.");
          return;
        }
        alert(`'${keyword}'를 [${type}]에서 검색합니다.`);
        // TODO: 실제 검색 API 호출로 연결
      });

      close.addEventListener("click", () => {
        if (searchBox) {
          searchBox.remove();
          searchBox = null;
        }
      });
    });
  }

  // 3) posts 내부의 "더보기" 등 per-post 초기화 (home.js에서 페이지 로드 시 하던 작업 일부)
  //    (home.js had similar logic at initial load — we must rebind for newly injected posts)
function bindPerPostMoreAndAnswerToggle() {
  postsContainer.querySelectorAll(".post").forEach(post => {
    if (post.dataset._bound === "true") return;

    const postBody = post.querySelector(".post-body");
    const moreBtn = post.querySelector(".more");
    const imageBox = post.querySelector(".post-images");
    const comments = post.querySelector(".comments");
    const commentForm = post.querySelector(".comment-form");

    if (postBody && moreBtn) {
      moreBtn.addEventListener("click", (e) => {
        e.preventDefault();
        postBody.classList.toggle("expanded");
        if (imageBox) imageBox.style.display = postBody.classList.contains("expanded") ? "flex" : "none";
        if (comments && commentForm) {
          comments.style.display = postBody.classList.contains("expanded") ? "block" : "none";
          commentForm.style.display = postBody.classList.contains("expanded") ? "flex" : "none";
        }
        moreBtn.textContent = postBody.classList.contains("expanded") ? "접기" : "더보기";
      });
    }

    // 답안 토글 버튼 (있다면)
    const answerBtn = post.querySelector('.answer-toggle .answer-btn');
    if (answerBtn) {
      answerBtn.addEventListener('click', () => {
        const answers = post.querySelector('.answers');
        if (answers) answers.classList.toggle('show');
      });
    }

    post.dataset._bound = "true";
  });
}


  // 호출해서 초기 상태에 대해 바인딩(혹시 복구 시 사용)
  function rebindHomeSubFeatures() {
    bindTopAndFeedButtons();
    bindInlineSearchUnderSearchSort();
    bindPerPostMoreAndAnswerToggle();
    // 다른 home.js 전역(문서 위임) 이벤트들은 이미 home.js에서 document에 붙어있기 때문에 그대로 동작함.
  }

  // ---------- 아이템샵(상품판매) HTML 템플릿 (상품카드형) ----------
  function getItemShopPostsHTML() {
    return `
      <div class="post item-card">
        <div class="post-header">
          <span class="kind">[아이템]</span>
          <span class="title">😀 개죽이 아이콘 패키지</span>
          <span class="nick">상점관리자</span>
          <span class="hit">구매수: 45</span>
          <span class="wdate">2025-09-29</span>
        </div>
        <div class="post-body">
          <div class="item-row" style="display:flex; gap:12px; align-items:center;">
            <img src="../img/gae.jpg" alt="icon" style="width:80px;height:80px;border-radius:8px;object-fit:cover;">
            <div style="flex:1;">
              <div class="bnote">프로필에 사용할 수 있는 개죽이 아이콘 세트입니다. 사용권 구매 시 프로필에 적용됩니다.</div>
              <div style="margin-top:8px;">가격: <strong>2,500 P</strong></div>
            </div>
            <div>
              <button class="buy-btn">구매</button>
            </div>
          </div>
        </div>
        <div class="post-footer">
        </div>
      </div>

      <div class="post item-card">
        <div class="post-header">
          <span class="kind">[아이템]</span>
          <span class="title">🌌 아이오니아 휘장</span>
          <span class="nick">상점관리자</span>
          <span class="hit">구매수: 30</span>
          <span class="wdate">2025-09-28</span>
        </div>
        <div class="post-body">
          <div class="item-row" style="display:flex; gap:12px; align-items:center;">
            <img src="../img/gnlwkd.png" alt="bg" style="width:120px;height:80px;border-radius:8px;object-fit:cover;">
            <div style="flex:1;">
              <div class="bnote">마이페이지 및 아이콘에 사용할 수 있는 휘장 아이템 입니다.</div>
              <div style="margin-top:8px;">가격: <strong>5,000 P</strong></div>
            </div>
            <div>
              <button class="buy-btn">구매</button>
            </div>
          </div>
        </div>
        <div class="post-footer">
        </div>
      </div>
    `;
  }

  // ---------- 모드 전환 함수 ----------
  function activateItemShopMode() {
    // 1) 상단 버튼 바꿔치기 (정렬)
    topButtonsWrap.innerHTML = `
      <button>최신순</button>
      <button>인기순</button>
      <button>낮은 가격순</button>
      <button>높은 가격순</button>
    `;

    // 2) feed-buttons 바꿔치기 (필터)
    feedButtonsWrap.innerHTML = `
      <button>전체</button>
      <button>아이콘</button>
      <button>휘장</button>
      <button>배경이미지</button>
    `;

    // 3) 게시글을 상품카드 형태로 교체
    postsContainer.innerHTML = getItemShopPostsHTML();

    // 4) 사이드바에서 pointshop 링크 (아이템구매) 버튼을 active로 표시
    //    (사이드바 탭은 .tab-button 형식이면 그걸 활성화, 아니면 링크에 selected 스타일 추가)
    // try to activate the sidebar tab button if present
    const sidebarTabButtons = document.querySelectorAll('.sidebar-tabs .tab-button');
    sidebarTabButtons.forEach(btn => {
      if (btn.dataset.target === 'panel-pointstore') {
        // keep pointstore tab as is
      }
    });
    // visually mark the pointshop link (if it's in list)
    const li = itemShopLink ? itemShopLink.closest('li') : null;
    if (li) {
      // remove selected from siblings
      const siblings = li.parentElement.querySelectorAll('li');
      siblings.forEach(s => s.classList.remove('selected'));
      li.classList.add('selected');
    }

    // 5) 새로 생성된 버튼/게시글에 대해 필요한 바인딩 수행
    //    (active 상태, 검색 버튼 등)
    bindTopAndFeedButtons();
    // item mode probably doesn't need inline search, but safe to bind (it will be no-op if no 검색순)
    bindInlineSearchUnderSearchSort();

    // bind per-post "buy" buttons or more toggles if needed
    postsContainer.querySelectorAll('.post').forEach(p => {
      // 구매 버튼 동작 예시
      const buyBtn = p.querySelector('.buy-btn');
      if (buyBtn) {
        buyBtn.addEventListener('click', () => {
          alert('구매 흐름을 시작합니다. (서버 연동 필요)');
        });
      }
    });

    // mark that we are in item mode
    postsContainer.dataset.mode = "itemshop";
  }

  function restoreOriginalBoardMode() {
    // 복원
    topButtonsWrap.innerHTML = originalTopHTML;
    feedButtonsWrap.innerHTML = originalFeedHTML;
    postsContainer.innerHTML = originalPostsHTML;

    // remove mode mark
    delete postsContainer.dataset.mode;

    // restore sidebar selection: pointstore list item -> find the one matching pointstoreLink
    if (pointstoreLink) {
      const li = pointstoreLink.closest('li');
      if (li) {
        // clear all siblings' selected
        const siblings = li.parentElement.querySelectorAll('li');
        siblings.forEach(s => s.classList.remove('selected'));
        li.classList.add('selected');
      }
    }

    // Now rebind the dynamic handlers that home.js would have set at initial load.
    // home.js executed earlier and attached many "document" delegated handlers,
    // but it also attached per-element handlers for topButtons/feedButtons/search/more — we need to rebind those.
    rebindHomeSubFeatures();

    // Additionally ensure any global handlers in home.js that were bound to specific elements (e.g., loginBtn)
    // are still pointing to correct elements — in our HTML replacement we didn't remove login area, so they remain.
  }

  // ---------- 이벤트 연결: 사이드바 링크 클릭해서 모드 전환 ----------
  if (itemShopLink) {
    itemShopLink.addEventListener("click", (e) => {
      e.preventDefault();
      activateItemShopMode();
    });
  }

  if (pointstoreLink) {
    pointstoreLink.addEventListener("click", (e) => {
      e.preventDefault();
      restoreOriginalBoardMode();
    });
  }

  // ---------- 초기 바인딩: 페이지 로드 시 원래 기능 보장 ----------
  // rebind home.js sub features for the initial DOM (in case pointstore.js loaded after home.js)
  // This will ensure top/feed buttons / 검색순 binding / per-post more binding are active.
  rebindHomeSubFeatures();
});
