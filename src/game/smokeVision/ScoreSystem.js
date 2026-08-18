const XP = {
  FIND_SAFE_EXIT: 100,
  CRAWL_THROUGH_SMOKE: 30,
  CHECK_HOT_DOOR: 40,
  CHECK_DOOR: 10,
  FOLLOW_EMERGENCY_SIGN: 20,
  AVOID_BLOCKED_EXIT: 40,
  HELP_NPC: 50,
  EXTINGUISHER_CORRECT: 30,
  OPEN_DANGEROUS_DOOR: -40,
  ENTER_HEAVY_SMOKE_UNNECESSARY: -30,
  WASTE_FLASHLIGHT: -10
};

export class ScoreSystem {
  constructor() {
    this.xp = 0;
    this.log = [];
    this.stats = {
      doorsChecked: 0,
      dangerousDoorsOpened: 0,
      crawlEvents: 0,
      exitFound: false,
      npcRescued: 0,
      timeCrawling: 0,
      timeInHeavySmoke: 0
    };
  }

  award(key, note) {
    const delta = XP[key] || 0;
    this.xp = Math.max(0, this.xp + delta);
    this.log.push({ key, delta, note, t: performance.now() });
    return delta;
  }

  finalize() {
    const xp = this.xp;
    let level = 'BEGINNER';
    let color = '🟡';
    if (xp >= 700) { level = 'EXPERT'; color = '🟢'; }
    else if (xp >= 400) { level = 'SAFE ESCAPER'; color = '🟢'; }
    else if (xp >= 200) { level = 'CAUTIOUS'; color = '🟡'; }
    else { level = 'NEEDS PRACTICE'; color = '🔴'; }

    const stars = Math.max(1, Math.min(5, Math.round(xp / 180)));

    const lessons = [];
    lessons.push('🔥 Never open a door that feels very hot — fire may be on the other side.');
    lessons.push('🚪 Always check a door before opening it during a fire.');
    if (this.stats.crawlEvents > 0) {
      lessons.push('🧎 Staying low in smoke reduces how much toxic smoke you breathe in.');
    } else {
      lessons.push('🧎 Crawling under smoke keeps you in cleaner air — try it next time.');
    }
    lessons.push('🚨 Follow illuminated exit signs, but verify the route is actually clear.');
    lessons.push('🏃 Never go back for belongings during an emergency evacuation.');

    return { xp, level, color, stars, lessons };
  }
}

export { XP };
