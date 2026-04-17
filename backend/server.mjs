import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.PORT || 8787);
const JUSO_API_KEY = process.env.JUSO_API_KEY || "";
const DATA_GO_KR_API_KEY = process.env.DATA_GO_KR_API_KEY || "";
const VWORLD_API_KEY = process.env.VWORLD_API_KEY || "";
const VWORLD_DOMAIN = process.env.VWORLD_DOMAIN || "api.vworld.kr";
const BUILDING_HUB_BASE_URL = "https://apis.data.go.kr/1613000/BldRgstHubService";
const LEGAL_DONG_BASE_URL = "https://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList";
const VWORLD_INDVD_LAND_PRICE_URL = "https://api.vworld.kr/ned/data/getIndvdLandPriceAttr";
const VWORLD_TRIT_PLAN_WFS_URL = "https://api.vworld.kr/ned/wfs/getTritPlnSpceWFS";
const VWORLD_TRIT_PLAN_TYPENAMES = ["dt_d124", "dt_d125", "dt_d126", "dt_d127", "dt_d128"];

const mockGroups = {
  retail: {
    searchText: "서울특별시 강남구 대치동 은마상가",
    note:
      "은마상가 재건축 진행 여부와 집합건물 관리규약, 공실 여부에 따라 수익가치 편차가 큼. 호실별 임대차 현황 및 전용률 확인 필요.",
    items: [
      {
        address: "서울특별시 강남구 대치동",
        parcel: "316",
        buildingName: "은마상가 A동",
        exclusiveArea: "45.70",
        supplyArea: "61.22",
        landShareArea: "12.18",
        buildingWing: "A동",
        unitNumber: "214호",
        floor: "2",
        totalFloors: "4",
        builtYear: "1980",
        usage: "제1종근린생활시설",
        zoning: "제3종일반주거지역",
        officialYear: "2025",
        landPrice: "9,180,000",
        purpose: "매매 참고",
        type: "상가",
        fetchLabel: "은마상가 A동 214호",
      },
      {
        address: "서울특별시 강남구 대치동",
        parcel: "316",
        buildingName: "은마상가 B동",
        exclusiveArea: "32.15",
        supplyArea: "48.04",
        landShareArea: "9.82",
        buildingWing: "B동",
        unitNumber: "117호",
        floor: "1",
        totalFloors: "4",
        builtYear: "1980",
        usage: "제2종근린생활시설",
        zoning: "제3종일반주거지역",
        officialYear: "2025",
        landPrice: "9,180,000",
        purpose: "매매 참고",
        type: "상가",
        fetchLabel: "은마상가 B동 117호",
      },
    ],
  },
  officetel: {
    searchText: "서울특별시 송파구 문정동 힐스테이트에코송파",
    note:
      "오피스텔은 업무시설 여부와 주거형 사용 현황이 혼재할 수 있어 집합건축물대장, 임대차 현황, 관리비 수준을 함께 확인해야 함.",
    items: [
      {
        address: "서울특별시 송파구 문정동",
        parcel: "651-8",
        buildingName: "힐스테이트에코송파",
        exclusiveArea: "29.84",
        supplyArea: "49.12",
        landShareArea: "6.73",
        buildingWing: "1동",
        unitNumber: "1508호",
        floor: "15",
        totalFloors: "16",
        builtYear: "2017",
        usage: "업무시설(오피스텔)",
        zoning: "일반상업지역",
        officialYear: "2025",
        landPrice: "14,320,000",
        purpose: "담보평가",
        type: "오피스텔",
        fetchLabel: "힐스테이트에코송파 1508호",
      },
      {
        address: "서울특별시 송파구 문정동",
        parcel: "651-8",
        buildingName: "힐스테이트에코송파",
        exclusiveArea: "27.12",
        supplyArea: "44.87",
        landShareArea: "6.11",
        buildingWing: "1동",
        unitNumber: "907호",
        floor: "9",
        totalFloors: "16",
        builtYear: "2017",
        usage: "업무시설(오피스텔)",
        zoning: "일반상업지역",
        officialYear: "2025",
        landPrice: "14,320,000",
        purpose: "담보평가",
        type: "오피스텔",
        fetchLabel: "힐스테이트에코송파 907호",
      },
    ],
  },
  land: {
    searchText: "경기도 성남시 분당구 금곡동 172-4",
    note:
      "토지는 도로접면, 형상, 고저, 용도지역 및 개발가능성이 가치에 직접 영향을 주므로 인접 필지 이용상황과 표준지 비교 검토가 필요.",
    items: [
      {
        address: "경기도 성남시 분당구 금곡동",
        parcel: "172-4",
        buildingName: "나대지",
        exclusiveArea: "",
        supplyArea: "",
        landShareArea: "428.50",
        buildingWing: "",
        unitNumber: "",
        floor: "",
        totalFloors: "",
        builtYear: "",
        usage: "주상용",
        zoning: "제2종일반주거지역",
        officialYear: "2025",
        landPrice: "6,540,000",
        purpose: "매매 참고",
        type: "토지",
        fetchLabel: "금곡동 172-4",
      },
      {
        address: "경기도 성남시 분당구 금곡동",
        parcel: "172-5",
        buildingName: "잡종지",
        exclusiveArea: "",
        supplyArea: "",
        landShareArea: "395.00",
        buildingWing: "",
        unitNumber: "",
        floor: "",
        totalFloors: "",
        builtYear: "",
        usage: "상업나지",
        zoning: "제2종일반주거지역",
        officialYear: "2025",
        landPrice: "6,480,000",
        purpose: "매매 참고",
        type: "토지",
        fetchLabel: "금곡동 172-5",
      },
    ],
  },
  building: {
    searchText: "서울특별시 중구 충무로2가 61-3",
    note:
      "일반 건축물은 연면적, 임대현황, 리모델링 여부, 용도별 면적 배분이 중요하므로 건축물대장과 임대차 자료를 함께 검토해야 함.",
    items: [
      {
        address: "서울특별시 중구 충무로2가",
        parcel: "61-3",
        buildingName: "충무로 근린생활시설",
        exclusiveArea: "1287.42",
        supplyArea: "1542.30",
        landShareArea: "212.00",
        buildingWing: "본관",
        unitNumber: "",
        floor: "6",
        totalFloors: "6",
        builtYear: "1998",
        usage: "근린생활시설",
        zoning: "일반상업지역",
        officialYear: "2025",
        landPrice: "18,900,000",
        purpose: "자산 재평가",
        type: "건축물",
        fetchLabel: "충무로 근린생활시설 본관",
      },
      {
        address: "서울특별시 중구 충무로2가",
        parcel: "61-4",
        buildingName: "충무로 업무시설",
        exclusiveArea: "1482.18",
        supplyArea: "1704.25",
        landShareArea: "228.10",
        buildingWing: "별관",
        unitNumber: "",
        floor: "7",
        totalFloors: "7",
        builtYear: "2004",
        usage: "업무시설",
        zoning: "일반상업지역",
        officialYear: "2025",
        landPrice: "19,240,000",
        purpose: "자산 재평가",
        type: "건축물",
        fetchLabel: "충무로 업무시설 별관",
      },
    ],
  },
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
}

