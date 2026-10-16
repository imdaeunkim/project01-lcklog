// 챔피언 목록(src/data/champions.ts)을 만드는 스크립트
// 실행: npm run gen:champions
//
// - 이름(한국어), 이미지: Riot Data Dragon 최신 버전
// - 포지션: Meraki Analytics (커뮤니티 데이터. 롤 클라이언트 분류와 다를 수 있음)
// - 틀린 포지션은 scripts/champion-position-overrides.json 에 적으면 마지막에 덮어쓴다
//   예: { "Azir": ["MID"] }  (키는 Data Dragon id)
import { readFile, writeFile } from 'node:fs/promises';

const OVERRIDES_PATH = new URL('./champion-position-overrides.json', import.meta.url);
const OUTPUT_PATH = new URL('../src/data/champions.ts', import.meta.url);

// Meraki 포지션 이름 → 앱에서 쓰는 포지션 이름
const POSITION_MAP = {
  TOP: 'TOP',
  JUNGLE: 'JUNGLE',
  MIDDLE: 'MID',
  BOTTOM: 'ADC',
  SUPPORT: 'SUPPORT',
};
const VALID_POSITIONS = Object.values(POSITION_MAP);

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} 요청 실패: ${res.status}`);
  return res.json();
}

const [version] = await fetchJson('https://ddragon.leagueoflegends.com/api/versions.json');
const ddragon = await fetchJson(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion.json`);
const meraki = await fetchJson('https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json');
const overrides = JSON.parse(await readFile(OVERRIDES_PATH, 'utf8'));

// 영문 id는 출처마다 다를 수 있어서(예: Wukong / MonkeyKing) 챔피언 고유 번호로 맞춘다
const merakiByNumber = new Map(Object.values(meraki).map((c) => [String(c.id), c]));

const missing = [];
const champions = Object.values(ddragon.data).map((c) => {
  const merakiChamp = merakiByNumber.get(c.key);
  let positions = (merakiChamp?.positions ?? []).map((p) => POSITION_MAP[p]).filter(Boolean);

  if (overrides[c.id]) {
    positions = overrides[c.id];
  }
  if (positions.length === 0) missing.push(`${c.id}(${c.name})`);

  return {
    id: c.id,
    name: c.name,
    imageUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`,
    positions,
  };
});

// overrides 파일의 오타 확인
for (const [id, positions] of Object.entries(overrides)) {
  if (!ddragon.data[id]) console.warn(`[경고] overrides에 없는 챔피언 id: ${id}`);
  const invalid = positions.filter((p) => !VALID_POSITIONS.includes(p));
  if (invalid.length) console.warn(`[경고] ${id}의 잘못된 포지션: ${invalid.join(', ')}`);
}

champions.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

const toLine = (c, indent) =>
  `${indent}{ id: ${JSON.stringify(c.id)}, name: ${JSON.stringify(c.name)}, imageUrl: ${JSON.stringify(c.imageUrl)} },`;

// 포지션별 묶음. 여러 포지션을 가는 챔피언은 각 묶음에 중복으로 들어간다
const POSITION_LABELS = { TOP: '탑', JUNGLE: '정글', MID: '미드', ADC: '원딜', SUPPORT: '서폿' };
const groups = VALID_POSITIONS.map((pos) => {
  const list = champions.filter((c) => c.positions.includes(pos));
  return `  // ${POSITION_LABELS[pos]} (${pos}) ${list.length}명
  ${pos}: [
${list.map((c) => toLine(c, '    ')).join('\n')}
  ],`;
});

const output = `// 이 파일은 scripts/generate-champions.mjs 가 자동으로 만든다. 직접 고치지 말 것.
// 포지션 수정은 scripts/champion-position-overrides.json 에 적고 \`npm run gen:champions\`를 다시 실행한다.
// Data Dragon 버전: ${version}

export type ChampionPosition = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";

export interface Champion {
  id: string;
  name: string;
  imageUrl: string;
}

// 포지션별 챔피언. 여러 포지션을 가는 챔피언은 각 포지션에 중복으로 들어 있다
export const CHAMPIONS_BY_POSITION: Record<ChampionPosition, Champion[]> = {
${groups.join('\n\n')}
};

// 전체 챔피언 (중복 없음, 가나다순). 포지션 정보가 없는 챔피언도 여기에는 들어 있다
export const CHAMPIONS_LIST: Champion[] = [
${champions.map((c) => toLine(c, '  ')).join('\n')}
];
`;

await writeFile(OUTPUT_PATH, output);

console.log(`Data Dragon ${version}, 챔피언 ${champions.length}명 → src/data/champions.ts`);
console.log(`overrides 적용: ${Object.keys(overrides).length}명`);
if (missing.length) {
  console.warn(`[경고] 포지션이 없는 챔피언 ${missing.length}명: ${missing.join(', ')}`);
}
