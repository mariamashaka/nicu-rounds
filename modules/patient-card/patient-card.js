// Patient Card Module - Individual patient view

const PatientCard = {
    currentPatientId: null,

    show(patientId) {
        this.currentPatientId = patientId;
        const patient = Storage.getPatient(patientId);
        
        if (!patient) {
            alert('Patient not found');
            return;
        }

        const content = document.getElementById('appContent');
        content.innerHTML = this.renderPatientCard(patient);
        Language.applyTranslations();
    },

    renderPatientCard(patient) {
        const dol = Calculations.calculateDOL(patient.dateOfBirth);
        const dpa = Calculations.calculateDPA(patient.admissionDate);
        const maturity = patient.gaWeeks ? Calculations.getMaturityCategory(patient.gaWeeks) : null;

        return `
            <div class="patient-detail">
                <!-- Header -->
                <div class="patient-detail-header">
                    <button class="btn btn-secondary" onclick="App.loadPage('patients')">
                        ← <span data-translate="common.back">Back to List</span>
                    </button>
                    <h1>${patient.name}</h1>
                </div>

                <!-- Patient Info Card -->
                <div class="card" style="margin-top: 1rem;">
                    <h2 data-translate="patient.info">Patient Information</h2>
                    <div class="patient-info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                        <div>
                            <div class="info-label" data-translate="patient.sex">Sex</div>
                            <div class="info-value">
                                <span class="sex-badge ${patient.sex}">${patient.sex === 'M' ? 'Male' : 'Female'}</span>
                            </div>
                        </div>
                        <div>
                            <div class="info-label" data-translate="patient.dol">Day of Life</div>
                            <div class="info-value">${dol} days</div>
                        </div>
                        <div>
                            <div class="info-label" data-translate="patient.dpa">Day Post Admission</div>
                            <div class="info-value">${dpa} days</div>
                        </div>
                        <div>
                            <div class="info-label" data-translate="patient.birth_weight">Birth Weight</div>
                            <div class="info-value">${patient.birthWeight} kg</div>
                        </div>
                        ${patient.currentWeight ? `
                            <div>
                                <div class="info-label" data-translate="patient.current_weight">Current Weight</div>
                                <div class="info-value">${patient.currentWeight} kg</div>
                            </div>
                        ` : ''}
                        ${patient.gaWeeks ? `
                            <div>
                                <div class="info-label" data-translate="patient.ga">Gestational Age</div>
                                <div class="info-value">${patient.gaWeeks}+${patient.gaDays || 0} weeks</div>
                            </div>
                            <div>
                                <div class="info-label">Maturity</div>
                                <div class="info-value">${maturity.label}</div>
                            </div>
                        ` : ''}
                        ${patient.apgarScores.oneMin ? `
                            <div>
                                <div class="info-label">APGAR Scores</div>
                                <div class="info-value">
                                    ${patient.apgarScores.oneMin} / ${patient.apgarScores.fiveMin || '-'} / ${patient.apgarScores.tenMin || '-'}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Rounds History -->
                <div class="card" style="margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2>Daily Rounds</h2>
                        <button class="btn btn-primary" onclick="DailyRoundForm.show('${patient.id}')">
                            + Add Daily Round
                        </button>
                    </div>
                    
                    ${this.renderRoundsHistory(patient)}
                </div>

                <!-- Actions -->
                <div class="card" style="margin-top: 1rem;">
                    <h3>Patient Actions</h3>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button class="btn btn-secondary" onclick="PatientCard.archivePatient('${patient.id}', 'discharged')">
                            Discharge
                        </button>
                        <button class="btn btn-secondary" onclick="PatientCard.archivePatient('${patient.id}', 'transferred')">
                            Transfer
                        </button>
                        <button class="btn btn-danger" onclick="PatientCard.archivePatient('${patient.id}', 'deceased')">
                            Mark Deceased
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderRoundsHistory(patient) {
        if (!patient.rounds || patient.rounds.length === 0) {
            return `
                <p class="text-muted" style="margin-top: 1rem;">
                    No rounds recorded yet. Click "Add Daily Round" to start.
                </p>
            `;
        }

        const rounds = [...patient.rounds].reverse(); // Most recent first
        
        return `
            <div class="rounds-list" style="margin-top: 1rem;">
                ${rounds.map((round, index) => `
                    <div class="round-item card" style="margin-bottom: 1rem; border-left: 3px solid var(--color-primary);">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h4>${Calculations.formatDateTime(round.timestamp)}</h4>
                                ${round.vitals ? `
                                    <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                                        <strong>Vitals:</strong> 
                                        HR ${round.vitals.heartRate}, 
                                        RR ${round.vitals.respRate}, 
                                        T ${round.vitals.temperature}°C, 
                                        SpO2 ${round.vitals.spo2}%
                                    </div>
                                ` : ''}
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="DailyRoundForm.view('${patient.id}', ${patient.rounds.length - 1 - index})">
                                View Details
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    archivePatient(patientId, status) {
        const statusNames = {
            'discharged': 'discharge',
            'transferred': 'transfer', 
            'deceased': 'mark as deceased'
        };

        const confirmed = confirm(`Are you sure you want to ${statusNames[status]} this patient?`);
        
        if (confirmed) {
            const reason = prompt(`Reason for ${statusNames[status]}:`) || 'Not specified';
            Storage.archivePatient(patientId, status, reason);
            App.loadPage('patients');
            alert('Patient archived successfully');
        }
    }
};

// Make available globally
window.PatientCard = PatientCard;
