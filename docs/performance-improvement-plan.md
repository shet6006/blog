# 프론트엔드 성능 개선 계획

## 1. 목적과 원칙

이 문서는 현재 Next.js 정적 export 프론트엔드의 성능 개선 백로그다. 개선 전후를 같은 조건에서
측정하고, 사용자 체감과 운영 비용에 영향이 큰 순서로 진행한다. 스켈레톤 노출 시간을 줄이는
것보다 실제 데이터 도착과 렌더링을 빠르게 만드는 것을 우선한다.

현재 운영 구조는 CloudFront -> S3 정적 파일이며 API만 CloudFront -> EC2 -> Spring Boot로
전달된다. `output: "export"`이므로 Next.js 서버 캐시, SSR, ISR은 현재 구조에서 사용할 수 없다.

## 2. 현재 기준선

- Next.js 15.2.6, React 19, 정적 export
- `images.unoptimized: true`
- 공개 페이지 대부분이 `"use client"`이고 마운트 후 API를 호출한다.
- 현재 프로덕션 빌드의 공통 First Load JS는 약 101 kB다.
- 게시글 상세 First Load JS는 약 254 kB, 글 작성/수정은 약 263 kB다.
- `public/placeholder.png`는 약 1.1 MB다.
- 홈 첫 데이터는 게시글, 인기 글, 카테고리, 통계, 프로필을 순차 호출한다.

위 수치는 2026-08-23 로컬 빌드 기준이며 배포 환경의 Web Vitals 기준선은 아직 없다.

## 3. P0: 먼저 측정할 항목

### F-01. 성능 예산과 실사용 지표 수집

**근거:** 현재 Lighthouse, Core Web Vitals, API timing을 지속적으로 기록하지 않는다. 수치 없이
스켈레톤이나 메모이제이션만 바꾸면 실제 개선 여부를 판단하기 어렵다.

**작업**

- 모바일 Lighthouse를 홈, 게시글 상세, 카테고리, 관리자 작성 화면에서 각각 측정한다.
- Web Vitals의 LCP, INP, CLS를 수집하고 배포 버전과 함께 기록한다.
- 브라우저 Performance/Network에서 API 요청 수, TTFB, 전송량, long task를 기록한다.
- CI 빌드에서 route별 First Load JS가 예산을 넘으면 알리도록 설정한다.

**초기 목표**

| 지표 | 목표 |
|---|---:|
| 모바일 LCP p75 | 2.5초 이하 |
| INP p75 | 200ms 이하 |
| CLS p75 | 0.1 이하 |
| 홈 초기 API 요청 | 필수 1회 + 보조 최대 1회 |
| 공개 페이지 JS gzip | route별 200 kB 이하를 1차 목표로 설정 |

## 4. P1: 체감 효과가 큰 개선

### F-02. 홈의 순차 API waterfall 제거

**근거:** `app/page.tsx`의 `loadData`는 게시글 -> 인기 글 -> 카테고리 -> 통계 -> 프로필을
차례로 기다린다. 전체 완료 시간은 각 요청 시간의 합에 가까우며, 필터 변경 때도 변하지 않는
데이터를 전부 다시 요청한다.

**작업**

- 게시글 목록만 검색어, 카테고리, 페이지, 정렬 조건에 종속시킨다.
- 카테고리, 통계, 프로필, 인기 글은 별도 query key로 분리해 병렬 요청하고 재사용한다.
- 작은 사이트에서는 먼저 `Promise.allSettled`와 모듈 수준 캐시를 적용한다.
- 페이지가 늘어나면 SWR 또는 TanStack Query 중 하나만 도입해 dedupe, stale time, 재검증을
  통합한다. 단순히 라이브러리만 추가하지 않는다.
- 장기적으로 홈 전용 집계 API(`/api/home`)를 만들어 왕복 횟수를 줄이는 방안도 비교 측정한다.

**완료 조건:** 필터/페이지 변경 시 게시글 API 외 정적 성격의 API가 재호출되지 않고, 홈 초기
요청이 동시에 시작된다.

### F-03. 방문자 추적 중복 호출 제거

**근거:** `app/page.tsx`에서 방문자 추적이 데이터 로딩 effect 안에 있어 카테고리, 검색, 페이지,
정렬 변경 때마다 다시 호출된다. 주석의 "페이지 로드 시 한 번"과 실제 동작이 다르다.

