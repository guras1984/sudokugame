# 스도쿠

빈칸 하나에서 시작하는 조용한 몰입.

실행: https://guras1984.github.io/sudokugame/

빌드 도구 없이 동작하는 HTML/CSS/JavaScript 웹게임입니다. `python3 -m http.server 8080`으로 실행합니다. `file://`로 직접 열면 ES 모듈이 작동하지 않을 수 있습니다.

- `config.js`: 제목, 규칙, 색상
- `game.js`: 화면·입력·진행 관리
- `puzzle-engine.mjs`: 순수 게임 규칙
- `common.js`, `style.css`: 공통 화면과 저장 처리
- `sw.js`: 최초 접속 후 캐시한 파일의 오프라인 재접속 지원. 브라우저가 저장 데이터를 지우면 온라인으로 다시 접속해야 합니다.
- `data.js`: 난이도별 유일해를 검증한 퍼즐 (숫자 퍼즐에만 포함)

게임 기록은 브라우저 localStorage에 저장합니다. 외부 서버로 전송하지 않으며 계정 간 동기화는 없습니다.

규칙 참고: [Simon Tatham의 퍼즐 설명](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/). 규칙을 참고해 화면·코드·문제는 별도로 작성했습니다. 외부 그림·음악·폰트 의존성이 없습니다.
