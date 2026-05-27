/** A single entry in the persistent leaderboard. */
export interface ScoreEntry {
  name: string;
  score: number;
  level: number;       // player level reached
  survived: number;    // seconds
  kills: number;
  levelName: string;   // which game level was played
  isWin: boolean;
  date: string;        // ISO date string
}

const STORAGE_KEY = 'psw_leaderboard';
const MAX_ENTRIES = 10;

export const ScoreManager = {
  save(entry: ScoreEntry): void {
    const all = this.loadAll();
    all.push(entry);
    all.sort((a, b) => b.score - a.score);
    if (all.length > MAX_ENTRIES) all.length = MAX_ENTRIES;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // localStorage unavailable (private mode, sandboxed iframe, etc.)
    }
  },

  loadAll(): ScoreEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ScoreEntry[]) : [];
    } catch {
      return [];
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  },
};

/**
 * Canonical score formula used everywhere in the game.
 *  10 pts/second survived + 5 pts/kill + 150 pts/player-level + 500 win bonus
 */
export function calcScore(
  survived: number,
  kills: number,
  level: number,
  isWin: boolean,
): number {
  return Math.floor(
    survived * 10 +
    kills    * 5  +
    (level - 1) * 150 +
    (isWin ? 500 : 0),
  );
}

/** Format seconds as "M:SS" */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
