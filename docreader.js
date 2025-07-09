var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var DocumentLoader = /** @class */ (function () {
    function DocumentLoader() {
    }
    DocumentLoader.loadDocument = function (contentElement) {
        return __awaiter(this, void 0, void 0, function () {
            var docxPath, response, buffer, result, html, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        console.log('🔍 Načítám dokument...');
                        docxPath = 'SYNTHOMA - NULL.docx';
                        // Vytvoříme kontejner pro obsah a navigaci
                        contentElement.innerHTML = "\n                <div id=\"toc-container\" style=\"margin-bottom: 2rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 5px;\">\n                    <h2 style=\"color: #00ff00; margin-top: 0;\">Obsah</h2>\n                    <div id=\"toc\" style=\"display: flex; flex-wrap: wrap; gap: 1rem;\"></div>\n                </div>\n                <div id=\"book-content\" style=\"margin-top: 1rem;\">\n                    <p style=\"color: #00ff00;\">\u23F3 Na\u010D\u00EDt\u00E1m dokument... Pros\u00EDm po\u010Dkejte.</p>\n                </div>\n            ";
                        this.contentContainer = document.getElementById('book-content');
                        this.tocContainer = document.getElementById('toc');
                        // Kontrola existence Mammoth.js
                        if (typeof mammoth === 'undefined') {
                            throw new Error('Mammoth.js není načten!');
                        }
                        // Načtení dokumentu
                        console.log('⬇️ Stahuji dokument...');
                        return [4 /*yield*/, fetch(docxPath)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP error ".concat(response.status));
                        }
                        // Konverze na HTML
                        console.log('📥 Dokument stažen, konvertuji na HTML...');
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 2:
                        buffer = _a.sent();
                        return [4 /*yield*/, mammoth.convertToHtml({ arrayBuffer: buffer })];
                    case 3:
                        result = _a.sent();
                        html = result.value;
                        console.log('✅ Dokument načten!');
                        // Zobrazení obsahu s animací psaní
                        this.setupContent(html);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('❌ Chyba při načítání dokumentu:', error_1);
                        errorMessage = "Neznámá chyba";
                        if (error_1 instanceof Error) {
                            errorMessage = error_1.message;
                        }
                        else if (typeof error_1 === 'string') {
                            errorMessage = error_1;
                        }
                        this.contentContainer.innerHTML = "\n                <p style=\"color: #ff5555;\">\n                    \u274C Chyba p\u0159i na\u010D\u00EDt\u00E1n\u00ED dokumentu: ".concat(errorMessage, "\n                </p>\n            ");
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DocumentLoader.setupContent = function (html) {
        var _this = this;
        // Vytvoříme dočasný element pro manipulaci s HTML
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        // Najdeme všechny důležité elementy
        var allElements = Array.from(tempDiv.children);
        var currentChapter = 'Úvod';
        // Projdeme všechny elementy a připravíme je pro psaní
        allElements.forEach(function (el, index) {
            var tagName = el.tagName.toLowerCase();
            var isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName);
            // Vytvoříme nový element
            var newEl = document.createElement(tagName);
            // Pro nadpisy vytvoříme kotvu a přidáme do obsahu
            if (isHeading) {
                currentChapter = el.textContent || "Kapitola ".concat(index + 1);
                var anchor_1 = "chapter-".concat(index);
                newEl.id = anchor_1;
                newEl.classList.add('chapter-heading');
                // Přidáme do obsahu
                var level = parseInt(tagName[1]) || 1;
                var tocItem = document.createElement('a');
                tocItem.href = "#".concat(anchor_1);
                tocItem.textContent = currentChapter;
                tocItem.style.marginLeft = "".concat((level - 1) * 1, "rem");
                tocItem.style.display = 'block';
                tocItem.style.color = '#00ff00';
                tocItem.style.textDecoration = 'none';
                tocItem.onclick = function (e) {
                    e.preventDefault();
                    _this.jumpToChapter(anchor_1);
                    return false;
                };
                _this.tocContainer.appendChild(tocItem);
            }
            // Uložíme původní obsah
            newEl.setAttribute('data-original-text', el.innerHTML);
            newEl.innerHTML = '';
            newEl.style.opacity = '0';
            newEl.style.transition = 'opacity 0.3s';
            // Přidáme do dokumentu
            _this.contentContainer.appendChild(newEl);
            _this.elementsToType.push(newEl);
        });
        // Spustíme psaní prvního elementu
        if (this.elementsToType.length > 0) {
            this.typeNextElement();
        }
    };
    DocumentLoader.jumpToChapter = function (chapterId) {
        var element = document.getElementById(chapterId);
        if (element) {
            // Najdeme index kapitoly
            var chapterIndex = this.elementsToType.findIndex(function (el) { return el.id === chapterId; });
            if (chapterIndex !== -1) {
                // Zastavíme aktuální psaní
                this.currentElementIndex = chapterIndex;
                // Zobrazíme všechny předchozí elementy
                for (var i = 0; i < this.elementsToType.length; i++) {
                    var el = this.elementsToType[i];
                    if (i < chapterIndex) {
                        // Pro již napsaný text
                        el.style.opacity = '1';
                        el.innerHTML = el.getAttribute('data-original-text') || '';
                        this.applyEffects(el);
                    }
                    else if (i === chapterIndex) {
                        // Pro aktuální kapitolu
                        el.style.opacity = '0.9';
                        el.innerHTML = '';
                        this.typeText(el, el.getAttribute('data-original-text') || '', 0);
                    }
                    else {
                        // Pro následující kapitoly
                        el.style.opacity = '0';
                        el.innerHTML = '';
                    }
                }
                // Scroll k vybrané kapitole
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };
    DocumentLoader.typeNextElement = function () {
        if (this.currentElementIndex < this.elementsToType.length) {
            var element = this.elementsToType[this.currentElementIndex];
            var originalText = element.getAttribute('data-original-text') || '';
            element.style.opacity = '0.9';
            this.typeText(element, originalText, 0);
        }
    };
    DocumentLoader.typeText = function (element, text, index) {
        var _this = this;
        if (index < text.length) {
            // Přidáme znak
            element.innerHTML = text.substring(0, index + 1);
            // Náhodné zpoždění pro přirozenější psaní (rychlejší pro mezery)
            var isSpace = text[index] === ' ';
            var delay = isSpace ? 5 : Math.random() * 15 + 20; // Zrychlené psaní
            // Častější a výraznější glitch efekt při psaní (10% šance)
            if (!isSpace && Math.random() < 0.1) {
                var glitchChars = '!@#$%^&*()_+{}|:"<>?~`';
                var glitchLength = 3 + Math.floor(Math.random() * 8); // Více náhodných znaků
                var glitchText = '';
                // Vytvoříme delší a výraznější glitch efekt
                for (var i = 0; i < glitchLength; i++) {
                    glitchText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                }
                var glitchSpan_1 = document.createElement('span');
                glitchSpan_1.className = 'glitch-char';
                glitchSpan_1.textContent = glitchText;
                glitchSpan_1.style.color = '#ff00ff';
                glitchSpan_1.style.textShadow = '0 0 5px #ff00ff';
                element.appendChild(glitchSpan_1);
                // Kratší zpoždění pro rychlejší psaní
                setTimeout(function () {
                    if (element.contains(glitchSpan_1)) {
                        element.removeChild(glitchSpan_1);
                    }
                    setTimeout(function () { return _this.typeText(element, text, index + 1); }, 10);
                }, 30 + Math.random() * 50);
            }
            else {
                setTimeout(function () { return _this.typeText(element, text, index + 1); }, delay);
            }
        }
        else {
            // Po dokončení psaní zobrazíme element plně
            element.style.opacity = '1';
            this.applyEffects(element);
            // Po krátké pauze začneme psát další element
            this.currentElementIndex++;
            var isHeading = element.classList.contains('chapter-heading');
            setTimeout(function () { return _this.typeNextElement(); }, isHeading ? 500 : 100);
        }
    };
    DocumentLoader.applyEffects = function (element) {
        // Efekty pro kurzívu
        var italicElements = element.querySelectorAll('em, i');
        italicElements.forEach(function (el) {
            el.classList.add('glow-text');
            var delay = Math.random() * 0.5;
            el.style.animationDelay = "".concat(delay, "s");
        });
        // Efekty pro text v závorkách
        var speechElements = element.querySelectorAll('.speech-text');
        speechElements.forEach(function (el) {
            el.classList.add('speech-effect');
        });
        // Náhodné glitchování slov
        this.setupWordGlitch(element);
        // Zásadní kapitoly pro lore - přidání ASCII artu
        var loreKeywords = ['NULL', 'SYNTHOMA', 'realita', 'anomálie', 'kód'];
        var isLoreChapter = loreKeywords.some(function (keyword) { var _a; return (_a = element.textContent) === null || _a === void 0 ? void 0 : _a.includes(keyword); });
        if (isLoreChapter && Math.random() < 0.25) {
            this.showAsciiArt();
        }
        // Náhodné zobrazení chybových hlášek
        if (Math.random() < 0.1) {
            this.showSystemMessage();
        }
    };
    DocumentLoader.showAsciiArt = function () {
        var asciiArts = [
            "\n<pre style=\"color: #00ff00; opacity: 0.2; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1; font-size: 8px; text-align: center;\">\n  _   _   _   _   _   _   _   _ \n /  /  /  /  /  /  /  /  \n( S | Y | N | T | H | O | M | A )\n _/ _/ _/ _/ _/ _/ _/ _/ \n</pre>\n            ",
            "\n<pre style=\"color: #00ff00; opacity: 0.2; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1; font-size: 8px; text-align: center;\">\n  [01010011 01011001 01001110]\n  [01010100 01001000 01001111]\n  [01001101 01000001 00111111]\n</pre>\n            "
        ];
        var art = asciiArts[Math.floor(Math.random() * asciiArts.length)];
        var artContainer = document.createElement('div');
        artContainer.innerHTML = art;
        document.body.appendChild(artContainer);
        setTimeout(function () {
            document.body.removeChild(artContainer);
        }, 1500 + Math.random() * 2000);
    };
    DocumentLoader.showSystemMessage = function () {
        var messages = [
            'VAROVÁNÍ: Detekována anomálie v datovém proudu...',
            'NULL: \'Realita je jen zastaralý protokol.\'',
            'Systémová integrita: 98.7%... Rekalibrace...',
            'Memory leak v sektoru 7G... Ignoruji...',
            'Chyba: Pokus o čtení z nealokované paměti. Adresa: 0xDEADBEEF'
        ];
        var message = messages[Math.floor(Math.random() * messages.length)];
        var msgContainer = document.createElement('div');
        msgContainer.className = 'system-message';
        msgContainer.textContent = message;
        document.body.appendChild(msgContainer);
        setTimeout(function () {
            msgContainer.style.opacity = '0';
            setTimeout(function () {
                document.body.removeChild(msgContainer);
            }, 1000);
        }, 3000 + Math.random() * 3000);
    };
    DocumentLoader.setupWordGlitch = function (element) {
        var mainGlitchInterval = null;
        var cleanup = function () {
            if (mainGlitchInterval)
                clearInterval(mainGlitchInterval);
            mainGlitchInterval = null;
        };
        var glitchWord = function (word) {
            var glitchChars = '!@#$%^&*()_+{}|:"<>?~`';
            return word.split('').map(function (char) { return (char.trim() === '' ? char : glitchChars[Math.floor(Math.random() * glitchChars.length)]); }).join('');
        };
        var findWords = function () {
            var words = [];
            var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
                acceptNode: function (node) {
                    if (node.nodeValue && node.nodeValue.trim().length > 2 && node.parentNode && !node.parentNode.nodeName.match(/^(H[1-6]|A|SCRIPT|STYLE)$/)) {
                        if (node.parentNode.classList && !node.parentNode.classList.contains('glitch-word')) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    }
                    return NodeFilter.FILTER_REJECT;
                }
            });
            var currentNode;
            while (currentNode = walker.nextNode()) {
                var text = currentNode.nodeValue || '';
                var wordRegex = /\b\w{3,}\b/g; // Slova s alespoň 3 znaky
                var match = void 0;
                while ((match = wordRegex.exec(text))) {
                    words.push({ node: currentNode, startIndex: match.index, endIndex: match.index + match[0].length });
                }
            }
            return words;
        };
        var triggerGlitch = function () {
            var words = findWords();
            if (words.length === 0)
                return;
            var _a = words[Math.floor(Math.random() * words.length)], node = _a.node, startIndex = _a.startIndex, endIndex = _a.endIndex;
            var range = document.createRange();
            range.setStart(node, startIndex);
            range.setEnd(node, endIndex);
            var originalWord = range.toString();
            if (originalWord.trim().length < 3)
                return;
            var span = document.createElement('span');
            span.className = 'glitch-word';
            try {
                range.surroundContents(span);
                var blinkCount_1 = 0;
                var maxBlinks_1 = 4 + Math.floor(Math.random() * 4); // 4-7 blinks
                var blinkInterval_1 = setInterval(function () {
                    if (!document.body.contains(span) || blinkCount_1 >= maxBlinks_1) {
                        clearInterval(blinkInterval_1);
                        var parent_1 = span.parentNode;
                        if (parent_1) {
                            var textNode = document.createTextNode(originalWord);
                            parent_1.replaceChild(textNode, span);
                            parent_1.normalize();
                        }
                        return;
                    }
                    span.textContent = blinkCount_1 % 2 === 0 ? glitchWord(originalWord) : originalWord;
                    blinkCount_1++;
                }, 80); // Rychlejší blikání
            }
            catch (e) {
                // Ignorovat chyby, pokud se nepodaří obalit (stává se)
            }
        };
        var startGlitching = function () {
            cleanup();
            mainGlitchInterval = window.setInterval(function () {
                if (document.body.contains(element)) {
                    triggerGlitch();
                }
                else {
                    cleanup();
                }
            }, 1500 + Math.random() * 2000); // Častější spouštění
        };
        startGlitching();
        // Observer pro restart, pokud se změní obsah
        var observer = new MutationObserver(function () {
            startGlitching();
        });
        observer.observe(element, { childList: true, subtree: true });
        // Cleanup, když element zmizí
        var disconnectObserver = new MutationObserver(function () {
            if (!document.body.contains(element)) {
                cleanup();
                observer.disconnect();
                disconnectObserver.disconnect();
                window.removeEventListener('beforeunload', cleanup);
            }
        });
        disconnectObserver.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('beforeunload', cleanup);
    };
    DocumentLoader.initialize = function () {
        console.log('🖥️ Inicializace DocumentLoader...');
        var appContainer = document.getElementById('app');
        if (!appContainer) {
            console.error('❌ Element #app nenalezen!');
            return;
        }
        // Vytvoříme základní strukturu
        appContainer.innerHTML = "\n            <div id=\"book-container\" style=\"max-width: 800px; margin: 0 auto; padding: 20px; font-family: 'Courier New', monospace; color: #ffffff; background: #111; line-height: 1.6;\">\n                <h1 style=\"color: #00ff00; text-align: center; margin-bottom: 2rem;\">SYNTHOMA</h1>\n                <div id=\"content-container\"></div>\n            </div>\n        ";
        // Načtení dokumentu
        var contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            this.loadDocument(contentContainer);
        }
    };
    DocumentLoader.currentElementIndex = 0;
    DocumentLoader.elementsToType = [];
    return DocumentLoader;
}());
// Přidáme styly pro efekty
var style = document.createElement('style');
style.textContent = "\n    .glow-text {\n        color: #00ff88;\n        text-shadow: 0 0 5px #00ff88, 0 0 10px #00ff88;\n    }\n    \n    .speech-effect {\n        color: #88aaff;\n        font-style: italic;\n    }\n    \n    .glitch-char {\n        color: #ff00ff;\n        opacity: 0.7;\n    }\n    \n    .chapter-heading {\n        margin-top: 2rem;\n        color: #00ffff;\n        border-bottom: 1px solid #00ffff;\n        padding-bottom: 0.5rem;\n    }\n    \n    #toc a:hover {\n        color: #ffffff !important;\n        text-decoration: underline !important;\n    }\n";
document.head.appendChild(style);
// Spuštění po načtení stránky
document.addEventListener('DOMContentLoaded', function () {
    DocumentLoader.initialize();
});