function normalizeType(propertyType = "") {
  if (propertyType === "오피스텔") return "officetel";
  if (propertyType === "상가") return "retail";
  if (propertyType === "토지") return "land";
  if (propertyType === "건축물") return "building";
  return "retail";
}

function getMockBundle(propertyType) {
  const key = normalizeType(propertyType);
  return mockGroups[key];
}

async function fetchJsonWithFallback(urls) {
  let lastError;

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      return JSON.parse(text);
    } catch (error) {
      lastError = error;
      console.error("[fetchJsonWithFallback] failed:", url.toString(), error);
    }
  }

  throw lastError || new Error("모든 API 호출이 실패했습니다.");
}

async function fetchJusoCandidates(query) {
  const urls = [
    new URL("https://business.juso.go.kr/addrlink/addrLinkApi.do"),
    new URL("https://www.juso.go.kr/addrlink/addrLinkApi.do"),
    new URL("http://www.juso.go.kr/addrlink/addrLinkApi.do"),
  ];

  urls.forEach((url) => {
    url.searchParams.set("confmKey", JUSO_API_KEY);
    url.searchParams.set("currentPage", "1");
    url.searchParams.set("countPerPage", "10");
    url.searchParams.set("keyword", query);
    url.searchParams.set("resultType", "json");
  });

  const data = await fetchJsonWithFallback(urls);
  const rows = data?.results?.juso ?? [];
  const errorCode = data?.results?.common?.errorCode;
  const errorMessage = data?.results?.common?.errorMessage;

  if (errorCode && errorCode !== "0") {
    throw new Error(`Juso API 오류 (${errorCode}): ${errorMessage || "알 수 없는 오류"}`);
  }

  return rows.map((row, index) => ({
    id: row.bdMgtSn || `${row.admCd}-${index}`,
    fetchLabel: row.roadAddr || row.jibunAddr || row.bdNm || query,
    roadAddr: row.roadAddr,
    jibunAddr: row.jibunAddr,
    admCd: row.admCd,
    rnMgtSn: row.rnMgtSn,
    udrtYn: row.udrtYn,
    buldMnnm: row.buldMnnm,
    buldSlno: row.buldSlno,
    bdNm: row.bdNm,
    bdMgtSn: row.bdMgtSn,
    entX: row.entX || row.x || "",
    entY: row.entY || row.y || "",
  }));
}

