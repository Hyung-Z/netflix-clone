export function buildIndicators({ categoryEl, itemCount, perPage }) {
  const indicator = categoryEl.querySelector(".indicator");
  if (!indicator) return;

  indicator.innerHTML = "";
  const pages = Math.max(1, Math.ceil(itemCount / perPage));

  for (let i = 0; i < pages; i++) {
    const li = document.createElement("li");
    li.textContent = "-";
    indicator.appendChild(li);
  }
  if (indicator.firstChild) indicator.firstChild.classList.add("now-here");
  return { indicator, pages };
}

export function setIndicator({ indicatorEl, toIndex }) {
  const dots = indicatorEl.querySelectorAll("li");
  dots.forEach(d => d.classList.remove("now-here"));
  const safe = Math.max(0, Math.min(toIndex, dots.length - 1));
  dots[safe]?.classList.add("now-here");
}