export type Locale = 'vi' | 'en' | 'es' | 'ja';

export const LOCALES: readonly Locale[] = ['vi', 'en', 'es', 'ja'] as const;

export const LOCALE_META: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  es: 'Español',
  ja: '日本語',
};

export type DeathCause = 'invisible' | 'rugpull' | 'scam' | 'hollow' | 'fud' | 'pit' | 'gas';

export interface Translations {
  brandSubtitle: string;
  pinApp: string;
  pinned: string;
  webPreviewBanner: string;
  langLabel: string;
  footer: string;

  modeCampaign: string;
  modeDaily: string;
  levelNames: [string, string, string];
  levelLockedHint: string;
  dailyResetIn: (hm: string) => string;
  dailySameMap: string;
  dailyYourBest: (pts: number) => string;

  score: string;
  best: string;
  deaths: string;
  lives: string;
  guideBtn: string;
  restartBtn: string;
  muteBtn: string;
  unmuteBtn: string;
  ctrlLeft: string;
  ctrlRight: string;
  ctrlJump: string;
  ctrlHintDesktop: string;

  idleTag: string;
  idleDesc: string;
  startStage: (n: number) => string;
  startDaily: (day: number) => string;

  gameOverTitle: string;
  tryAgain: string;
  shareFail: string;

  victoryDailyTitle: (day: number) => string;
  victoryStageTitle: (n: number) => string;
  victoryAllTitle: string;
  victorySub: (pts: number) => string;
  nextStage: (name: string) => string;
  playAgain: string;
  shareWin: string;

  tagSafe: string;
  tagRun: string;
  tagRug: string;
  floatTrap: string;
  floatHollow: string;
  floatRug: string;
  floatScam: (pen: number) => string;
  floatStomp: (pts: number) => string;
  floatFakeFlag: string;
  floatGoal: (pts: number) => string;

  deathReasons: Record<DeathCause, string>;

  guideTitle: string;
  guideControlsTitle: string;
  guideControlsBody: string;
  guideScoreTitle: string;
  guideScoreBase: (pts: number) => string;
  guideScoreFc: (pts: number) => string;
  guideScoreMystery: (pts: number) => string;
  guideScoreStomp: (pts: number) => string;
  guideScoreFlag: (pts: number) => string;
  guideTrapTitle: string;
  guideTraps: [string, string, string, string];
  guideClose: string;

  boardTitle: (day: number) => string;
  boardSubtitle: string;
  boardYou: (rank: number, pts: number) => string;
  boardEmpty: string;
  boardLoadErr: string;
  boardOpenWarpcast: string;
  boardPosting: string;
  boardPostErr: string;
  boardRefresh: string;

  shareTitle: string;
  shareDesc: string;
  shareBtn: string;
  copyBtn: string;
  copiedBtn: string;

  castInvite: (best: number, day: number) => string;
  castDaily: (day: number, pts: number, deaths: number, won: boolean) => string;
  castStage: (stage: string, pts: number, deaths: number, won: boolean) => string;
}

