export function buildIndicators({
  categoryEl,
  itemCount,
  perPage,
}: {
  categoryEl: HTMLElement;
  itemCount: number;
  perPage: number;
}): { indicator: HTMLUListElement; pages: number } | void {
  const indicator = categoryEl.querySelector<HTMLUListElement>(".indicator");
  if (!indicator) return;

  indicator.innerHTML = "";
  const pages = Math.max(1, Math.ceil(itemCount / perPage));

  for (let i = 0; i < pages; i++) {
    const li = document.createElement("li");
    li.textContent = "-";
    indicator.appendChild(li);
  }
  indicator.firstElementChild?.classList.add("now-here");

  return { indicator, pages };
}

export function setIndicator({
  indicatorEl,
  toIndex,
}: {
  indicatorEl: HTMLUListElement;
  toIndex: number;
}): void {
  const dots = indicatorEl.querySelectorAll<HTMLLIElement>("li");
  dots.forEach((d) => d.classList.remove("now-here"));
  const safe = Math.max(0, Math.min(toIndex, dots.length - 1));
  dots[safe]?.classList.add("now-here");
}