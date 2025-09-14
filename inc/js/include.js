(function () {
  function includeHTML(callback) {
    const elements = document.querySelectorAll('[include-html]');
    let remaining = elements.length;

    if (remaining === 0) {
      callback?.();
      return;
    }

    elements.forEach((elmnt) => {
      const file = elmnt.getAttribute('include-html');
      if (!file) {
        if (--remaining === 0) callback?.();
        return;
      }

      fetch(file)
        .then((response) => (response.ok ? response.text() : 'Page not found.'))
        .then((data) => {
          if (
            elmnt.parentNode.tagName === 'HEAD' ||
            document.head.contains(elmnt)
          ) {
            const temp = document.createElement('div');
            temp.innerHTML = data;
            [...temp.children].forEach((child) => {
              document.head.appendChild(child);
            });
            elmnt.remove();
          } else {
            elmnt.innerHTML = data;
            elmnt.removeAttribute('include-html');
          }
        })
        .finally(() => {
          // 모든 include 완료 후 다시 검사
          if (--remaining === 0) {
            // 포함된 파일에 또 include-html이 있는지 다시 확인
            // 잠시 defer하여 DOM 반영 기다림
            setTimeout(() => {
              if (document.querySelector('[include-html]')) {
                includeHTML(callback); // 재귀 호출
              } else {
                callback?.(); // 최종 콜백
              }
            }, 0);
          }
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    includeHTML(function () {
      var swiperBrand = new Swiper('.imine-footer-brand .swiper', {
        loop: true,
        slidesPerView: 'auto',
        spaceBetween: 56,
        autoplay: {
          delay: 2500,
          disableOnInteraction: false,
        },
      });

      $(function () {
        //header
        var menuIndex = $('#content').data('menu');

        $('.imine-header-gnb-item')
          .eq(menuIndex - 1)
          .addClass('active');
      });

      $(
        '.imine-header-menu__toggle, .imine-header-gnb-head, .imine-header-menu__dim'
      ).on('click', function () {
        $('.imine').toggleClass('is-menu');
      });
      $('.imine-header-gnb-item > a').on('click', function () {
        $('.imine-header-gnb-item').removeClass('active');
        $(this).parent('.imine-header-gnb-item').addClass('active');
      });

      //
      const $includeheader = $('.include-header');
      const $header = $('.imine-header'); // 대상 헤더
      const headerHeight = $header.outerHeight(); // 헤더 높이

      $(window).on('scroll', function () {
        if ($(this).scrollTop() > headerHeight) {
          $includeheader.addClass('active');
          $header.addClass('active');
        } else {
          $includeheader.removeClass('active');
          $header.removeClass('active');
        }
      });
    });
  });
})();
