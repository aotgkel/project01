// 약관동의 스크립트
document.addEventListener("DOMContentLoaded", function () {
  const selectAll = document.getElementById('select-all');
  const checkboxes = document.querySelectorAll('.terms-checkbox');
  const nextBtn = document.getElementById('nextBtn');

  // 전체선택 이벤트
  selectAll.addEventListener('change', function () {
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    validateRequired();
  });

  // 개별 체크박스 이벤트
  checkboxes.forEach(cb => {
    cb.addEventListener('change', function () {
      selectAll.checked = [...checkboxes].every(cb => cb.checked);
      validateRequired();
    });
  });

  // 필수 약관 체크 확인 함수
  function validateRequired() {
    const termsChecked = document.getElementById('agree-terms').checked;
    const privacyChecked = document.getElementById('agree-privacy').checked;

    if (termsChecked && privacyChecked) {
      nextBtn.style.pointerEvents = "auto";
      nextBtn.style.opacity = "1";
    } else {
      nextBtn.style.pointerEvents = "none";
      nextBtn.style.opacity = "0.5";
    }
  }

  // 페이지 로드 시 초기화
  validateRequired();
});

