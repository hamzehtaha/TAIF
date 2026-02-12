export class LocalStorageService {
    private static isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }

    static set(key: string, value: any) {
        if (!this.isBrowser()) return;
        localStorage.setItem(key, JSON.stringify(value));
    }

    static get(key: string): any {
        if (!this.isBrowser()) return null;
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    static setString(key: string, value: string) {
        if (!this.isBrowser()) return;
        localStorage.setItem(key, value);
    }

    static getString(key: string): string | null {
        if (!this.isBrowser()) return null;
        return localStorage.getItem(key);
    }

    static remove(key: string) {
        if (!this.isBrowser()) return;
        localStorage.removeItem(key);
    }
}