**작업:** 방문자 추적을 빈 dependency effect로 분리하고 `sendBeacon` 또는 낮은 우선순위 요청을
사용한다. 백엔드의 일일 중복 방지는 유지하되 불필요한 네트워크와 DB 조회를 만들지 않는다.

### F-04. 인증/프로필 요청 중복 제거

**근거:** `Header`가 페이지마다 `/api/auth/check`를 호출하며, 관리자 페이지도 같은 요청을 다시
실행한다. 로그인 상태이면 Header가 프로필까지 별도로 가져온다. 게시글 상세와 소개 페이지도
인증 또는 프로필 요청을 자체적으로 수행한다. `lib/auth-context.tsx`가 있지만 일관되게 사용되지
않는다.

**작업**

- 루트 레이아웃의 단일 AuthProvider를 인증 상태의 기준으로 사용한다.
- Header와 관리자 route guard가 같은 인증 promise/cache를 공유한다.
- 공개 프로필 endpoint와 관리자 인증 endpoint의 책임을 분리한다.
- 401 응답과 로그아웃에서만 인증 캐시를 무효화한다.

### F-05. 목록 응답에서 본문 제거

**근거:** 프론트 홈은 카드에 제목, 요약, 카테고리, 썸네일, 카운트만 쓰지만 백엔드 목록 DTO는
`content`까지 반환한다. 글이 늘면 JSON parsing, 메모리, 전송량이 함께 증가한다.

**작업:** 백엔드의 경량 목록 DTO와 연계해 프론트 `PostSummary` 타입을 별도로 만들고 `any`를
제거한다. Network 패널에서 10개 목록 응답 크기를 전후 비교한다.

### F-06. 이미지 최적화 경로 확립

**근거:** `next.config.mjs`에서 이미지 최적화가 꺼져 있고 `<img>`를 직접 사용한다. 업로드 이미지는
원본 최대 10 MB이며 서버에서도 리사이즈하지 않는다. 큰 placeholder PNG도 배포된다.

**작업**

- 프로필, 썸네일, 본문 이미지 용도별 최대 크기와 품질을 정한다.
- 업로드 시 WebP/AVIF 변환과 thumbnail variant 생성을 백엔드 또는 이미지 파이프라인에서 한다.
- 정적 이미지는 압축하고 1.1 MB placeholder를 제거하거나 작은 WebP로 교체한다.
- 정적 export 제약상 Next Image optimizer를 그대로 쓸 수 없으므로, 사전 생성 variant +
  `srcset`/`sizes` 또는 CloudFront 이미지 변환 중 하나를 선택한다.
- 모든 이미지에 안정적인 width/height 또는 aspect-ratio를 부여하고 offscreen 이미지는 lazy load한다.

**완료 조건:** 첫 화면에서 원본 대형 이미지가 내려오지 않고, 이미지 때문에 CLS가 발생하지 않는다.

## 5. P2: 번들·렌더링·데이터 UX 개선

### F-07. 무거운 기능을 route 단위로 지연 로딩

**근거:** 게시글 상세와 에디터 route의 First Load JS가 가장 크다. Markdown 렌더링,
`rehype-highlight`, 에디터가 주요 후보이며 코드 하이라이트 자동 감지는 비용이 크다.

**작업**

- bundle analyzer로 패키지별 비중을 먼저 확인한다.
- Markdown editor와 관리자 전용 기능은 dynamic import한다.
- `rehype-highlight`의 전체 언어 자동 감지 대신 실제 사용하는 언어만 등록하거나 빌드 시
  하이라이트를 검토한다.
- `components/ui`의 미사용 컴포넌트와 직접 dependency를 정리하되 tree-shaking 결과로 판단한다.

### F-08. 공개 페이지의 클라이언트 경계 축소

**근거:** 홈, 소개, 카테고리, 게시글 상세가 모두 클라이언트 렌더링 후 데이터를 가져와 초기 HTML에
실제 콘텐츠가 없다. 정적 export를 유지하면 동적 게시글을 빌드 시 모두 생성하기 어렵다는 제약이
있다.

**선택지**

1. 현재 정적 export 유지: shell은 정적으로 두고 상호작용 컴포넌트만 client로 분리하며 API 캐시를
   강화한다.
