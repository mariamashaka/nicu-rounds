// NICU Rounds App - Main Application Logic

const App = {
    currentPage: 'patients',
    
    // Initialize the application
    async init() {
        console.log('Initializing NICU Rounds App...');
        
        // Initialize language system
        await Language.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial page
        this.loadPage('patients');
        
        console.log('App initialized successfully');
    },

    // Set up all event listeners
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.loadPage(page);
            });
        });

        // Language toggle button
        const langButton = document.getElementById('languageToggle');
        if (langButton) {
            langButton.addEventListener('click', () => {
                Language.toggle();
            });
        }

        // Add patient button
        const addButton = document.getElementById('addPatientBtn');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.showAddPatientForm();
            });
        }
    },

    // Load a specific page
    loadPage(pageName) {
        console.log('Loading page:', pageName);
        
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.page === pageName) {
                tab.classList.add('active');
            }
        });

        // Update current page
        this.currentPage = pageName;

        // Load page content
        const content = document.getElementById('appContent');
        
        switch(pageName) {
            case 'patients':
                this.renderPatientList(content);
                break;
            case 'archive':
                this.renderArchive(content);
                break;
            case 'statistics':
                this.renderStatistics(content);
                break;
            default:
                content.innerHTML = '<p>Page not found</p>';
        }
    },

    // Render patient list page
    renderPatientList(container) {
        const patients = Storage.getActivePatients();
        
        if (patients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2 data-translate="patients.empty_title">No Active Patients</h2>
                    <p data-translate="patients.empty_message">Click the + button below to add your first patient</p>
                </div>
            `;
            Language.applyTranslations();
            return;
        }

        let html = '<div class="patient-grid">';
        
        patients.forEach(patient => {
            const dol = Calculations.calculateDOL(patient.dateOfBirth);
            const dpa = Calculations.calculateDPA(patient.admissionDate);
            
            html += `
                <div class="patient-card card" onclick="App.openPatient('${patient.id}')">
                    <div class="patient-header">
                        <h3>${patient.name}</h3>
                        <span class="sex-badge ${patient.sex}">${patient.sex}</span>
                    </div>
                    <div class="patient-info">
                        <div class="info-row">
                            <span class="label">DOL:</span>
                            <span class="value">${dol}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">DPA:</span>
                            <span class="value">${dpa}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Birth Weight:</span>
                            <span class="value">${patient.birthWeight} kg</span>
                        </div>
                        ${patient.currentWeight ? `
                            <div class="info-row">
                                <span class="label">Current:</span>
                                <span class="value">${patient.currentWeight} kg</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },

    // Render archive page
    renderArchive(container) {
        const archived = Storage.getArchivedPatients();
        
        if (archived.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>No Archived Patients</h2>
                    <p>Discharged, transferred, or deceased patients will appear here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '<h2>Archive</h2><div class="archive-list">' + 
            archived.map(p => `
                <div class="archive-item card">
                    <h3>${p.name}</h3>
                    <p>Status: ${p.status}</p>
                    <p>Archived: ${Calculations.formatDate(p.archivedAt)}</p>
                </div>
            `).join('') + 
            '</div>';
    },

    // Render statistics page
    renderStatistics(container) {
        const allPatients = Storage.getPatients();
        const active = Storage.getActivePatients();
        const archived = Storage.getArchivedPatients();

        container.innerHTML = `
            <div class="statistics">
                <h2>Department Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-card card">
                        <div class="stat-value">${allPatients.length}</div>
                        <div class="stat-label">Total Patients</div>
                    </div>
                    <div class="stat-card card">
                        <div class="stat-value">${active.length}</div>
                        <div class="stat-label">Currently Active</div>
                    </div>
                    <div class="stat-card card">
                        <div class="stat-value">${archived.length}</div>
                        <div class="stat-label">Archived</div>
                    </div>
                </div>
            </div>
        `;
    },

    // Show add patient form
    showAddPatientForm() {
        AddPatientForm.show();
    },

    // Open patient detail page
    openPatient(patientId) {
        PatientCard.show(patientId);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
