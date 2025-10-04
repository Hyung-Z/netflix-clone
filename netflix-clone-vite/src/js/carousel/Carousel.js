export default class Carousel {
  constructor(root, { loop = true } = {}) {
    this.root = root;
    this.wrapper = root.querySelector(".scrollbox-wrapper");
    this.scrollbox = root.querySelector(".scrollbox");
    this.prevBtn = root.querySelector(".prev");
    this.nextBtn = root.querySelector(".next");
    this.indicatorEl = root.querySelector(".indicator");

    this.loop = loop;
    this.pageIndex = 0; // 실제 보이는 페이지 인덱스 (0 ~ pages-1)
    this.virtualPageIndex = 0; // 애니메이션 계산을 위한 가상 인덱스 (음수 또는 pages 이상 가능)
    this.currentX = 0;
    this.transitionMs = 500;

    this.init();
  }

  init() {
    this.items = [...this.scrollbox.querySelectorAll("li:not(.clone)")];
    if (!this.items.length) return;
    
    this.teardownClones();
    this.measure();
    if (this.loop) {
        this.setupClones();
    }
    this.buildIndicators();

    this.pageIndex = 0;
    this.virtualPageIndex = 0;
    this.jumpToPage(this.pageIndex);

    // 이전 이벤트 리스너 제거 (중복 방지)
    if (this.boundResize) {
        window.removeEventListener("resize", this.boundResize);
    }
    if (this.boundTransitionEnd) {
        this.scrollbox.removeEventListener("transitionend", this.boundTransitionEnd);
    }
    this.bind();
  }

  measure() {
    const styles = getComputedStyle(this.scrollbox);
    const gap = parseFloat(styles.columnGap || "0");
    const cardWidth = this.items[0].getBoundingClientRect().width;
    const wrapperWidth = this.wrapper.clientWidth;

    this.perPage = Math.max(1, Math.floor((wrapperWidth + gap) / (cardWidth + gap)));
    this.pages = Math.max(1, Math.ceil(this.items.length / this.perPage));
    this.pageDistance = this.perPage * (cardWidth + gap);

    this.cardWidth = cardWidth;
    this.gap = gap;
  }

  setupClones() {
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
      const button = document.createElement("div");
      button.textContent = "-";
      li.appendChild(button);
      this.indicatorEl.appendChild(li);

      button.addEventListener("click", () => {
        this.virtualPageIndex = i;
        this.animateToPage(this.virtualPageIndex);
      });
    }
    this.setIndicator(0);
  }

  setIndicator(index) {
    if (!this.indicatorEl) return;
    const dots = this.indicatorEl.querySelectorAll("li");
    if (!dots.length) return;
    
    const activeIndex = ((index % this.pages) + this.pages) % this.pages;

    dots.forEach((d) => d.classList.remove("now-here"));
    dots[activeIndex]?.classList.add("now-here");
  }

  bind() {
    this.prevBtn?.addEventListener("click", () => this.prev());
    this.nextBtn?.addEventListener("click", () => this.next());

    this.boundTransitionEnd = () => {
      if (!this.loop) return;
      
      if (this.virtualPageIndex >= this.pages) {
        this.virtualPageIndex = 0;
        this.jumpToPage(this.virtualPageIndex);
      }
      
      if (this.virtualPageIndex < 0) {
        this.virtualPageIndex = this.pages - 1;
        this.jumpToPage(this.virtualPageIndex);
      }
    };
    this.scrollbox.addEventListener("transitionend", this.boundTransitionEnd);

    this.boundResize = () => this.init();
    window.addEventListener("resize", this.boundResize, { passive: true });
  }

  // 애니메이션 없이 즉시 이동
  jumpToPage(realPageIndex) {
    const x = -this.headCloneCount * (this.cardWidth + this.gap) - realPageIndex * this.pageDistance;
    this.withoutTransition(() => {
      this.applyX(x);
    });
    this.pageIndex = realPageIndex;
    this.setIndicator(this.pageIndex);
  }

  // 애니메이션과 함께 이동
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
    if (!this.pages) return;
    this.virtualPageIndex--;
    this.animateToPage(this.virtualPageIndex);
  }

  next() {
    if (!this.pages) return;
    this.virtualPageIndex++;
    this.animateToPage(this.virtualPageIndex);
  }
}