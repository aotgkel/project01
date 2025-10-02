document.addEventListener('DOMContentLoaded', function () {
  // --- 요소 선택 ---
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const useridInput = document.getElementById('userid');
  const nicknameInput = document.getElementById('nickname');
  const emailInput = document.getElementById('email');

  const useridMessage = document.getElementById('userid-message');
  const nicknameMessage = document.getElementById('nickname-message');
  const emailMessage = document.getElementById('email-message');

  // --- 메시지 요소 동적 추가 (비밀번호 전용) ---
  const passwordMessage = document.createElement('div');
  passwordMessage.className = 'message';
  passwordInput.insertAdjacentElement('afterend', passwordMessage);

  const confirmMessage = document.createElement('div');
  confirmMessage.className = 'message';
  confirmInput.insertAdjacentElement('afterend', confirmMessage);

  // --- 디바운스 타이머 ---
  let debounceTimer, nicknameTimer, emailTimer;

  // --- 비밀번호 유효성 검사 ---
  passwordInput.addEventListener('input', function () {
    const value = passwordInput.value;
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLongEnough = value.length >= 8;

    if (hasLetter && hasNumber && hasSpecial && isLongEnough) {
      passwordMessage.textContent = '사용 가능합니다.';
      passwordMessage.style.color = 'green';
    } else {
      passwordMessage.textContent = '영문, 숫자, 특수문자를 포함하여 8자 이상 입력하세요.';
      passwordMessage.style.color = '#d9534f';
    }

    checkPasswordMatch();
  });

  confirmInput.addEventListener('input', checkPasswordMatch);

  function checkPasswordMatch() {
    if (confirmInput.value === '') {
      confirmMessage.textContent = '';
      return;
    }
    if (passwordInput.value === confirmInput.value) {
      confirmMessage.textContent = '비밀번호가 일치합니다.';
      confirmMessage.style.color = 'green';
    } else {
      confirmMessage.textContent = '비밀번호가 일치하지 않습니다.';
      confirmMessage.style.color = '#d9534f';
    }
  }

  // --- 아이디 검사 ---
  useridInput.addEventListener('input', function () {
    const value = useridInput.value.trim();

    if (value === '') {
      useridMessage.textContent = '';
      return;
    }

    const isEnglishOnly = /^[a-zA-Z]+$/.test(value);
    if (!isEnglishOnly) {
      useridMessage.textContent = '영문만 입력 가능합니다.';
      useridMessage.style.color = '#d9534f';
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetch(`/check-userid?userid=${encodeURIComponent(value)}`)
        .then(res => res.json())
        .then(data => {
          useridMessage.textContent = data.exists
            ? '중복된 아이디입니다.'
            : '사용 가능한 아이디입니다.';
          useridMessage.style.color = data.exists ? '#d9534f' : 'green';
        })
        .catch(() => {
          useridMessage.textContent = '확인 중 오류가 발생했습니다.';
          useridMessage.style.color = '#d9534f';
        });
    }, 500);
  });

  // --- 닉네임 검사 ---
  nicknameInput.addEventListener('input', function () {
    const value = nicknameInput.value.trim();

    if (value === '') {
      nicknameMessage.textContent = '';
      return;
    }

    clearTimeout(nicknameTimer);
    nicknameTimer = setTimeout(() => {
      fetch(`/check-nickname?nickname=${encodeURIComponent(value)}`)
        .then(res => res.json())
        .then(data => {
          nicknameMessage.textContent = data.exists
            ? '중복된 닉네임입니다.'
            : '사용 가능한 닉네임입니다.';
          nicknameMessage.style.color = data.exists ? '#d9534f' : 'green';
        })
        .catch(() => {
          nicknameMessage.textContent = '확인 중 오류가 발생했습니다.';
          nicknameMessage.style.color = '#d9534f';
        });
    }, 500);
  });

  // --- 이메일 검사 ---
  emailInput.addEventListener('input', function () {
    const value = emailInput.value.trim();
    const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (value === '') {
      emailMessage.textContent = '';
      return;
    }

    if (!isValidFormat) {
      emailMessage.textContent = '이메일 형식을 확인해 주세요.';
      emailMessage.style.color = '#d9534f';
      return;
    }

    clearTimeout(emailTimer);
    emailTimer = setTimeout(() => {
      fetch(`/check-email?email=${encodeURIComponent(value)}`)
        .then(res => res.json())
        .then(data => {
          emailMessage.textContent = data.exists
            ? '이미 등록된 이메일입니다.'
            : '사용 가능한 이메일입니다.';
          emailMessage.style.color = data.exists ? '#d9534f' : 'green';
        })
        .catch(() => {
          emailMessage.textContent = '확인 중 오류가 발생했습니다.';
          emailMessage.style.color = '#d9534f';
        });
    }, 500);
  });

    // -------------------------------
  // 회원가입 완료 알림 + 홈 이동
  // -------------------------------
  const form = document.querySelector('.post form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault(); // 서버로 보내지 않고 알림 + 이동 (서버 연동 시 제거)

      alert('회원가입이 완료되었습니다.');
      window.location.href = '../main/home.html';
    });
  }

});
