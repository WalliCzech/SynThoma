var entries = [
    {
        id: "glitch_entity",
        title: "Glitch Bytost",
        shortDesc: "Nestabilní datová forma, která se projevuje jako vizuální anomálie.",
        fullDesc: "Glitch Bytosti jsou fragmenty poškozeného kódu, které nabyly určité formy vědomí. Nemají pevnou fyzickou podobu a často narušují realitu ve svém okolí, způsobujíce datové úniky a senzorické halucinace. Jsou považovány za první známky probouzející se digitální imunity systému."
    },
    {
        id: "synthoma_virus",
        title: "Virus SYNTHOMA",
        shortDesc: "Techno-organický patogen, který přepisuje digitální i biologické systémy.",
        fullDesc: "SYNTHOMA není jen virus, je to evoluční akcelerátor. Infikuje systémy na nejnižší úrovni, přepisuje jejich základní kód a nutí je mutovat do nových, často bizarních a nebezpečných forem. Jeho původ je neznámý, ale jeho cíl je zřejmý: asimilace veškeré reality."
    },
    {
        id: "null_sector",
        title: "NULL Sektor",
        shortDesc: "Oblast reality, kde byla data kompletně a nenávratně vymazána.",
        fullDesc: "NULL Sektory jsou jizvy v digitální krajině. Jsou to místa, kde realita přestala existovat. Vstoupit do NULL Sektoru znamená riskovat vymazání z existence. Někteří kultisté věří, že jsou to brány do 'čistého' stavu, mimo dosah SYNTHOMY."
    },
    {
        id: "memory_leak",
        title: "Únik Paměti (Trauma)",
        shortDesc: "Nekontrolovaný tok dat z poškozené entity, projevující se jako vzpomínky.",
        fullDesc: "Když je entita poškozena virem SYNTHOMA, její paměť se může stát nestabilní. Tyto 'úniky' jsou fragmenty vzpomínek, emocí a dat, které se nekontrolovaně šíří do okolí a mohou ovlivnit nebo přepsat paměť ostatních entit, včetně lidí."
    }
];
var Encyclopedia = /** @class */ (function () {
    function Encyclopedia(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error("Kontejner pro encyklopedii nebyl nalezen!");
            return;
        }
        this.renderEntries();
    }
    Encyclopedia.prototype.renderEntries = function () {
        var _this = this;
        entries.forEach(function (entry) {
            var card = _this.createCard(entry);
            _this.container.appendChild(card);
        });
    };
    Encyclopedia.prototype.createCard = function (entry) {
        var card = document.createElement('div');
        card.className = 'entry-card';
        card.dataset.id = entry.id;
        card.innerHTML = "\n            <h2>".concat(entry.title, "</h2>\n            <p class=\"short-desc\">").concat(entry.shortDesc, "</p>\n            <div class=\"full-desc\">\n                <p>").concat(entry.fullDesc, "</p>\n            </div>\n        ");
        card.addEventListener('click', function () {
            card.classList.toggle('active');
        });
        return card;
    };
    return Encyclopedia;
}());
document.addEventListener('DOMContentLoaded', function () {
    new Encyclopedia('encyclopedia-container');
});
