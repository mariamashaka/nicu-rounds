// Add Patient Form Module

const AddPatientForm = {
    show() {
        const modal = this.createModal();
        document.body.appendChild(modal);
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('patientName').focus();
        }, 100);
    },

    createModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title" data-translate="patients.add_patient">Add New Patient</h2>
                    <button class="modal-close" onclick="AddPatientForm.close()">&times;</button>
                </div>
                
                <form id="addPatientForm" onsubmit="AddPatientForm.submit(event)">
                    <div class="form-group">
                        <label class="form-label" for="patientName">
                            <span data-translate="patient.name">Patient Name</span> *
                        </label>
                        <input type="text" id="patientName" class="form-input" required 
                               placeholder="Baby of Mother's Name">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="patientSex">
                                <span data-translate="patient.sex">Sex</span> *
                            </label>
                            <select id="patientSex" class="form-input" required>
                                <option value="">Select...</option>
                                <option value="M" data-translate="patient.male">Male</option>
                                <option value="F" data-translate="patient.female">Female</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="birthWeight">
                                <span data-translate="patient.birth_weight">Birth Weight (kg)</span> *
                            </label>
                            <input type="number" id="birthWeight" class="form-input" 
                                   step="0.1" min="0.3" max="6" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="dateOfBirth">
                                <span data-translate="patient.dob">Date of Birth</span> *
                            </label>
                            <input type="date" id="dateOfBirth" class="form-input" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="admissionDate">
                                <span data-translate="patient.admission_date">Admission Date</span> *
                            </label>
                            <input type="date" id="admissionDate" class="form-input" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="admissionSource">
                            <span data-translate="patient.admission_source">Admission Source</span>
                        </label>
                        <input type="text" id="admissionSource" class="form-input" 
                               placeholder="Labour Ward, Transfer, etc.">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="gaWeeks">GA (weeks)</label>
                            <input type="number" id="gaWeeks" class="form-input" 
                                   min="20" max="45" placeholder="38">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="gaDays">GA (days)</label>
                            <input type="number" id="gaDays" class="form-input" 
                                   min="0" max="6" placeholder="0">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="apgar1">APGAR 1 min</label>
                            <input type="number" id="apgar1" class="form-input" 
                                   min="0" max="10">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="apgar5">APGAR 5 min</label>
                            <input type="number" id="apgar5" class="form-input" 
                                   min="0" max="10">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="apgar10">APGAR 10 min</label>
                            <input type="number" id="apgar10" class="form-input" 
                                   min="0" max="10">
                        </div>
                    </div>

                    <div class="modal-footer" style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="AddPatientForm.close()">
                            <span data-translate="actions.cancel">Cancel</span>
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <span data-translate="actions.save">Save Patient</span>
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Apply translations
        Language.applyTranslations();
        
        return overlay;
    },

    submit(event) {
        event.preventDefault();
        
        const patient = {
            name: document.getElementById('patientName').value,
            sex: document.getElementById('patientSex').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            birthWeight: parseFloat(document.getElementById('birthWeight').value),
            admissionDate: document.getElementById('admissionDate').value,
            admissionSource: document.getElementById('admissionSource').value || 'Not specified',
            status: 'active',
            apgarScores: {
                oneMin: parseInt(document.getElementById('apgar1').value) || null,
                fiveMin: parseInt(document.getElementById('apgar5').value) || null,
                tenMin: parseInt(document.getElementById('apgar10').value) || null
            },
            gaWeeks: parseInt(document.getElementById('gaWeeks').value) || null,
            gaDays: parseInt(document.getElementById('gaDays').value) || 0,
            rounds: []
        };

        // Save to storage
        Storage.savePatient(patient);
        
        // Close modal
        this.close();
        
        // Refresh patient list
        App.loadPage('patients');
        
        // Show success message
        alert('Patient added successfully!');
    },

    close() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }
};

// Make available globally
window.AddPatientForm = AddPatientForm;
