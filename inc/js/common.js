const lenis = new Lenis({
  // 추가된 부분
  duration: 2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

//header
$(function () {
  // 2뎁스 메뉴만 대상
  const $menuLinks = $(".imine-snb > ul > li > ul > li > a[href^='#']");
  const $sections = $('section[id]');
  const $depth2Lis = $('.imine-snb > ul > li > ul > li');

  // 브레이크포인트 & 오프셋
  const BP_TABLET = 1440;
  const OFFSET_BASE = 20;
  const OFFSET_TABLET_ADD = 130;

  // 활성화 버퍼(위/아래로 여유를 줌)
  const ACT_TOP_BASE = 120; // 상단 버퍼
  const ACT_BOT_BASE = 180; // 하단 버퍼
  const ACT_TOP_TABLET_ADD = 60; // 태블릿 추가 버퍼
  const ACT_BOT_TABLET_ADD = 80;

  const isTablet = () => $(window).width() <= BP_TABLET;
  const getOffset = () =>
    isTablet() ? OFFSET_BASE + OFFSET_TABLET_ADD : OFFSET_BASE;

  const getActivateTop = () =>
    isTablet() ? ACT_TOP_BASE + ACT_TOP_TABLET_ADD : ACT_TOP_BASE;

  const getActivateBottom = () =>
    isTablet() ? ACT_BOT_BASE + ACT_BOT_TABLET_ADD : ACT_BOT_BASE;

  // 스크롤 위치에 따른 2뎁스 active 토글 (1뎁스는 유지)
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const st = $(window).scrollTop();
      const vpTop = st + getOffset() + getActivateTop(); // 상단 여유 반영
      const vpBot = st + $(window).height() - getActivateBottom(); // 하단 여유 반영

      // 2뎁스만 active 제거
      $depth2Lis.removeClass('active');

      // 여유 구간(vpTop~vpBot)과 교차하는 첫 섹션을 active
      for (let i = 0; i < $sections.length; i++) {
        const $sec = $sections.eq(i);
        const top = $sec.offset().top;
        const bottom = top + $sec.outerHeight();

        // 교차 판정: 섹션이 여유 구간에 걸쳐 있으면 활성화
        const intersects = bottom > vpTop && top < vpBot;
        if (intersects) {
          const id = $sec.attr('id');
          $menuLinks.filter(`[href='#${id}']`).parent('li').addClass('active');
          break;
        }
      }
      ticking = false;
    });
  }

  $(window).on('scroll', onScroll);
  $(window).on('resize', onScroll);
  onScroll(); // 초기 실행

  // 메뉴 클릭 시 스무스 스크롤 + 2뎁스 active 즉시 반영
  $menuLinks.on('click', function (e) {
    e.preventDefault();
    const targetId = $(this).attr('href');
    const $target = $(targetId);
    if (!$target.length) return;

    // 클릭 즉시 2뎁스 active 갱신(1뎁스는 그대로)
    $depth2Lis.removeClass('active');
    $(this).parent('li').addClass('active');

    $('html, body').animate(
      {
        scrollTop:
          $target.offset().top - getOffset() - $('.imine-header').outerHeight(),
      },
      600,
      () => onScroll() // 도착 후 한번 더 동기화
    );
  });

  // 해시로 직접 진입 시 스크롤/active 보정
  if (location.hash) {
    const $initTarget = $(location.hash);
    if ($initTarget.length) {
      setTimeout(() => {
        $('html, body').scrollTop($initTarget.offset().top - getOffset());
        onScroll();
      }, 0);
    }
  }
});

//faq
$(document).ready(function () {
  $('.imine-board-list-body-item__title').on('click', function () {
    const $item = $(this).closest('.imine-board-list-body-item');
    const $answer = $(this).next('.imine-board-list-body-item__answer');

    $('.imine-board-list-body-item').not($item).removeClass('active');
    $('.imine-board-list-body-item__answer')
      .not($answer)
      .each(function () {
        const $el = $(this);
        if ($el.height() > 0) {
          $el.css('height', $el.height() + 'px');
          $el[0].offsetHeight;
          $el.css('height', '0px');
        }
      });

    if ($answer.height() > 0) {
      $answer.css('height', $answer.height() + 'px');
      $answer[0].offsetHeight;
      $answer.css('height', '0px');
      $item.removeClass('active');
    } else {
      $answer.css('height', $answer[0].scrollHeight + 'px');
      $item.addClass('active');
    }
  });

  $('.imine-board-list-body-item__answer').on('transitionend', function () {
    if ($(this).height() !== 0) {
      $(this).css('height', 'auto');
    }
  });
});

