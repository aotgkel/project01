document.addEventListener("DOMContentLoaded", () => {

  /************* 공통 이벤트 *************/
  // 1. 로그인 기능
  const loginBox = document.querySelector(".login-box");
  const icons = document.querySelector("header .icons");
  const loginBtn = document.getElementById("loginBtn");

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const id = document.getElementById("loginId").value.trim();
    const pw = document.getElementById("loginPw").value.trim();

    if (id && pw) {
      alert("로그인 성공!");
      loginBox.style.display = "none";
      icons.style.display = "flex";
    } else {
      alert("아이디와 비밀번호를 입력하세요.");
    }
  });

  // 2. 로그인 아이콘 버튼 동작 (로그아웃 포함)
  const iconButtons = document.querySelectorAll(".icons button");
  let activeBalloon = null;

  iconButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const tooltip = btn.getAttribute("data-tooltip");

      // 마이페이지 이동
      if (tooltip === "마이페이지") {
        window.location.href = "mypage.html";
        return;
      }

      // 로그아웃 처리
      if (tooltip === "로그아웃") {
        loginBox.style.display = "block";
        icons.style.display = "none";
        alert("로그아웃 되었습니다.");
        return;
      }

      // 나머지 아이콘 툴팁 표시
      if (activeBalloon) {
        activeBalloon.remove();
        activeBalloon = null;
      }

      const balloon = document.createElement("div");
      balloon.className = "balloon";
      balloon.textContent = `${tooltip} 요약 정보가 표시됩니다.`;

      document.body.appendChild(balloon);

      const rect = btn.getBoundingClientRect();
      balloon.style.position = "absolute";
      balloon.style.top = `${rect.bottom + window.scrollY + 8}px`;
      balloon.style.left = `${rect.left + window.scrollX}px`;

      activeBalloon = balloon;

      document.addEventListener("click", function closeBalloon(ev) {
        if (!btn.contains(ev.target) && !balloon.contains(ev.target)) {
          balloon.remove();
          activeBalloon = null;
          document.removeEventListener("click", closeBalloon);
        }
      });
    });
  });
  
  // 3. 정렬버튼 선택됨 상태 및 초기값 설정
  const topButtons = document.querySelectorAll(".top-buttons button");
  const feedButtons = document.querySelectorAll(".feed-buttons button");
  if (topButtons.length > 0) topButtons[0].classList.add("active");
  if (feedButtons.length > 0) feedButtons[0].classList.add("active");

  function setActive(buttons, clicked) {
    buttons.forEach(btn => btn.classList.remove("active"));
    clicked.classList.add("active");
  }
  topButtons.forEach(btn => {
    btn.addEventListener("click", () => setActive(topButtons, btn));
  });
  feedButtons.forEach(btn => {
    btn.addEventListener("click", () => setActive(feedButtons, btn));
  });
  
// 검색순 버튼 아래 툴팁형 검색창
const searchBtn = Array.from(topButtons).find(
  btn => btn.textContent.includes("검색순")
);

let searchBox = null;

if (searchBtn) {
  // 부모를 relative로 지정해줘야 position:absolute가 버튼 기준으로 잡힘
  searchBtn.parentElement.style.position = "relative";

  searchBtn.addEventListener("click", () => {
    // 이미 열려 있으면 닫기
    if (searchBox) {
      searchBox.remove();
      searchBox = null;
      return;
    }

    // 검색창 생성
    searchBox = document.createElement("div");
    searchBox.className = "inline-search-box";
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

    // 버튼 컨테이너에 붙이기
    searchBtn.parentElement.appendChild(searchBox);

    // 이벤트 연결
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
      // 🔥 여기서 실제 검색 API 연동
    });

    close.addEventListener("click", () => {
      searchBox.remove();
      searchBox = null;
    });
  });
}

  
  // 4. 사이드바 채팅-메뉴 선택 기능
  const tabButtons = document.querySelectorAll('.sidebar-tabs .tab-button');
  const panels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      panels.forEach(p => {
        p.classList.add('hidden');
        p.setAttribute('aria-hidden', 'true');
      });
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        target.classList.remove('hidden');
        target.setAttribute('aria-hidden', 'false');
      }
    });
  });

  /********** 게시글 영역 이벤트 ************/
  // 5. 통합 더보기 이벤트 (본문 확장 + 이미지 토글 + 댓글 토글)
  const MAX_LENGTH = 100;

  document.querySelectorAll(".post").forEach(post => {
  const body = post.querySelector(".bnote");
  const moreBtn = post.querySelector(".more");
  const imageBox = post.querySelector(".post-images");
  const comments = post.querySelector(".comments");
  const commentForm = post.querySelector(".comment-form");

  if (!body || !moreBtn) return;

  // 원문 저장
  const fullText = body.textContent.trim();
  const shortText =
    fullText.length > MAX_LENGTH
      ? fullText.substring(0, MAX_LENGTH) + "..."
      : fullText.padEnd(MAX_LENGTH, " "); // ✅ 짧아도 길이를 맞춤

  // 처음엔 요약본 표시
  body.textContent = shortText;
  let expanded = false;

  moreBtn.addEventListener("click", (e) => {
    e.preventDefault();
    expanded = !expanded;

    // 1) 본문 확장/축소
    body.textContent = expanded ? fullText : shortText;

    // 2) 이미지 토글
    if (imageBox) {
      imageBox.style.display = expanded ? "flex" : "none";
    }

    // 3) 댓글 + 입력창 토글
    if (comments && commentForm) {
      comments.style.display = expanded ? "block" : "none";
      commentForm.style.display = expanded ? "flex" : "none";
    }

    // 버튼 텍스트 변경
    moreBtn.textContent = expanded ? "접기" : "더보기";
  });
});

