import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    currentTheme = signal<'light' | 'dark'>('light');

    constructor() {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
    }

    setTheme(theme: 'light' | 'dark') {
        this.currentTheme.set(theme);
        localStorage.setItem('theme', theme);
        document.body.setAttribute('data-bs-theme', theme);
    }

    toggleTheme() {
        this.setTheme(this.currentTheme() === 'light' ? 'dark' : 'light');
    }
}