async function fetchLegalDongCode(addressName) {
  const url = new URL(LEGAL_DONG_BASE_URL);
  url.searchParams.set("ServiceKey", DATA_GO_KR_API_KEY);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "100");
  url.searchParams.set("type", "json");
  url.searchParams.set("locatadd_nm", addressName);

  const data = await fetchJsonWithFallback([url]);
  const items =
    data?.StanReginCd?.[1]?.row ??
    data?.StanReginCd?.row ??
    data?.response?.body?.items?.item ??
    [];

  return Array.isArray(items) ? items : [items];
}

function normalizeAddressName(rawAddress = "") {
  return rawAddress
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 3)
    .join(" ");
}

function pickBestLegalDong(rows, addressName) {
  if (!rows.length) return null;
  const exact = rows.find((row) => row.locatadd_nm === addressName);
  if (exact) return exact;

  const prefix = rows.find((row) => addressName.startsWith(row.locatadd_nm));
  if (prefix) return prefix;

  return rows[0];
}

function parseJibunAddress(jibunAddr = "") {
  const cleaned = jibunAddr.replace(/\s+/g, " ").trim();
  const tokens = cleaned.split(" ");
  const last = tokens.at(-1) || "";
  const isMountain = last.startsWith("산");
  const numeric = last.replace(/^산/, "");
  const [bunRaw = "", jiRaw = "0"] = numeric.split("-");

  return {
    platGbCd: isMountain ? "1" : "0",
    bun: bunRaw.padStart(4, "0"),
    ji: jiRaw.padStart(4, "0"),
  };
}

function buildPnu(regionCode, platGbCd, bun, ji) {
  if (!regionCode || !bun || !ji) return "";
  const landTypeCode = platGbCd === "1" ? "2" : "1";
  return `${regionCode}${landTypeCode}${bun}${ji}`;
}

async function fetchBuildingTitleInfo({ sigunguCd, bjdongCd, platGbCd, bun, ji }) {
  const url = new URL(`${BUILDING_HUB_BASE_URL}/getBrTitleInfo`);
  url.searchParams.set("serviceKey", DATA_GO_KR_API_KEY);
  url.searchParams.set("sigunguCd", sigunguCd);
  url.searchParams.set("bjdongCd", bjdongCd);
  url.searchParams.set("platGbCd", platGbCd);
  url.searchParams.set("bun", bun);
  url.searchParams.set("ji", ji);
  url.searchParams.set("_type", "json");
  url.searchParams.set("numOfRows", "20");
  url.searchParams.set("pageNo", "1");

  const data = await fetchJsonWithFallback([url]);
  const items = data?.response?.body?.items?.item ?? [];
  return Array.isArray(items) ? items : [items];
}

async function fetchVworldIndividualLandPrice({ pnu }) {
  if (!VWORLD_API_KEY || !pnu) return null;

  const url = new URL(VWORLD_INDVD_LAND_PRICE_URL);
  url.searchParams.set("pnu", pnu);
  url.searchParams.set("format", "json");
  url.searchParams.set("numOfRows", "10");
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("key", VWORLD_API_KEY);
  url.searchParams.set("domain", VWORLD_DOMAIN);

  const data = await fetchJsonWithFallback([url]);
  const root = data?.indvdLandPrices ?? data?.response ?? data ?? {};
  const resultCode = root?.resultCode;
  const resultMsg = root?.resultMsg;

  if (resultCode && resultCode !== "OK") {
    throw new Error(`VWorld 개별공시지가 오류 (${resultCode}): ${resultMsg || "알 수 없는 오류"}`);
  }

  const rows =
    root?.field ??
    root?.item ??
    root?.items?.item ??
    Object.values(root).find(Array.isArray) ??
    [];
  const list = Array.isArray(rows) ? rows : [rows];
  return list.find(Boolean) || null;
}

