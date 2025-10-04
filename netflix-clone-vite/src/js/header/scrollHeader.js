import { debounce } from "../utils/debounce.js";

export function initScrollHeader(headerSelector = "header", wait = 150) {
  const header = document.querySelector(headerSelector);
  if (!header) return;

  const add = () => header.classList.add("is-scrolling");
  const remove = debounce(() => header.classList.remove("is-scrolling"), wait);

  window.addEventListener("scroll", () => {
    add();
    remove();
  }, { passive: true });
}