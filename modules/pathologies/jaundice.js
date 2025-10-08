// Jaundice Pathology Module
// Based on: Tanzania National Guideline for Neonatal Care 2019

const JaundiceModule = {
    currentPatient: null,

    // Render the jaundice assessment section
    render(container, patientId) {
        this.currentPatient = Storage.getPatient(patientId);
        
        if (!this.currentPatient) {
            container.innerHTML = '<p class="text-danger">Patient not found</p>';
            return;
        }

        const dol = Calculations.calculateDOL(this.currentPatient.dateOfBirth);
        const isHighRisk = this.assessHighRisk(dol);

        container.innerHTML = `
            <div style="margin-top: 1rem; padding: 1rem; background-color: var(--color-surface-alt); border-radius: var(--radius-md);">
                <h4 style="margin-bottom: 0.75rem;">Jaundice Assessment</h4>
                
                ${isHighRisk.isRisk ? this.renderHighRiskSection(isHighRisk) : ''}
                
                ${this.renderKramerSection(dol, isHighRisk.isRisk)}
            </div>
        `;
    },

    // Assess if patient is high risk
    assessHighRisk(dol) {
        const reasons = [];
        let isRisk = false;

        // Check 1: Preterm
        if (this.currentPatient.gaWeeks && this.currentPatient.gaWeeks < 37) {
            reasons.push('Preterm baby (GA <37 weeks)');
            isRisk = true;
        }

        // Check 2: Jaundice before 24 hours
        if (dol < 1) {
            reasons.push('Jaundice onset before 24 hours of life');
            isRisk = true;
        }

        return { isRisk, reasons };
    },

    // Render HIGH RISK section
    renderHighRiskSection(riskData) {
        return `
            <div class="alert alert-danger" style="margin-bottom: 1rem;">
                <strong>⚠️ HIGH RISK JAUNDICE</strong>
                
                <div style="margin-top: 0.5rem;">
                    <strong>Why high risk:</strong>
                    <ul style="margin: 0.25rem 0 0 1.5rem; padding: 0;">
                        ${riskData.reasons.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>

                <div style="margin-top: 0.75rem; padding: 0.75rem; background-color: white; border-radius: var(--radius-sm);">
                    <strong>Required Actions:</strong>
                    
                    <div style="margin-top: 0.5rem;">
                        <strong>1. Basic Investigations:</strong>
                        <ul style="margin: 0.25rem 0 0 1.5rem;">
                            <li>FBC (Full Blood Count)</li>
                            <li>Blood group and cross match</li>
                            <li>Mother's blood group (Rh/ABO incompatibility)</li>
                            <li>Total AND Direct bilirubin</li>
                        </ul>
                    </div>

                    <div style="margin-top: 0.5rem;">
                        <strong>2. Additional Assessment:</strong>
                        <ul style="margin: 0.25rem 0 0 1.5rem;">
                            <li>Check for rash (TORCHES?)</li>
                            <li>Check for microcephaly (TORCHES?)</li>
                            <li>Signs of sepsis? (Add CRP, cultures)</li>
                            <li>Jaundice >14 days? (Add thyroid panel)</li>
                        </ul>
                    </div>

                    <div style="margin-top: 0.5rem;">
                        <strong>3. Consider phototherapy</strong> based on bilirubin results and age
                    </div>

                    <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--color-text-secondary);">
                        <em>Source: Tanzania National Guideline for Neonatal Care 2019</em>
                    </div>
                </div>
            </div>
        `;
    },

    // Render Kramer Score section
    renderKramerSection(dol, isHighRisk) {
        return `
            <div>
                <div class="form-group">
                    <label class="form-label">
                        Kramer Score (Visual Assessment)
                        <button type="button" class="btn-info-icon" onclick="JaundiceModule.showKramerInfo()" title="How to assess">ℹ️</button>
                    </label>
                    <select id="kramerScore" class="form-input" onchange="JaundiceModule.updateRecommendations()">
                        <option value="">Select zone...</option>
                        <option value="0">No visible jaundice</option>
                        <option value="1">Grade 1 - Head and neck only</option>
                        <option value="2">Grade 2 - To umbilicus</option>
                        <option value="3">Grade 3 - Below umbilicus to knees</option>
                        <option value="4">Grade 4 - Arms and lower legs</option>
                        <option value="5">Grade 5 - Palms and soles</option>
                    </select>
                </div>

                <div id="kramerRecommendations" style="margin-top: 1rem;">
                    <p class="text-muted text-small">Select Kramer grade to see recommendations</p>
                </div>
            </div>
        `;
    },

    // Update recommendations based on Kramer score
    updateRecommendations() {
        const kramerGrade = document.getElementById('kramerScore').value;
        const recommendationsDiv = document.getElementById('kramerRecommendations');
        
        if (!kramerGrade) {
            recommendationsDiv.innerHTML = '<p class="text-muted text-small">Select Kramer grade to see recommendations</p>';
            return;
        }

        const dol = Calculations.calculateDOL(this.currentPatient.dateOfBirth);
        const isPreterm = this.currentPatient.gaWeeks && this.currentPatient.gaWeeks < 37;
        
        let recommendation = this.getKramerRecommendation(parseInt(kramerGrade), dol, isPreterm);
        
        recommendationsDiv.innerHTML = recommendation;
    },

    // Get recommendation based on Kramer grade
    getKramerRecommendation(grade, dol, isPreterm) {
        const recommendations = {
            0: {
                title: 'No Visible Jaundice',
                bili: 'Bilirubin likely <4 mg/dL',
                action: 'Continue normal care. Monitor for development of jaundice.',
                source: 'Clinical assessment'
            },
            1: {
                title: 'Grade 1: Head and Neck Only',
                bili: 'Estimated: 4-8 mg/dL (68-133 μmol/L)',
                action: isPreterm ? 
                    'Preterm baby - Already in HIGH RISK pathway above' :
                    'Check for red flags (anaemia, lethargy). Advise frequent breastfeeding. Follow-up in daily rounds.',
                source: 'Tanzania National Guideline 2019, Kramer\'s Rule'
            },
            2: {
                title: 'Grade 2: To Umbilicus',
                bili: 'Estimated: 5-12 mg/dL (85-204 μmol/L)',
                action: this.getGrade2Action(dol, isPreterm),
                source: 'Tanzania National Guideline 2019 - "Treat if: Age <3 days OR Anaemia"'
            },
            3: {
                title: 'Grade 3: Below Umbilicus to Knees',
                bili: 'Estimated: 8-16 mg/dL (136-272 μmol/L)',
                action: '<strong>Action Required:</strong><br>1. Get Total AND Direct bilirubin levels<br>2. Basic investigations (FBC, blood groups)<br>3. Phototherapy likely needed (after confirming unconjugated)',
                source: 'Tanzania National Guideline 2019 - "Always treat Grade 3+"'
            },
            4: {
                title: 'Grade 4: Arms and Lower Legs',
                bili: 'Estimated: 11-18 mg/dL (187-306 μmol/L)',
                action: '<strong>URGENT Action:</strong><br>1. URGENT Total AND Direct bilirubin<br>2. Full investigations<br>3. Intensive phototherapy likely needed<br>4. Monitor for exchange transfusion threshold',
                source: 'Tanzania National Guideline 2019'
            },
            5: {
                title: 'Grade 5: Palms and Soles',
                bili: 'Estimated: >18 mg/dL (>306 μmol/L)',
                action: '<strong>CRITICAL - IMMEDIATE ACTION:</strong><br>1. STAT Total AND Direct bilirubin<br>2. Prepare for intensive phototherapy<br>3. Consider exchange transfusion<br>4. May need transfer to higher facility',
                source: 'Tanzania National Guideline 2019 - Danger signs'
            }
        };

        const rec = recommendations[grade];
        
        return `
            <div style="padding: 0.75rem; background-color: white; border-left: 3px solid ${grade >= 3 ? 'var(--color-danger)' : 'var(--color-warning)'}; border-radius: var(--radius-sm);">
                <strong>${rec.title}</strong>
                <p style="margin: 0.5rem 0; font-size: 0.9rem;">${rec.bili}</p>
                <div style="margin: 0.5rem 0;">
                    ${rec.action}
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--color-text-secondary);">
                    <em>Source: ${rec.source}</em>
                </div>
            </div>
        `;
    },

    // Get Grade 2 specific action
    getGrade2Action(dol, isPreterm) {
        if (isPreterm) {
            return 'Preterm baby - Already in HIGH RISK pathway';
        }
        
        if (dol < 3) {
            return '<strong>START PHOTOTHERAPY</strong><br>Reason: Age <3 days<br><br>Also do basic investigations (FBC, blood groups, bilirubin)';
        }
        
        return 'Monitor closely. Check for anaemia. If anaemia present → start phototherapy.<br><br>Advise frequent breastfeeding. Reassess daily.';
    },

    // Show Kramer info
    showKramerInfo() {
        alert(`Kramer Score - Visual Assessment of Jaundice

Grade 1: Head and neck only
Grade 2: Extends to trunk above umbilicus  
Grade 3: Extends to lower trunk below umbilicus to knees
Grade 4: Extends to forearms and lower legs below knees
Grade 5: Extends to palms and soles

Assess by applying gentle pressure to skin in good natural light.

Source: Tanzania National Guideline 2019`);
    },

    // Get data to save
    getData() {
        const kramerScore = document.getElementById('kramerScore')?.value;
        
        if (!kramerScore) {
            return null;
        }

        const dol = Calculations.calculateDOL(this.currentPatient.dateOfBirth);
        const riskAssessment = this.assessHighRisk(dol);

        return {
            kramerScore: parseInt(kramerScore),
            isHighRisk: riskAssessment.isRisk,
            riskReasons: riskAssessment.reasons,
            assessmentDate: new Date().toISOString()
        };
    }
};

// Make available globally
window.JaundiceModule = JaundiceModule;
