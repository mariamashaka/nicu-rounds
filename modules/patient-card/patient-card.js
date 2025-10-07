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
        
        // Birth weight categories
        const birthWeightCat = Calculations.getBirthWeightCategory(patient.birthWeight);
        const weightForGA = patient.gaWeeks && patient.sex ? 
            Calculations.getWeightForGA(patient.birthWeight, patient.gaWeeks, patient.sex) : null;

        // Current weight and growth analysis
        const weightAnalysis = this.analyzeWeightGrowth(patient);

        return `
            <div class="patient-detail">
                <!-- Header -->
                <div class="patient-detail-header">
                    <button class="btn btn-secondary" onclick="App.loadPage('patients')">
                        ← <span data-translate="common.back">Back to List</span>
                    </button>
                    <h1>${patient.name}</h1>
                </div>

                ${weightAnalysis.reminder ? `
                    <div class="alert alert-warning" style="margin-top: 1rem;">
                        🔔 <strong>Reminder:</strong> Weight not measured for ${weightAnalysis.daysSinceLastWeight} days - please weigh baby today!
                    </div>
                ` : ''}

                <!-- Birth Data Card -->
                <div class="card" style="margin-top: 1rem;">
                    <h2>Birth Data & Assessment</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1rem;">
                        
                        <!-- LEFT: Facts -->
                        <div style="border-right: 2px solid var(--color-border); padding-right: 1rem;">
                            <h3 style="font-size: 1rem; color: var(--color-text-secondary); margin-bottom: 1rem;">Birth Facts</h3>
                            ${patient.gaWeeks ? `
                                <div style="margin-bottom: 0.75rem;">
                                    <div class="info-label">Gestational Age</div>
                                    <div class="info-value">${patient.gaWeeks}+${patient.gaDays || 0} weeks</div>
                                </div>
                            ` : ''}
                            <div style="margin-bottom: 0.75rem;">
                                <div class="info-label">Birth Weight</div>
                                <div class="info-value">${patient.birthWeight} kg (${(patient.birthWeight * 1000).toFixed(0)}g)</div>
                            </div>
                            ${patient.apgarScores.oneMin ? `
                                <div style="margin-bottom: 0.75rem;">
                                    <div class="info-label">APGAR Scores</div>
                                    <div class="info-value">
                                        ${patient.apgarScores.oneMin} / ${patient.apgarScores.fiveMin || '-'} / ${patient.apgarScores.tenMin || '-'}
                                    </div>
                                </div>
                            ` : ''}
                        </div>

                        <!-- RIGHT: Assessment -->
                        <div style="padding-left: 1rem;">
                            <h3 style="font-size: 1rem; color: var(--color-text-secondary); margin-bottom: 1rem;">Clinical Assessment</h3>
                            ${patient.gaWeeks ? `
                                <div style="margin-bottom: 0.75rem;">
                                    <div class="info-label">Maturity Category</div>
                                    <div class="info-value">
                                        ${maturity.label}
                                        <button class="btn-info-icon" onclick="PatientCard.showInfo('maturity')" title="Learn more">ℹ️</button>
                                    </div>
                                </div>
                            ` : ''}
                            <div style="margin-bottom: 0.75rem;">
                                <div class="info-label">Birth Weight Category</div>
                                <div class="info-value">
                                    <span class="badge badge-${birthWeightCat.color}">${birthWeightCat.label}</span>
                                    ${birthWeightCat.risk ? `
                                        <button class="btn-info-icon" onclick="PatientCard.showInfo('birthWeight', '${birthWeightCat.key}')" title="Risks">ℹ️</button>
                                    ` : ''}
                                </div>
                            </div>
                            ${weightForGA ? `
                                <div style="margin-bottom: 0.75rem;">
                                    <div class="info-label">Weight for GA</div>
                                    <div class="info-value">
                                        <span class="badge badge-${weightForGA.color}">${weightForGA.label}</span>
                                        ${weightForGA.risk ? `
                                            <button class="btn-info-icon" onclick="PatientCard.showInfo('weightForGA', '${weightForGA.key}')" title="Risks">ℹ️</button>
                                        ` : ''}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Current Status Card -->
                ${weightAnalysis.hasCurrentWeight ? `
                    <div class="card" style="margin-top: 1rem; border-left: 4px solid var(--color-success);">
                        <h2>Current Status</h2>
                        <div class="patient-info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                            <div>
                                <div class="info-label">Age</div>
                                <div class="info-value">
                                    DOL: ${dol} days
                                    ${patient.gaWeeks ? `<br>PMA: ${patient.gaWeeks + Math.floor(dol/7)}+${dol % 7} weeks` : ''}
                                </div>
                            </div>
                            <div>
                                <div class="info-label">Current Weight</div>
                                <div class="info-value">
                                    ${weightAnalysis.currentWeight} kg
                                    <div class="text-small text-muted">Measured ${weightAnalysis.daysSinceLastWeight} day(s) ago</div>
                                </div>
                            </div>
                            <div>
                                <div class="info-label">Weight Change</div>
                                <div class="info-value">
                                    ${weightAnalysis.weightChange > 0 ? '📈' : '📉'} 
                                    ${weightAnalysis.weightChangeDisplay}
                                    <div class="text-small ${weightAnalysis.changeStatus === 'good' ? 'text-success' : 'text-warning'}">
                                        ${weightAnalysis.changePercent}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="info-label">Average Daily Gain</div>
                                <div class="info-value">
                                    ${weightAnalysis.avgDailyGain} g/day
                                    ${weightAnalysis.gainStatus === 'good' ? '✅' : '⚠️'}
                                </div>
                            </div>
                            ${weightAnalysis.currentWeightForGA ? `
                                <div>
                                    <div class="info-label">Current Weight for GA</div>
                                    <div class="info-value">
                                        <span class="badge badge-${weightAnalysis.currentWeightForGA.color}">
                                            ${weightAnalysis.currentWeightForGA.label}
                                        </span>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div style="margin-top: 1rem;">
                            <button class="btn btn-secondary" onclick="PatientCard.showGrowthChart('${patient.id}')">
                                📊 View Growth Chart
                            </button>
                        </div>
                    </div>
                ` : ''}

                <!-- Patient Info (Sex, Admission) -->
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
                            <div class="info-label">Admission Source</div>
                            <div class="info-value">${patient.admissionSource || 'Not specified'}</div>
                        </div>
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
                    <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
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
    },

    // Analyze weight growth
    analyzeWeightGrowth(patient) {
        const result = {
            hasCurrentWeight: false,
            currentWeight: null,
            daysSinceLastWeight: null,
            reminder: false,
            weightChange: 0,
            weightChangeDisplay: '',
            changePercent: '',
            changeStatus: 'unknown',
            avgDailyGain: 0,
            gainStatus: 'unknown',
            currentWeightForGA: null
        };

        // Find most recent weight from rounds
        if (patient.rounds && patient.rounds.length > 0) {
            const roundsWithWeight = patient.rounds.filter(r => r.weight);
            
            if (roundsWithWeight.length > 0) {
                const lastRound = roundsWithWeight[roundsWithWeight.length - 1];
                const lastWeightDate = new Date(lastRound.timestamp);
                const today = new Date();
                const daysSince = Math.floor((today - lastWeightDate) / (1000 * 60 * 60 * 24));

                result.hasCurrentWeight = true;
                result.currentWeight = lastRound.weight;
                result.daysSinceLastWeight = daysSince;
                result.reminder = daysSince > 3;

                // Calculate weight change
                const weightChange = lastRound.weight - patient.birthWeight;
                const percentChange = ((weightChange / patient.birthWeight) * 100).toFixed(1);
                
                result.weightChange = weightChange;
                result.weightChangeDisplay = `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(2)} kg`;
                result.changePercent = `${percentChange}%`;
                result.changeStatus = weightChange >= 0 ? 'good' : 'concern';

                // Calculate average daily gain
                const dol = Calculations.calculateDOL(patient.dateOfBirth);
                const avgGain = ((weightChange * 1000) / dol).toFixed(1);
                result.avgDailyGain = avgGain;
                
                // Expected gain: ~15-30g/day depending on age/size
                result.gainStatus = avgGain >= 10 ? 'good' : 'concern';

                // Current weight for GA
                if (patient.gaWeeks && patient.sex) {
                    const currentGA = patient.gaWeeks + Math.floor(dol / 7);
                    result.currentWeightForGA = Calculations.getWeightForGA(
                        lastRound.weight, 
                        currentGA, 
                        patient.sex
                    );
                }
            }
        }

        return result;
    },

    // Show info popups
    showInfo(type, category) {
        let title = '';
        let content = '';

        if (type === 'maturity') {
            title = 'Gestational Age Categories';
            content = `
                <strong>Extremely Preterm:</strong> <28 weeks
                <strong>Very Preterm:</strong> 28-31+6 weeks
                <strong>Moderate/Late Preterm:</strong> 32-36+6 weeks
                <strong>Term:</strong> 37-41+6 weeks
                <strong>Post-term:</strong> ≥42 weeks
            `.trim().split('\n').map(line => line.trim()).join('\n');
        } else if (type === 'birthWeight') {
            const risks = {
                'elbw': 'All VLBW risks plus severe developmental delays, chronic lung disease',
                'vlbw': 'Respiratory distress, intraventricular hemorrhage, necrotizing enterocolitis, retinopathy of prematurity',
                'lbw': 'Hypothermia, hypoglycemia, feeding difficulties, increased infection risk'
            };
            title = 'Birth Weight Category Risks';
            content = `Associated Risks:\n${risks[category]}`;
        } else if (type === 'weightForGA') {
            const risks = {
                'sga': 'Hypoglycemia, polycythemia, hypothermia, neurodevelopmental delays',
                'lga': 'Birth trauma, hypoglycemia, respiratory distress, increased cesarean section risk'
            };
            title = 'Weight for GA Risks';
            content = `Associated Risks:\n${risks[category]}`;
        }

        alert(`${title}\n\n${content}`);
    },

    // Show growth chart (placeholder for now)
    showGrowthChart(patientId) {
        alert('Growth chart visualization - coming soon!\n\nThis will show:\n- Fenton percentile curves\n- Baby\'s weight points over time\n- Growth trajectory');
    }
};

// Make available globally
window.PatientCard = PatientCard;