export const I18N: Record<Locale, Translations> = {
  vi: {
    brandSubtitle: 'Arcade Mini App • Base',
    pinApp: 'Ghim App',
    pinned: 'Đã ghim',
    webPreviewBanner: 'Đang xem trên trình duyệt — mở trong Warpcast để tự động gắn FID và ghi điểm lên bảng xếp hạng.',
    langLabel: 'Ngôn ngữ',
    footer: 'FarBase Rush • Arcade trên Farcaster & Base',

    modeCampaign: 'Màn chơi',
    modeDaily: 'Thử thách ngày',
    levelNames: ['Khối Khởi Nguyên', 'Đại Chiến Gas', 'Thị Trường Gấu'],
    levelLockedHint: 'Vượt màn trước để mở khóa',
    dailyResetIn: (hm) => `Đổi map sau ${hm}`,
    dailySameMap: '1 bản đồ chung toàn cầu mỗi ngày (UTC)',
    dailyYourBest: (pts) => `Kỷ lục hôm nay: ${pts} đ`,

    score: 'Điểm',
    best: 'Kỷ lục',
    deaths: 'Tử trận',
    lives: 'Mạng',
    guideBtn: 'Luật chơi',
    restartBtn: 'Chơi lại',
    muteBtn: 'Tắt tiếng',
    unmuteBtn: 'Bật tiếng',
    ctrlLeft: 'Sang trái',
    ctrlRight: 'Sang phải',
    ctrlJump: 'NHẢY',
    ctrlHintDesktop: 'A/D hoặc ◀/▶ di chuyển • Space/W/▲ nhảy • R chơi lại',

    idleTag: 'TRAP ARCADE',
    idleDesc: 'Vượt gạch tàng hình, cầu sập rug-pull, xu lừa đảo và quái FUD để chạm cột cờ thật.',
    startStage: (n) => `VÀO MÀN ${n}`,
    startDaily: (day) => `CHƠI DAILY #${day}`,

    gameOverTitle: 'SẬP BẪY RỒI!',
    tryAgain: 'Thử lại',
    shareFail: 'Khoe pha ngã',

    victoryDailyTitle: (day) => `PHÁ ĐẢO DAILY #${day}!`,
    victoryStageTitle: (n) => `QUA MÀN ${n}!`,
    victoryAllTitle: 'PHÁ ĐẢO TOÀN BỘ MÀN CHƠI!',
    victorySub: (pts) => `Sống sót qua mọi cạm bẫy • Tổng điểm: ${pts}`,
    nextStage: (name) => `Màn kế: ${name}`,
    playAgain: 'Chơi lại',
    shareWin: 'Chia sẻ điểm',

    tagSafe: 'ÊM',
    tagRun: 'CHẠY!',
    tagRug: 'SẬP!',
    floatTrap: 'GẠCH ẨN!',
    floatHollow: 'CỘT RỖNG!',
    floatRug: 'CẦU SẬP!',
    floatScam: (pen) => `XU SCAM -${pen}`,
    floatStomp: (pts) => `+${pts} HẠ QUÁI`,
    floatFakeFlag: 'CỜ GIẢ! ĐUỔI THEO!',
    floatGoal: (pts) => `+${pts} ĐÍCH THẬT!`,

    deathReasons: {
      invisible: 'Đội đầu trúng gạch tàng hình rồi rơi thẳng xuống vực!',
      rugpull: 'Cầu "ÊM" sập ngay dưới chân — đúng chuẩn rug-pull!',
      scam: 'Tham ăn đồng xu 10K$ lừa đảo bị hất văng khỏi đường đua!',
      hollow: 'Đặt chân lên cột ống rỗng ruột rồi tụt thẳng xuống hố!',
      fud: 'Bị quái vật FUD húc bay màu tài khoản!',
      pit: 'Nhảy hụt nhịp, rơi tự do xuống vực sâu!',
      gas: 'Phí gas tăng đột biến chặn đứng cú nhảy giữa không trung!',
    },

    guideTitle: 'Hướng dẫn chơi FarBase Rush',
    guideControlsTitle: 'Điều khiển',
    guideControlsBody: 'Máy tính: A/D hoặc ◀/▶ để chạy, Space/W/▲ để nhảy, R chơi lại nhanh. Điện thoại: chạm giữ phím Trái, Phải và Nhảy bên dưới màn hình.',
    guideScoreTitle: 'Cách tính điểm',
    guideScoreBase: (pts) => `Xu Base xanh: +${pts} điểm`,
    guideScoreFc: (pts) => `Ngọc Signal cam: +${pts} điểm`,
    guideScoreMystery: (pts) => `Khối bí ẩn [?]: +${pts} điểm (húc từ dưới hoặc giẫm lên)`,
    guideScoreStomp: (pts) => `Đạp đầu quái FUD: +${pts} điểm & nảy cao`,
    guideScoreFlag: (pts) => `Chạm cột cờ thật cuối màn: +${pts} điểm`,
    guideTrapTitle: 'Cảnh báo cạm bẫy',
    guideTraps: [
      'Gạch tàng hình lơ lửng ngay trên miệng vực chặn cú nhảy.',
      'Cầu tím ghi "ÊM" sẽ rung và sập chỉ sau tích tắc.',
      'Xu vàng 10K$ nhấp nháy đỏ là bẫy trừ điểm & hất lùi.',
      'Cột cờ đích biết bỏ chạy ở lần tiếp cận đầu tiên!',
    ],
    guideClose: 'Đã hiểu, vào chơi!',

    boardTitle: (day) => `Bảng xếp hạng Daily #${day}`,
    boardSubtitle: 'Top 10 điểm cao nhất hôm nay',
    boardYou: (rank, pts) => `Hạng #${rank} · ${pts} đ`,
    boardEmpty: 'Chưa có ai ghi điểm hôm nay. Chiếm Top 1 ngay!',
    boardLoadErr: 'Không tải được bảng xếp hạng.',
    boardOpenWarpcast: 'Mở trong Warpcast để gửi điểm lên bảng xếp hạng.',
    boardPosting: 'Đang đồng bộ điểm lên server…',
    boardPostErr: 'Không gửi được điểm.',
    boardRefresh: 'Làm mới',

    shareTitle: 'Thách đấu kênh Farcaster',
    shareDesc: 'Đăng kết quả lên Warpcast và rủ bạn bè vượt kỷ lục bản đồ hôm nay.',
    shareBtn: 'Đăng Cast lên Warpcast',
    copyBtn: 'Chép link',
    copiedBtn: 'Đã chép',

    castInvite: (best, day) =>
      best > 0
        ? `Kỷ lục FarBase Rush của mình: ${best} điểm! Đố anh em phá được map Daily #${day} hôm nay mà không quạo:`
        : `Thử thách vượt cạm bẫy FarBase Rush Daily #${day} trên Farcaster! Ai qua được màn này ít chết nhất?`,
    castDaily: (day, pts, deaths, won) =>
      won
        ? `Phá đảo FarBase Rush Daily #${day} với ${pts} điểm (ngã ${deaths} lần)! Cùng 1 bản đồ hôm nay, đố bạn vượt điểm mình:`
        : `Ngã ${deaths} lần ở FarBase Rush Daily #${day} (${pts} điểm)! Bản đồ hôm nay căng thật sự, thử sức ngay:`,
    castStage: (stage, pts, deaths, won) =>
      won
        ? `Vượt qua màn "${stage}" trong FarBase Rush với ${pts} điểm (${deaths} lần sập bẫy)! Thử xem bạn mất mấy mạng:`
        : `Sập bẫy ${deaths} lần ở màn "${stage}" trong FarBase Rush (${pts} điểm)! Ai qua nổi màn này không:`,
  },

  en: {
    brandSubtitle: 'Arcade Mini App • Base',
    pinApp: 'Pin App',
    pinned: 'Pinned',
    webPreviewBanner: 'Browser preview — open inside Warpcast to link your FID and post scores to the leaderboard.',
    langLabel: 'Language',
    footer: 'FarBase Rush • Arcade on Farcaster & Base',

    modeCampaign: 'Stages',
    modeDaily: 'Daily Run',
    levelNames: ['Genesis Block', 'Gas Wars', 'Bear Market'],
    levelLockedHint: 'Clear the previous stage to unlock',
    dailyResetIn: (hm) => `New map in ${hm}`,
    dailySameMap: 'Identical seeded map for everyone today (UTC)',
    dailyYourBest: (pts) => `Today's best: ${pts} pts`,

    score: 'Score',
    best: 'Best',
    deaths: 'Deaths',
    lives: 'Lives',
    guideBtn: 'Guide',
    restartBtn: 'Restart',
    muteBtn: 'Mute',
    unmuteBtn: 'Unmute',
    ctrlLeft: 'Move left',
    ctrlRight: 'Move right',
    ctrlJump: 'JUMP',
    ctrlHintDesktop: 'A/D or ◀/▶ move • Space/W/▲ jump • R quick restart',

    idleTag: 'TRAP ARCADE',
    idleDesc: 'Dodge invisible blocks, collapsing rug-pull bridges, bait coins, and FUD monsters to capture the real flag.',
    startStage: (n) => `PLAY STAGE ${n}`,
    startDaily: (day) => `PLAY DAILY #${day}`,

    gameOverTitle: 'WRECKED BY TRAPS!',
    tryAgain: 'Try Again',
    shareFail: 'Share Fail',

    victoryDailyTitle: (day) => `DAILY #${day} CLEARED!`,
    victoryStageTitle: (n) => `STAGE ${n} CLEARED!`,
    victoryAllTitle: 'ALL STAGES CONQUERED!',
    victorySub: (pts) => `All traps survived • Final score: ${pts}`,
    nextStage: (name) => `Next: ${name}`,
    playAgain: 'Play Again',
    shareWin: 'Share Score',

    tagSafe: 'SAFE',
    tagRun: 'RUN!',
    tagRug: 'RUG!',
    floatTrap: 'TRAP!',
    floatHollow: 'HOLLOW!',
    floatRug: 'RUG PULL!',
    floatScam: (pen) => `SCAM -${pen}`,
    floatStomp: (pts) => `+${pts} STOMP`,
    floatFakeFlag: 'FAKE FLAG! CHASE IT!',
    floatGoal: (pts) => `+${pts} REAL GOAL!`,

    deathReasons: {
      invisible: 'Bonked an invisible block mid-jump and plunged into the void!',
      rugpull: 'The "SAFE" platform rug-pulled right beneath your boots!',
      scam: 'Grabbed a bait $10K scam coin and got blasted off course!',
      hollow: 'Stepped onto a hollow decoy pillar and dropped straight through!',
      fud: 'Liquidated on contact by a patrolling FUD monster!',
      pit: 'Missed your footing and tumbled into the abyss!',
      gas: 'Sudden gas spike froze your leap right above the pit!',
    },

    guideTitle: 'How to Play FarBase Rush',
    guideControlsTitle: 'Controls',
    guideControlsBody: 'Desktop: A/D or ◀/▶ to run, Space/W/▲ to jump, R to quick-restart. Mobile: hold Left, Right, and tap Jump on the arcade pad.',
    guideScoreTitle: 'Scoring',
    guideScoreBase: (pts) => `Base Orb (blue): +${pts} pts`,
    guideScoreFc: (pts) => `Signal Gem (orange): +${pts} pts`,
    guideScoreMystery: (pts) => `Mystery Cube [?]: +${pts} pts (bump or land on top)`,
    guideScoreStomp: (pts) => `Stomp FUD Monster: +${pts} pts & high bounce`,
    guideScoreFlag: (pts) => `Capture Real Goal Beacon: +${pts} pts`,
    guideTrapTitle: 'Trap Survival Tips',
    guideTraps: [
      'Hidden blocks hover above pits ready to clip reckless jumps.',
      'Bridges labeled "SAFE" shake and collapse almost immediately.',
      'Flashing $10K coins are scam bait — they deduct points and knock you back.',
      'The goal beacon flees forward the first time you get close!',
    ],
    guideClose: 'Got It — Play!',

    boardTitle: (day) => `Daily #${day} Leaderboard`,
    boardSubtitle: 'Top 10 verified runs today',
    boardYou: (rank, pts) => `Rank #${rank} · ${pts} pts`,
    boardEmpty: 'No scores posted today yet. Claim the #1 spot!',
    boardLoadErr: 'Could not load the leaderboard.',
    boardOpenWarpcast: 'Open inside Warpcast to post your score to the leaderboard.',
    boardPosting: 'Submitting your score…',
    boardPostErr: 'Could not submit score.',
    boardRefresh: 'Refresh',

    shareTitle: 'Challenge Your Channel',
    shareDesc: 'Share your run on Warpcast and dare friends to beat today’s seeded map.',
    shareBtn: 'Share Cast on Warpcast',
    copyBtn: 'Copy Link',
    copiedBtn: 'Copied',

    castInvite: (best, day) =>
      best > 0
        ? `My FarBase Rush high score is ${best} pts! Think you can beat today's Daily #${day} trap course without rage-quitting?`
        : `Running today's FarBase Rush Daily #${day} trap course on Farcaster! Who can clear it with the fewest deaths?`,
    castDaily: (day, pts, deaths, won) =>
      won
        ? `Cleared FarBase Rush Daily #${day} with ${pts} pts (${deaths} deaths)! Same map for everyone today — beat my score:`
        : `Got wrecked ${deaths} times on FarBase Rush Daily #${day} (${pts} pts)! Today's trap layout is brutal — try your luck:`,
    castStage: (stage, pts, deaths, won) =>
      won
        ? `Conquered "${stage}" in FarBase Rush with ${pts} pts (${deaths} deaths)! Can you survive the traps?`
        : `Fell for ${deaths} traps on "${stage}" in FarBase Rush (${pts} pts)! Think you can clear it?`,
  },

  es: {
    brandSubtitle: 'Mini App Arcade • Base',
    pinApp: 'Fijar App',
    pinned: 'Fijada',
    webPreviewBanner: 'Vista previa web — abre en Warpcast para vincular tu FID y registrar tu puntaje en el ranking.',
    langLabel: 'Idioma',
    footer: 'FarBase Rush • Arcade en Farcaster y Base',

    modeCampaign: 'Niveles',
    modeDaily: 'Reto Diario',
    levelNames: ['Bloque Génesis', 'Guerra de Gas', 'Mercado Bajista'],
    levelLockedHint: 'Supera el nivel anterior para desbloquear',
    dailyResetIn: (hm) => `Nuevo mapa en ${hm}`,
    dailySameMap: 'Mismo mapa global para todos hoy (UTC)',
    dailyYourBest: (pts) => `Tu récord hoy: ${pts} pts`,

    score: 'Puntos',
    best: 'Récord',
    deaths: 'Muertes',
    lives: 'Vidas',
    guideBtn: 'Guía',
    restartBtn: 'Reiniciar',
    muteBtn: 'Silenciar',
    unmuteBtn: 'Sonido',
    ctrlLeft: 'Izquierda',
    ctrlRight: 'Derecha',
    ctrlJump: 'SALTAR',
    ctrlHintDesktop: 'A/D o ◀/▶ mover • Espacio/W/▲ saltar • R reiniciar',

    idleTag: 'ARCADE DE TRAMPAS',
    idleDesc: 'Esquiva bloques invisibles, puentes rug-pull, monedas trampa y monstruos FUD hasta alcanzar la bandera real.',
    startStage: (n) => `JUGAR NIVEL ${n}`,
    startDaily: (day) => `JUGAR RETO #${day}`,

    gameOverTitle: '¡CAÍSTE EN LA TRAMPA!',
    tryAgain: 'Reintentar',
    shareFail: 'Compartir fallo',

    victoryDailyTitle: (day) => `¡RETO DIARIO #${day} SUPERADO!`,
    victoryStageTitle: (n) => `¡NIVEL ${n} SUPERADO!`,
    victoryAllTitle: '¡TODOS LOS NIVELES COMPLETADOS!',
    victorySub: (pts) => `Sobreviviste a todas las trampas • Puntaje: ${pts}`,
    nextStage: (name) => `Siguiente: ${name}`,
    playAgain: 'Jugar otra vez',
    shareWin: 'Compartir logro',

    tagSafe: 'FIJO',
    tagRun: '¡CORRE!',
    tagRug: '¡CAE!',
    floatTrap: '¡TRAMPA!',
    floatHollow: '¡HUECO!',
    floatRug: '¡RUG PULL!',
    floatScam: (pen) => `ESTAFA -${pen}`,
    floatStomp: (pts) => `+${pts} PISOTÓN`,
    floatFakeFlag: '¡META FALSA! ¡SÍGUELA!',
    floatGoal: (pts) => `+${pts} ¡META REAL!`,

    deathReasons: {
      invisible: '¡Golpeaste un bloque invisible en pleno salto y caíste al vacío!',
      rugpull: '¡El puente "FIJO" se desplomó justo bajo tus pies!',
      scam: '¡Tocaste una moneda estafa de 10K$ y saliste volando!',
      hollow: '¡Pisaste una columna hueca falsa y caíste directo al abismo!',
      fud: '¡Un monstruo FUD liquidó tu carrera al instante!',
      pit: '¡Calculaste mal el salto y caíste al precipicio!',
      gas: '¡Un pico de gas frenó tu salto justo encima del foso!',
    },

    guideTitle: 'Cómo jugar FarBase Rush',
    guideControlsTitle: 'Controles',
    guideControlsBody: 'PC: A/D o ◀/▶ para correr, Espacio/W/▲ para saltar, R para reiniciar. Móvil: usa los botones táctiles Izquierda, Derecha y Saltar.',
    guideScoreTitle: 'Puntuación',
    guideScoreBase: (pts) => `Orbe Base (azul): +${pts} pts`,
    guideScoreFc: (pts) => `Gema Señal (naranja): +${pts} pts`,
    guideScoreMystery: (pts) => `Cubo Misterioso [?]: +${pts} pts`,
    guideScoreStomp: (pts) => `Aplastar monstruo FUD: +${pts} pts y rebote`,
    guideScoreFlag: (pts) => `Alcanzar la meta real: +${pts} pts`,
    guideTrapTitle: 'Cuidado con las trampas',
    guideTraps: [
      'Hay bloques invisibles sobre los fosos esperando bloquear tu salto.',
      'Las plataformas marcadas "FIJO" tiemblan y caen en un instante.',
      'Las monedas de 10K$ con borde rojo restan puntos y te empujan.',
      '¡La bandera de meta huye la primera vez que te acercas!',
    ],
    guideClose: '¡Entendido, a jugar!',

    boardTitle: (day) => `Ranking Diario #${day}`,
    boardSubtitle: 'Top 10 puntajes verificados hoy',
    boardYou: (rank, pts) => `Puesto #${rank} · ${pts} pts`,
    boardEmpty: 'Aún no hay puntajes hoy. ¡Conquista el #1!',
    boardLoadErr: 'No se pudo cargar el ranking.',
    boardOpenWarpcast: 'Abre la app en Warpcast para subir tu puntaje al ranking.',
    boardPosting: 'Enviando puntaje…',
    boardPostErr: 'No se pudo enviar el puntaje.',
    boardRefresh: 'Actualizar',

    shareTitle: 'Reta a tu canal',
    shareDesc: 'Publica tu partida en Warpcast y reta a tus amigos en el mapa diario.',
    shareBtn: 'Publicar Cast en Warpcast',
    copyBtn: 'Copiar enlace',
    copiedBtn: 'Copiado',

    castInvite: (best, day) =>
      best > 0
        ? `¡Mi récord en FarBase Rush es de ${best} pts! ¿Puedes superar las trampas del Reto Diario #${day} hoy?`
        : `¡Probando el Reto Diario #${day} de FarBase Rush en Farcaster! ¿Quién llega a la meta con menos muertes?`,
    castDaily: (day, pts, deaths, won) =>
      won
        ? `¡Superé el Reto Diario #${day} de FarBase Rush con ${pts} pts (${deaths} muertes)! Mismo mapa hoy, intenta superarme:`
        : `¡Caí ${deaths} veces en el Reto Diario #${day} de FarBase Rush (${pts} pts)! El mapa de hoy no perdona:`,
    castStage: (stage, pts, deaths, won) =>
      won
        ? `¡Completé "${stage}" en FarBase Rush con ${pts} pts (${deaths} muertes)! ¿Te atreves a jugarlo?`
        : `¡Caí en ${deaths} trampas jugando "${stage}" en FarBase Rush (${pts} pts)! ¿Puedes pasarlo?`,
  },

  ja: {
    brandSubtitle: 'アーケード Mini App • Base',
    pinApp: '追加',
    pinned: '追加済',
    webPreviewBanner: 'ブラウザプレビュー中 — Warpcast内で開くとFID連携とランキング登録が有効になります。',
    langLabel: '言語',
    footer: 'FarBase Rush • Farcaster & Base アーケード',

    modeCampaign: 'ステージ',
    modeDaily: 'デイリー',
    levelNames: ['ジェネシス・ブロック', 'ガス代ウォーズ', 'ベアマーケット'],
    levelLockedHint: '前のステージをクリアすると解放されます',
    dailyResetIn: (hm) => `更新まで ${hm}`,
    dailySameMap: '毎日世界共通のシードマップ (UTC)',
    dailyYourBest: (pts) => `今日のベスト: ${pts} pt`,

    score: 'スコア',
    best: 'ベスト',
    deaths: 'デス数',
    lives: 'ライフ',
    guideBtn: '遊び方',
    restartBtn: 'やり直す',
    muteBtn: '消音',
    unmuteBtn: '音量ON',
    ctrlLeft: '左へ移動',
    ctrlRight: '右へ移動',
    ctrlJump: 'ジャンプ',
    ctrlHintDesktop: 'A/D・◀/▶ 移動 • Space/W/▲ ジャンプ • R リスタート',

    idleTag: 'トラップ・アーケード',
    idleDesc: '透明ブロック、崩れる床、詐欺コイン、FUDモンスターを見切って本物のゴールフラッグを掴め！',
    startStage: (n) => `ステージ ${n} 開始`,
    startDaily: (day) => `デイリー #${day} 開始`,

    gameOverTitle: 'トラップ撃沈！',
    tryAgain: '再挑戦',
    shareFail: '失敗をシェア',

    victoryDailyTitle: (day) => `デイリー #${day} クリア！`,
    victoryStageTitle: (n) => `ステージ ${n} クリア！`,
    victoryAllTitle: '全ステージ完全制覇！',
    victorySub: (pts) => `全トラップ突破 • 最終スコア: ${pts}`,
    nextStage: (name) => `次へ: ${name}`,
    playAgain: 'もう一度遊ぶ',
    shareWin: '記録をシェア',

    tagSafe: '安全',
    tagRun: '急げ!',
    tagRug: '崩壊!',
    floatTrap: '透明罠!',
    floatHollow: '底抜け!',
    floatRug: '床崩壊!',
    floatScam: (pen) => `詐欺 -${pen}`,
    floatStomp: (pts) => `+${pts} 撃破!`,
    floatFakeFlag: '偽ゴール！追いかけろ！',
    floatGoal: (pts) => `+${pts} 真ゴール!`,

    deathReasons: {
      invisible: 'ジャンプ中に透明ブロックへ激突し、そのまま奈落へ落下！',
      rugpull: '「安全」と書かれた足場が足元からラグプル崩壊！',
      scam: '10K$の詐欺コインに釣られて吹き飛ばされた！',
      hollow: 'ハリボテの土管に乗ってそのまま穴へ真っ逆さま！',
      fud: 'FUDモンスターに接触して一瞬でロスカット！',
      pit: '踏み切りを誤って深い谷底へダイブ！',
      gas: '急激なガス代高騰で空中のジャンプが止められた！',
    },

    guideTitle: 'FarBase Rush の遊び方',
    guideControlsTitle: '操作方法',
    guideControlsBody: 'PC: A/D または ◀/▶ で移動、Space/W/▲ でジャンプ、R で即リスタート。スマホ: 画面下の左右＆ジャンプボタンをタップ。',
    guideScoreTitle: 'スコア獲得',
    guideScoreBase: (pts) => `Baseオーブ (青): +${pts} pt`,
    guideScoreFc: (pts) => `シグナルジェム (橙): +${pts} pt`,
    guideScoreMystery: (pts) => `ハテナブロック [?]: +${pts} pt`,
    guideScoreStomp: (pts) => `FUDモンスター踏みつけ: +${pts} pt & ハイジャンプ`,
    guideScoreFlag: (pts) => `本物のゴール到達: +${pts} pt`,
    guideTrapTitle: 'トラップ注意報',
    guideTraps: [
      '穴の上に隠された透明ブロックがジャンプを阻みます。',
      '「安全」と書かれた紫の床は乗るとすぐ崩れ落ちます。',
      '赤く光る10K$コインは減点＆ノックバックの罠です。',
      'ゴールフラッグは最初に近づくと前方へ逃げ出します！',
    ],
    guideClose: 'OK、ゲーム開始！',

    boardTitle: (day) => `デイリー #${day} ランキング`,
    boardSubtitle: '本日のトップ10プレイヤー',
    boardYou: (rank, pts) => `#${rank}位 · ${pts} pt`,
    boardEmpty: 'まだ本日の記録がありません。1番乗りを目指そう！',
    boardLoadErr: 'ランキングを読み込めませんでした。',
    boardOpenWarpcast: 'ランキングにスコアを送信するにはWarpcast内で開いてください。',
    boardPosting: 'スコアを送信中…',
    boardPostErr: 'スコアを送信できませんでした。',
    boardRefresh: '更新',

    shareTitle: 'チャンネルの仲間に挑戦',
    shareDesc: 'Warpcastに結果を投稿して、今日の共通マップでスコアを競おう。',
    shareBtn: 'Warpcastでシェア',
    copyBtn: 'リンクをコピー',
    copiedBtn: 'コピー済',

    castInvite: (best, day) =>
      best > 0
        ? `FarBase Rush 自己ベスト ${best} pt！今日のデイリー #${day} の罠マップ、クリアできる？`
        : `Farcasterの罠アクション FarBase Rush デイリー #${day} に挑戦中！最小デス数でクリアできるかな？`,
    castDaily: (day, pts, deaths, won) =>
      won
        ? `FarBase Rush デイリー #${day} を ${pts} pt（${deaths}デス）でクリア！今日の共通マップで勝負しよう：`
        : `FarBase Rush デイリー #${day} で ${deaths}回罠にハマった（${pts} pt）！今日のマップはかなり手強いぞ：`,
    castStage: (stage, pts, deaths, won) =>
      won
        ? `FarBase Rush「${stage}」を ${pts} pt（${deaths}デス）で突破！罠を見切れるか試してみて：`
        : `FarBase Rush「${stage}」で ${deaths}回撃沈（${pts} pt）！クリアできる猛者いる？`,
  },
};

const STORAGE_KEY = 'farbase_lang';

export function isLocale(val: string | null | undefined): val is Locale {
  return val === 'vi' || val === 'en' || val === 'es' || val === 'ja';
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'vi';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {}

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
  for (const raw of candidates) {
    const lower = raw.toLowerCase();
    if (lower.startsWith('vi')) return 'vi';
    if (lower.startsWith('es')) return 'es';
    if (lower.startsWith('ja')) return 'ja';
    if (lower.startsWith('en')) return 'en';
  }
  return 'en';
}

export function saveLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {}
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}

export function formatUtcCountdown(now = Date.now()): string {
  const nextMidnight = Math.ceil((now + 1) / 86_400_000) * 86_400_000;
  const totalMinutes = Math.max(1, Math.floor((nextMidnight - now) / 60_000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}
