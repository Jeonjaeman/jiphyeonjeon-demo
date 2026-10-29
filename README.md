# 집현전 의료전문센터 데모 사이트 (3안)

고객 자료 정리: `../자료정리.md` (메뉴·문구·변호사 이력·확인 필요 항목). 세 안 모두 같은 콘텐츠(교정본 문구, 변호사 10인 실사진, 지도, 면책공고)를 쓰고 디자인·모션만 다르다.

| 폴더 | 안 | 레퍼런스 | 톤·기법 | 포트 |
|---|---|---|---|---|
| `01-navy-gold/` | 1안 | 13-탐정법인(UNIST 기법) | 딥네이비+골드, 고정 인트로 히어로, 마퀴, 핀 2곳, 글래스 | 8211 |
| `02-edu-light/` | 2안 | robotoriedu.com | 화이트+비비드 블루·민트, 대각선 오버레이 히어로 스와이퍼, 스크롤 단계 고정 섹션, 둥근 패널 | 8212 |
| `03-cinematic/` | 3안 | ipark-dvp.com | 화이트 여백+와인레드 바, 풀스크린 영상 히어로(클립패스 리빌), 300vh·500vh 스티키 스테이지, 핀 겹침, three.js 파티클 | 8213 |

실행: 각 폴더 `index.html` 더블클릭, 또는 `npx --yes serve <폴더> -l <포트>`. 외부 네트워크 의존 0(폰트·GSAP·Lenis·Swiper·three.js 전부 로컬 vendor). 관리자 페이지는 1안에만 있음(2·3안은 요청에 따라 제외).

## 레퍼런스 분석 요약 (2026-10-29)

**robotoriedu.com** — jQuery + Swiper 11만 사용. 영상·canvas·three.js 없음. 히어로는 사진 스와이퍼 위에 초록 대각선 반투명 폴리곤, 섹션 헤드는 "○ 라벨 + 더보기 +" 패턴. 핵심 인터랙션은 `sec03`의 스크롤 단계 고정: `scrollTop` 기준 300px마다 좌측 목록 `li.on` 전환 + 우측 큰 원 배경(`main-scroll01.on01~04`) 교체. 나머지는 `.opacity` 클래스 IO 리빌, 헤더 스크롤 방향 숨김/노출, 리스트 행.

**ipark-dvp.com** — 번들(libs.js)에 GSAP·ScrollTrigger·Lenis·Swiper·Lottie 포함, three.js 없음. 히어로는 CDN mp4 영상에 `clip-path: inset(100% 0 0 0) → inset(0)` 1초 리빌, 타이포는 `line-mask` 안에서 translateY 리빌, 헤더는 `header--white` 토글. Corporate Essence는 300vh 스테이지 + sticky 뷰포트, 좌측 세로 이미지 3장을 스크롤 진행률 lerp(0.12)로 translateY, 우측 index/타이틀 크로스페이드. Businesses는 500vh 스테이지, 풀블리드 이미지 3장이 임계값(.1/.5/.9)에서 슬라이드업, 카드 아코디언. Masterpiece 스와이퍼는 `pin: true, pinSpacing: false`로 다음 섹션(ESG, +50% 핀)이 덮으며 올라옴. 영상 프레임 시퀀스(canvas)는 두 사이트 모두 없음.

## 2안 (02-edu-light)

- 메인: 히어로 스와이퍼(페이드·fraction·프로그레스·일시정지) → 주요 업무(사진 카드 + 컬러 카드 그리드) → WHY 스티키 단계 섹션(좌 목록 4단계 / 우 큰 원 색·회전선·패널 전환, 모바일은 카드 스택) → 상황별 상담 가이드 스와이퍼 → 소식 스플릿(리스트 카드 + 블루 프로모) → 변호사 스와이퍼(4/뷰) → 칼럼 리스트 행 → CTA → 면책공고 → 푸터.
- 서브 7페이지: about(소개/인사말/변호사), criminal, license, admin-law, malpractice, contact(폼은 localStorage 저장), privacy. 생성기 `build_sub.py 02`.
- 파일: `assets/css/edu.css`, `assets/js/edu.js`(헤더 숨김·리빌·단계 섹션·스와이퍼·카운터·탭·스파이), `assets/js/components.js`(헤더·푸터·면책공고 인젝션).
- 이미지: 힉스필드 7종(hero-01~03, photo-01~02, case-01~02) + 1안 공용 이미지 일부 + 변호사 실사진.