// 6. 닉네임 드롭다운
document.addEventListener('click', (e) => {
  const clickedDropdown = e.target.closest('.nick.dropdown');
  document.querySelectorAll('.nick.dropdown.open')
    .forEach(d => {
      if (d !== clickedDropdown) d.classList.remove('open');
    });
  if (clickedDropdown) {
    clickedDropdown.classList.toggle('open');
    }
  });

// 신고모달
const modal = document.getElementById("reportModal");
const reportForm = document.getElementById("reportForm");
const cancelBtn = document.getElementById("cancelBtn");

if (modal) {
  const closeBtn = modal.querySelector(".close");
  let currentPostId = null;

  document.querySelectorAll(".report").forEach(btn => {
    btn.addEventListener("click", (e) => {
      currentPostId = e.target.dataset.postId;
      modal.style.display = "block";
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", () => modal.style.display = "none");
  if (cancelBtn) cancelBtn.addEventListener("click", () => modal.style.display = "none");

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  if (reportForm) {
    reportForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const reason = document.querySelector("input[name='reason']:checked");
      if (!reason) {
        alert("신고 사유를 선택해주세요.");
        return;
      }
      alert(`게시글 ${currentPostId}번이 '${reason.value}' 사유로 신고되었습니다.`);
      modal.style.display = "none";
      e.target.reset();
    });
  }
}

  // 8. 추천기능
  document.querySelectorAll(".post-up").forEach(btn => {
    btn.addEventListener("click", () => alert("게시글을 추천하셨습니다"));
  });
  document.querySelectorAll(".post-down").forEach(btn => {
    btn.addEventListener("click", () => alert("게시글을 비추천하셨습니다"));
  });
  document.querySelectorAll(".comment-up").forEach(btn => {
    btn.addEventListener("click", () => alert("댓글을 추천하셨습니다"));
  });
  document.querySelectorAll(".comment-down").forEach(btn => {
    btn.addEventListener("click", () => alert("댓글을 비추천하셨습니다"));
  });

  // 9. 답안 토글 + 채택
  document.querySelectorAll('.answer-toggle .answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const post = btn.closest('.post');
      if (!post) return;
      const answers = post.querySelector('.answers');
      if (answers) answers.classList.toggle('show');
    });
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.a-choice');
    if (!btn) return;
    e.preventDefault();
    if (!confirm('답안을 채택하시겠습니까?')) return;

    const answerItem = btn.closest('.answer-item');
    const textDiv = answerItem.querySelector('.a-text');
    if (textDiv && !textDiv.querySelector('.chosen-label')) {
      const label = document.createElement('span');
      label.className = 'chosen-label';
      label.textContent = '채택된 답안';
      textDiv.prepend(label);
    }
    btn.textContent = '채택 완료';
    btn.disabled = true;
    btn.classList.add('disabled');
  });

  // 10. 글쓰기 버튼 이벤트
  const writeBtn = document.getElementById("writeBtn");
  if (writeBtn) {
    writeBtn.addEventListener("click", () => {
      window.location.href = "write.html";
    });
  }

  // 11. 댓글/답변 수정/삭제 기능
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn') && e.target.dataset.type === 'post') {
      const post = e.target.closest('.post');
      if (post && confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
        post.remove();
      }
    } else if (e.target.classList.contains('delete-btn') && e.target.dataset.type === 'comment') {
      const commentItem = e.target.closest('.comment-item');
      if (commentItem && confirm('이 댓글을 삭제하시겠습니까?')) {
        commentItem.remove();
      }
    } else if (e.target.classList.contains('delete-btn') && e.target.dataset.type === 'answer') {
      const answerItem = e.target.closest('.answer-item');
      if (answerItem && confirm('이 답변을 삭제하시겠습니까?')) {
        answerItem.remove();
      }
    } else if (e.target.classList.contains('edit-btn')) {
      const commentItem = e.target.closest('.comment-item');
      if (commentItem) {
        const textEl = commentItem.querySelector('.c-text');
        const post = commentItem.closest('.post');
        const commentForm = post.querySelector('.comment-form');
        const textarea = commentForm.querySelector('textarea');
        const submitBtn = commentForm.querySelector('.submit-comment');

        if (textEl && textarea && submitBtn) {
          textarea.value = textEl.textContent.trim();
          textarea.dataset.editing = "true";
          textarea.dataset.targetId = commentItem.dataset.id;
          textarea.dataset.editType = "comment";
          submitBtn.textContent = "수정완료";
          textarea.focus();
        }
      } else {
        const answerItem = e.target.closest('.answer-item');
        if (answerItem) {
          const textEl = answerItem.querySelector('.a-text');
          const post = answerItem.closest('.post');
          const answerForm = post.querySelector('.answer-form');
          const textarea = answerForm.querySelector('textarea');
          const submitBtn = answerForm.querySelector('button[type="submit"]');

          if (textEl && textarea && submitBtn) {
            const answers = post.querySelector('.answers');
            answers.classList.add('show');
            textarea.value = textEl.textContent.trim();
            textarea.dataset.editing = "true";
            textarea.dataset.targetId = answerItem.dataset.id;
            textarea.dataset.editType = "answer";
            submitBtn.textContent = "수정완료";
            textarea.focus();
          }
        }
      }
    } else if (e.target.classList.contains('submit-comment')) {
      const form = e.target.closest('.comment-form');
      const textarea = form.querySelector('textarea');
      const submitBtn = e.target;

      if (!textarea.value.trim()) {
        alert('댓글 내용을 입력해주세요.');
        return;
      }

      if (textarea.dataset.editing === "true") {
        const targetId = textarea.dataset.targetId;
        const post = form.closest('.post');
        const targetComment = post.querySelector(`.comment-item[data-id="${targetId}"]`);
        const targetText = targetComment ? targetComment.querySelector('.c-text') : null;

        if (targetText) {
          targetText.textContent = textarea.value.trim();
          alert('댓글이 수정되었습니다.');
          textarea.dataset.editing = "false";
          textarea.dataset.targetId = "";
          textarea.dataset.editType = "";
          textarea.value = "";
          submitBtn.textContent = "작성";
        }
      } else {
        const ok = confirm("등록하시겠습니까?");
        if (ok) {
          alert("댓글을 작성하였습니다.");
          textarea.value = "";
        }
      }
    } else if (e.target.type === 'submit' && e.target.closest('.answer-form')) {
      e.preventDefault();
      const form = e.target.closest('.answer-form');
      const textarea = form.querySelector('textarea');
      const submitBtn = e.target;

      if (!textarea.value.trim()) {
        alert('답변 내용을 입력해주세요.');
        return;
      }

      if (textarea.dataset.editing === "true" && textarea.dataset.editType === "answer") {
        const targetId = textarea.dataset.targetId;
        const post = form.closest('.post');
        const targetAnswer = post.querySelector(`.answer-item[data-id="${targetId}"]`);
        const targetText = targetAnswer ? targetAnswer.querySelector('.a-text') : null;

        if (targetText) {
          targetText.textContent = textarea.value.trim();
          alert('답변이 수정되었습니다.');
          textarea.dataset.editing = "false";
          textarea.dataset.targetId = "";
          textarea.dataset.editType = "";
          textarea.value = "";
          submitBtn.textContent = "등록";
        }
      } else {
        const ok = confirm("등록하시겠습니까?");
        if (!ok) return;

        const answersContainer = form.closest('.answers');
        const answerList = answersContainer ? answersContainer.querySelector('.answer-list') : null;
        if (!answerList) return;

        const existingAnswers = answerList.querySelectorAll('.answer-item');
        let maxId = 0;
        existingAnswers.forEach(answer => {
          const id = parseInt(answer.dataset.id);
          if (id > maxId) maxId = id;
        });
        const newId = maxId + 1;

        const newItem = document.createElement('div');
        newItem.className = 'answer-item';
        newItem.dataset.id = newId;
        newItem.innerHTML = `
          <div class="a-text">${escapeHtml(textarea.value.trim())}</div>
          <div class="a-footer">
            <span class="author">by 나</span>
            <div class="answer-actions">
              <span class="edit-btn">수정</span>
              <span class="delete-btn" data-type="answer">삭제</span>
            </div>
            <button class="a-choice">채택</button>
          </div>
        `;
        answerList.appendChild(newItem);

        textarea.value = '';
        answersContainer.classList.add('show');
        alert('답변이 작성되었습니다.');
      }
    }
  });
});

// HTML 이스케이프 함수
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}