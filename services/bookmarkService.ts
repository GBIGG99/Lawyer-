
import { type SearchParams, type SearchResult, type Bookmark, type SearchBookmark } from '../types';
import { generateCacheKey } from './cacheService'; 

const BOOKMARKS_KEY = 'web-search-explorer-bookmarks';
const MAX_BOOKMARKS = 25; 

const prepareBookmarkForStorage = (bookmark: Bookmark): Bookmark => {
    const b = JSON.parse(JSON.stringify(bookmark));
    if (b.type === 'document_analysis' && b.result) {
        delete b.result.base64;
        delete b.result.mimeType;
        if (b.result.sourceDocumentText && b.result.sourceDocumentText.length > 50000) {
            b.result.sourceDocumentText = b.result.sourceDocumentText.substring(0, 50000) + '... [truncated]';
        }
    }
    return b;
};

/**
 * Retrieves all bookmarks from localStorage, sorted by the most recently saved.
 * Handles migration of legacy bookmarks (which lacked 'type').
 * @returns An array of Bookmark objects.
 */
export const getBookmarks = (): Bookmark[] => {
    try {
        const bookmarksJson = localStorage.getItem(BOOKMARKS_KEY);
        if (!bookmarksJson) return [];
        
        const rawBookmarks = JSON.parse(bookmarksJson);
        
        // Migration: Ensure legacy bookmarks get the 'search' type
        const bookmarks = rawBookmarks.map((b: any) => {
            if (!b.type) {
                return { ...b, type: 'search' } as SearchBookmark;
            }
            return b as Bookmark;
        });

        // Sort by most recently saved
        return bookmarks.sort((a: Bookmark, b: Bookmark) => b.savedAt - a.savedAt);
    } catch (error) {
        console.error('Failed to retrieve bookmarks:', error);
        return [];
    }
};

/**
 * Saves an array of bookmarks to localStorage.
 * @param bookmarks The array of Bookmark objects to save.
 */
const saveBookmarksToStorage = (bookmarks: Bookmark[]): void => {
    try {
        // Prune to MAX_BOOKMARKS
        const pruned = bookmarks
            .sort((a, b) => b.savedAt - a.savedAt)
            .slice(0, MAX_BOOKMARKS)
            .map(prepareBookmarkForStorage);
            
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(pruned));
    } catch (error) {
        if (error instanceof Error && error.name === 'QuotaExceededError') {
            console.error('LocalStorage quota exceeded. Attempting to prune further.');
            // Extreme prune: keep only 10
            try {
                const extremePruned = bookmarks
                    .sort((a, b) => b.savedAt - a.savedAt)
                    .slice(0, 10)
                    .map(prepareBookmarkForStorage);
                localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(extremePruned));
            } catch (innerError) {
                console.error('Critical failure: Could not save even minimal bookmarks.', innerError);
            }
        } else {
            console.error('Failed to save bookmarks:', error);
        }
    }
};

/**
 * Checks if a bookmark with the given key exists.
 * @param key The unique key to check.
 * @returns True if bookmarked, false otherwise.
 */
export const isBookmarkedByKey = (key: string): boolean => {
    const bookmarks = getBookmarks();
    return bookmarks.some(bookmark => bookmark.key === key);
};

// --- Key Generators ---

export const generateSearchKey = (params: SearchParams): string => {
    return generateCacheKey(params);
};

export const generateDocKey = (fileName: string): string => {
    return `doc_${fileName}`;
};

export const generateCrossRefKey = (fileAName: string, fileBName: string): string => {
    return `xref_${fileAName}_${fileBName}`;
};

// --- Checkers (Helpers for UI) ---

export const isSearchBookmarked = (params: SearchParams): boolean => {
    return isBookmarkedByKey(generateSearchKey(params));
};

export const isDocBookmarked = (fileName: string): boolean => {
    return isBookmarkedByKey(generateDocKey(fileName));
};

export const isCrossRefBookmarked = (fileAName: string, fileBName: string): boolean => {
    return isBookmarkedByKey(generateCrossRefKey(fileAName, fileBName));
};

// --- Actions ---

/**
 * Saves a bookmark. If it already exists, it does nothing.
 * @param bookmark The bookmark object to save.
 */
export const saveBookmark = (bookmark: Bookmark): void => {
    const bookmarks = getBookmarks();
    if (bookmarks.some(b => b.key === bookmark.key)) return;

    bookmarks.push(bookmark);
    saveBookmarksToStorage(bookmarks);
};

/**
 * Adds a new search bookmark (Wrapper for backward compatibility/ease of use).
 */
export const addBookmark = (params: SearchParams, result: SearchResult): void => {
    const key = generateSearchKey(params);
    if (isBookmarkedByKey(key)) return;

    const newBookmark: SearchBookmark = {
        key,
        type: 'search',
        params,
        result,
        savedAt: Date.now()
    };
    saveBookmark(newBookmark);
};

/**
 * Removes a bookmark from localStorage by its key.
 * @param key The unique key of the bookmark to remove.
 */
export const removeBookmark = (key: string): void => {
    let bookmarks = getBookmarks();
    bookmarks = bookmarks.filter(bookmark => bookmark.key !== key);
    saveBookmarksToStorage(bookmarks);
};

/**
 * Clears all bookmarks from localStorage.
 */
export const clearBookmarks = (): void => {
    try {
      localStorage.removeItem(BOOKMARKS_KEY);
      console.log('Bookmarks cleared.');
    } catch (error) {
      console.error('Failed to clear bookmarks:', error);
    }
};
