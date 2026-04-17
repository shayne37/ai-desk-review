# Basic Info Backend

기본정보 화면에서 사용할 백엔드 프록시입니다.

## 역할

- `POST /api/basic-info/candidates`
  - 주소/건물명 검색 후 대상물 선택 목록 반환
- `POST /api/basic-info/fetch`
  - 선택한 대상물의 기본정보 자동 채움용 데이터 반환
- `GET /api/health`
  - 서버 상태 확인

## 현재 상태

- 키가 없으면 `mock` 데이터로 동작합니다.
- 키가 있으면 아래까지 실제 호출합니다.
  - `Juso 검색 API`
  - `행정표준코드_법정동코드`
  - `건축HUB 건축물대장정보 서비스(getBrTitleInfo)`
  - `건축HUB 건축물대장정보 서비스(getBrExposPubuseAreaInfo)`
- `VWORLD_API_KEY`까지 있으면 아래도 함께 조회합니다.
  - `VWorld 개별공시지가속성조회(getIndvdLandPriceAttr)`
  - `VWorld 국토계획주제도WFS조회(getTritPlnSpceWFS)`
- 현재는 `건축물대장 표제부 + 전유공용면적`까지 조회해서 아래 항목을 우선 채웁니다.
  - `준공연도`
  - `주용도`
  - `전용면적`
  - `공급면적`
  - `대지권면적`
- `VWORLD_API_KEY`가 있으면 아래 항목도 보강합니다.
  - `용도지역`
  - `공시연도`
  - `개별공시지가`
- `용도지역`은 좌표 기반 WFS 조회라서 주소 좌표를 받지 못하는 일부 케이스에서는 비어 있을 수 있습니다.

## 실행 전제

- Node.js 18 이상 필요

## 실행

```bash
cd /Users/shayne/Documents/Playground/backend
cp .env.example .env
node --env-file=.env server.mjs
```

Node 20 이상이면 위 명령으로 `.env` 로딩이 가능합니다.

Node 18 계열이면 아래처럼 실행하세요.

```bash
cd /Users/shayne/Documents/Playground/backend
export $(grep -v '^#' .env | xargs)
node server.mjs
```

## 프론트 연결

[index.html](/Users/shayne/Documents/Playground/index.html) 안에서 아래 설정을 바꾸면 됩니다.

```js
const APP_CONFIG = {
  apiMode: "auto",
  apiBaseUrl: "http://localhost:8787",
};
```

기본값은 `auto`라서 서버가 켜져 있으면 실제 API 모드, 아니면 mock 모드로 동작합니다.

## 다음 연결 순서

1. `JUSO_API_KEY` 전달
2. `DATA_GO_KR_API_KEY` 전달
3. `VWORLD_API_KEY` 전달
4. 건축물대장 OpenAPI의 실제 승인 상태 확인
5. 필요하면 `getBrRecapTitleInfo`, `getBrAtchJibunInfo` 등 추가
6. 필요하면 좌표 변환/지번도형 조회를 붙여 `용도지역` 정확도를 더 높임
