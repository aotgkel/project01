document.addEventListener('DOMContentLoaded', function () {
  // --- 아이디 찾기 ---
  const emailInputForId = document.getElementById('email-id');
  const codeInput = document.getElementById('code-id');
  const idFindForm = document.querySelector('#find-id form');

  idFindForm.addEventListener('submit', async function (e) {
    e.preventDefault(); // 기본 submit 막기

    const email = emailInputForId.value.trim();
    const code = codeInput.value.trim();

    if (email === '' || code === '') {
      alert('이메일과 인증코드를 입력하세요.');
      return;
    }

    try {
      // 서버로 인증 요청
      const res = await fetch('/verify-id-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();

      if (data.success) {
        alert('인증하신 메일로 아이디를 전송하였습니다');
      } else {
        alert(data.message || '인증 실패. 다시 시도하세요.');
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류가 발생했습니다.');
    }
  });


  // --- 비밀번호 찾기 ---
  const emailInputForPw = document.getElementById('email-pw');
  const pwFindForm = document.querySelector('#find-password form');

  pwFindForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = emailInputForPw.value.trim();
    if (email === '') {
      alert('이메일을 입력하세요.');
      return;
    }

    try {
      const res = await fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success) {
        alert('해당 메일로 임시 비밀번호를 발송하였습니다');
      } else {
        alert(data.message || '등록되지 않은 이메일입니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류가 발생했습니다.');
    }
  });
});
