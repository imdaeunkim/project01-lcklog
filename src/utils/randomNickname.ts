// 처음 로그인할 때 주는 무작위 닉네임#태그
const ADJECTIVES = ['용감한', '날쌘', '침착한', '배고픈', '졸린', '신난', '수줍은', '든든한', '빛나는', '느긋한', '재빠른', '씩씩한'];
const NOUNS = ['포로', '바위게', '칼날부리', '전령', '내셔', '용', '미니언', '와드', '포탑', '억제기', '두꺼비', '늑대'];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

// 닉네임은 형용사+명사(3~16자), 태그는 숫자 4자리
export function createRandomNickname(): { nickname: string; tag: string } {
  const nickname = pick(ADJECTIVES) + pick(NOUNS);
  const tag = String(Math.floor(1000 + Math.random() * 9000));
  return { nickname, tag };
}
