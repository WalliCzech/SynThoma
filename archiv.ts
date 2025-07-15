// archiv.ts

interface ArchivEntry {
    id: string;
    title: string;
    category: string;
    summary: string;
    content: string;
    tags: string[];
}

class Archiv {
    private entries: ArchivEntry[] = [];
    private entryListContainer: HTMLElement;
    private entryDetailContainer: HTMLElement;
    private searchBar: HTMLInputElement;
    private categoryFiltersContainer: HTMLElement;

    constructor() {
        this.entryListContainer = document.getElementById('entry-list') as HTMLElement;
        this.entryDetailContainer = document.getElementById('entry-detail') as HTMLElement;
        this.searchBar = document.getElementById('search-bar') as HTMLInputElement;
        this.categoryFiltersContainer = document.getElementById('category-filters') as HTMLElement;

        if (!this.entryListContainer || !this.entryDetailContainer || !this.searchBar || !this.categoryFiltersContainer) {
            console.error("Chyba: Nepodařilo se najít potřebné elementy DOM pro encyklopedii.");
            return;
        }
    }

    async initialize(): Promise<void> {
        try {
            const response = await fetch('archiv.json');
            if (!response.ok) {
                throw new Error(`Chyba při načítání dat: ${response.statusText}`);
            }
            const data = await response.json();
            this.entries = data.entries;

            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error("FATÁLNÍ CHYBA SYSTÉMU ENCYKLOPEDIE:", error);
            this.entryDetailContainer.innerHTML = `<p class="error-text">SELHÁNÍ ARCHIVU. Data jsou poškozena nebo nedostupná.</p>`;
        }
    }

    private render(category: string = 'all', filter: string = ''): void {
        this.entryListContainer.innerHTML = '';
        const filteredEntries = this.entries.filter(entry => {
            const searchIn = `${entry.title} ${entry.summary} ${entry.tags.join(' ')}`.toLowerCase();
            const matchesFilter = filter === '' || searchIn.includes(filter);
            const matchesCategory = category === 'all' || entry.category === category;
            return matchesFilter && matchesCategory;
        });

        if (filteredEntries.length === 0) {
            this.entryListContainer.innerHTML = '<p class="no-results">Žádné záznamy neodpovídají filtru.</p>';
        } else {
            filteredEntries.forEach(entry => {
                const entryElement = document.createElement('div');
                entryElement.className = 'entry-item';
                entryElement.innerHTML = `
                    <div class="entry-item-title">${entry.title}</div>
                    <div class="entry-item-category">${entry.category}</div>
                `;
                entryElement.dataset.id = entry.id;
                this.entryListContainer.appendChild(entryElement);
            });
        }

        this.renderCategoryFilters(category);
    }

    private renderCategoryFilters(activeCategory: string = 'all'): void {
        const categories = Array.from(new Set(this.entries.map(entry => entry.category)));
        this.categoryFiltersContainer.innerHTML = '';
        
        const allButton = document.createElement('button');
        allButton.className = 'category-filter';
        if (activeCategory === 'all') allButton.classList.add('active');
        allButton.textContent = 'Vše';
        allButton.dataset.category = 'all';
        this.categoryFiltersContainer.appendChild(allButton);

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-filter';
            if (activeCategory === category) button.classList.add('active');
            button.textContent = category;
            button.dataset.category = category;
            this.categoryFiltersContainer.appendChild(button);
        });
    }

    private displayEntryDetail(id: string): void {
        const entry = this.entries.find(e => e.id === id);
        if (entry) {
            this.entryDetailContainer.innerHTML = `
                <h2 class="glitch">${entry.title}</h2>
                <p><strong>Kategorie:</strong> ${entry.category}</p>
                <div class="entry-content">${entry.content}</div>
                <div class="entry-tags">
                    ${entry.tags.map(tag => `<span>#${tag}</span>`).join(' ')}
                </div>
            `;
        } else {
            this.entryDetailContainer.innerHTML = `<p class="placeholder-text">Záznam nenalezen. Možná byl pohlcen glitchem.</p>`;
        }
    }

    private setupEventListeners(): void {
        this.searchBar.addEventListener('input', (e) => {
            const filter = (e.target as HTMLInputElement).value.toLowerCase();
            const activeCategory = (this.categoryFiltersContainer.querySelector('button.active') as HTMLElement)?.dataset.category || 'all';
            this.render(activeCategory, filter);
        });

        this.entryListContainer.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest('.entry-item');
            if (target && target instanceof HTMLElement) {
                const id = target.dataset.id;
                if (id) {
                    this.displayEntryDetail(id);
                    this.entryListContainer.querySelectorAll('.entry-item').forEach(el => el.classList.remove('active'));
                    target.classList.add('active');
                }
            }
        });

        this.categoryFiltersContainer.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'BUTTON' && target instanceof HTMLElement) {
                const category = target.dataset.category || 'all';
                const filter = this.searchBar.value.toLowerCase();
                this.render(category, filter);
            }
        });
    }
}

// Inicializace po načtení DOM
document.addEventListener('DOMContentLoaded', () => {
    const archiv = new Archiv();
    archiv.initialize();
});
