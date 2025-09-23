// NICU Rounds App - Language Module
// Handles translation between English and Swahili

const Language = {
    current: 'en',
    translations: {},

    // Initialize language system
    async init() {
        this.current = Storage.getLanguage() || 'en';
        await this.loadTranslations();
        this.applyTranslations();
    },

    // Load translation files
    async loadTranslations() {
        try {
            const enResponse = await fetch('languages/en.json');
            const swResponse = await fetch('languages/sw.json');
            
            this.translations.en = await enResponse.json();
            this.translations.sw = await swResponse.json();
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Fallback to basic translations
            this.translations = {
                en: { 'app.title': 'NICU Rounds' },
                sw: { 'app.title': 'NICU Rounds' }
            };
        }
    },

    // Get translated text
    t(key) {
        const translation = this.translations[this.current]?.[key];
        return translation || key;
    },

    // Switch language
    setLanguage(lang) {
        this.current = lang;
        Storage.setLanguage(lang);
        this.applyTranslations();
        this.updateLanguageButton();
    },

    // Toggle between English and Swahili
    toggle() {
        const newLang = this.current === 'en' ? 'sw' : 'en';
        this.setLanguage(newLang);
    },

    // Apply translations to all elements with data-translate attribute
    applyTranslations() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = this.t(key);
        });
    },

    // Update language toggle button
    updateLanguageButton() {
        const langButton = document.getElementById('currentLang');
        if (langButton) {
            langButton.textContent = this.current.toUpperCase();
        }
    },

    // Get current language name
    getCurrentLanguageName() {
        return this.current === 'en' ? 'English' : 'Kiswahili';
    }
};

// Make Language available globally
window.Language = Language;
