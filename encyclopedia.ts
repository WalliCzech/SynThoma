interface EncyclopediaEntry {
    id: string;
    title: string;
    shortDesc: string;
    fullDesc: string;
}

const entries: EncyclopediaEntry[] = [
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

class Encyclopedia {
    private container: HTMLElement;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
        if (!this.container) {
            console.error("Kontejner pro encyklopedii nebyl nalezen!");
            return;
        }

        this.renderEntries();
    }

    private renderEntries(): void {
        entries.forEach(entry => {
            const card = this.createCard(entry);
            this.container.appendChild(card);
        });
    }

    private createCard(entry: EncyclopediaEntry): HTMLElement {
        const card = document.createElement('div');
        card.className = 'entry-card';
        card.dataset.id = entry.id;

        card.innerHTML = `
            <h2>${entry.title}</h2>
            <p class="short-desc">${entry.shortDesc}</p>
            <div class="full-desc">
                <p>${entry.fullDesc}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            card.classList.toggle('active');
        });

        return card;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Encyclopedia('encyclopedia-container');
});
