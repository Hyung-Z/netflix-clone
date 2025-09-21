// 페이지의 모든 캐러셀(.category)을 선택합니다.
const categories = document.querySelectorAll('.category');

//헤더 배경 애니메이션
const header = document.querySelector('header')

let scrollTimer;

window.addEventListener('scroll', () => {
  header.classList.add('is-scrolling')

  clearTimeout(scrollTimer)

  scrollTimer = setTimeout(()=> {
    header.classList.remove('is-scrolling')
  }, 150)
})



window.addEventListener('resize', () => {
    categories.forEach(category => {
        const indicator = category.querySelector('.indicator')
        indicator.innerHTML = ''
        const scrollbox = category.querySelector('.scrollbox')
        const liItems = scrollbox.querySelectorAll('li');
        let a = Math.floor(window.innerWidth / 371.5)
        let num = Math.floor(liItems.length/a -0.5) + 1 
        let i = 0
        while ( i < num) {
            let indicatorLi = document.createElement('li')
            indicatorLi.innerHTML = "-"
            indicator.appendChild(indicatorLi)
            i += 1
        }
        indicator.firstChild.classList.add('now-here')
        scrollbox.style.transform = `translateX(0px)`;
        
    })
    }
)   

categories.forEach(category => {

})


categories.forEach(category => {
    // 현재 처리 중인 category 내의 요소들만 선택합니다.
    const scrollbox = category.querySelector('.scrollbox');
    const prevBtn = category.querySelector('.prev');
    const nextBtn = category.querySelector('.next');
    const scrollboxWrapper = category.querySelector('.scrollbox-wrapper');
    const indicator = category.querySelector('.indicator')
    indicator.innerHTML = ''
    const liItems = scrollbox.querySelectorAll('li');
    let a = Math.floor(window.innerWidth / 371.5)
    let num = Math.floor(liItems.length/a -0.5) + 1 
    console.log(num)
    let i = 0
    while ( i < num) {
        let indicatorLi = document.createElement('li')
        indicatorLi.innerHTML = "-"
        indicator.appendChild(indicatorLi)
        i += 1
    }
    indicator.firstChild.classList.add('now-here')

    // 각 캐러셀의 위치를 독립적으로 저장할 변수를 루프 내에 선언합니다.
    let currentPosition = 0;

    // 카드 하나의 너비 + 오른쪽 마진 (CSS에 정의된 값과 일치시켜야 합니다)
    const CARD_WIDTH = 355.5;
    const CARD_MARGIN = 16;
    var MOVE_DISTANCE = (CARD_MARGIN+CARD_WIDTH)*(Math.floor(window.innerWidth / 371))

    window.addEventListener('resize', ()=> {
        MOVE_DISTANCE = (CARD_MARGIN+CARD_WIDTH)*(Math.floor(window.innerWidth / 371))
        currentPosition = 0;
    })

    // 이전 버튼 클릭 이벤트
    prevBtn.addEventListener('click', () => {
        const indicator = category.querySelector('.indicator')
        const indicatorLi = indicator.querySelectorAll('li')
        if (currentPosition >= 0 || currentPosition + MOVE_DISTANCE >= 0) {
            // 0이 최대 위치이므로 더 이상 이동하지 않음
            currentPosition = 0; 
        } else {
            currentPosition += MOVE_DISTANCE;
        }
        scrollbox.style.transform = `translateX(${currentPosition}px)`;
        let i = num-1

        while (i > 0) {
            if (indicatorLi[i].classList.contains('now-here') ) {
                if ( i != num-1 ) {
                    indicatorLi[i-1].classList.add('now-here')
                    indicatorLi[i].classList.remove('now-here')
                    break
                }
                else {
                    break
                }
            }
            i -= 1
            
        }

    });

    // 다음 버튼 클릭 이벤트
    nextBtn.addEventListener('click', () => {
        const liItems = scrollbox.querySelectorAll('li');
        const wrapperWidth = scrollboxWrapper.clientWidth;
        const totalWidth = liItems.length * (CARD_MARGIN+CARD_WIDTH) - CARD_MARGIN; // 마지막 마진 제외
        const indicator = category.querySelector('.indicator')
        const indicatorLi = indicator.querySelectorAll('li')
        // 이동 가능한 최대 음수 값
        const maxPosition = -(totalWidth - wrapperWidth);

        if (currentPosition <= maxPosition || currentPosition - MOVE_DISTANCE <= maxPosition) {
             // 최대 위치에 도달하면 더 이상 이동하지 않음
            currentPosition = maxPosition;
        } else {
            currentPosition -= MOVE_DISTANCE;
        }
        scrollbox.style.transform = `translateX(${currentPosition}px)`;
        let i = 0 

        while (i < num) {
            if (indicatorLi[i].classList.contains('now-here') ) {
                if ( i != num-1 ) {
                    indicatorLi[i+1].classList.add('now-here')
                    indicatorLi[i].classList.remove('now-here')
                    break
                }
                else {
                    break
                }
            }
            i += 1
            
        }
    });
});
