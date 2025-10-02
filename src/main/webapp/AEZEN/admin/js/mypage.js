document.addEventListener('DOMContentLoaded', function () {
// ✅ [추가] 마이페이지 전용 로그인 박스 → 아이콘 표시
  const loginBox = document.querySelector('.login-box');
  const icons = document.querySelector('.icons');
  if (loginBox && icons) {
    loginBox.style.display = 'none';
    icons.style.display = 'block';
  }

  // ✅ 1. 사이드바 탭 전환 (실시간채팅 / 마이페이지)
  const sidebarTabButtons = document.querySelectorAll('.sidebar-tabs .tab-button');
  const sidebarTabPanels  = document.querySelectorAll('.tab-panel');
  sidebarTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sidebarTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sidebarTabPanels.forEach(p => p.classList.add('hidden'));
      const target = document.getElementById(btn.dataset.target);
      if (target) target.classList.remove('hidden');
    });
  });

  // ✅ 2. 마이페이지 콘텐츠 전환 + 정렬 버튼 / 글쓰기 버튼 표시
  const menuItems     = document.querySelectorAll('.mypage-list li[data-target]');
  const contentPanels = document.querySelectorAll('.content-panel');
  const sortButtons   = document.querySelector('.sort-buttons');
  const writeBtn      = document.getElementById('writeBtn');
  const noticeButtons = document.querySelector('.notice-buttons');

function showPanelById(panelId, skipPush = false) {
  contentPanels.forEach(p => p.classList.add('hidden'));
  menuItems.forEach(li => li.classList.remove('selected'));

  const targetPanel = document.getElementById(panelId);
  const targetMenu  = document.querySelector(`.mypage-list li[data-target="${panelId}"]`);

  if (targetPanel) targetPanel.classList.remove('hidden');
  if (targetMenu)  targetMenu.classList.add('selected');

  // 내 글 관리일 때만 정렬 버튼 / 글쓰기 버튼 보이기
  if (sortButtons) {
    sortButtons.style.display = panelId === 'posts-panel' ? 'flex' : 'none';
  }
  if (writeBtn) {
    writeBtn.style.display = panelId === 'posts-panel' ? 'block' : 'none';
  }
  if (noticeButtons) {
    noticeButtons.style.display = panelId === 'posts-panel' ? 'flex' : 'none'; // ✅ 추가
  }

  // ✅ URL 갱신 (뒤로가기/앞으로가기 대응을 위해 pushState)
  if (!skipPush) {
    const url = new URL(window.location);
    url.searchParams.set("panel", panelId.replace("-panel", ""));
    history.pushState({ panelId }, "", url);
  }
}


  // 메뉴 클릭 이벤트
  menuItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      showPanelById(item.dataset.target);
    });
  });

  // ✅ 3. URL 파라미터 기반 자동 패널 열기
const params = new URLSearchParams(window.location.search);
const panel = params.get("panel");
if (panel) {
  showPanelById(`${panel}-panel`, true); // 처음 로드 시 pushState 하지 않음
} else {
  showPanelById("posts-panel", true); // 기본값
}

// ✅ popstate 이벤트 (브라우저 뒤/앞 이동 대응)
window.addEventListener("popstate", function (e) {
  const panelId = e.state?.panelId || `${(new URLSearchParams(window.location.search)).get("panel") || "posts"}-panel`;
  showPanelById(panelId, true); // skipPush = true (무한 push 방지)
});

  // ✅ 4. 팔로우/팔로워 탭 전환
  const followPanel = document.getElementById('follow-panel');
  if (followPanel) {
    const followTabButtons = followPanel.querySelectorAll('.follow-tabs .tab-button');
    followTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        followTabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        followPanel.querySelectorAll('.follow-list').forEach(list => list.classList.add('hidden'));
        const targetList = followPanel.querySelector(`#${btn.dataset.target}`);
        if (targetList) targetList.classList.remove('hidden');
      });
    });

    // ✅ 5. 팔로우/팔로잉 버튼 토글
    followPanel.addEventListener('click', function (e) {
      if (e.target.classList.contains('follow-toggle')) {
        e.target.classList.toggle('following');
        e.target.textContent = e.target.classList.contains('following') ? '팔로잉' : '팔로우';
      }
    });
  }

  // ✅ 6. 실시간 채팅 기능
  const chatHistory = {
    123: [
      { type: "received", text: "안녕하세요!" },
      { type: "sent", text: "반갑습니다 😊" }
    ]
  };
  let currentChatId = null;

  window.viewMessage = function (id) {
    currentChatId = id;
    document.getElementById("messages-panel").classList.add("hidden");
    document.getElementById("chat-panel").classList.remove("hidden");
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";
    const history = chatHistory[id] || [];
    history.forEach(msg => {
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${msg.type}`;
      bubble.textContent = msg.text;
      chatBox.appendChild(bubble);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  window.sendReply = function () {
    const input = document.getElementById("reply-input");
    const text = input.value.trim();
    if (!text || !currentChatId) return;
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble sent";
    bubble.textContent = text;
    document.getElementById("chat-box").appendChild(bubble);
    if (!chatHistory[currentChatId]) chatHistory[currentChatId] = [];
    chatHistory[currentChatId].push({ type: "sent", text });
    input.value = "";
    document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
  };

  window.goBackToList = function () {
    document.getElementById("chat-panel").classList.add("hidden");
    document.getElementById("messages-panel").classList.remove("hidden");
    currentChatId = null;
  };

  // ✅ 7. 포인트 탭 전환
  window.showPointHistory = function () {
    document.getElementById("point-history-section").style.display = "block";
    document.getElementById("btn-point-history").classList.add("active");
    document.getElementById("btn-point-store").classList.remove("active");
  };

  window.goToPointStore = function () {
    window.location.href = "pointstore.html";
  };

  // ✅ 8. 회원탈퇴 팝업 기능
  const withdrawBtn = document.getElementById("btn-withdraw");
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", function () {
      const agreed = document.getElementById("agree-check").checked;
      if (!agreed) {
        alert("회원탈퇴 약관에 동의해주세요.");
        return;
      }
      document.getElementById("withdrawal-popup").classList.remove("hidden");
    });
  }

  window.closeWithdrawalPopup = function () {
    document.getElementById("withdrawal-popup").classList.add("hidden");
  };

  window.confirmWithdrawal = function () {
    const id = document.getElementById("withdraw-id").value.trim();
    const pw = document.getElementById("withdraw-pw").value.trim();
    if (!id || !pw) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    document.getElementById("withdrawal-popup").classList.add("hidden");
    document.getElementById("withdrawal-complete").classList.remove("hidden");
  };

  window.goToHome = function () {
    window.location.href = "home.html";
  };
});
