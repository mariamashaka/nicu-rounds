// Jaundice Pathology Module
// Based on: Tanzania National Guideline for Neonatal Care and Establishment of Neonatal Care Unit 2019
// Coombs test recommendations: AAP 2004 (Recommendations 2.1.1 & 2.1.2)

const JaundiceModule = {
    currentPatient: null,
    selectedMotherBlood: null,
    
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
                
                <div id="motherBloodSection" style="display: none; margin-top: 1rem;">
                    ${this.renderMotherBloodSection()}
                </div>
                
                <div id="investigationsSection" style="display: none; margin-top: 1rem;">
                    ${this.renderInvestigationsSection()}
                </div>
            </div>
        `;
    },

    // Assess if patient is high risk
    assessHighRisk(dol) {
        const reasons = [];
        let isRisk = false;

        // Check 1: Preterm
        if (this.currentPatient.gaWeeks && this.currentPatient.gaWeeks < 37) {
            reasons.push(`Preterm baby (GA ${this.currentPatient.gaWeeks} weeks)`);
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
                        <em>Source: Tanzania National Guideline for Neonatal Care and Establishment of Neonatal Care Unit 2019</em>
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

    // Render Mother's Blood Group section
    renderMotherBloodSection() {
        return `
            <div style="padding: 1rem; background-color: white; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                <div class="form-group">
                    <label class="form-label">
                        Mother's blood group
                        <button type="button" class="btn-info-icon" onclick="JaundiceModule.showMotherBloodInfo()" title="Why we ask">ℹ️</button>
                    </label>
                    <select id="motherBloodGroup" class="form-input" onchange="JaundiceModule.updateInvestigations()">
                        <option value="">Select...</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="unavailable">Mother unavailable</option>
                    </select>
                </div>
            </div>
        `;
    },

    // Render Investigations section
    renderInvestigationsSection() {
        return `
            <div style="padding: 1rem; background-color: white; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                <h5 style="margin-bottom: 0.75rem;">📋 Recommended Investigations</h5>
                
                <div style="margin-bottom: 1rem;">
                    <strong>Baseline (always for Grade 3+):</strong>
                    <div style="margin-top: 0.5rem;">
                        <label style="display: block; margin-bottom: 0.25rem;">
                            <input type="checkbox" id="inv_totalBili" checked> 
                            <strong>Total bilirubin</strong> - <em>Why: Quantify severity</em>
                        </label>
                        <label style="display: block; margin-bottom: 0.25rem;">
                            <input type="checkbox" id="inv_directBili" checked> 
                            <strong>Direct bilirubin</strong> - <em>Why: Rule out conjugated hyperbilirubinemia</em>
                        </label>
                        <label style="display: block; margin-bottom: 0.25rem;">
                            <input type="checkbox" id="inv_fbc" checked> 
                            <strong>FBC (Full Blood Count)</strong> - <em>Why: Check for anaemia (hemolysis) and infection</em>
                        </label>
                        <label style="display: block; margin-bottom: 0.25rem;">
                            <input type="checkbox" id="inv_bloodGroup" checked> 
                            <strong>Blood group & Rh (Baby)</strong> - <em>Why: Identify incompatibility risk</em>
                        </label>
                        <label style="display: block; margin-bottom: 0.25rem;">
                            <input type="checkbox" id="inv_crossMatch" checked> 
                            <strong>Cross match</strong> - <em>Why: Prepare for exchange transfusion if needed</em>
                        </label>
                    </div>
                </div>

                <div id="coombsSection" style="display: none; margin-bottom: 1rem; padding: 0.75rem; background-color: #fff3cd; border-left: 3px solid #ffc107; border-radius: var(--radius-sm);">
                    <!-- Coombs test will be added here dynamically -->
                </div>

                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
                    <strong>Additional assessment (check if present):</strong>
                    <div style="margin-top: 0.5rem;">
                        <label style="display: block; margin-bottom: 0.25rem;">
                            <input type="checkbox" id="check_rash" onchange="JaundiceModule.toggleAdditionalInv('rash')"> 
                            Check for rash → <em>If YES, add TORCHES screening</em>
                        </label>
                        <label style="display: block; margin-bottom: 0.25rem;">
                            <input type="checkbox" id="check_microcephaly" onchange="JaundiceModule.toggleAdditionalInv('microcephaly')"> 
                            Check for microcephaly → <em>If YES, add TORCHES screening</em>
                        </label>
                        <label style="display: block; margin-bottom: 0.25rem;">
                            <input type="checkbox" id="check_sepsis" onchange="JaundiceModule.toggleAdditionalInv('sepsis')"> 
                            Signs of sepsis → <em>If YES, add CRP + Blood culture</em>
                        </label>
                        <label style="display: block; margin-bottom: 0.25rem;">
                            <input type="checkbox" id="check_prolonged" onchange="JaundiceModule.toggleAdditionalInv('prolonged')"> 
                            Jaundice >14 days → <em>If YES, add Thyroid function (TSH, T4)</em>
                        </label>
                    </div>
                </div>

                <div id="additionalInvList" style="margin-top: 0.75rem;">
                    <!-- Additional investigations will appear here -->
                </div>

                <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--color-text-secondary);">
                    <em>Sources: Tanzania National Guideline for Neonatal Care 2019; AAP 2004 (Coombs recommendations)</em>
                </div>
            </div>
        `;
    },

    // Update recommendations based on Kramer score
    updateRecommendations() {
        const kramerGrade = document.getElementById('kramerScore').value;
        const recommendationsDiv = document.getElementById('kramerRecommendations');
        const motherBloodSection = document.getElementById('motherBloodSection');
        const investigationsSection = document.getElementById('investigationsSection');
        
        if (!kramerGrade) {
            recommendationsDiv.innerHTML = '<p class="text-muted text-small">Select Kramer grade to see recommendations</p>';
            motherBloodSection.style.display = 'none';
            investigationsSection.style.display = 'none';
            return;
        }

        const dol = Calculations.calculateDOL(this.currentPatient.dateOfBirth);
        const isPreterm = this.currentPatient.gaWeeks && this.currentPatient.gaWeeks < 37;
        const isHighRisk = this.assessHighRisk(dol).isRisk;
        
        let recommendation = this.getKramerRecommendation(parseInt(kramerGrade), dol, isPreterm);
        
        recommendationsDiv.innerHTML = recommendation;

        // Show mother's blood and investigations if Grade 3+ OR High Risk
        if (parseInt(kramerGrade) >= 3 || isHighRisk) {
            motherBloodSection.style.display = 'block';
            investigationsSection.style.display = 'block';
        } else {
            motherBloodSection.style.display = 'none';
            investigationsSection.style.display = 'none';
        }
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
                source: 'Tanzania National Guideline for Neonatal Care 2019, Kramer\'s Rule'
            },
            2: {
                title: 'Grade 2: To Umbilicus',
                bili: 'Estimated: 5-12 mg/dL (85-204 μmol/L)',
                action: this.getGrade2Action(dol, isPreterm),
                source: 'Tanzania National Guideline for Neonatal Care 2019 - "Treat if: Age <3 days OR Anaemia"'
            },
            3: {
                title: 'Grade 3: Below Umbilicus to Knees',
                bili: 'Estimated: 8-16 mg/dL (136-272 μmol/L)',
                action: '<strong>Action Required:</strong><br>1. Get Total AND Direct bilirubin levels<br>2. Basic investigations (FBC, blood groups)<br>3. Phototherapy likely needed (after confirming unconjugated)',
                source: 'Tanzania National Guideline for Neonatal Care 2019 - "Always treat Grade 3+"'
            },
            4: {
                title: 'Grade 4: Arms and Lower Legs',
                bili: 'Estimated: 11-18 mg/dL (187-306 μmol/L)',
                action: '<strong>URGENT Action:</strong><br>1. URGENT Total AND Direct bilirubin<br>2. Full investigations<br>3. Intensive phototherapy likely needed<br>4. Monitor for exchange transfusion threshold',
                source: 'Tanzania National Guideline for Neonatal Care 2019'
            },
            5: {
                title: 'Grade 5: Palms and Soles',
                bili: 'Estimated: >18 mg/dL (>306 μmol/L)',
                action: '<strong>CRITICAL - IMMEDIATE ACTION:</strong><br>1. STAT Total AND Direct bilirubin<br>2. Prepare for intensive phototherapy<br>3. Consider exchange transfusion<br>4. May need transfer to higher facility',
                source: 'Tanzania National Guideline for Neonatal Care 2019 - Danger signs'
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

    // Update investigations based on mother's blood group
    updateInvestigations() {
        const motherBlood = document.getElementById('motherBloodGroup').value;
        const coombsSection = document.getElementById('coombsSection');
        
        this.selectedMotherBlood = motherBlood;
        
        if (!motherBlood) {
            coombsSection.style.display = 'none';
            return;
        }

        // Check if Rh-negative or Mother unavailable
        const isRhNegative = motherBlood.includes('-');
        const isUnavailable = motherBlood === 'unavailable';
        const isOPositive = motherBlood === 'O+';

        if (isRhNegative || isUnavailable) {
            // STRONGLY RECOMMENDED (auto-checked)
            coombsSection.style.display = 'block';
            coombsSection.innerHTML = `
                <strong>Conditional - STRONGLY RECOMMENDED:</strong>
                <div style="margin-top: 0.5rem;">
                    <label style="display: block;">
                        <input type="checkbox" id="inv_coombs" checked> 
                        <strong>Direct Coombs Test (DAT)</strong> - <strong style="color: #d9534f;">STRONGLY RECOMMENDED</strong>
                    </label>
                    <div style="margin-left: 1.5rem; margin-top: 0.25rem; font-size: 0.9rem;">
                        <strong>Why:</strong> ${isRhNegative ? 'Mother Rh-negative' : 'Mother unavailable'} → High risk of ${isRhNegative ? 'Rh' : 'blood group'} incompatibility<br>
                        <strong>What it shows:</strong> Detects maternal antibodies on baby's red blood cells<br>
                        <strong>Evidence:</strong> AAP 2004 Recommendation 2.1.1 (Quality B)<br>
                        <em style="color: var(--color-text-secondary);">Note: Can uncheck if already done</em>
                    </div>
                </div>
            `;
        } else if (isOPositive) {
            // OPTIONAL (not checked)
            coombsSection.style.display = 'block';
            coombsSection.innerHTML = `
                <strong>Conditional - OPTIONAL:</strong>
                <div style="margin-top: 0.5rem;">
                    <label style="display: block;">
                        <input type="checkbox" id="inv_coombs"> 
                        <strong>Direct Coombs Test (DAT)</strong> - <em>OPTIONAL</em>
                    </label>
                    <div style="margin-left: 1.5rem; margin-top: 0.25rem; font-size: 0.9rem;">
                        <strong>Why:</strong> Mother blood group O → Possible ABO incompatibility<br>
                        <strong>Note:</strong> Not required if good surveillance and follow-up available<br>
                        <strong>Evidence:</strong> AAP 2004 Recommendation 2.1.2 (Quality C)<br>
                        <em style="color: var(--color-text-secondary);">User can check to add if desired</em>
                    </div>
                </div>
            `;
        } else {
            // A+, B+, AB+ - low risk, don't show Coombs
            coombsSection.style.display = 'none';
        }
    },

    // Toggle additional investigations
    toggleAdditionalInv(type) {
        const additionalList = document.getElementById('additionalInvList');
        
        const checks = {
            rash: document.getElementById('check_rash').checked,
            microcephaly: document.getElementById('check_microcephaly').checked,
            sepsis: document.getElementById('check_sepsis').checked,
            prolonged: document.getElementById('check_prolonged').checked
        };

        let html = '';

        if (checks.rash || checks.microcephaly) {
            html += `
                <div style="margin-bottom: 0.5rem; padding: 0.5rem; background-color: #f0f8ff; border-radius: var(--radius-sm);">
                    <label style="display: block;">
                        <input type="checkbox" id="inv_torches" checked> 
                        <strong>TORCHES screening</strong> - <em>Why: ${checks.rash ? 'Rash present' : ''} ${checks.rash && checks.microcephaly ? '+' : ''} ${checks.microcephaly ? 'Microcephaly present' : ''} → suspect congenital infection</em>
                    </label>
                </div>
            `;
        }

        if (checks.sepsis) {
            html += `
                <div style="margin-bottom: 0.5rem; padding: 0.5rem; background-color: #f0f8ff; border-radius: var(--radius-sm);">
                    <label style="display: block; margin-bottom: 0.25rem;">
                        <input type="checkbox" id="inv_crp" checked> 
                        <strong>CRP (C-Reactive Protein)</strong> - <em>Why: Signs of sepsis present</em>
                    </label>
                    <label style="display: block;">
                        <input type="checkbox" id="inv_bloodCulture" checked> 
                        <strong>Blood culture</strong> - <em>Why: Confirm sepsis</em>
                    </label>
                </div>
            `;
        }

        if (checks.prolonged) {
            html += `
                <div style="margin-bottom: 0.5rem; padding: 0.5rem; background-color: #f0f8ff; border-radius: var(--radius-sm);">
                    <label style="display: block; margin-bottom: 0.25rem;">
                        <input type="checkbox" id="inv_tsh" checked> 
                        <strong>TSH (Thyroid Stimulating Hormone)</strong> - <em>Why: Prolonged jaundice >14 days</em>
                    </label>
                    <label style="display: block;">
                        <input type="checkbox" id="inv_t4" checked> 
                        <strong>Free T4</strong> - <em>Why: Rule out hypothyroidism</em>
                    </label>
                </div>
            `;
        }

        additionalList.innerHTML = html;
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

Source: Tanzania National Guideline for Neonatal Care and Establishment of Neonatal Care Unit 2019`);
    },

    // Show mother blood info
    showMotherBloodInfo() {
        alert(`Mother's blood group matters because:

• O positive mother → Baby can be A, B, or AB
  Risk: ABO incompatibility (maternal antibodies attack baby's RBCs)

• Rh-negative mother → Baby can be Rh-positive  
  Risk: Rh incompatibility (if mother sensitized)

• Mother unavailable → Cannot determine compatibility risk
  Safer to test baby for antibodies (Coombs test)

If risk present → Direct Coombs test recommended to detect antibodies on baby's red blood cells

Source: AAP 2004 Recommendations 2.1.1 & 2.1.2`);
    },

    // Get all investigations data
    getInvestigationsData() {
        const kramerGrade = document.getElementById('kramerScore')?.value;
        
        if (!kramerGrade || parseInt(kramerGrade) < 3) {
            return [];
        }

        const investigations = [];

        // Baseline investigations
        const baselineTests = [
            { id: 'inv_totalBili', name: 'Total bilirubin', reason: 'Quantify severity' },
            { id: 'inv_directBili', name: 'Direct bilirubin', reason: 'Rule out conjugated hyperbilirubinemia' },
            { id: 'inv_fbc', name: 'FBC (Full Blood Count)', reason: 'Check for anaemia and infection' },
            { id: 'inv_bloodGroup', name: 'Blood group & Rh (Baby)', reason: 'Identify incompatibility risk' },
            { id: 'inv_crossMatch', name: 'Cross match', reason: 'Prepare for exchange transfusion if needed' }
        ];

        baselineTests.forEach(test => {
            const checkbox = document.getElementById(test.id);
            if (checkbox && checkbox.checked) {
                investigations.push({ name: test.name, reason: test.reason, category: 'baseline' });
            }
        });

        // Coombs test (if applicable)
        const coombsCheckbox = document.getElementById('inv_coombs');
        if (coombsCheckbox && coombsCheckbox.checked) {
            const motherBlood = this.selectedMotherBlood;
            const isRhNeg = motherBlood?.includes('-');
            const isUnavailable = motherBlood === 'unavailable';
            const category = (isRhNeg || isUnavailable) ? 'strongly_recommended' : 'optional';
            
            investigations.push({
                name: 'Direct Coombs Test (DAT)',
                reason: `Mother ${motherBlood} → ${isRhNeg ? 'Rh' : isUnavailable ? 'Blood group' : 'ABO'} incompatibility risk`,
                category: category,
                evidence: category === 'strongly_recommended' ? 'AAP 2004 Rec 2.1.1' : 'AAP 2004 Rec 2.1.2'
            });
        }

        // Additional investigations
        const additionalTests = [
            { id: 'inv_torches', name: 'TORCHES screening', reason: 'Congenital infection suspected' },
            { id: 'inv_crp', name: 'CRP', reason: 'Signs of sepsis' },
            { id: 'inv_bloodCulture', name: 'Blood culture', reason: 'Confirm sepsis' },
            { id: 'inv_tsh', name: 'TSH', reason: 'Prolonged jaundice >14 days' },
            { id: 'inv_t4', name: 'Free T4', reason: 'Rule out hypothyroidism' }
        ];

        additionalTests.forEach(test => {
            const checkbox = document.getElementById(test.id);
            if (checkbox && checkbox.checked) {
                investigations.push({ name: test.name, reason: test.reason, category: 'additional' });
            }
        });

        return investigations;
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
            motherBloodGroup: this.selectedMotherBlood,
            isHighRisk: riskAssessment.isRisk,
            riskReasons: riskAssessment.reasons,
            investigations: this.getInvestigationsData(),
            assessmentDate: new Date().toISOString()
        };
    }
};

// Make available globally
window.JaundiceModule = JaundiceModule;