function parseCoordinate(value) {
  const numeric = Number(String(value ?? "").trim());
  return Number.isFinite(numeric) ? numeric : null;
}

function extractWgs84Point(selected) {
  const x = parseCoordinate(selected?.entX);
  const y = parseCoordinate(selected?.entY);
  if (x === null || y === null) return null;

  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    return { lon: x, lat: y };
  }

  if (Math.abs(y) <= 180 && Math.abs(x) <= 90) {
    return { lon: y, lat: x };
  }

  return null;
}

async function fetchVworldZoning({ selected }) {
  if (!VWORLD_API_KEY) return "";

  const point = extractWgs84Point(selected);
  if (!point) return "";

  const delta = 0.0005;
  const bbox = [
    point.lat - delta,
    point.lon - delta,
    point.lat + delta,
    point.lon + delta,
    "EPSG:4326",
  ].join(",");

  const url = new URL(VWORLD_TRIT_PLAN_WFS_URL);
  url.searchParams.set("typename", VWORLD_TRIT_PLAN_TYPENAMES.join(","));
  url.searchParams.set("bbox", bbox);
  url.searchParams.set("maxFeatures", "50");
  url.searchParams.set("resultType", "results");
  url.searchParams.set("srsName", "EPSG:4326");
  url.searchParams.set("output", "application/json");
  url.searchParams.set("key", VWORLD_API_KEY);
  url.searchParams.set("domain", VWORLD_DOMAIN);

  const data = await fetchJsonWithFallback([url]);
  const features = data?.features ?? data?.response?.features ?? [];
  if (!Array.isArray(features) || !features.length) return "";

  const names = [
    ...new Set(
      features
        .map((feature) => feature?.properties?.spfc_dstrc_code_nm)
        .filter(Boolean),
    ),
  ];

  return names.join(", ");
}

async function fetchBuildingExposPubuseAreaInfo({
  sigunguCd,
  bjdongCd,
  platGbCd,
  bun,
  ji,
}) {
  const url = new URL(`${BUILDING_HUB_BASE_URL}/getBrExposPubuseAreaInfo`);
  url.searchParams.set("serviceKey", DATA_GO_KR_API_KEY);
  url.searchParams.set("sigunguCd", sigunguCd);
  url.searchParams.set("bjdongCd", bjdongCd);
  url.searchParams.set("platGbCd", platGbCd);
  url.searchParams.set("bun", bun);
  url.searchParams.set("ji", ji);
  url.searchParams.set("_type", "json");
  url.searchParams.set("numOfRows", "200");
  url.searchParams.set("pageNo", "1");

  const data = await fetchJsonWithFallback([url]);
  const items = data?.response?.body?.items?.item ?? [];
  return Array.isArray(items) ? items : [items];
}

function pickBestBuildingItem(items, selected) {
  if (!items.length) return null;

  const byName = items.find((item) => {
    const buildingName = `${item?.bldNm ?? ""}`.trim();
    return buildingName && selected.bdNm && buildingName.includes(selected.bdNm);
  });
  if (byName) return byName;

  return items[0];
}

function formatNumberLike(value) {
  if (value === null || value === undefined || value === "") return "";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return numeric.toLocaleString("ko-KR");
}