//upload
$(function () {
  const $uploadBox = $('#uploadBox');
  const $uploadBtn = $('#uploadBtn');
  const $uploadInput = $('#uploadInput');
  const $uploadList = $('#uploadList');
  const $fileCount = $('#fileCount');

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'xls'];

  // 초기 카운트 반영
  updateCount();

  // 버튼 → 파일 선택
  $uploadBtn.on('click', function () {
    $uploadInput.trigger('click');
  });

  // 파일 선택 시
  $uploadInput.on('change', function (e) {
    handleFiles(e.target.files);
    $(this).val(''); // 동일 파일 재선택 가능
  });

  // 드래그 앤 드롭
  $uploadBox
    .on('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).addClass('dragover');
    })
    .on('dragleave dragend', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).removeClass('dragover');
    })
    .on('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).removeClass('dragover');
      const files = e.originalEvent.dataTransfer.files;
      handleFiles(files);
    });

  // 목록 삭제
  $uploadList.on('click', '.file-remove', function () {
    $(this).closest('li').remove();
    updateCount();
  });

  // 파일 처리
  function handleFiles(fileList) {
    [...fileList].forEach((file) => {
      const ext = getExt(file.name);
      if (!ALLOWED.includes(ext)) {
        alert(`${file.name} : 허용되지 않는 형식입니다.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        alert(`${file.name} : 10MB를 초과합니다.`);
        return;
      }
      // 중복 방지(같은 이름+사이즈 기준)
      if (isDuplicate(file.name, file.size)) {
        alert(`${file.name} : 이미 추가된 파일입니다.`);
        return;
      }
      appendItem(file.name, file.size);
    });
    updateCount();
  }

  function appendItem(name, size) {
    const sizeLabel = formatSize(size);
    // data-name/size 보관 → 중복/제거 판단 용이
    const li = `
      <li data-name="${escapeHtml(name)}" data-size="${size}">
        <div class="imine-form-file__text">
          <p>${escapeHtml(name)}</p>
          <span>${sizeLabel}</span>
        </div>
        <button type="button" class="file-remove" aria-label="첨부 삭제">
          <i class="ico-24-delete"></i>
        </button>
      </li>`;
    $uploadList.append(li);
  }

  function isDuplicate(name, size) {
    let dup = false;
    $uploadList.find('li').each(function () {
      const n = $(this).data('name');
      const s = Number($(this).data('size'));
      if (n === name && s === size) {
        dup = true;
        return false;
      }
    });
    return dup;
  }

  function updateCount() {
    $fileCount.text($uploadList.find('li').length);
  }

  function getExt(filename) {
    const idx = filename.lastIndexOf('.');
    return idx > -1 ? filename.slice(idx + 1).toLowerCase() : '';
  }

  function formatSize(bytes) {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    if (bytes >= 1024) return Math.round(bytes / 1024) + 'KB';
    return bytes + 'B';
  }

  // XSS 방지용 간단 이스케이프
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
});

//modal
// ====== 열기 공통 함수 ======
function openModal(targetSelector) {
  const modal = document.querySelector(targetSelector);
  if (!modal) return;

  // 모달 표시
  modal.classList.add('show');
  document.body.classList.add('modal-open');

  // 기존 백드롭 제거(중복 방지)
  document.querySelectorAll('.imine-modal-backdrop').forEach((b) => b.remove());

  // 백드롭 생성
  const backdrop = document.createElement('div');
  backdrop.className = 'imine-modal-backdrop fade';
  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('show'));
}

// ====== 닫기 공통 함수 ======
function closeModal(modal) {
  if (typeof modal === 'string') {
    modal = document.querySelector(modal);
  }
  if (modal) {
    modal.classList.remove('show');
  }

  const backdrop = document.querySelector('.imine-modal-backdrop');
  if (backdrop) {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.remove(), 300);
  }

  document.body.classList.remove('modal-open');
}

// ====== 열기: 이벤트 위임 (동적 버튼 대응) ======
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-bs-toggle="modal"][data-bs-target]');
  if (!btn) return;

  const targetId = btn.getAttribute('data-bs-target');
  if (!targetId) return;

  openModal(targetId);
});

// ====== 닫기: [data-bs-dismiss="modal"] ======
document.addEventListener('click', function (e) {
  const dismissBtn = e.target.closest('[data-bs-dismiss="modal"]');
  if (dismissBtn) {
    const modal = dismissBtn.closest('.imine-modal');
    closeModal(modal);
  }
});

// ====== ESC로 닫기 ======
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.imine-modal.show').forEach((modal) => {
      closeModal(modal);
    });
  }
});

// ====== 바깥 클릭(백드롭/컨테이너)으로 닫기 + 드래그 보호 ======
let isDraggingFromModal = false;

// 드래그 시작 체크
document.addEventListener('mousedown', function (e) {
  const modalContent = e.target.closest('.imine-modal-content');
  isDraggingFromModal = !!modalContent;
});

// 바깥 클릭 처리
document.addEventListener('click', function (e) {
  if (e.target.closest('.imine-tooltip')) return;

  // 1) 백드롭 클릭 시 닫기
  if (
    e.target.classList &&
    e.target.classList.contains('imine-modal-backdrop')
  ) {
    const opened = document.querySelector('.imine-modal.show');
    if (opened) closeModal(opened);
    isDraggingFromModal = false;
    return;
  }

  // 2) .imine-modal 안이지만 .imine-modal-content 밖을 클릭한 경우 닫기
  const modal = e.target.closest('.imine-modal');
  const content = e.target.closest('.imine-modal-content');

  if (modal && !content && !isDraggingFromModal) {
    closeModal(modal);
  }

  isDraggingFromModal = false;
});

//
$(document).ready(function () {
  const $shareWrap = $('.imine-board-detail-head-info__share');
  const $shareButton = $shareWrap.find('> button'); // 공유 버튼
  const $closeButton = $shareWrap.find(
    '.imine-board-detail-head-info__layer-head button'
  ); // 닫기 버튼
  const $dimButton = $shareWrap.find(
    '.imine-board-detail-head-info__layer-dim'
  ); // dim 버튼

  // 공유 버튼 클릭 시 active 토글
  $shareButton.on('click', function (e) {
    e.stopPropagation();
    $shareWrap.toggleClass('active');
  });

  // 닫기 버튼 클릭 시 active 제거
  $closeButton.on('click', function (e) {
    e.stopPropagation();
    $shareWrap.removeClass('active');
  });

  // dim 버튼 클릭 시 active 제거
  $dimButton.on('click', function (e) {
    e.stopPropagation();
    $shareWrap.removeClass('active');
  });

  // 바깥 영역 클릭 시 active 제거
  $(document).on('click', function (e) {
    if (!$shareWrap.is(e.target) && $shareWrap.has(e.target).length === 0) {
      $shareWrap.removeClass('active');
    }
  });

  setTimeout(() => {
    AOS.init({
      duration: 1000, // 기본 애니메이션 속도 (1초)
    });
  }, 500);
});

//
$(function () {
  $('.imine-rnd-facility-item__title').on('click', function () {
    const $item = $(this).closest('.imine-rnd-facility-item');
    // 다른 아이템 active 제거
    $('.imine-rnd-facility-item').not($item).removeClass('active');
    // 현재 클릭한 아이템 active 토글
    $item.toggleClass('active');
  });
});

//
$(document).ready(function () {
  var swiper01 = new Swiper('.imine-skincare-swiper-type01 .swiper', {
    //loop: true,
    navigation: {
      nextEl: '.imine-skincare-swiper-type01 .swiper-button-next',
    },
    slidesPerView: 'auto',
    spaceBetween: 24,
    freeMode: true,
    breakpoints: {
      800: {
        // 800px 이상일 때 적용
        spaceBetween: 24,
      },
      0: {
        // 0 ~ 799px 구간
        spaceBetween: 16,
      },
    },
  });
  var swiper02 = new Swiper('.imine-skincare-swiper-type02 .swiper', {
    navigation: {
      nextEl: '.imine-skincare-swiper-type02 .swiper-button-next',
    },
    slidesPerView: 'auto',
    spaceBetween: 24,
    freeMode: true,
    breakpoints: {
      800: {
        // 800px 이상일 때 적용
        spaceBetween: 24,
      },
      0: {
        // 0 ~ 799px 구간
        spaceBetween: 16,
      },
    },
  });
  var swiper03 = new Swiper('.imine-skincare-swiper-type03 .swiper', {
    navigation: {
      nextEl: '.imine-skincare-swiper-type03 .swiper-button-next',
    },
    slidesPerView: 'auto',
    spaceBetween: 24,
    freeMode: true,
    breakpoints: {
      800: {
        // 800px 이상일 때 적용
        spaceBetween: 24,
      },
      0: {
        // 0 ~ 799px 구간
        spaceBetween: 16,
      },
    },
  });
});
