

export type Instrument = { id: number; value: string };

const DB_NAME = 'QuanthiveDB';
const DB_VERSION = 1; // Incremented version for schema change
const STORE_NAME = 'instruments';

class TrieNode {
    children: Map<string, TrieNode> = new Map();
    rowIds: Set<number> = new Set();
}

class Trie {
    private root: TrieNode = new TrieNode();

    insert(word: string, rowId: number): void {
        let node = this.root;
        for (const char of word) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char)!;
        }
        node.rowIds.add(rowId);
    }

    search(prefix: string): Set<number> {
        let node = this.root;
        for (const char of prefix) {
            if (!node.children.has(char)) {
                return new Set();
            }
            node = node.children.get(char)!;
        }

        const allIds: Set<number> = new Set();
        this.collectAllIds(node, allIds);
        return allIds;
    }

    private collectAllIds(node: TrieNode, allIds: Set<number>): void {
        node.rowIds.forEach(id => allIds.add(id));
        for (const child of node.children.values()) {
            this.collectAllIds(child, allIds);
        }
    }
}


class IndexedDBService {
    private db: IDBDatabase | null = null;
    private trie = new Trie();
    private nGramIndex: Map<string, Set<number>> = new Map();
    private readonly NGRAM_SIZE = 1; // Using unigrams for better fuzzy matching on transpositions
    private isDataLoaded = false; // Flag to prevent duplicate data loading
    private dataLoadPromise: Promise<void> | null = null; // Promise to track ongoing data load