function parseNumeric(value) {
  const numeric = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function matchExposureRowScore(row, selected) {
  let score = 0;
  const buildingWing = row?.dongNm || row?.dongNmNm || "";
  const unitNumber = row?.hoNm || row?.hoNmNm || "";
  const floorName = row?.floorNm || row?.floorNo || "";

  if (selected?.bdNm && buildingWing && selected.bdNm.includes(buildingWing)) {
    score += 5;
  }
  if (selected?.fetchLabel && unitNumber && selected.fetchLabel.includes(unitNumber)) {
    score += 4;
  }
  if (selected?.fetchLabel && floorName && selected.fetchLabel.includes(String(floorName))) {
    score += 1;
  }

  return score;
}

function summarizeExposureRows(rows, selected) {
  if (!rows.length) {
    return {
      exclusiveArea: "",
      supplyArea: "",
      landShareArea: "",
      buildingWing: selected?.bdNm || "",
      unitNumber: "",
      floor: "",
    };
  }

  const scopedRows = [...rows].sort(
    (a, b) => matchExposureRowScore(b, selected) - matchExposureRowScore(a, selected),
  );

  const topScore = matchExposureRowScore(scopedRows[0], selected);
  const candidateRows =
    topScore > 0
      ? scopedRows.filter((row) => matchExposureRowScore(row, selected) === topScore)
      : scopedRows;

  let exclusiveArea = 0;
  let commonArea = 0;
  let landShareArea = 0;

  for (const row of candidateRows) {
    const area = parseNumeric(row?.area);
    const exposPubuseName = `${row?.exposPubuseGbCdNm ?? ""}`.trim();
    const mainPurposeName = `${row?.mainPurpsCdNm ?? ""}`.trim();
    const etcPurpose = `${row?.etcPurps ?? ""}`.trim();
    const joinedPurpose = `${mainPurposeName} ${etcPurpose}`;

    if (joinedPurpose.includes("대지권")) {
      landShareArea += area;
      continue;
    }

    if (exposPubuseName.includes("전유")) {
      exclusiveArea += area;
      continue;
    }

    if (exposPubuseName.includes("공용")) {
      commonArea += area;
    }
  }

  const representative = candidateRows[0] || {};

  return {
    exclusiveArea: exclusiveArea ? String(exclusiveArea) : "",
    supplyArea: exclusiveArea || commonArea ? String(exclusiveArea + commonArea) : "",
    landShareArea: landShareArea ? String(landShareArea) : "",
    buildingWing: representative?.dongNm || selected?.bdNm || "",
    unitNumber: representative?.hoNm || "",
    floor: representative?.floorNm || representative?.floorNo || "",
  };
}

function mapBuildingItemToBasicInfo({
  selected,
  legalDong,
  buildingItem,
  exposureSummary,
  vworldLandPrice,
  zoning,
  pnu,
  propertyType,
}) {
  const totalFloors = buildingItem?.grndFlrCnt || "";
  const builtYear = (buildingItem?.useAprDay || "").slice(0, 4);

  return {
    address:
      normalizeAddressName(selected?.jibunAddr || selected?.roadAddr || "") || "",
    parcel: selected?.jibunAddr?.split(" ").at(-1) || "",
    buildingName: buildingItem?.bldNm || selected?.bdNm || selected?.fetchLabel || "",
    exclusiveArea: exposureSummary?.exclusiveArea || "",
    supplyArea: exposureSummary?.supplyArea || buildingItem?.totArea || "",
    landShareArea: exposureSummary?.landShareArea || buildingItem?.platArea || "",
    buildingWing: exposureSummary?.buildingWing || selected?.bdNm || "",
    unitNumber: exposureSummary?.unitNumber || "",
    floor: exposureSummary?.floor || "",
    totalFloors,
    builtYear,
    usage: buildingItem?.mainPurpsCdNm || "",
    zoning: zoning || "",
    officialYear: vworldLandPrice?.stdrYear || "",
    landPrice: vworldLandPrice?.pblntfPclnd || "",
    purpose: propertyType === "상가" ? "매매 참고" : "",
    type: propertyType || "",
    fetchLabel: selected?.fetchLabel || "",
    rawMeta: {
      legalDongName: legalDong?.locatadd_nm || "",
      regionCode: legalDong?.region_cd || "",
      pnu,
      roadAddr: selected?.roadAddr || "",
      jibunAddr: selected?.jibunAddr || "",
      platArea: formatNumberLike(buildingItem?.platArea),
      totalArea: formatNumberLike(buildingItem?.totArea),
    },
  };
}

async function resolveCandidates(query, propertyType) {
  if (!JUSO_API_KEY) {
    return getMockBundle(propertyType).items;
  }

  const jusoCandidates = await fetchJusoCandidates(query);
  if (!jusoCandidates.length) {
    return [];
  }

  return jusoCandidates.map((candidate) => ({
    ...candidate,
    fetchLabel: candidate.fetchLabel,
  }));
}

async function resolveBasicInfo(query, propertyType, candidateIndex) {
  if (!JUSO_API_KEY || !DATA_GO_KR_API_KEY) {
    const bundle = getMockBundle(propertyType);
    const item = bundle.items[candidateIndex] ?? bundle.items[0];
    return { item, note: bundle.note, source: "mock" };
  }

  const candidates = await fetchJusoCandidates(query);
  const selected = candidates[candidateIndex] ?? candidates[0];

  if (!selected) {
    throw new Error("선택 가능한 대상물이 없습니다.");
  }

  const addressName = normalizeAddressName(selected.jibunAddr || selected.roadAddr || query);
  const legalDongRows = await fetchLegalDongCode(addressName);
  const legalDong = pickBestLegalDong(legalDongRows, addressName);

  if (!legalDong?.region_cd) {
    throw new Error("법정동코드를 찾지 못했습니다.");
  }

  const { platGbCd, bun, ji } = parseJibunAddress(selected.jibunAddr || "");
  const regionCode = String(legalDong.region_cd);
  const sigunguCd = regionCode.slice(0, 5);
  const bjdongCd = regionCode.slice(5, 10);
  const pnu = buildPnu(regionCode, platGbCd, bun, ji);
  const buildingItems = await fetchBuildingTitleInfo({
    sigunguCd,
    bjdongCd,
    platGbCd,
    bun,
    ji,
  });
  const exposPubuseAreaItems = await fetchBuildingExposPubuseAreaInfo({
    sigunguCd,
    bjdongCd,
    platGbCd,
    bun,
    ji,
  });
  const buildingItem = pickBestBuildingItem(buildingItems, selected);
  const exposureSummary = summarizeExposureRows(exposPubuseAreaItems, selected);
  let vworldLandPrice = null;
  let zoning = "";

  if (VWORLD_API_KEY) {
    try {
      vworldLandPrice = await fetchVworldIndividualLandPrice({ pnu });
    } catch (error) {
      console.error("[resolveBasicInfo] VWorld land price lookup failed:", error);
    }

    try {
      zoning = await fetchVworldZoning({ selected });
    } catch (error) {
      console.error("[resolveBasicInfo] VWorld zoning lookup failed:", error);
    }
  }

  if (!buildingItem) {
    return {
      item: {
        address: selected.jibunAddr || selected.roadAddr || "",
        parcel: selected.jibunAddr?.split(" ").at(-1) || "",
        buildingName: selected.bdNm || selected.fetchLabel || "",
        exclusiveArea: "",
        supplyArea: "",
        landShareArea: "",
        buildingWing: selected.bdNm || "",
        unitNumber: "",
        floor: "",
        totalFloors: "",
        builtYear: "",
        usage: "",
        zoning,
        officialYear: vworldLandPrice?.stdrYear || "",
        landPrice: vworldLandPrice?.pblntfPclnd || "",
        purpose: "",
        type: propertyType,
        fetchLabel: selected.fetchLabel,
      },
      note:
        "주소 후보는 찾았지만 건축물대장 표제부 데이터가 없어 일부 항목만 채웠습니다.",
      source: "partial",
    };
  }

  return {
    item: mapBuildingItemToBasicInfo({
      selected,
      legalDong,
      buildingItem,
      exposureSummary,
      vworldLandPrice,
      zoning,
      pnu,
      propertyType,
    }),
    note:
      VWORLD_API_KEY
        ? "주소검색, 법정동코드, 건축물대장 표제부/전유공용면적과 VWorld 용도지역·개별공시지가까지 실제 조회했습니다."
        : "주소검색, 법정동코드, 건축물대장 표제부/전유공용면적까지 실제 조회했습니다. 용도지역과 개별공시지가는 VWorld API 키를 추가하면 함께 조회할 수 있습니다.",
    source: "backend",
  };
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        mode: JUSO_API_KEY && DATA_GO_KR_API_KEY ? "backend" : "mock",
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/basic-info/candidates") {
      const body = await readJsonBody(req);
      const items = await resolveCandidates(body.query || "", body.propertyType || "");
      sendJson(res, 200, { items });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/basic-info/fetch") {
      const body = await readJsonBody(req);
      const result = await resolveBasicInfo(
        body.query || "",
        body.propertyType || "",
        Number(body.candidateIndex || 0),
      );
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    console.error("[server] request failed:", req.method, url.pathname, error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Basic info backend listening on http://localhost:${PORT}`);
});
