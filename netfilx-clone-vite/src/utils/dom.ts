/**
 * '좋아요' 버튼과 카운터 DOM 요소를 생성하여 반환합니다.
 * @param initialCount - 초기 좋아요 수
 * @returns 생성된 'like-container' div 요소
 */

export function createLikeElement(initialCount = 0): HTMLElement {
  const container = document.createElement('div');
  container.className = 'like-container';

  const button = document.createElement('button');
  button.className = 'like-button';
  button.setAttribute('aria-label', '좋아요');
  button.textContent = '♡'; // 초기 아이콘


  container.appendChild(button);

  return container;
}