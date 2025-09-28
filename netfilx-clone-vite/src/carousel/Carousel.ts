import { buildIndicators, setIndicator } from './indicators'; // 헬퍼 함수 파일 경로
import { createLikeElement } from '../utils/dom';


// ==== 캐러셀 클래스 정의 ====

export type CarouselOptions = {
  loop?: boolean;
  transitionMs?: number;
};

export default class Carousel {
  // ==== DOM refs ====
  root: HTMLElement;
  wrapper: HTMLElement;
  scrollbox: HTMLElement;
  prevBtn: HTMLButtonElement | null;
  nextBtn: HTMLButtonElement | null;
  indicatorEl: HTMLUListElement | null;

  // ==== State ====
  loop: boolean;
  pageIndex = 0;
  isAnimating = false;
  likeState = new Map<string, { count: number; liked: boolean }>();

  // ==== Measured / Derived ====
  items: HTMLLIElement[] = [];
  gap = 0;
  cardWidth = 0;
  perPage = 1;
  pageDistance = 0;
  pages = 1;
  headCloneCount = 0;
  transitionMs = 500;
  isBound = false;
  wrapperWidth = 0;

  constructor(root: HTMLElement, { loop = true, transitionMs }: CarouselOptions = {}) {
    this.root = root;

    const wrapper = root.querySelector<HTMLElement>('.scrollbox-wrapper');
    const scrollbox = root.querySelector<HTMLElement>('.scrollbox');
    if (!wrapper || !scrollbox) {
      throw new Error('[Carousel] .scrollbox-wrapper / .scrollbox 가 필요합니다.');
    }
    this.wrapper = wrapper;
    this.scrollbox = scrollbox;

    this.prevBtn = root.querySelector<HTMLButtonElement>('.prev');
    this.nextBtn = root.querySelector<HTMLButtonElement>('.next');
    this.indicatorEl = root.querySelector<HTMLUListElement>('.indicator');

    this.loop = loop;
    if (typeof transitionMs === 'number') this.transitionMs = transitionMs;

    this.init();
  }

  init() {
    this.items = Array.from(this.scrollbox.querySelectorAll<HTMLLIElement>('li:not(.clone)'));
    if (!this.items.length) return;

    // 각 아이템에 고유 ID 부여 및 좋아요 버튼 추가
    this.items.forEach((item, index) => {
      const itemId = `item-${index}`;
      item.dataset.itemId = itemId;
      
      if (!this.likeState.has(itemId)) {
        this.likeState.set(itemId, { count: 0, liked: false });
      }

      if (!item.querySelector('.like-container')) {
        const initialState = this.likeState.get(itemId);
        const likeElement = createLikeElement(initialState?.count);
        item.appendChild(likeElement);
      }
    });

    this.teardownClones();
    this.measure();
    if (this.loop) this.setupClones();
    this.buildIndicators();

    this.pageIndex = 0;
    this.jumpToPage(this.pageIndex);

    if (!this.isBound) this.bind();
  }

  bind() {
    this.isBound = true;
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());
    this.scrollbox.addEventListener('transitionend', this.handleTransitionEnd);
    this.scrollbox.addEventListener('click', this.handleLikeClick);
    window.addEventListener('resize', () => this.init(), { passive: true });
  }

  handleTransitionEnd = () => {
    this.isAnimating = false;
    if (!this.loop) return;

    if (this.pageIndex === -1) {
      this.pageIndex = this.pages - 1;
      this.jumpToPage(this.pageIndex);
    } else if (this.pageIndex === this.pages) {
      this.pageIndex = 0;
      this.jumpToPage(this.pageIndex);
    }
  };

  handleLikeClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const likeButton = target.closest<HTMLButtonElement>('.like-button');
    if (!likeButton) return;

    const item = likeButton.closest<HTMLLIElement>('li');
    const itemId = item?.dataset.itemId;
    if (!itemId) return;
    
    this.toggleLike(itemId, likeButton);
  };

  toggleLike(itemId: string, button: HTMLButtonElement) {
    const state = this.likeState.get(itemId);
    if (!state) return;

    state.liked = !state.liked;
    state.count += state.liked ? 1 : -1;
    
    button.textContent = state.liked ? '♥' : '♡';
    button.classList.toggle('liked', state.liked);
    
  }

  jumpToPage(index: number) {
    const x = -this.headCloneCount * (this.cardWidth + this.gap) - index * this.pageDistance;
    this.withoutTransition(() => this.applyX(x));
    this.setIndicator(index);
  }

  animateToPage(index: number) {
    const x = -this.headCloneCount * (this.cardWidth + this.gap) - index * this.pageDistance;
    this.withTransition(() => this.applyX(x));
    const realIndex = (index % this.pages + this.pages) % this.pages;
    this.setIndicator(realIndex);
  }
  
  prev() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    if (this.loop) {
      this.pageIndex--;
      this.animateToPage(this.pageIndex);
    } else {
      this.pageIndex = Math.max(0, this.pageIndex - 1);
      this.animateToPage(this.pageIndex);
    }
  }

  next() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    if (this.loop) {
      this.pageIndex++;
      this.animateToPage(this.pageIndex);
    } else {
      this.pageIndex = Math.min(this.pages - 1, this.pageIndex + 1);
      this.animateToPage(this.pageIndex);
    }
  }

  buildIndicators() {
    if (!this.root || !this.items.length) return;
  
    // 외부 buildIndicators 함수 호출
    const result = buildIndicators({
      categoryEl: this.root,
      itemCount: this.items.length,
      perPage: this.perPage,
    });
    
    // 결과가 있으면 클래스 상태 업데이트
    if (result) {
      this.indicatorEl = result.indicator;
      this.pages = result.pages;
    }
  }
  
  // FIXED: 외부 함수를 사용하도록 수정
  setIndicator(index: number) {
    if (!this.indicatorEl) return;
    
    // 외부 setIndicator 함수 호출
    setIndicator({
      indicatorEl: this.indicatorEl,
      toIndex: index,
    });
  }

  measure() {
    const styles = getComputedStyle(this.scrollbox);
    this.gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    this.cardWidth = this.items[0]?.getBoundingClientRect().width || 0;
    this.wrapperWidth = this.wrapper.clientWidth;
    this.perPage = Math.max(1, Math.floor((this.wrapperWidth + this.gap) / (this.cardWidth + this.gap)));
    this.pageDistance = this.perPage * (this.cardWidth + this.gap);
    this.pages = Math.max(1, Math.ceil(this.items.length / this.perPage));
  }

  setupClones() {
    const n = this.perPage;
    const head = this.items.slice(-n).map(node => node.cloneNode(true) as HTMLLIElement);
    const tail = this.items.slice(0, n).map(node => node.cloneNode(true) as HTMLLIElement);

    head.forEach(clone => clone.classList.add('clone'));
    tail.forEach(clone => clone.classList.add('clone'));

    this.scrollbox.prepend(...head);
    this.scrollbox.append(...tail);

    this.headCloneCount = n;
  }

  teardownClones() {
    const clones = this.scrollbox.querySelectorAll<HTMLLIElement>('.clone');
    clones.forEach(c => c.remove());
    this.headCloneCount = 0;
  }

  applyX(x: number) {
    this.scrollbox.style.transform = `translateX(${x}px)`;
  }

  withTransition(fn: () => void) {
    this.scrollbox.style.transition = `transform ${this.transitionMs}ms ease-in-out`;
    fn();
  }

  withoutTransition(fn: () => void) {
    this.scrollbox.style.transition = 'none';
    fn();
    void this.scrollbox.offsetWidth;
  }
 
}

  // ==== 인디케이터 관련 ====