    public initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                reject(new Error('IndexedDB not supported'));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(new Error('Error opening database'));
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                let store: IDBObjectStore;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                } else {
                    store = (event.currentTarget as any).transaction.objectStore(STORE_NAME);
                }
                
                // Remove the obsolete 'status' index if it exists from the previous version
                if (store.indexNames.contains('status')) {
                    store.deleteIndex('status');
                }
            };
            request.onsuccess = async (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                try {
                    const count = await this.getRowCount();
                    if (count > 0) {
                        await this.buildIndexes();
                    }
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
        });
    }

    private tokenize(value: any): string[] {
        return String(value).toLowerCase().match(/\b(\w+)\b/g) || [];
    }

    public buildIndexes(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log("Building search indexes (Trie and N-gram)...");
            this.trie = new Trie();
            this.nGramIndex = new Map();
            const store = this.getStore('readonly');
            const request = store.openCursor();

            request.onerror = () => reject(request.error);
            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    const row: Instrument = cursor.value;
                    const words = this.tokenize(row.value);
                    words.forEach(word => {
                        // 1. Build Trie for prefix search
                        this.trie.insert(word, row.id);

                        // 2. Build N-gram index for fast fuzzy search
                        if (word.length >= this.NGRAM_SIZE) {
                            for (let i = 0; i <= word.length - this.NGRAM_SIZE; i++) {
                                const nGram = word.substring(i, i + this.NGRAM_SIZE);
                                if (!this.nGramIndex.has(nGram)) {
                                    this.nGramIndex.set(nGram, new Set());
                                }
                                this.nGramIndex.get(nGram)!.add(row.id);
                            }
                        }
                    });
                    cursor.continue();
                } else {
                    console.log("Indexes built successfully.");
                    resolve();
                }
            };
        });
    }

    private getStore(mode: IDBTransactionMode): IDBObjectStore {
        if (!this.db) {
            throw new Error('Database not initialized.');
        }
        return this.db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
    }

    public async bulkAddData(data: string[]): Promise<void> {
        // If data is already loaded or currently loading, wait for it or skip
        if (this.isDataLoaded) {
            console.log('Data already loaded, skipping bulkAddData');
            return;
        }
        
        if (this.dataLoadPromise) {
            console.log('Data load in progress, waiting...');
            return this.dataLoadPromise;
        }

        // Create a promise to track this data load
        this.dataLoadPromise = (async () => {
            try {
                // First, clear existing data to prevent duplicates
                await this.clearData();
                
                await new Promise<void>((resolve, reject) => {
                    if (!this.db) {
                        reject(new Error('Database not initialized.'));
                        return;
                    }
                    const transaction = this.db.transaction(STORE_NAME, 'readwrite');
                    const store = transaction.objectStore(STORE_NAME);

                    transaction.onerror = () => reject(transaction.error);
                    transaction.oncomplete = () => resolve();

                    data.forEach(item => store.add({ value: item }));
                });
                await this.buildIndexes(); // Re-build indexes after adding data
                this.isDataLoaded = true;
                console.log(`Successfully loaded ${data.length} items into IndexedDB`);
            } catch (error) {
                this.dataLoadPromise = null; // Reset on error so it can be retried
                throw error;
            }
        })();

        return this.dataLoadPromise;
    }

    public clearData(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized.'));
            }
            const transaction = this.db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.clear();

            transaction.oncomplete = () => {
                this.trie = new Trie(); // Clear indexes after data is confirmed cleared
                this.nGramIndex = new Map();
                this.isDataLoaded = false; // Reset the flag when data is cleared
                this.dataLoadPromise = null; // Reset the promise
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    }
    
    public getRowCount(): Promise<number> {
        return new Promise((resolve, reject) => {
            const store = this.getStore('readonly');
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    public getRowsByIds(ids: number[]): Promise<Instrument[]> {
        if (!this.db || ids.length === 0) {
            return Promise.resolve([]);
        }
        const transaction = this.db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
    
        const promises = ids.map(id => {
            return new Promise<Instrument | undefined>((resolve, reject) => {
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
    
        return Promise.all(promises).then(results => 
            results.filter((r): r is Instrument => r !== undefined)
        );
    }

    private calculateScore(row: Instrument, searchTerm: string): number {
        const searchTokens = this.tokenize(searchTerm);
        if (searchTokens.length === 0) return 0;
    
        let score = 0;
        const fullText = row.value.toLowerCase();
    
        for (const token of searchTokens) {
            const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
            const exactRegex = new RegExp(`\\b${escapedToken}\\b`, 'gi');
            const exactMatches = fullText.match(exactRegex);
            if (exactMatches) {
                score += exactMatches.length * 10;
            }
    
            const prefixRegex = new RegExp(`\\b${escapedToken}`, 'gi');
            const prefixMatches = fullText.match(prefixRegex);
            if (prefixMatches) {
                score += (prefixMatches.length - (exactMatches?.length || 0)) * 5;
            }
        }
    
        // Add a positional bonus if the search term is a prefix of the value.
        if (fullText.startsWith(searchTerm.toLowerCase())) {
            score *= 1.5;
        }

        if (fullText.length > 0) {
            score /= Math.log1p(fullText.length * 0.1);
        }
    
        return score;
    }

    /**
     * Calculates the Damerau-Levenshtein distance between two strings.
     */
    private levenshtein(a: string, b: string): number {
        const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

        for (let i = 0; i <= a.length; i++) { matrix[i][0] = i; }
        for (let j = 0; j <= b.length; j++) { matrix[0][j] = j; }

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,         // Deletion
                    matrix[i][j - 1] + 1,         // Insertion
                    matrix[i - 1][j - 1] + cost   // Substitution
                );
                if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                    matrix[i][j] = Math.min(
                        matrix[i][j],
                        matrix[i - 2][j - 2] + 1  // Transposition
                    );
                }
            }
        }
        return matrix[a.length][b.length];
    }
    
    /**
     * Calculates the Sørensen-Dice coefficient between the character sets of two strings.
     */
    private sorensenDice(a: string, b: string): number {
        if (!a || !b) return 0;
        const setA = new Set(a);
        const setB = new Set(b);
        const intersection = new Set([...setA].filter(x => setB.has(x)));
        const dice = (2 * intersection.size) / (setA.size + setB.size);
        return isNaN(dice) ? 0 : dice;
    }


    private calculateFuzzyScore(row: Instrument, searchTerm: string): number {
        const lowerSearchTerm = searchTerm.toLowerCase();
        if (!lowerSearchTerm) return 0;
        let bestScore = 0;
    
        const stringValue = row.value.toLowerCase();
        const words = this.tokenize(stringValue);
        const candidates = [...new Set([stringValue, ...words])];
    
        for (const candidateWord of candidates) {
            if (!candidateWord) continue;
            
            const prefix = candidateWord.substring(0, lowerSearchTerm.length);
            const distance = this.levenshtein(lowerSearchTerm, prefix);
            
            // Allow for up to 50% errors for flexibility, especially on short words
            const maxDistance = Math.floor(lowerSearchTerm.length * 0.5);
    
            if (distance <= maxDistance) {
                // 1. Core score is now based on character set similarity (Dice coefficient).
                // This is great at detecting when the right letters are present, even with typos.
                const diceScore = this.sorensenDice(lowerSearchTerm, prefix);
                let score = diceScore * 3.0; // Give this a very high weight.
                
                // 2. HUGE bonus if the search term's first char matches the candidate's.
                if (lowerSearchTerm[0] === candidateWord[0]) {
                    score += 1.0; 
                }

                // 3. Bonus for an initial unbroken sequence of matching characters.
                let streak = 0;
                for (let i = 0; i < Math.min(lowerSearchTerm.length, candidateWord.length); i++) {
                    if (lowerSearchTerm[i] === candidateWord[i]) {
                        streak++;
                    } else {
                        break;
                    }
                }
                score += streak * 0.1;

                // 4. Positional bonus: If the matched word is at the start of the entire field value.
                if (stringValue.startsWith(candidateWord)) {
                    score += 0.5;
                }

                // 5. Use Levenshtein distance as a small penalty/tie-breaker.
                // A smaller distance is better, so we subtract it from the score.
                if (lowerSearchTerm.length > 0) {
                    score -= (distance / lowerSearchTerm.length) * 0.1;
                }
                
                if (score > bestScore) {
                    bestScore = score;
                }
            }
        }
        return bestScore;
    }

    private async fuzzySearchFallback(term: string, limit: number): Promise<Instrument[]> {
        const lowerTerm = term.toLowerCase();
        if (lowerTerm.length < this.NGRAM_SIZE) return [];

        const candidateScores: Map<number, number> = new Map();
        
        const searchNGrams = new Set<string>();
        for (let i = 0; i <= lowerTerm.length - this.NGRAM_SIZE; i++) {
            searchNGrams.add(lowerTerm.substring(i, i + this.NGRAM_SIZE));
        }

        if (searchNGrams.size === 0) return [];
        
        for (const nGram of searchNGrams) {
            const rowIds = this.nGramIndex.get(nGram);
            if (rowIds) {
                for (const id of rowIds) {
                    candidateScores.set(id, (candidateScores.get(id) || 0) + 1);
                }
            }
        }

        if (candidateScores.size === 0) return [];

        const sortedCandidates = Array.from(candidateScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 500);

        const candidateIds = sortedCandidates.map(entry => entry[0]);
        if (candidateIds.length === 0) return [];

        const candidateRows = await this.getRowsByIds(candidateIds);
        
        const FUZZY_SCORE_THRESHOLD = 0.6; 
        const scoredRows = candidateRows.map(row => ({
            row,
            score: this.calculateFuzzyScore(row, term)
        })).filter(item => item.score >= FUZZY_SCORE_THRESHOLD);

        scoredRows.sort((a, b) => b.score - a.score);
        return scoredRows.slice(0, limit).map(item => item.row);
    }

    public async searchData(term: string, limit: number = 5): Promise<Instrument[]> {
        if (!term.trim()) return [];

        const searchTokens = this.tokenize(term);
        if (searchTokens.length === 0) return [];
    
        let matchingIds: Set<number> = new Set();
        let isFirstToken = true;
    
        for (const token of searchTokens) {
            const idsForToken = this.trie.search(token);
            if (isFirstToken) {
                matchingIds = idsForToken;
                isFirstToken = false;
            } else {
                matchingIds = new Set([...matchingIds].filter(id => idsForToken.has(id)));
            }
            if (matchingIds.size === 0) break;
        }
    
        const finalIds = Array.from(matchingIds);
        
        if (finalIds.length > 0) {
            const rows = await this.getRowsByIds(finalIds);
            const scoredRows = rows.map(row => ({
                row,
                score: this.calculateScore(row, term),
            }));
            scoredRows.sort((a, b) => b.score - a.score);
            return scoredRows.slice(0, limit).map(item => item.row);
        } else {
            console.log("Trie search failed. Falling back to fast fuzzy search.");
            return this.fuzzySearchFallback(term, limit);
        }
    }
}

export const dbService = new IndexedDBService();
