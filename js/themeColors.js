// ---- SEZNAM TVÝCH BAREVNÝCH TÉMAT ----
const themes = [
    'default',
    'cyberWeed',
    'cyberPink',
    'cyberBlue',
    'cyberOrange',
    'cyberPurple',
    'neonGrave',
    'bloodRust',
    'toxicSlime',
    'midnightOil',
    'glitchRed',
    'voidPurple',
    'acidLemon',
    'burntChrome',
    'frostByte',
    'plasmaPulse',
    'shadowLime',
    'crimsonGlitch',
    'electricAbyss',
    'venomGreen',
    'obsidianGlow',
    'hellfireOrange',
    'neonViper',
    'darkSakura',
    'ghostCircuit',
    'moltenCore',
    'cyberAsh',
    'toxicFuchsia',
    'steelFrost',
    'neonBlood',
    'voidCyan',
    'radioactiveMint',
    'duskEmber',
    'cyberCrimson',
    'phantomGreen',
    'twilightNeon'
];




// ---- HLAVNÍ APP ----
function App() {

    try {
        // Ukázkový déšť
        setTimeout(() => {
            console.log('🌧️ Spouštím ukázkový déšť...');
            triggerRainEffect();
        }, 2000);
        
        console.log('🚀 Aplikace inicializována! Zadej "help" pro příkazy.');
    } catch (error) {
        console.error('💥 Chyba při inicializaci:', error);
        showNotification('Chyba', `Inicializace selhala: ${error.message}`, 'error');
     }
    const [screen, setScreen] = React.useState('logo');
    const [consoleOpen, setConsoleOpen] = React.useState(false);
    const [theme, setTheme] = React.useState('default');

    // Theme switch
    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    function switchTheme() {
        setTheme(prev => {
            const idx = themes.indexOf(prev);
            return themes[(idx + 1) % themes.length];
        });
    }
    function goHome() { setScreen('logo'); }
    function goMenu() { setScreen('menu'); }
    function openModule(id) { setScreen(id); }

    return (
        <div>
            {screen === 'logo' && <LogoScreen onLogoClick={goMenu} />}
            {screen === 'menu' && <FloatingMenu onSelect={openModule} onBack={goHome} />}
            {['flux-sdxl','wan','tts','faceswap','sam','upscaler'].includes(screen) && (
                <ModuleScreen type={screen} onBack={goMenu} />
            )}
            <ThemeSwitcher theme={theme} switchTheme={switchTheme} />
            <DebugConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />
            <button
                id="toggle-console"
                className="fixed bottom-6 right-6 neon-button-min z-50"
                style={{fontSize: 12}}
                onClick={() => setConsoleOpen(v => !v)}>
                Konzole 🟰
            </button>
        </div>
    );
}

// ---- THEME SWITCHER ----
function ThemeSwitcher({theme, switchTheme}) {
    return (
        <button
            className="fixed bottom-14 right-6 z-50 neon-button-min-invert opacity-50"
            style={{fontSize: 12}}
            title="Změnit barevný styl"
            onClick={switchTheme}
        >
            
            <span className="hidden md:inline">{theme}</span>
            <span role="img" aria-label="palette"> 🎨</span>
        </button>
    );
}

// ---- GLITCH NADPIS (neztratí se ti nikdy!) ----
function GlitchTitle() {
    return (
        <div className="flex flex-col items-center justify-center select-none">
            <div className="glitch-wrapper relative mb-0">
                {/* Glitch vrstvy */}
                <span className="glitch-top text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                  wAllICzech
                </span>
                <span className="glitch-bottom text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                  wAllICzech
                </span>
                {/* Viditelný text pro výšku a přístupnost */}
                <h1 className="glitch text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight relative z-10">
                    w<span className="text-[#ff7800]">A</span>ll<span className="text-[#ff7800]">I</span>Czech
                </h1>
            </div>
            <div className="glitch-wrapper relative mt-0">
                {/* Glitch vrstvy */}
                <span className="glitch-top text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                  Studio
                </span>
                <span className="glitch-bottom text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                  Studio
                </span>
                {/* Viditelný text pro výšku a přístupnost */}
                <h1 className="glitch text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight relative z-10">
                    Studio
                </h1>
            </div>
        </div>
    );
}