2. Next 서버 배포 전환: 공개 글을 SSR/ISR하고 CDN 캐시를 사용한다. 운영 복잡도와 EC2 비용이
   증가하므로 데이터 규모와 SEO/LCP 효과를 측정한 뒤 결정한다.
3. 배포 시 콘텐츠 snapshot 생성: 글 변경이 적다면 빌드 단계에서 공개 API 데이터를 받아 정적
   페이지로 생성한다. 백엔드 배포와 프론트 재빌드 연결이 필요하다.

현 구조에서는 1번을 먼저 적용하고, LCP가 목표를 계속 넘을 때 2번과 3번을 비교한다.

### F-09. 게시글 상세의 하위 요청 통합

**근거:** 상세 진입 시 글, 인증, 카테고리를 병렬 호출한 뒤 LikeButton과 CommentSection이 각각
좋아요와 댓글을 추가 호출한다. Header의 인증 호출까지 중복될 수 있다.

**작업:** 초기 글 응답에 공개 좋아요 수는 유지하고, 사용자 liked 상태와 댓글은 viewport/idle 기준
지연 또는 상세 bootstrap API로 통합한다. 댓글 작성/삭제 뒤 전체 목록 재요청 대신 로컬 상태를
증분 갱신한다.

### F-10. 요청 취소와 stale response 방지

**근거:** 검색·필터를 빠르게 바꾸면 이전 fetch가 계속 실행되고 늦게 도착한 응답이 최신 화면을
덮을 수 있다.

**작업:** `AbortController`를 API client에 전달하고 effect cleanup에서 취소한다. query library를
도입한다면 해당 기능을 공통화한다. 검색은 submit 방식은 유지하되 즉시 검색으로 바꿀 경우 debounce를
추가한다.

### F-11. 렌더링 비용과 상태 범위 축소

- 홈의 posts/categories/stats/profile 상태를 독립 컴포넌트로 나눠 한 응답이 전체 페이지를 다시
  렌더링하지 않게 한다.
- Markdown의 heading 추출과 렌더 parsing이 긴 글에서 long task를 만드는지 프로파일링한다.
- `onCountChange={setLikeCount}`처럼 안정적인 callback은 유지하고, 실제 profiler 결과 없이 모든
  컴포넌트에 `memo`를 적용하지 않는다.
- 긴 관리자 댓글/게시글 테이블은 서버 페이지네이션과 필요 시 windowing을 적용한다.

### F-12. 캐시 헤더와 CloudFront 정책 정리

- 해시 정적 자산: `Cache-Control: public, max-age=31536000, immutable`
- HTML: 현재 배포 정책대로 `no-cache`
- 공개 GET API: 인증 쿠키가 필요 없는 endpoint만 짧은 TTL + stale-while-revalidate 후보로 분리
- `/api/auth/*`, 좋아요 상태, 관리자 API는 CDN 캐시 금지
- 업로드 파일에는 content hash 또는 UUID가 있으므로 장기 immutable 캐시 적용

## 6. P3: 품질과 지속 검증

- `next lint`는 Next 15에서 제거된 명령이므로 ESLint CLI로 교체하고 빌드의
  `ignoreDuringBuilds: true`를 제거한다.
- Lighthouse CI와 bundle size budget을 PR 검증에 추가한다.
- API 오류를 빈 데이터로 바꾸는 광범위한 `.catch(() => ...)`를 정리해 느림과 장애를 구분한다.
- 브라우저 캐시가 찬 경우와 비어 있는 경우, 모바일 throttling과 데스크톱을 각각 측정한다.
- 메모리 누수 검사는 route 왕복, 이미지 업로드 preview, 긴 Markdown 편집 흐름을 대상으로 한다.

## 7. 권장 실행 순서

1. F-01 기준선 수집
2. F-02, F-03, F-04 요청 수와 waterfall 개선
3. 백엔드 목록 DTO 개선과 함께 F-05 적용
4. F-06 이미지 pipeline 적용
5. F-07 bundle analyzer 기반 분할
6. F-09, F-10 데이터 갱신 개선
7. 결과를 보고 F-08 렌더링 아키텍처 결정

각 작업은 변경 전/후 측정값, 테스트 결과, 롤백 방법을 PR에 기록한다.

