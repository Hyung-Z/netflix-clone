export default class Carousel {
  constructor(root, { loop = true } = {}) {
    this.root = root;
    this.wrapper = root.querySelector(".scrollbox-wrapper");
    this.scrollbox = root.querySelector(".scrollbox");
    this.prevBtn = root.querySelector(".prev");
    this.nextBtn = root.querySelector(".next");
    this.indicatorEl = root.querySelector(".indicator");

    this.loop = loop;
    this.transitionMs = 500;

    // --- 이벤트 핸들러를 constructor에서 한 번만 바인딩 ---
    this.handlePrev = this.prev.bind(this);
    this.handleNext = this.next.bind(this);
    this.handleTransitionEnd = this._handleTransitionEnd.bind(this);
    this.handleResize = this._handleResize.bind(this);

    this.init();
  }

  init() {
    // 리스너를 먼저 깔끔하게 제거
    this.unbind();

    this.teardownClones();
    this.items = [...this.scrollbox.querySelectorAll("li")];
    if (!this.items.length) return;
    
    this.measure();
    if (this.loop) {
      this.setupClones();
    }
    this.buildIndicators();

    // 초기 위치 설정
    this.pageIndex = 0;
    this.virtualPageIndex = 0;
    this.jumpToPage(this.pageIndex);
    
    // 준비된 핸들러를 다시 연결
    this.bind();
  }
  
  // --- 리스너를 제거하는 메서드 ---
  unbind() {
    this.prevBtn?.removeEventListener("click", this.handlePrev);
    this.nextBtn?.removeEventListener("click", this.handleNext);
    this.scrollbox.removeEventListener("transitionend", this.handleTransitionEnd);
    window.removeEventListener("resize", this.handleResize);
  }

  // --- 리스너를 연결하는 메서드 ---
  bind() {
    this.prevBtn?.addEventListener("click", this.handlePrev);
    this.nextBtn?.addEventListener("click", this.handleNext);
    this.scrollbox.addEventListener("transitionend", this.handleTransitionEnd);
    window.addEventListener("resize", this.handleResize, { passive: true });
  }

  _handleResize() {
    const oldPageIndex = this.pageIndex;
    this.init(); // init은 unbind -> bind 사이클을 담당
    const newPageIndex = Math.min(oldPageIndex, this.pages - 1);
    this.jumpToPage(newPageIndex);
    this.virtualPageIndex = newPageIndex;
  }

  _handleTransitionEnd() {
    if (!this.loop) return;
    
    if (this.virtualPageIndex >= this.pages) {
      this.virtualPageIndex = 0;
      this.jumpToPage(this.virtualPageIndex);
    }
    
    if (this.virtualPageIndex < 0) {
      this.virtualPageIndex = this.pages - 1;
      this.jumpToPage(this.virtualPageIndex);
    }
  }

  measure() {
    const styles = getComputedStyle(this.scrollbox);
    const gap = parseFloat(styles.columnGap || "0");
    const cardWidth = this.items.length > 0 ? this.items[0].getBoundingClientRect().width : 0;
    const wrapperWidth = this.wrapper.clientWidth;

    this.perPage = Math.max(1, Math.floor((wrapperWidth + gap) / (cardWidth + gap)));
    this.pages = Math.max(1, Math.ceil(this.items.length / this.perPage));
    this.pageDistance = this.perPage * (cardWidth + gap);
    
    this.cardWidth = cardWidth;
    this.gap = gap;
  }

  setupClones() {
    if (!this.items.length) return;
    const n = this.perPage;
    const headItems = this.items.slice(-n).map((node) => node.cloneNode(true));
    const tailItems = this.items.slice(0, n).map((node) => node.cloneNode(true));

    headItems.forEach(clone => clone.classList.add("clone"));
    tailItems.forEach(clone => clone.classList.add("clone"));

    this.scrollbox.prepend(...headItems);
    this.scrollbox.append(...tailItems);

    this.headCloneCount = headItems.length;
  }
  
  teardownClones() {
    const clones = this.scrollbox.querySelectorAll("li.clone");
    clones.forEach((c) => c.remove());
    this.headCloneCount = 0;
  }

  buildIndicators() {
    if (!this.indicatorEl) return;
    this.indicatorEl.innerHTML = "";
    for (let i = 0; i < this.pages; i++) {
      const li = document.createElement("li");
      const indicator = document.createElement("div");
      indicator.textContent = "-";
      li.appendChild(indicator);
      this.indicatorEl.appendChild(li);

      indicator.addEventListener("click", () => {
        this.virtualPageIndex = i;
        this.animateToPage(this.virtualPageIndex);
      });
    }
    this.setIndicator(this.pageIndex);
  }

  setIndicator(index) {
    if (!this.indicatorEl) return;
    const dots = this.indicatorEl.querySelectorAll("li");
    if (!dots.length) return;
    
    const activeIndex = ((index % this.pages) + this.pages) % this.pages;

    dots.forEach((d) => d.classList.remove("now-here"));
    dots[activeIndex]?.classList.add("now-here");
  }

  jumpToPage(realPageIndex) {
    const x = -this.headCloneCount * (this.cardWidth + this.gap) - realPageIndex * this.pageDistance;
    this.withoutTransition(() => {
      this.applyX(x);
    });
    this.pageIndex = realPageIndex;
    this.virtualPageIndex = realPageIndex; // virtualPageIndex도 동기화
    this.setIndicator(this.pageIndex);
  }

  animateToPage(virtualPageIndex) {
    const x = -this.headCloneCount * (this.cardWidth + this.gap) - virtualPageIndex * this.pageDistance;
    this.withTransition(() => {
      this.applyX(x);
    });
    this.pageIndex = ((virtualPageIndex % this.pages) + this.pages) % this.pages;
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
    this.scrollbox.style.transition = "none";
    requestAnimationFrame(() => {
      fn();
      requestAnimationFrame(() => {
        this.scrollbox.style.transition = `transform ${this.transitionMs}ms ease-in-out`;
      });
    });
  }

  prev() {
    if (!this.pages || (this.pageIndex <= 0 && !this.loop)) return;
    this.virtualPageIndex--;
    this.animateToPage(this.virtualPageIndex);
  }

  next() {
    if (!this.pages || (this.pageIndex >= this.pages - 1 && !this.loop)) return;
    this.virtualPageIndex++;
    this.animateToPage(this.virtualPageIndex);
  }
}