// ---- LOGO SCREEN ----
function LogoScreen({ onLogoClick }) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-10 select-none">
        {/* INLINE SVG logo s CSS proměnnými */}
        <div
          className="neon-glow neon-logo cursor-pointer mb-1"
          style={{ width: 550, height: 550 }}
          onClick={onLogoClick}
        >
          <svg
            viewBox="-180 0 390 760"
            width="512"
            height="512"
            className="vallia-logo"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* <defs> musí být na začátku SVG */}
            <defs>
              {/* GLOW filtry */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="11" result="blur" />
                <feFlood floodColor="var(--color-primary-invert)" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glowColor" />
                <feMerge>
                  <feMergeNode in="glowColor" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-invert" x="-50%" y="-50%" width="250%" height="250%">
                <feGaussianBlur stdDeviation="11" result="blur" />
                <feFlood floodColor="var(--color-primary)" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glowColor" />
                <feMerge>
                  <feMergeNode in="glowColor" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* ----- ANIMOVANÝ SCANLINE PATTERN ----- */}
              <pattern id="scanlines" patternUnits="userSpaceOnUse" width="1" height="20">
               
                <rect x="0" y="2" width="1" height="2" fill="var(--color-primary)" opacity="1" />
                <animateTransform
                  attributeName="patternTransform"
                  type="translate"
                  from="0 0"
                  to="0 10"
                  begin="0s"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </pattern>
              {/* MASKA: tvar oka */}
              <mask id="scanlineMask">
                <path
                  d="m 628.4,394 c -17.3,4.5 -34.6,17.5 -46.1,34.5 -4.2,6.3 -8.3,13.8 -8.3,15.3 0,0.5 2.6,0 5.8,-1.1 7.5,-2.5 18.8,-1.9 29.3,1.6 14.8,5 23,6.2 41.9,6.1 14.8,0 19,-0.4 27,-2.4 16.6,-4 29.3,-10.4 40.4,-20.1 2.5,-2.2 4.6,-4.5 4.6,-5.1 0,-2.3 -18.5,-15.1 -29.4,-20.2 -21.1,-9.9 -47.1,-13.4 -65.2,-8.6 z"
                  fill="white"
                />
              </mask>
            </defs>
            {/* ---------- SVG STYLE ---------- */}
            <style>{`
              .face { fill: #ff7800; }
              .oko { fill: var(--color-primary-invert); opacity: 0.75;}
              .oboci { fill: var(--color-bg); }
              .signal, .signal2 { fill: var(--color-primary); }
              .mouth { fill: var(--color-bg); }
              .eye-blink {
                transform-origin: center center;
                transform-box: fill-box;
                animation: blink 6s infinite;
              }
              @keyframes blink {
                0%, 100%   { transform: scaleY(1); }
                48%        { transform: scaleY(1); }
                49%, 51%   { transform: scaleY(0.1); }
                52%        { transform: scaleY(1); }
              }
              .signal {
                transform-origin: center center;
                transform-box: fill-box;
                animation: signal 3s infinite ease-in-out;
              }
              @keyframes signal {
                0%, 100% { transform: scaleY(1) scaleX(1); }
                20% { transform: scaleY(0.98) scaleX(1.05); }
                40% { transform: scaleY(1.02) scaleX(0.95); }
                60% { transform: scaleY(0.98) scaleX(1.05); }
                80% { transform: scaleY(1) scaleX(1); }
              }
            `}</style>
  
            {/* ------ TVAR A VŠE UVNITŘ LOGA ------ */}
            <g
              id="vallia-glitch"
              transform="matrix(0.9576984,0,0,0.9576984,-485.55309,-91.651736)"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0;8 -6;-10 4;6 -8;-3 6;0 0"
                keyTimes="0;0.1;0.2;0.3;0.4;1"
                dur="0.3s"
                begin="15s;30s;45s"
                repeatCount="1"
                additive="sum"
              />
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0;4;-3;5;-2;0"
                keyTimes="0;0.1;0.2;0.3;0.4;1"
                dur="0.3s"
                begin="15s;30s;45s"
                repeatCount="1"
                additive="sum"
              />
    <path
       id="Layer5"
       class="face"
       d="m 544,98.6 c 46.1,6 90.7,21.6 124.5,43.5 57.5,37.4 92.7,96.5 98.4,165.2 3,35.7 -0.4,184.2 -4.3,190.6 -1.4,2.2 -12.2,6.9 -18.2,8 -3.2,0.6 -15.8,1.3 -27.9,1.7 -24.5,0.7 -27.3,1.4 -29.9,6.9 -2,4.1 -2.2,20.8 -0.3,24.4 0.6,1.3 2.5,3.4 4,4.5 2.7,2 3.9,2.1 19,1.8 19.2,-0.3 29,-1.5 40,-4.7 4.5,-1.3 8.3,-2.3 8.4,-2.2 0.1,0.2 -0.5,5 -1.4,10.7 -1.7,11.6 -3,13.7 -9.6,17.2 -6,3 -17.7,5.6 -28.9,6.4 -9.4,0.7 -10.5,0.9 -13,3.5 -2.6,2.6 -2.8,3.3 -2.8,11.4 0,12.7 2,15.4 11.3,15.5 5.9,0 21.7,-3 28.9,-5.6 2.3,-0.8 4.3,-1.3 4.5,-1.1 0.1,0.2 -1.5,6.9 -3.7,14.8 -18.8,68.8 -50.9,126.6 -96,173.3 -17.9,18.5 -46.5,41.3 -68.5,54.6 -21.6,13 -38.4,18.3 -67.2,21.4 l -4.3,0.4 v -48.2 -48.2 l 6.1,-1.3 c 22.3,-4.6 43,-18 54.5,-35.2 2.4,-3.7 4.4,-7.2 4.4,-7.8 0,-0.6 -2.4,0.8 -5.3,3.2 -7.3,6 -16.3,11.3 -23.8,14.1 -7.4,2.8 -28.2,7.6 -32.8,7.6 H 507 v -21 c 0,-19.8 0.1,-21 1.9,-21 1,0 6.1,-1.5 11.2,-3.2 l 9.4,-3.3 28.5,-0.1 c 19.1,0 30.8,-0.4 35.3,-1.3 3.8,-0.7 8.9,-1.1 11.3,-0.8 2.6,0.2 5,0 6,-0.7 1.5,-1.1 1.5,-1.5 0,-5.1 -3.1,-7.3 -3.6,-7.5 -15,-6.9 -11.7,0.7 -16,-0.4 -37.6,-10 -21.3,-9.4 -30.8,-10.6 -42.4,-5.3 -3.1,1.4 -5.6,2.3 -5.6,1.9 0.1,-0.4 0.7,-3.4 1.5,-6.7 0.9,-3.8 1.5,-11.4 1.5,-20.8 0,-15.9 0.9,-19.6 6.2,-24.3 5.2,-4.8 8.7,-5.8 23.3,-6.3 11.7,-0.5 14.6,-0.9 17.5,-2.7 10.7,-6.2 11.9,-25.8 2.4,-40.2 -4,-6.1 -5.1,-6.7 -2.8,-1.5 6.1,13.7 4.6,29 -3.2,35.2 -3.4,2.7 -4.8,2.7 -4.1,-0.1 2.2,-8.3 -11.8,-10.3 -27.8,-3.9 -4.4,1.8 -10.1,3.5 -12.7,3.8 l -4.8,0.6 V 348.5 95.7 l 12.8,0.7 c 7,0.4 17.9,1.4 24.2,2.2 z" />
    <path
       id="Layer4"
       class="mouth"
       d="m 507,764.4 6.1,-1.3 c 22.3,-4.6 43,-18 54.5,-35.2 2.4,-3.7 4.4,-7.2 4.4,-7.8 0,-0.6 -2.4,0.8 -5.3,3.2 -7.3,6 -16.3,11.3 -23.8,14.1 -7.4,2.8 -28.2,7.6 -32.8,7.6 H 507 m 1.9,-42 c 1,0 6.1,-1.5 11.2,-3.2 l 9.4,-3.3 28.5,-0.1 c 19.1,0 30.8,-0.4 35.3,-1.3 3.8,-0.7 8.9,-1.1 11.3,-0.8 2.6,0.2 5,0 6,-0.7 1.5,-1.1 1.5,-1.5 0,-5.1 -3.1,-7.3 -3.6,-7.5 -15,-6.9 -11.7,0.7 -16,-0.4 -37.6,-10 -21.3,-9.4 -30.8,-10.6 -42.4,-5.3 -3.1,1.4 -5.6,2.3 -5.6,1.9 0.1,-0.4 0.7,-3.4 1.5,-6.7 0.9,-3.8 1.5,-11.4 1.5,-20.8 0,-15.9 0.9,-19.6 6.2,-24.3 5.2,-4.8 8.7,-5.8 23.3,-6.3 11.7,-0.5 14.6,-0.9 17.5,-2.7 10.7,-6.2 11.9,-25.8 2.4,-40.2 -4,-6.1 -5.1,-6.7 -2.8,-1.5 6.1,13.7 4.6,29 -3.2,35.2 -3.4,2.7 -4.8,2.7 -4.1,-0.1 2.2,-8.3 -11.8,-10.3 -27.8,-3.9 -4.4,1.8 -10.1,3.5 -12.7,3.8 l -4.8,0.6" />
    <path
       id="Layer3"
       class="signal"
       filter="url(#glow-invert)"
       d="m 844.5,256.5 c 2.4,2.3 2.5,2.9 2.5,16.8 0,13.1 -0.2,14.7 -2.1,17.1 -2.6,3.3 -7.9,3.6 -10.9,0.6 -1.8,-1.8 -2,-3.3 -2,-17.4 v -15.5 l 2.6,-2 c 3.5,-2.8 6.9,-2.6 9.9,0.4 z m 44.8,53.7 c 1.6,1.9 1.7,9 1.7,118.5 v 116.4 l -2.5,2.4 c -3.1,3.2 -6.9,3.2 -10,0 l -2.5,-2.4 v -116 c 0,-63.8 0.3,-116.7 0.6,-117.6 0.9,-2.2 6.3,-4.6 8.9,-3.9 1.1,0.3 2.8,1.5 3.8,2.6 z m -44.4,30.7 c 1.2,1.2 2.2,4 2.6,7.3 0.3,2.9 0.5,36.2 0.3,73.9 -0.3,73.9 -0.1,70.9 -5.5,73 -2.8,1 -8,-0.7 -9.3,-3.1 -0.6,-1.2 -1,-29.4 -1,-75.4 0,-72.3 0,-73.6 2,-75.6 2.6,-2.6 8.3,-2.7 10.9,-0.1 z m -43.8,62.4 c 0.9,0.7 2.1,2.2 2.7,3.4 1.6,3 1.7,48.2 0.1,51.7 -2.6,5.5 -10.7,5.7 -14,0.2 -1.7,-2.8 -1.9,-5.1 -1.8,-22.1 0.1,-24.2 0.8,-30.2 3.8,-32.6 2.6,-2.2 6.8,-2.4 9.2,-0.6 z m 25.3,190.8 c 2.4,1.9 2.6,2.6 2.6,10.3 0,12.2 0.2,12.1 -21.5,12.1 -21.7,0 -21.5,0.1 -21.5,-12.1 0,-7.7 0.2,-8.4 2.6,-10.3 2.5,-1.9 4,-2.1 18.9,-2.1 14.9,0 16.4,0.2 18.9,2.1 z m -37.3,90.8 c 2.6,2.7 2.9,3.6 2.9,9.6 0,5.7 -0.3,6.9 -2.5,9 -2.4,2.5 -2.7,2.5 -19.2,2.5 -17.5,-0.1 -18.8,-0.3 -21.1,-4.7 -1.8,-3.2 -1.5,-12.4 0.4,-15.1 2.5,-3.6 4.8,-4.1 21.2,-4.1 l 15.4,-0.1 z" />
    <path
       id="Layer2"
       class="oboci"
       d="m 638,329.7 c -41.9,4.5 -77.4,26.8 -93.2,58.8 -5.3,10.6 -8.2,20.6 -10.2,34.7 -0.2,2.1 -0.3,3.8 -0.1,3.8 0.2,0 1.5,-2.5 2.9,-5.5 12.8,-27.9 42.6,-53.1 76.4,-64.4 19.6,-6.5 45.2,-9.9 62.8,-8.2 23.4,2.3 47.9,13.4 65.2,29.5 l 6.5,6.1 -2.3,-4.5 c -8.2,-16.2 -23.2,-30.5 -41.5,-39.7 -17.3,-8.8 -44.1,-13 -66.5,-10.6 z" />
            <path
              id="Layer1"
              className="oko eye-blink"
              filter="url(#glow)"
              d="m 628.4,394 c -17.3,4.5 -34.6,17.5 -46.1,34.5 -4.2,6.3 -8.3,13.8 -8.3,15.3 0,0.5 2.6,0 5.8,-1.1 7.5,-2.5 18.8,-1.9 29.3,1.6 14.8,5 23,6.2 41.9,6.1 14.8,0 19,-0.4 27,-2.4 16.6,-4 29.3,-10.4 40.4,-20.1 2.5,-2.2 4.6,-4.5 4.6,-5.1 0,-2.3 -18.5,-15.1 -29.4,-20.2 -21.1,-9.9 -47.1,-13.4 -65.2,-8.6 z"
            />
            {/* ---- OKO: 2) Overlay s maskou + scanlines ---- */}
            <path
              d="m 628.4,394 c -17.3,4.5 -34.6,17.5 -46.1,34.5 -4.2,6.3 -8.3,13.8 -8.3,15.3 0,0.5 2.6,0 5.8,-1.1 7.5,-2.5 18.8,-1.9 29.3,1.6 14.8,5 23,6.2 41.9,6.1 14.8,0 19,-0.4 27,-2.4 16.6,-4 29.3,-10.4 40.4,-20.1 2.5,-2.2 4.6,-4.5 4.6,-5.1 0,-2.3 -18.5,-15.1 -29.4,-20.2 -21.1,-9.9 -47.1,-13.4 -65.2,-8.6 z"
              fill="url(#scanlines)"
              className="okoline eye-blink"
              mask="url(#scanlineMask)"
              opacity="1"
              style={{ pointerEvents: "none" }}
            />
            <path
              className="signal2"
              filter="url(#glow-invert)"
              d="m 652.5,575.5 c -2.3,2.2 -2.5,3.1 -2.5,12.5 0,10 0.1,10.2 3,13.2 l 3,3 12.1,-0.4 c 11.8,-0.3 12.1,-0.4 14.5,-3.1 2.2,-2.5 2.4,-3.7 2.4,-12.3 0,-9.2 -0.1,-9.7 -2.9,-12.5 -2.9,-2.9 -3,-2.9 -15.1,-2.9 -11.5,0 -12.2,0.1 -14.5,2.5 z"
              id="path1"
            />
          </g>
        </svg>
      </div>
      <GlitchTitle />
      <p className="text-lg text-[var(--color-primary-glow)] opacity-70 mt-4">
        Klikni na logo pro výběr AI modulu
      </p>
    </div>
  );
}