## 3안 (03-cinematic)

- 메인: 영상 히어로(`video/hero.mp4` 힉스필드 Seedance 8초 1080p, H.264 변환, 클립패스 리빌) → Essence 300vh 스테이지(세로 이미지 3장 lerp 스택 + 01/02/03 서사) → 주요 업무 500vh 스테이지(법정/행정청 복도/병실 풀블리드 슬라이드업 + 카드 아코디언 + 도트) → 변호사 스와이퍼(흑백→컬러, 핀 겹침) → 약속 풀스크린 핀(+60%) → 칼럼 리스트 → three.js 파티클 CTA(마우스 패럴랙스, 뷰포트 밖 정지) → 면책공고 → 다크 푸터.
- Lenis 스무스 스크롤, 1024px 이하·reduced-motion은 스테이지를 정적 레이아웃으로 강등.
- 서브 7페이지: 2안과 같은 구성, 다크 섹션·선 그리드(`.cells`)·흑백 변호사 사진. 생성기 `build_sub.py 03`.
- 파일: `assets/css/cine.css`, `assets/js/cine.js`, `assets/js/components.js`(풀스크린 메뉴 포함), `assets/vendor/three.min.js`(r160).
- 이미지: 힉스필드 12종(hero-poster, essence-01~03, biz-*, night-window, facade, still-marble) + 1안 공용 이미지 일부.

## 1안 (01-navy-gold)

- 메인 8섹션 + 서브 8페이지(admin 포함). 상세는 이전 기록 참고. 메가메뉴 hover 후 안 닫히던 버그 수정됨(`.megamenu__scrim` 포인터 통과) — 원본 13-탐정법인에도 같은 패치 필요.

## 공통 참고

- 오시는 길 지도: 세 안 모두 카카오맵 퍼가기(`daumRoughmapContainer1793268396215`, key `44pw9y8ug7j`)로 교체(2026-10-29). 고정 640x360 대신 컨테이너 크기(데스크톱 16:9, 640px 이하 4:3)로 렌더하고 창 폭이 바뀌면 다시 그린다. 오프라인·로드 전에는 `img/map-static.png`가 폴백으로 보인다.
- 한국식 줄나눔: `assets/js/kb.js`(세 안 동일)가 `p/dd/li/blockquote/figcaption` 텍스트를 문장 끝(…다.) → 연결어미(…며/…지만/…는데) → 절 끝 쉼표(…으로,/…경우,) 순으로 `<br class="kb">`를 넣어 나눈다. 명사 나열 쉼표·"신속하고 정확한" 같은 수식 연결은 나누지 않는다. `body { word-break: keep-all }`로 단어 중간 끊김 방지, 640px 이하에서는 `br.kb`를 숨겨 자연 줄바꿈. 내비·푸터·폼·버튼·표·`[data-no-kb]`는 제외.

- 인사말 문안은 자료가 없어 임시 작성(고객 확인 필요). `../자료정리.md` 6장의 확인 항목 10개 유지.
- 세 안 모두 데스크톱(1440)·모바일(375) 가로 넘침 0, 콘솔 에러 0(3안 contact의 404 1건은 favicon).
- 디자인 검수(2026-10-29, 1440·390 전 페이지 캡처): 1안 INSIGHT 섹션 위아래 민무늬 네이비 띠 제거(`.insight` 패딩 0), 2안 메인 "방문 상담 예약제" 와이드 카드 설명문이 세로로 찌그러지던 것 수정(카드 줄바꿈 배치), 2안 소식 카드 모바일 세로 스택, 2안 상담 페이지 서브히어로 사진 중복 해소(office-02). `overflow-wrap: anywhere`는 플렉스 안에서 글 폭을 0으로 만들어 `break-word`로 교체.
