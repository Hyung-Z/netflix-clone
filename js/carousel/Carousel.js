export default class Carousel {
  constructor(root, { loop = true } = {}) {
    this.root = root;
    this.wrapper = root.querySelector('.scrollbox-wrapper');
    this.scrollbox = root.querySelector('.scrollbox');
    this.prevBtn = root.querySelector('.prev');
    this.nextBtn = root.querySelector('.next');
    this.indicatorEl = root.querySelector('.indicator');

    this.loop = loop;

    this.pageIndex = 0;          // "실제 페이지" 인덱스
    this.currentX = 0;
    this.transitionMs = 500;
    this.like = 0;

    this.init();
  }



  init() {
    this.items = [...this.scrollbox.querySelectorAll('li')];
    if (!this.items.length) return;

    // 초기화(리사이즈 시에도 재호출됨)
    this.teardownClones();      // 이전 복제 제거
    this.measure();             // perPage 등 실측
    if (this.loop) this.setupClones(); // 복제 재구성
    this.buildIndicators();

    // 초기 위치: 앞쪽 복제 블록 길이만큼 우측으로 이동(실제 첫 페이지 보이도록)
    this.pageIndex = 0;
    this.jumpToPage(this.pageIndex); // transition 없이 위치

    this.bind();
  }

  measure() {
    // 실측: 카드 폭/갭/보이는 개수
    const styles = getComputedStyle(this.scrollbox);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const first = this.items[0];
    const cardWidth = first ? first.getBoundingClientRect().width : 0;
    const wrapperWidth = this.wrapper.clientWidth;

    const perPage = Math.max(1, Math.floor((wrapperWidth + gap) / (cardWidth + gap)));
    const totalWidth = this.items.length * cardWidth + Math.max(0, this.items.length - 1) * gap;

    this.gap = gap;
    this.cardWidth = cardWidth;
    this.wrapperWidth = wrapperWidth;
    this.perPage = perPage;
    this.totalWidth = totalWidth;

    // 한 번에 이동할 거리(페이지 단위)
    this.pageDistance = perPage * (cardWidth + gap);

    // 실제 페이지 수 (실 카드 기준)
    this.pages = Math.max(1, Math.ceil(this.items.length / this.perPage));
  }

  setupClones() {
    // 앞뒤에 perPage 만큼 복제
    const n = this.perPage;
    const head = this.items.slice(-n).map(node => node.cloneNode(true));
    const tail = this.items.slice(0, n).map(node => node.cloneNode(true));

    head.forEach(clone => clone.classList.add('clone'));
    tail.forEach(clone => clone.classList.add('clone'));

    // DOM 삽입
    head.forEach(clone => this.scrollbox.insertBefore(clone, this.scrollbox.firstChild));
    tail.forEach(clone => this.scrollbox.appendChild(clone));

    // 복제 포함 전체 아이템 참조 업데이트
    this.allItems = [...this.scrollbox.querySelectorAll('li')];

    // 복제 길이(앞쪽) 기억
    this.headCloneCount = n;
    this.tailCloneCount = n;
  }

  teardownClones() {
    // 이전 복제 제거
    const clones = this.scrollbox.querySelectorAll('li.clone');
    clones.forEach(c => c.remove());
    this.headCloneCount = 0;
    this.tailCloneCount = 0;
    this.allItems = [...this.scrollbox.querySelectorAll('li')]; // 현재는 실 아이템만
  }

  buildIndicators() {
    if (!this.indicatorEl) return;
    this.indicatorEl.innerHTML = '';
    for (let i = 0; i < this.pages; i++) {
      const li = document.createElement('li');
      li.textContent = '-';
      this.indicatorEl.appendChild(li);
    }
    this.setIndicator(0);
  }

  setIndicator(realIndex) {
    if (!this.indicatorEl) return;
    const dots = this.indicatorEl.querySelectorAll('li');
    dots.forEach(d => d.classList.remove('now-here'));
    dots[(realIndex % this.pages + this.pages) % this.pages]?.classList.add('now-here');
  }

  bind() {
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    // transition 끝나면, 클론 영역을 벗어난 경우 "순간 점프"
    this.scrollbox.addEventListener('transitionend', () => {
      if (!this.loop) return;

      // 가장 왼쪽/오른쪽 끝 체크
      const leftLimit = -this.headCloneCount * (this.cardWidth + this.gap);
      const rightLimit = leftLimit - (this.pages - 1) * this.pageDistance;

      // 왼쪽(이전)으로 복제 구간 넘어서면 → 실제 마지막 페이지로 점프
      if (this.currentX > leftLimit + 1) {
        this.jumpToPage(this.pages - 1); // 마지막 페이지
      }
      // 오른쪽(다음)으로 복제 구간 넘어서면 → 실제 첫 페이지로 점프
      if (this.currentX < rightLimit - 1) {
        this.jumpToPage(0); // 첫 페이지
      }
    });

    // 리사이즈 대응: 전체 재초기화(측정→복제 재구성)
    window.addEventListener('resize', () => {
      const oldPages = this.pages;
      this.init();
      // (선택) 리사이즈 전 현재 페이지 근사 유지하고 싶다면 보정 로직 추가 가능
      if (this.pages !== oldPages) this.setIndicator(0);
    }, { passive: true });
  }

  // 애니메이션 없이 특정 "실제 페이지" 위치로 즉시 이동
  jumpToPage(realPageIndex) {
    const baseX = -this.headCloneCount * (this.cardWidth + this.gap); // 복제 헤드 바로 뒤
    const x = baseX - realPageIndex * this.pageDistance;
    this.withoutTransition(() => {
      this.applyX(x);
    });
    this.pageIndex = realPageIndex;
    this.setIndicator(this.pageIndex);
  }

  // 애니메이션 이동
  animateToPage(realPageIndex) {
    const baseX = -this.headCloneCount * (this.cardWidth + this.gap);
    const x = baseX - realPageIndex * this.pageDistance;
    this.withTransition(() => {
      this.applyX(x);
    });
    this.pageIndex = ((realPageIndex % this.pages) + this.pages) % this.pages;
    this.setIndicator(this.pageIndex);
  }

  applyX(x) {
    this.currentX = x;
    this.scrollbox.style.transform = `translateX(${x}px)`;
  }

  withTransition(fn) {
    this.scrollbox.style.transition = `transform ${this.transitionMs}ms ease-in-out`;
    fn();
  }

  withoutTransition(fn) {
    const prev = this.scrollbox.style.transition;
    this.scrollbox.style.transition = 'none';
    fn();
    // 강제로 리플로우 후 원복(스타일 적용 보장)
    void this.scrollbox.offsetWidth;
    this.scrollbox.style.transition = prev || `transform ${this.transitionMs}ms ease-in-out`;
  }

  prev() {
    if (!this.pages) return;
    if (this.loop) {
      // 실 페이지 인덱스만 감소시키고 애니메이션
      this.animateToPage(this.pageIndex - 1);
    } else {
      // 비루프 모드라면 범위 체크
      if (this.pageIndex <= 0) return;
      this.animateToPage(this.pageIndex - 1);
    }
  }

  next() {
    if (!this.pages) return;
    if (this.loop) {
      this.animateToPage(this.pageIndex + 1);
    } else {
      if (this.pageIndex >= this.pages - 1) return;
      this.animateToPage(this.pageIndex + 1);
    }
  }
}