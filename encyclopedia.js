// encyclopedia.ts
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
var Encyclopedia = /** @class */ (function () {
    function Encyclopedia() {
        this.entries = [];
        this.entryListContainer = document.getElementById('entry-list');
        this.entryDetailContainer = document.getElementById('entry-detail');
        this.searchBar = document.getElementById('search-bar');
        this.categoryFiltersContainer = document.getElementById('category-filters');
        if (!this.entryListContainer || !this.entryDetailContainer || !this.searchBar || !this.categoryFiltersContainer) {
            console.error("Chyba: Nepodařilo se najít potřebné elementy DOM pro encyklopedii.");
            return;
        }
    }
    Encyclopedia.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('encyclopedia.json')];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Chyba p\u0159i na\u010D\u00EDt\u00E1n\u00ED dat: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        this.entries = data.entries;
                        this.render();
                        this.setupEventListeners();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("FATÁLNÍ CHYBA SYSTÉMU ENCYKLOPEDIE:", error_1);
                        this.entryDetailContainer.innerHTML = "<p class=\"error-text\">SELH\u00C1N\u00CD ARCHIVU. Data jsou po\u0161kozena nebo nedostupn\u00E1.</p>";
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Encyclopedia.prototype.render = function (category, filter) {
        var _this = this;
        if (category === void 0) { category = 'all'; }
        if (filter === void 0) { filter = ''; }
        this.entryListContainer.innerHTML = '';
        var filteredEntries = this.entries.filter(function (entry) {
            var searchIn = "".concat(entry.title, " ").concat(entry.summary, " ").concat(entry.tags.join(' ')).toLowerCase();
            var matchesFilter = filter === '' || searchIn.includes(filter);
            var matchesCategory = category === 'all' || entry.category === category;
            return matchesFilter && matchesCategory;
        });
        if (filteredEntries.length === 0) {
            this.entryListContainer.innerHTML = '<p class="no-results">Žádné záznamy neodpovídají filtru.</p>';
        }
        else {
            filteredEntries.forEach(function (entry) {
                var entryElement = document.createElement('div');
                entryElement.className = 'entry-item';
                entryElement.innerHTML = "\n                    <div class=\"entry-item-title\">".concat(entry.title, "</div>\n                    <div class=\"entry-item-category\">").concat(entry.category, "</div>\n                ");
                entryElement.dataset.id = entry.id;
                _this.entryListContainer.appendChild(entryElement);
            });
        }
        this.renderCategoryFilters(category);
    };
    Encyclopedia.prototype.renderCategoryFilters = function (activeCategory) {
        var _this = this;
        if (activeCategory === void 0) { activeCategory = 'all'; }
        var categories = Array.from(new Set(this.entries.map(function (entry) { return entry.category; })));
        this.categoryFiltersContainer.innerHTML = '';
        var allButton = document.createElement('button');
        allButton.className = 'category-filter';
        if (activeCategory === 'all')
            allButton.classList.add('active');
        allButton.textContent = 'Vše';
        allButton.dataset.category = 'all';
        this.categoryFiltersContainer.appendChild(allButton);
        categories.forEach(function (category) {
            var button = document.createElement('button');
            button.className = 'category-filter';
            if (activeCategory === category)
                button.classList.add('active');
            button.textContent = category;
            button.dataset.category = category;
            _this.categoryFiltersContainer.appendChild(button);
        });
    };
    Encyclopedia.prototype.displayEntryDetail = function (id) {
        var entry = this.entries.find(function (e) { return e.id === id; });
        if (entry) {
            this.entryDetailContainer.innerHTML = "\n                <h2 class=\"glitch\">".concat(entry.title, "</h2>\n                <p><strong>Kategorie:</strong> ").concat(entry.category, "</p>\n                <div class=\"entry-content\">").concat(entry.content, "</div>\n                <div class=\"entry-tags\">\n                    ").concat(entry.tags.map(function (tag) { return "<span>#".concat(tag, "</span>"); }).join(' '), "\n                </div>\n            ");
        }
        else {
            this.entryDetailContainer.innerHTML = "<p class=\"placeholder-text\">Z\u00E1znam nenalezen. Mo\u017En\u00E1 byl pohlcen glitchem.</p>";
        }
    };
    Encyclopedia.prototype.setupEventListeners = function () {
        var _this = this;
        this.searchBar.addEventListener('input', function (e) {
            var _a;
            var filter = e.target.value.toLowerCase();
            var activeCategory = ((_a = _this.categoryFiltersContainer.querySelector('button.active')) === null || _a === void 0 ? void 0 : _a.dataset.category) || 'all';
            _this.render(activeCategory, filter);
        });
        this.entryListContainer.addEventListener('click', function (e) {
            var target = e.target.closest('.entry-item');
            if (target && target instanceof HTMLElement) {
                var id = target.dataset.id;
                if (id) {
                    _this.displayEntryDetail(id);
                    _this.entryListContainer.querySelectorAll('.entry-item').forEach(function (el) { return el.classList.remove('active'); });
                    target.classList.add('active');
                }
            }
        });
        this.categoryFiltersContainer.addEventListener('click', function (e) {
            var target = e.target;
            if (target.tagName === 'BUTTON' && target instanceof HTMLElement) {
                var category = target.dataset.category || 'all';
                var filter = _this.searchBar.value.toLowerCase();
                _this.render(category, filter);
            }
        });
    };
    return Encyclopedia;
}());
// Inicializace po načtení DOM
document.addEventListener('DOMContentLoaded', function () {
    var encyclopedia = new Encyclopedia();
    encyclopedia.initialize();
});