// ---- MENU S NEONOVÝMI RÁMEČKY ----
function FloatingMenu({onSelect, onBack}) {
    const modules = [
        { id: 'flux-sdxl', label: 'Flux/SDXL', icon: '⚡️', desc: 'AI generátor obrázků' },
        { id: 'wan', label: 'WAN Video', icon: '🎥', desc: 'AI generátor videí' },
        { id: 'tts', label: 'TTS', icon: '🗣️', desc: 'Text-to-Speech' },
        { id: 'faceswap', label: 'FaceSwap', icon: '🧑‍🤝‍🧑', desc: 'Výměna obličeje' },
        { id: 'sam', label: 'Sam Segmentace', icon: '✂️', desc: 'Segmentace obrázků' },
        { id: 'upscaler', label: 'Upscaler', icon: '⬆️', desc: 'Zvětšování obrázků' },
    ];
    return (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/80">
            <div className="grid grid-cols-2 gap-8 bg-black/90 p-12 rounded-2xl shadow-xl">
                {modules.map(mod => (
                    <button key={mod.id}
                        className="menu-card flex flex-col items-center p-8 rounded-xl neon-border neon-glow transition-transform hover:scale-105"
                        onClick={() => onSelect(mod.id)}
                        title={mod.desc}
                    >
                        <span className="text-5xl mb-2">{mod.icon}</span>
                        <span className="font-bold text-xl mb-1">{mod.label}</span>
                        <span className="opacity-50 text-xs">{mod.desc}</span>
                    </button>
                ))}
            </div>
            <button className="absolute top-8 right-12 neon-button"
                    onClick={onBack}>Zpět na logo</button>
        </div>
    );
}

