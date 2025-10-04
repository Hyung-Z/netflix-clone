# Netflix-like Search (검색창 미션)

## 🎯 학습 목표 (Learning Goals)
- 복잡한 인터랙션(Interaction)을 **사용성을 고려**해 효과적으로 제어한다.
- **데이터 통신(HTTP/Fetch)** 과정을 이해하고 **브라우저(Frontend)** 와 **웹 서버(Backend)** 의 역할을 분리하여 구현한다.

---

## 🧩 기능 요구사항 (Features)
### 1) 검색결과 자동 노출 (Auto Suggest)
- 사용자가 검색어를 입력하기 시작하면, **하단 레이어**에 검색 결과가 노출된다.
- 서버에서 **고정 JSON(Mock Data)** 을 받아 필터링하여 보여준다.

### 2) 서버 응답 (Express Server)
- **Node.js + Express** 로 서버 구성.
- DB 없이 **JSON 형태의 고정 데이터**로 응답.
- **의도적인 1초 지연(Throttle/Delay)** 후 응답.

### 3) (선택) 최근 검색어 (Recent Keywords)
- 검색창에 **focus** 시 '최근 검색어' 레이어 노출.
- 최근 검색어는 **최신순 최대 5개**.
- 마우스/키보드 방향키로 선택 → 검색창에 입력.
- **입력 디바운스(debounce) 0.5초**: 0.5초 동안 추가 입력 없을 때만 서버 요청.
- **돋보기 아이콘 클릭 시 검색창 가로 확장 애니메이션(Animation)**.



