// NICU Rounds App - Data Storage Module
// Handles all data persistence using localStorage

const Storage = {
    // Keys for localStorage
    KEYS: {
        PATIENTS: 'nicu_patients',
        SETTINGS: 'nicu_settings',
        LANGUAGE: 'nicu_language'
    },

    // Get all patients
    getPatients() {
        const data = localStorage.getItem(this.KEYS.PATIENTS);
        return data ? JSON.parse(data) : [];
    },

    // Get single patient by ID
    getPatient(id) {
        const patients = this.getPatients();
        return patients.find(p => p.id === id);
    },

    // Save/Update patient
    savePatient(patient) {
        const patients = this.getPatients();
        const index = patients.findIndex(p => p.id === patient.id);
        
        if (index !== -1) {
            // Update existing patient
            patients[index] = patient;
        } else {
            // Add new patient
            patient.id = this.generateId();
            patient.createdAt = new Date().toISOString();
            patients.push(patient);
        }
        
        localStorage.setItem(this.KEYS.PATIENTS, JSON.stringify(patients));
        return patient;
    },

    // Delete patient
    deletePatient(id) {
        const patients = this.getPatients();
        const filtered = patients.filter(p => p.id !== id);
        localStorage.setItem(this.KEYS.PATIENTS, JSON.stringify(filtered));
    },

    // Get active patients only
    getActivePatients() {
        return this.getPatients().filter(p => p.status === 'active');
    },

    // Get archived patients
    getArchivedPatients() {
        return this.getPatients().filter(p => p.status !== 'active');
    },

    // Archive patient (discharge/transfer/death)
    archivePatient(id, status, reason) {
        const patient = this.getPatient(id);
        if (patient) {
            patient.status = status; // 'discharged', 'transferred', 'deceased'
            patient.archiveReason = reason;
            patient.archivedAt = new Date().toISOString();
            this.savePatient(patient);
        }
    },

    // Add round entry to patient
    addRound(patientId, roundData) {
        const patient = this.getPatient(patientId);
        if (patient) {
            if (!patient.rounds) patient.rounds = [];
            roundData.timestamp = new Date().toISOString();
            patient.rounds.push(roundData);
            this.savePatient(patient);
        }
    },

    // Get latest round for patient
    getLatestRound(patientId) {
        const patient = this.getPatient(patientId);
        if (patient && patient.rounds && patient.rounds.length > 0) {
            return patient.rounds[patient.rounds.length - 1];
        }
        return null;
    },

    // Settings management
    getSettings() {
        const data = localStorage.getItem(this.KEYS.SETTINGS);
        return data ? JSON.parse(data) : {
            language: 'en',
            theme: 'light',
            defaultView: 'patients'
        };
    },

    saveSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    },

    // Language preference
    getLanguage() {
        return localStorage.getItem(this.KEYS.LANGUAGE) || 'en';
    },

    setLanguage(lang) {
        localStorage.setItem(this.KEYS.LANGUAGE, lang);
    },

    // Generate unique ID
    generateId() {
        return 'patient_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Export data (for backup)
    exportData() {
        return {
            patients: this.getPatients(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    },

    // Import data (from backup)
    importData(data) {
        if (data.patients) {
            localStorage.setItem(this.KEYS.PATIENTS, JSON.stringify(data.patients));
        }
        if (data.settings) {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
        }
    },

    // Clear all data (use with caution!)
    clearAll() {
        if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
            localStorage.removeItem(this.KEYS.PATIENTS);
            localStorage.removeItem(this.KEYS.SETTINGS);
            localStorage.removeItem(this.KEYS.LANGUAGE);
            return true;
        }
        return false;
    }
};

// Make Storage available globally
window.Storage = Storage;