/**
 * Spustí neonový déšť – jako scéna z Blade Runnera! 🌧️
 */
function triggerRainEffect() {
    try {
        const rainContainer = document.createElement('div');
        rainContainer.className = 'rain-effect';
        document.body.appendChild(rainContainer);

        for (let i = 0; i < 50; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = `${Math.random() * 100}vw`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            rainContainer.appendChild(drop);
        }

        setTimeout(() => rainContainer.remove(), 5000);
        console.log('🌧️ Neonový déšť spuštěn na 5 sekund!');
    } catch (e) {
        console.error('💥 Chyba při spuštění deště:', e);
    }
}

// ---- MODULY (placeholder i Flux/SDXL karta) ----
function ModuleScreen({type, onBack}) {
    if (type === 'flux-sdxl') return <FluxSDXLCard goBack={onBack} />;
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="p-12 neon-panel neon-border rounded-2xl bg-black/90 max-w-xl text-center">
                <h2 className="glitch text-3xl mb-8">{type.toUpperCase()}</h2>
                <p className="opacity-70">Tento modul bude doplněn.<br/>Zatím si hraj s obrázky, zlato…</p>
                <button className="mt-10 neon-button" onClick={onBack}>Zpět do nabídky</button>
            </div>
        </div>
    );
}

// ---- DEBUG KONZOLE ----
function DebugConsole({open, onClose}) {
    const [lines, setLines] = React.useState([]);
    const [cmd, setCmd] = React.useState('');
    window.logToConsole = (msg, type='info') => {
        setLines(lines => [...lines, {msg, type, time: new Date().toLocaleTimeString()}]);
    };
    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-black/95 border-t-2 border-[#00ff88] z-40 transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`} style={{minHeight: 220}}>
            <div className="p-4 font-fira-code text-sm">
                <div id="console-output" className="h-36 overflow-y-auto mb-2" style={{whiteSpace: 'pre-wrap'}}>
                    {lines.map((l, i) =>
                        <div key={i} className={l.type}>{`[${l.time}] ${l.msg}`}</div>
                    )}
                </div>
                <input id="console-input" type="text"
                    className="w-full bg-black text-[#00ff88] border border-[#00ff88] p-2 rounded"
                    value={cmd} onChange={e => setCmd(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            window.logToConsole('> ' + cmd, 'cmd');
                            setCmd('');
                        }
                    }}
                    placeholder="Zadej příkaz (např. generate flux 'kyberpunk město')"
                />
            </div>
            <button className="absolute top-2 right-4 neon-button-min" onClick={onClose}>Zavřít ❌</button>
        </div>
    );
}

// ---- FLUX/SDXL KARTA ----

