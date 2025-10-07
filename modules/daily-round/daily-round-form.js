// Daily Round Form Module

const DailyRoundForm = {
    currentPatientId: null,

    show(patientId) {
        this.currentPatientId = patientId;
        const patient = Storage.getPatient(patientId);
        
        if (!patient) {
            alert('Patient not found');
            return;
        }

        const modal = this.createModal(patient);
        document.body.appendChild(modal);
        Language.applyTranslations();
    },

    createModal(patient) {
        const dol = Calculations.calculateDOL(patient.dateOfBirth);
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2 class="modal-title">Daily Round - ${patient.name}</h2>
                    <button class="modal-close" onclick="DailyRoundForm.close()">&times;</button>
                </div>
                
                <form id="dailyRoundForm" onsubmit="DailyRoundForm.submit(event)">
                    
                    <!-- Vital Signs -->
                    <fieldset style="border: 1px solid var(--color-border); padding: 1rem; margin-bottom: 1rem; border-radius: var(--radius-md);">
                        <legend style="font-weight: bold;">Vital Signs</legend>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="heartRate">
                                    Heart Rate (PR) * <span class="text-small text-muted">bpm</span>
                                </label>
                                <input type="number" id="heartRate" class="form-input" required min="60" max="200">
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="respRate">
                                    Respiratory Rate (RR) * <span class="text-small text-muted">breaths/min</span>
                                </label>
                                <input type="number" id="respRate" class="form-input" required min="20" max="80">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="temperature">
                                    Temperature (T) * <span class="text-small text-muted">°C</span>
                                </label>
                                <input type="number" id="temperature" class="form-input" required step="0.1" min="30" max="42">
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="spo2">
                                    SpO2 * <span class="text-small text-muted">%</span>
                                </label>
                                <input type="number" id="spo2" class="form-input" required min="50" max="100">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="oxygenSupport">Oxygen Support</label>
                            <select id="oxygenSupport" class="form-input">
                                <option value="RA">Room Air (RA)</option>
                                <option value="O2">Oxygen (O2)</option>
                                <option value="CPAP">CPAP</option>
                                <option value="Ventilator">Ventilator</option>
                            </select>
                        </div>
                    </fieldset>

                    <!-- Weight -->
                    <fieldset style="border: 1px solid var(--color-border); padding: 1rem; margin-bottom: 1rem; border-radius: var(--radius-md);">
                        <legend style="font-weight: bold;">Weight</legend>
                        
                        <div class="form-group">
                            <label class="form-label" for="currentWeight">
                                Current Weight <span class="text-small text-muted">(kg) - optional</span>
                            </label>
                            <input type="number" id="currentWeight" class="form-input" step="0.01" min="0.3" max="8"
                                   placeholder="Leave empty if not measured today">
                        </div>
                    </fieldset>

                    <!-- Clinical Status -->
                    <fieldset style="border: 1px solid var(--color-border); padding: 1rem; margin-bottom: 1rem; border-radius: var(--radius-md);">
                        <legend style="font-weight: bold;">Clinical Examination</legend>
                        
                        <!-- Skin -->
                        <div class="form-group">
                            <label class="form-label" for="skinColor">Skin Color</label>
                            <select id="skinColor" class="form-input" onchange="DailyRoundForm.handleSkinChange()">
                                <option value="normal">Normal</option>
                                <option value="pale">Pale</option>
                                <option value="cyanosed">Cyanosed</option>
                                <option value="jaundiced">Jaundiced</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <!-- Other skin description (if "other" selected) -->
                        <div id="otherSkinDescription" style="display: none;" class="form-group">
                            <label class="form-label" for="skinDescription">Describe skin appearance</label>
                            <textarea id="skinDescription" class="form-input" rows="2" 
                                      placeholder="Describe what you observe..."></textarea>
                        </div>

                        <!-- Jaundice Module Container (loaded dynamically) -->
                        <div id="jaundiceModuleContainer"></div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="activity">Activity Level</label>
                                <select id="activity" class="form-input">
                                    <option value="active">Active</option>
                                    <option value="lethargic">Lethargic</option>
                                    <option value="unresponsive">Unresponsive</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="feeding">Feeding</label>
                                <select id="feeding" class="form-input">
                                    <option value="breastfeeding">Breastfeeding</option>
                                    <option value="ebm">EBM (Expressed Breast Milk)</option>
                                    <option value="formula">Formula</option>
                                    <option value="ngt">NGT (Nasogastric Tube)</option>
                                    <option value="iv">IV fluids only</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="clinicalNotes">Clinical Notes</label>
                            <textarea id="clinicalNotes" class="form-input" rows="3" 
                                      placeholder="Any additional observations..."></textarea>
                        </div>
                    </fieldset>

                    <!-- Plan -->
                    <fieldset style="border: 1px solid var(--color-border); padding: 1rem; margin-bottom: 1rem; border-radius: var(--radius-md);">
                        <legend style="font-weight: bold;">Plan</legend>
                        
                        <div class="form-group">
                            <label class="form-label" for="plan">Plan for Today</label>
                            <textarea id="plan" class="form-input" rows="4" 
                                      placeholder="Investigations, medications, monitoring, etc."></textarea>
                        </div>
                    </fieldset>

                    <div class="modal-footer" style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="DailyRoundForm.close()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Save Round
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        return overlay;
    },

    submit(event) {
        event.preventDefault();
        
        const roundData = {
            type: 'daily',
            vitals: {
                heartRate: parseInt(document.getElementById('heartRate').value),
                respRate: parseInt(document.getElementById('respRate').value),
                temperature: parseFloat(document.getElementById('temperature').value),
                spo2: parseInt(document.getElementById('spo2').value),
                oxygenSupport: document.getElementById('oxygenSupport').value
            },
            weight: document.getElementById('currentWeight').value ? 
                    parseFloat(document.getElementById('currentWeight').value) : null,
            clinical: {
                skinColor: document.getElementById('skinColor').value,
                jaundice: this.getJaundiceData(),
                activity: document.getElementById('activity').value,
                feeding: document.getElementById('feeding').value,
                notes: document.getElementById('clinicalNotes').value
            },
            plan: document.getElementById('plan').value,
            timestamp: new Date().toISOString()
        };

        // Update patient's current weight if measured
        if (roundData.weight) {
            const patient = Storage.getPatient(this.currentPatientId);
            patient.currentWeight = roundData.weight;
            Storage.savePatient(patient);
        }

        // Save round
        Storage.addRound(this.currentPatientId, roundData);
        
        // Close modal
        this.close();
        
        // Refresh patient card
        PatientCard.show(this.currentPatientId);
        
        alert('Daily round saved successfully!');
    },

    getJaundiceData() {
        const skinColor = document.getElementById('skinColor').value;
        
        if (skinColor !== 'jaundiced') {
            return null;
        }

        // Get data from jaundice module if it exists
        if (window.JaundiceModule && window.JaundiceModule.getData) {
            return window.JaundiceModule.getData();
        }

        return null;
    },

    handleSkinChange() {
        const skinColor = document.getElementById('skinColor').value;
        const otherDescription = document.getElementById('otherSkinDescription');
        const jaundiceContainer = document.getElementById('jaundiceModuleContainer');
        
        // Show/hide "other" description field
        if (skinColor === 'other') {
            otherDescription.style.display = 'block';
        } else {
            otherDescription.style.display = 'none';
        }

        // Load jaundice module if selected
        if (skinColor === 'jaundiced') {
            if (window.JaundiceModule) {
                JaundiceModule.render(jaundiceContainer, this.currentPatientId);
            } else {
                jaundiceContainer.innerHTML = '<p class="text-warning">Jaundice module not loaded</p>';
            }
        } else {
            jaundiceContainer.innerHTML = '';
        }
    },

    close() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    },

    // View existing round (placeholder)
    view(patientId, roundIndex) {
        const patient = Storage.getPatient(patientId);
        const round = patient.rounds[roundIndex];
        
        alert('Round details view - coming soon!\n\nFor now, you can see summary in the patient card.');
    }
};

// Make available globally
window.DailyRoundForm = DailyRoundForm;
