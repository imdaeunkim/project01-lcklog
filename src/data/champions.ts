export interface Champion {
  id: string;
  name: string;
  imageUrl: string;
  positions: ("TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT")[];
}

export const CHAMPIONS_LIST: Champion[] = [
  // 탑 (TOP)
  { id: "Aatrox", name: "아트록스", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Aatrox.png", positions: ["TOP"] },
  { id: "Garen", name: "가렌", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Garen.png", positions: ["TOP"] },
  { id: "Darius", name: "다리우스", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Darius.png", positions: ["TOP"] },
  { id: "Teemo", name: "티모", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Teemo.png", positions: ["TOP", "SUPPORT"] },
  
  // 정글 (JUNGLE)
  { id: "LeeSin", name: "리 신", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/LeeSin.png", positions: ["JUNGLE"] },
  { id: "Graves", name: "그레이브즈", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Graves.png", positions: ["JUNGLE"] },
  { id: "Nidalee", name: "니달리", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Nidalee.png", positions: ["JUNGLE"] },
  { id: "Nocturne", name: "녹턴", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Nocturne.png", positions: ["JUNGLE"] },

  // 미드 (MID)
  { id: "Ahri", name: "아리", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Ahri.png", positions: ["MID"] },
  { id: "Yasuo", name: "야스오", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Yasuo.png", positions: ["MID", "TOP"] },
  { id: "Yone", name: "요네", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Yone.png", positions: ["MID", "TOP"] },
  { id: "Zed", name: "제드", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Zed.png", positions: ["MID"] },

  // 원딜 (ADC)
  { id: "Ezreal", name: "이즈리얼", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Ezreal.png", positions: ["ADC"] },
  { id: "Jinx", name: "징크스", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Jinx.png", positions: ["ADC"] },
  { id: "KaiSa", name: "카이사", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/KaiSa.png", positions: ["ADC"] },
  { id: "Vayne", name: "베인", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Vayne.png", positions: ["ADC", "TOP"] },

  // 서폿 (SUPPORT)
  { id: "Thresh", name: "쓰레쉬", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Thresh.png", positions: ["SUPPORT"] },
  { id: "Lux", name: "럭스", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Lux.png", positions: ["SUPPORT", "MID"] },
  { id: "Lulu", name: "룰루", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Lulu.png", positions: ["SUPPORT"] },
  { id: "Yuumi", name: "유미", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/Yuumi.png", positions: ["SUPPORT"] }
];