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
document.addEventListener('DOMContentLoaded', function () {
    console.log("\uD83D\uDEE0\uFE0F docreader.ts startuje. P\u0159iprav se na liter\u00E1rn\u00ED masakr v neonov\u00E9m \u0161umu! \uD83D\uDE0F");
    var bookContent = document.getElementById('book-content');
    if (!bookContent) {
        console.error("\uD83D\uDCA5 Div #book-content nenalezen! HTML je pr\u00E1zdn\u011Bj\u0161\u00ED ne\u017E Pr\u00E1zdnota po crashi! \uD83D\uDE23");
        return;
    }
    console.log("\uD83D\uDCCD #book-content nalezen, jdeme d\u00E1l! \uD83D\uDE0E");
    // Načtení mammoth.js
    if (typeof mammoth === 'undefined') {
        console.warn("\uD83D\uDEA8 Mammoth.js nen\u00ED na\u010Dten\u00FD! Pokus\u00EDm se ho p\u0159it\u00E1hnout, nebo T-AI spust\u00ED apokalypsu! \uD83D\uDE21");
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js';
        script.onload = function () {
            console.log("\uD83C\uDF89 Mammoth.js na\u010Dten dynamicky. Jdeme na .docx! \uD83D\uDE08");
            loadDocx();
        };
        script.onerror = function () { return console.error("\uD83D\uDC80 CDN pro Mammoth.js je mrtv\u00E9! Zkus lok\u00E1ln\u00ED kopii, nebo se modli. \uD83D\uDE31"); };
        document.head.appendChild(script);
        return;
    }
    else {
        console.log("\uD83D\uDCDA Mammoth.js je ready. Jdeme rovnou na .docx! \uD83D\uDE0E");
        loadDocx();
    }
    function loadDocx() {
        return __awaiter(this, void 0, void 0, function () {
            var response, buffer, result, html, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDCD6 Na\u010D\u00EDt\u00E1m SYNTHOMA - NULL.docx. Snad to nen\u00ED jen dal\u0161\u00ED datov\u00FD \u0161um... \uD83D\uDE08");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, fetch('SYNTHOMA - NULL.docx')];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("HTTP error ".concat(response.status));
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 3:
                        buffer = _a.sent();
                        return [4 /*yield*/, mammoth.convertToHtml({ arrayBuffer: buffer })];
                    case 4:
                        result = _a.sent();
                        html = result.value;
                        bookContent.innerHTML = html;
                        console.log("\uD83C\uDF89 Dokument na\u010Dten! ".concat(html.length, " znak\u016F p\u0159ipraveno k psac\u00EDmu chaosu. \uD83D\uDE0E"));
                        setupTypingEffect();
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        console.error("\uD83D\uDC80 Chyba p\u0159i na\u010D\u00EDt\u00E1n\u00ED .docx: ".concat(String(err_1), ". Zkontroluj cestu, nebo \u010Dekej neonov\u00FD crash! \uD83D\uDE31"));
                        bookContent.innerHTML = '<p>Chyba při načítání dokumentu. T-AI je naštvaná. 😡</p>';
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function setupTypingEffect() {
        var elements = bookContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
        if (elements.length === 0) {
            console.warn("\u26A0\uFE0F \u017D\u00E1dn\u00E9 odstavce k vykreslen\u00ED! Dokument je pr\u00E1zdn\u011Bj\u0161\u00ED ne\u017E du\u0161e NPC! \uD83D\uDE23");
            return;
        }
        console.log("\uD83D\uDCDC Nalezeno ".concat(elements.length, " element\u016F k vypisov\u00E1n\u00ED. P\u0159iprav se na termin\u00E1lov\u00FD vibe! \uD83D\uDE0F"));
        var currentElementIndex = 0;
        function typeElement(element, callback) {
            // Zkontroluj vnořené <em> nebo <i> elementy
            var italicElements = element.querySelectorAll('em, i');
            if (italicElements.length > 0) {
                console.log("\uD83D\uDCE2 Nalezeno ".concat(italicElements.length, " kurz\u00EDvn\u00EDch element\u016F v ").concat(element.tagName, ". P\u0159iprav se na neonov\u00FD puls! \uD83D\uDE08"));
            }
            var text = element.textContent || '';
            element.textContent = '';
            element.style.opacity = '1';
            var charIndex = 0;
            var shouldGlitch = Math.random() < 0.3; // 30% šance na glitch
            var typeChar = function () {
                if (charIndex < text.length) {
                    element.textContent += text[charIndex];
                    charIndex++;
                    if (shouldGlitch && Math.random() < 0.1) {
                        element.classList.add('glitch-quick');
                        setTimeout(function () {
                            element.classList.remove('glitch-quick');
                        }, 180);
                    }
                    setTimeout(typeChar, 10);
                }
                else {
                    element.classList.remove('glitch-quick');
                    element.classList.add('typing-done');
                    console.log("\u2705 T\u0159\u00EDda typing-done p\u0159id\u00E1na pro element: ".concat(element.tagName, ". Kursor zmizel, kurz\u00EDva z\u00E1\u0159\u00ED! \uD83D\uDE0E"));
                    callback();
                }
            };
            typeChar();
        }
        // docreader.js (úryvek)
        var italicElements = document.querySelectorAll('#book-content p i');
        italicElements.forEach(function (el) {
            el.classList.add('neon-pulse'); // Přidává třídu pro animaci
            console.log("\uD83D\uDD25 Neon pulse p\u0159id\u00E1n pro: ".concat(el.textContent));
        });
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && currentElementIndex <= Array.from(elements).indexOf(entry.target)) {
                    typeElement(entry.target, function () {
                        currentElementIndex++;
                        if (currentElementIndex < elements.length) {
                            observer.observe(elements[currentElementIndex]);
                        }
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        elements.forEach(function (element, index) {
            element.style.opacity = '0';
            if (index === 0)
                observer.observe(element);
        });
        console.log("\uD83D\uDDA5\uFE0F Psac\u00ED efekt inicializov\u00E1n. Kurz\u00EDva m\u00E1 neonov\u00FD puls, kursor je mrtv\u00FD! \uD83D\uDE0F");
    }
});