function FluxSDXLCard({ goBack }) {
    const [model, setModel] = React.useState('flux');
    const [steps, setSteps] = React.useState(30);
    const [guidanceScale, setGuidanceScale] = React.useState(7.5);
    const [sampler, setSampler] = React.useState('euler_a');
    const [availableSamplers, setAvailableSamplers] = React.useState([
        { value: 'euler_a', label: 'Euler a (Ancestral) ⚡' },
        { value: 'euler', label: 'Euler (Základní)' },
        { value: 'dpmpp_2m', label: 'DPM++ 2M (Doporučeno) 🚀' },
        { value: 'pndm', label: 'PNDM (Stabilní)' }
    ]);
    
    // Načtení dostupných samplerů při načtení komponenty
    React.useEffect(() => {
        const loadSamplers = async () => {
            try {
                console.log('Načítám dostupné samplery...');
                const response = await fetch('http://127.0.0.1:8000/api/samplers');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                if (!data || !Array.isArray(data.available_samplers)) {
                    throw new Error('Neplatný formát odpovědi od serveru');
                }
                
                // Mapování názvů samplerů na popisky
                const samplerLabels = {
                    'euler_a': 'Euler a (Ancestral) ⚡',
                    'euler': 'Euler (Základní)',
                    'dpmpp_2m': 'DPM++ 2M (Doporučeno) 🚀',
                    'pndm': 'PNDM (Stabilní)',
                    'ddim': 'DDIM (Denoising) 🧊',
                    'ddpm': 'DDPM (Diffusion) 🌀',
                    'unipc': 'UniPC Multistep ✨',
                    'deis': 'DEIS Multistep 🌠'
                };
                
                // Vytvoříme pole dostupných samplerů s popisky
                const samplers = data.available_samplers
                    .filter(s => samplerLabels[s])
                    .map(s => ({
                        value: s,
                        label: samplerLabels[s] || s
                    }));
                
                setAvailableSamplers(samplers);
                
                // Pokud aktuální sampler není mezi dostupnými, změníme ho na první dostupný
                if (samplers.length > 0 && !samplers.some(s => s.value === sampler)) {
                    setSampler(samplers[0].value);
                }
                
                console.log('Dostupné samplery načteny:', samplers);
            } catch (error) {
                console.error('Chyba při načítání samplerů:', error);
                // Ponecháme výchozí samplery
                const defaultSamplers = [
                    { value: 'euler_a', label: 'Euler a (Ancestral) ⚡' },
                    { value: 'euler', label: 'Euler (Základní)' },
                    { value: 'dpmpp_2m', label: 'DPM++ 2M (Doporučeno) 🚀' },
                    { value: 'pndm', label: 'PNDM (Stabilní)' }
                ];
                setAvailableSamplers(defaultSamplers);
            }
        };
        
        loadSamplers();
        const loadLoras = async () => {
            try {
                console.log('Načítám dostupné LoRA modely... 🤖');
                const response = await fetch('http://127.0.0.1:8000/api/loras');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} při načítání LoRA`);
                }
                const data = await response.json();
                setAvailableLoras(data.available_loras || []);
                console.log('Dostupné LoRA modely:', data.available_loras);
                if (data.available_loras && data.available_loras.length > 0) {
                    // setSelectedLora(data.available_loras[0].path); // Volitelně nastavit první jako výchozí
                } else {
                    console.log('Žádné LoRA modely nenalezeny nebo endpoint vrátil prázdný seznam.');
                }
            } catch (error) {
                console.error("Chyba při načítání LoRA modelů: ", error);
                toast.error(`Nepodařilo se načíst LoRA: ${error.message} 💣`);
                setAvailableLoras([]); // Zajistit, že je to pole i v případě chyby
            }
        };
        loadLoras();
    }, []);
    const [width, setWidth] = React.useState(1024);
    const [height, setHeight] = React.useState(1024);
    const [batchSize, setBatchSize] = React.useState(1);
    const [seed, setSeed] = React.useState(420);
    const [randomSeed, setRandomSeed] = React.useState(true);
    const [hiresFix, setHiresFix] = React.useState(false);
    const [denoise, setDenoise] = React.useState(0.7);
    const [faceRestore, setFaceRestore] = React.useState(false);
    const [clipSkip, setClipSkip] = React.useState(1);
    const [eta, setEta] = React.useState(0);
    const [preset, setPreset] = React.useState('');
    const [priorEnhancer, setPriorEnhancer] = React.useState(false);
    const [variant, setVariant] = React.useState('');
    const [outputFormat, setOutputFormat] = React.useState('png');
    const [status, setStatus] = React.useState('');
    const [images, setImages] = React.useState([]);
    const [prompt, setPrompt] = React.useState('');
    const [negativePrompt, setNegativePrompt] = React.useState('');
    const [schedulerProfile, setSchedulerProfile] = React.useState('normal');
    const [availableLoras, setAvailableLoras] = React.useState([]);
    const [selectedLora, setSelectedLora] = React.useState(''); // Bude ukládat cestu k LoRA souboru
    const [loraStrength, setLoraStrength] = React.useState(0.8); // Přidán stav pro scheduler profile
    const [showAdvanced, setShowAdvanced] = React.useState(false);

    
    async function generateImage(explicitSelectedLora, explicitLoraStrength) {
        setStatus('Připojuji se k AI serveru... 🤖');
        setImages([]); // Smaž předchozí obrázky
        
        // Zkontrolujeme, zda je zadaný prompt
        if (!prompt.trim()) {
            setStatus('Chyba: Zadejte prosím popis obrázku');
            window.logToConsole('❌ Chyba: Nezadán popis obrázku', 'error');
            return;
        }
    
        try {
            // Příprava dat pro odeslání
            const requestData = {
                model_type: model,
                prompt,
                negative_prompt: negativePrompt,
                width,
                height,
                num_images: batchSize,
                num_inference_steps: steps,
                guidance_scale: guidanceScale,
                seed: randomSeed ? null : seed,
                sampler: sampler, // Sampler je zde správně jen jednou
                scheduler_profile: schedulerProfile, // Scheduler profile přidán
                output_format: outputFormat, // Output format přidán
                hires_fix: hiresFix,
                denoise,
                face_restore: faceRestore,
                clip_skip: clipSkip,
                eta,
                preset,
                prior_enhancer: priorEnhancer,
                variant,
            };

            // Přidání LoRA parametrů, pokud jsou relevantní
            // Logujeme PŘÍMO OBDRŽENÉ argumenty a jejich typy pomocí window.logToConsole
            window.logToConsole('[LORA ARGS] explicitSelectedLora (parametr obdržený funkcí):', explicitSelectedLora, 'Typ:', typeof explicitSelectedLora, 'debug');
            window.logToConsole('[LORA ARGS] explicitLoraStrength (parametr obdržený funkcí):', explicitLoraStrength, 'Typ:', typeof explicitLoraStrength, 'debug');

            // Protože parametry explicitSelectedLora a explicitLoraStrength přicházejí jako undefined (viz logy výše),
            // budeme pro LoRA používat hodnoty přímo z React stavu komponenty ('selectedLora' a 'loraStrength').
            // Následující kód tedy bude pracovat s proměnnými 'selectedLora' a 'loraStrength' ze stavu.
            // Nejsou zde žádné nové `const selectedLora = ...` nebo `const loraStrength = ...`,
            // takže odkazy níže půjdou přímo na stavové proměnné.

            window.logToConsole('🕵️‍♂️ Používám LoRA hodnoty přímo ze STAVU KOMPONENTY:', { loraZeStavu: selectedLora, silaZeStavu: loraStrength, typLoraZeStavu: typeof selectedLora, typSilaZeStavu: typeof loraStrength }, 'debug');

            // Přidání LoRA parametrů, pokud jsou relevantní.
            if (selectedLora && typeof selectedLora === 'string' && selectedLora.trim() !== "") {
                const strengthValue = parseFloat(loraStrength);
                if (!isNaN(strengthValue)) {
                    requestData.selected_lora = selectedLora;
                    requestData.lora_strength = strengthValue;
                    window.logToConsole(`🚀 Posílám LoRA '${selectedLora.split(/[\\/]/).pop()}' se silou ${strengthValue.toFixed(2)} na backend. Snad to nevybouchne...`, 'info');
                } else {
                    window.logToConsole(`🤔 LoRA '${selectedLora.split(/[\\/]/).pop()}' sice vybrána, ale její síla '${loraStrength}' je nějaká divná. Radši ji nepošlu.`, 'warn');
                }
            } else {
                window.logToConsole('🧘 Pokračuji v zenovém klidu bez LoRA. Základ je taky fajn.', 'info');
                window.logToConsole('[LORA FAIL] Podmínka pro LoRA selhala. Hodnoty:', { loraVal: selectedLora, loraTyp: typeof selectedLora, strengthVal: loraStrength, strengthTyp: typeof loraStrength }, 'warn');
            }
              
            console.log("Finální data pro generování (včetně LoRA, pokud je aktivní):", requestData);
            
            // Vytvoříme unikátní ID pro tento task
            const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            try {
                const response = await fetch('http://127.0.0.1:8000/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...requestData,
                        task_id: taskId  // Přidáme ID tasku pro sledování
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage = `HTTP chyba! Status: ${response.status}`;
                    
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.detail || errorData.message || errorMessage;
                    } catch (e) {
                        errorMessage = errorText || errorMessage;
                    }
                    
                    throw new Error(errorMessage);
                }
                
                const data = await response.json();
                
                // Pokud server vrátí chybu
                if (!data.success) {
                    const errorMsg = data.detail || data.message || 'Neznámá chyba';
                    throw new Error(errorMsg);
                }
                
                // WebSocket pro dlouhotrvající úlohy
                if (data.task_id) {
                    const taskId = data.task_id;
                    setStatus(`Úloha přijata: ${taskId}`);
                    window.logToConsole(`🟢 Úloha přijata: ${taskId}`, 'info');
                    
                    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
                    const wsUrl = `${wsProtocol}127.0.0.1:8000/ws/task/${taskId}`;
                    const socket = new WebSocket(wsUrl);
                    
                    socket.onmessage = (event) => {
                        try {
                            const statusObj = JSON.parse(event.data);
                            if (statusObj.status === 'completed' && (statusObj.images_base64 || statusObj.images)) {
                                const images = statusObj.images_base64 || statusObj.images;
                                setImages(images);
                                setStatus('Hotovo! 🎉');
                                window.logToConsole(`✅ Vygenerováno ${images.length} obrázků`, 'success');
                                socket.close();
                            } else if (statusObj.status === 'failed') {
                                setStatus(`Chyba: ${statusObj.error || 'Neznámá chyba'}`);
                                window.logToConsole(`❌ ${statusObj.error || 'Neznámá chyba'}`, 'error');
                                socket.close();
                            } else if (statusObj.progress !== undefined) {
                                const progress = Math.min(100, Math.max(0, statusObj.progress * 100)).toFixed(0);
                                setStatus(`Průběh: ${progress}%`);
                            }
                        } catch (e) {
                            console.error('Chyba při zpracování WebSocket zprávy:', e);
                        }
                    };
                    
                    socket.onerror = (e) => {
                        console.error('WebSocket chyba:', e);
                        setStatus('Chyba připojení k serveru!');
                        window.logToConsole('❌ Chyba připojení k serveru', 'error');
                    };
                    
                    socket.onclose = () => {
                        console.log('WebSocket připojení ukončeno');
                    };
                }
                
                // Zpracování přímé odpovědi (pokud neběží WebSocket)
                if (data.images && data.images.length > 0) {
                    setImages(data.images);
                    setStatus('Hotovo! 🎉');
                    window.logToConsole(`✅ Vygenerováno ${data.images.length} obrázků`, 'success');
                }
                
                return; // Úspěšně dokončeno
            } catch (error) {
                console.error('Chyba při zpracování odpovědi:', error);
                throw error; // Přeposlání chyby výše
            }
        } catch (e) {
            setStatus(`Katastrofa: ${e.message}`);
            window.logToConsole(`💥 ${e.message}`, 'error');
        }
    };

    const toggleAdvanced = () => setShowAdvanced(!showAdvanced);

    return (
        <div className="neon-panel p-8 rounded-2xl max-w-3xl mx-auto flex flex-col gap-6 bg-black/90 neon-border neon-border-shadow mt-16">
          {/* Výběr modelu */}
          <div className="flex justify-center gap-8 mb-2">
            <button
              type="button"
              style={{ fontFamily: "BungeeHairline, sans-serif", fontWeight: "bold" }}
              className={`glitch px-8 py-2 rounded-xl neon-border-thin text-xl font-bold uppercase transition-all duration-150 ${
                model === "flux"
                  ? "bg-[var(--color-primary) opacity(0.7)] text-[var(--color-primary-invert)] shadow-[0_0_18px_var(--color-primary)]"
                  : "bg-black text-[var(--color-primary)] neon-border-thin"
              }`}
              onClick={() => setModel("flux")}
            >
              FLUX
            </button>
            <button
              type="button"
              style={{ fontFamily: "BungeeHairline, sans-serif", fontWeight: "bold" }}
              className={`glitch px-8 py-2 rounded-xl neon-border-thin text-xl font-bold uppercase transition-all duration-150 ${
                model === "sdxl"
                  ? "bg-[var(--color-primary) opacity(0.7)] text-[var(--color-primary-invert)] shadow-[0_0_18px_var(--color-primary)]"
                  : "bg-black text-[var(--color-primary)] neon-border-thin"
              }`}
              onClick={() => setModel("sdxl")}
            >
              SDXL
            </button>
            <button
              type="button"
              style={{ fontFamily: "BungeeHairline, sans-serif", fontWeight: "bold" }}
              className={`glitch px-8 py-2 rounded-xl neon-border-thin text-xl font-bold uppercase transition-all duration-150 ${
                model === "sd15"
                  ? "bg-[var(--color-primary) opacity(0.7)] text-[var(--color-primary-invert)] shadow-[0_0_18px_var(--color-primary)]"
                  : "bg-black text-[var(--color-primary)] neon-border-thin"
              }`}
              onClick={() => setModel("sd15")}
            >
              SD1.5
            </button>
          </div>
    
          {/* Prompty přes celou šíři */}
          <div>
            <label className="block mb-1 text-moje">Prompt:</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Kyberpunkové město v noci"
              className="text-moje2 w-full bg-black neon-border-thin neon-border-shadow-thin p-2 rounded resize-y mb-2"
            />
            <label className="block mb-1 text-moje">Negativní prompt:</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Rozmazané, nekvalitní"
              className="text-moje2 w-full bg-black neon-border-thin neon-border-shadow-thin p-2 rounded resize-y"
            />
          </div>
    
          {/* Nastavení */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              generateImage();
            }}
            className="flex flex-col md:flex-row gap-4"
          >
            {/* Levý sloupec - základní */}
            <div className="flex flex-col gap-4 flex-1">
              <div className="grid grid-cols-2 gap-2 ">
                <div>
                  <label className="text-moje">Šířka:</label>
                  <input
                    type="number"
                    min={256}
                    max={2048}
                    step={64}
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="text-moje2 w-full bg-black neon-border-thin neon-border-shadow-thin p-2 rounded"
                  />
                </div>
                <div>
                  <label className="text-moje">Výška:</label>
                  <input
                    type="number"
                    min={256}
                    max={2048}
                    step={64}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="text-moje2 w-full bg-black neon-border-thin neon-border-shadow-thin p-2 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-moje mb-1">Guidance scale:</label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.1}
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(Number(e.target.value))}
                  className="w-full neon-slider"
                />
                <div className="text-moje2 text-[1.1rem] text-[var(--color-primary)]">
                  {guidanceScale}
                </div>
              </div>
              <div>
                <label className="block text-moje mb-1">Sampler:</label>
                <select
                  value={sampler}
                  onChange={(e) => setSampler(e.target.value)}
                  className="text-moje2 w-full bg-black neon-border-thin neon-border-shadow-thin p-2 rounded"
                  id="sampler-select"
                  title="Vyberte sampler pro generování"
                >
                  {availableSamplers.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Pravý sloupec - pokročilé */}
            <div className="flex flex-col gap-2 flex-1">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="neon-button-min mb-2"
                style   ={{ fontFamily: "Handjet, sans-serif", color: "var(--color-primary)", fontWeight: "bold" }}
              >
                {showAdvanced ? "Skrýt pokročilá nastavení" : "Zobrazit pokročilá nastavení"}
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-2 p-3 neon-border-thin rounded bg-black/80 mt-2 animate-fade-in">
                  <div>
                    <label className="text-moje">Počet kroků:</label>
                    <input
                      type="range"
                      min={5}
                      max={150}
                      value={steps}
                      onChange={(e) => setSteps(Number(e.target.value))}
                      className="w-full neon-slider"
                    />
                    <div className="text-xs text-moje2 text-[var(--color-primary)]">
                      {steps} kroků
                    </div>
                  </div>
                  <div>
                    <label className="text-moje">Batch size:</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={batchSize}
                      onChange={(e) => setBatchSize(Number(e.target.value))}
                      className="text-moje2 text-[1.1rem] text-[var(--color-primary)] bg-black"
                    />
                  </div>
                  <div>
                    <label className="text-moje">Scheduler Profil: </label>
                    <select id="scheduler-profile-select" value={schedulerProfile} onChange={e => setSchedulerProfile(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5">
                      <option value="normal">Normal 🧘</option>
                      <option value="karras">Karras 🌀</option>
                      <option value="polyexponential">Polyexponential 📈</option>
                      <option value="beta">Beta (Experimentální) 🧪</option>
                    </select>
                  </div>
                  {/* LoRA Modely */}
                  <div>
                    <label className="text-moje">LoRA Model:</label>
                    <select 
                        value={selectedLora} 
                        onChange={e => setSelectedLora(e.target.value)} 
                        className="text-moje2 w-full bg-black neon-border-thin neon-border-shadow-thin p-2 rounded mb-1"
                        disabled={!availableLoras || availableLoras.length === 0}
                        title={availableLoras && availableLoras.length > 0 ? "Vyberte LoRA model" : "Žádné LoRA modely nenalezeny"}
                    >
                        <option value="">Žádný (bez LoRA)</option>
                        {availableLoras && availableLoras.map(lora => (
                            <option key={lora.path} value={lora.path}>{lora.name}</option>
                        ))}
                    </select>
                    {availableLoras && availableLoras.length === 0 && (
                        <p className="text-xs text-gray-400">V adresáři nebyly nalezeny žádné LoRA modely. Zkontrolujte konzoli backendu pro více detailů.</p>
                    )}
                  </div>
                  {selectedLora && (
                    <div>
                        <label className="block text-moje mb-1">Síla LoRA modelu: {loraStrength.toFixed(2)}</label>
                        <input 
                            type="range" 
                            min={0} 
                            max={1.5}  // Některé LoRA snesou i > 1.0
                            step={0.01} 
                            value={loraStrength} 
                            onChange={e => setLoraStrength(Number(e.target.value))} 
                            className="w-full neon-slider"
                            disabled={!selectedLora}
                        />
                    </div>
                  )}
                  {/* Duplicitní sampler roletka byla zde, nyní je odstraněna. Správná je v základním nastavení. */} 
                  <div>
                    <label className="text-moje">Seed:</label>
                    <input
                        type="number"
                        value={seed}
                        onChange={e => setSeed(Number(e.target.value))}
                        className={`text-moje2 w-full bg-black neon-border-thin neon-border-shadow-thin p-2 rounded transition-all duration-200 ${
                        randomSeed ? "opacity-50 pointer-events-none" : ""
                        }`}
                        disabled={randomSeed}
                    />
                    <button
                        type="button"
                        onClick={() => setRandomSeed(!randomSeed)}
                        className={`px-4 py-1 text-moje neon-button-min transition-all duration-200
                        ${
                            randomSeed
                            ? "bg-black text-[var(--color-glow-invert)]"
                            : "bg-black text-[var(--color-primary-invert)]"
                        }
                        `}
                    >
                        Náhodný seed
                    </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-moje">Highres Fix:</label>
                        <div
                            className={`neon-toggle ${hiresFix ? 'checked' : ''}`}
                            tabIndex={0}
                            role="switch"
                            aria-checked={hiresFix}
                            onClick={() => setHiresFix(!hiresFix)}
                            onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') setHiresFix(!hiresFix); }}
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                        >
                            <span className="knob"></span>
                        </div>
                    </div>
                  <div>
                    <label className="text-moje">Denoise:  </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={denoise}
                      className="neon-slider"
                      onChange={(e) => setDenoise(Number(e.target.value))}
                    />
                    <span className="ml-2 text-moje2 text-[1.1rem] text-[var(--color-primary)]">{denoise}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-moje">Face Restoration:</label>
                    <div
                        className={`neon-toggle ${faceRestore ? 'checked' : ''}`}
                        tabIndex={0}
                        role="switch"
                        aria-checked={faceRestore}
                        onClick={() => setFaceRestore(!faceRestore)}
                        onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') setFaceRestore(!faceRestore); }}
                        style={{ display: 'inline-block', cursor: 'pointer', marginLeft: '10px' }}
                    >
                        <span className="knob"></span>
                    </div>
                    </div>
                  <div>
                    <label className="text-moje">CLIP Skip:  </label>
                    <input
                      className="text-moje2 bg-black"
                      type="number"
                      min={1}
                      max={8}
                      value={clipSkip}
                      onChange={(e) => setClipSkip(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-moje ">Eta:  </label>
                    <input
                      className="text-moje2 bg-black"
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={eta}
                      onChange={(e) => setEta(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-moje">Styl preset: </label>
                    <select
                      className="text-moje2 bg-black"
                      value={preset}
                      onChange={(e) => setPreset(e.target.value)}
                    >
                      <option value="">Žádný</option>
                      <option value="anime">Anime</option>
                      <option value="photo">Photo</option>
                      <option value="pixelart">Pixel Art</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-moje">Prior enhancer:</label>
                    <div
                        className={`neon-toggle ${priorEnhancer ? 'checked' : ''}`}
                        tabIndex={0}
                        role="switch"
                        aria-checked={priorEnhancer}
                        onClick={() => setPriorEnhancer(!priorEnhancer)}
                        onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') setPriorEnhancer(!priorEnhancer); }}
                        style={{ display: 'inline-block', cursor: 'pointer', marginLeft: '10px' }}
                    >
                        <span className="knob"></span>
                    </div>
                 </div>
                  <div>
                    <label className="text-moje">Variant modelu: </label>
                    <input
                      type="text"
                      className="text-moje2 bg-black"
                      value={variant}
                      onChange={(e) => setVariant(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-moje">Výstupní formát: </label>
                    <select
                      className="text-moje2 bg-black"
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                    >
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </form>
          {/* Výsledek a obrázky pod nastavením */}
          <button type="submit" onClick={generateImage} className="neon-button w-full mt-4">
            Vygenerovat 🚀
          </button>
          <div className="text-moje text-[var(--color-primary)] mt-2">{status}</div>
          <div className="flex flex-row flex-wrap justify-center gap-4 mt-4">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Vygenerovaný obrázek"
                className="w-full md:w-72 rounded neon-border"
              />
            ))}
          </div>
          <button className="neon-button-outline mt-2" onClick={goBack}>
            Zpět do nabídky
          </button>
        </div>
      );
    }

// ---- REACT RENDER ----
ReactDOM.render(<App />, document.getElementById('root'));



