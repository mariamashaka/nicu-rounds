// NICU Rounds App - Calculations Module
// Age calculations, weight conversions, dose calculations, etc.

const Calculations = {
    
    // Calculate Day of Life (DOL)
    calculateDOL(dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const today = new Date();
        const diffTime = Math.abs(today - dob);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    // Calculate Day Post Admission (DPA)
    calculateDPA(admissionDate) {
        const admission = new Date(admissionDate);
        const today = new Date();
        const diffTime = Math.abs(today - admission);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    // Calculate Gestational Age from weeks+days format
    calculateGA(weeks, days = 0) {
        return {
            weeks: weeks,
            days: days,
            totalDays: (weeks * 7) + days,
            formatted: `${weeks}+${days}`
        };
    },

    // Determine maturity category based on GA
    getMaturityCategory(weeks) {
        if (weeks < 28) return { key: 'extremely_preterm', label: 'Extremely Preterm' };
        if (weeks < 32) return { key: 'very_preterm', label: 'Very Preterm' };
        if (weeks < 37) return { key: 'late_preterm', label: 'Moderate/Late Preterm' };
        if (weeks <= 42) return { key: 'term', label: 'Term' };
        return { key: 'post_term', label: 'Post-term' };
    },

    // Weight conversions
    kgToGrams(kg) {
        return kg * 1000;
    },

    gramsToKg(grams) {
        return grams / 1000;
    },

    // Calculate weight change
    calculateWeightChange(currentWeight, birthWeight) {
        const change = currentWeight - birthWeight;
        const percentChange = ((change / birthWeight) * 100).toFixed(1);
        return {
            absolute: change.toFixed(2),
            percent: percentChange,
            status: change >= 0 ? 'gain' : 'loss'
        };
    },

    // Medication dose calculations (weight-based)
    calculateDose(weightKg, dosePerKg, frequency = 1) {
        const singleDose = (weightKg * dosePerKg).toFixed(2);
        const dailyDose = (singleDose * frequency).toFixed(2);
        return {
            singleDose: parseFloat(singleDose),
            dailyDose: parseFloat(dailyDose),
            unit: 'mg' // default, should be specified per medication
        };
    },

    // Common NICU medication doses
    medications: {
        // Antibiotics
        ampicillin: (weightKg, age) => {
            const dose = age <= 7 ? 50 : 100; // mg/kg/dose
            return Calculations.calculateDose(weightKg, dose, 2); // BID
        },
        
        gentamicin: (weightKg, age) => {
            const dose = age <= 7 ? 4 : 5; // mg/kg/dose
            return Calculations.calculateDose(weightKg, dose, 1); // Once daily
        },
        
        ceftriaxone: (weightKg) => {
            return {
                ...Calculations.calculateDose(weightKg, 50, 1),
                warning: 'CONTRAINDICATED with jaundice/hyperbilirubinemia'
            };
        },

        cipro: (weightKg) => {
            return Calculations.calculateDose(weightKg, 10, 2); // 10mg/kg BID
        },

        // Anticonvulsants
        phenobarbital: {
            loading: (weightKg) => Calculations.calculateDose(weightKg, 20, 1),
            maintenance: (weightKg) => Calculations.calculateDose(weightKg, 5, 1)
        },

        // Jaundice treatment
        ursodeoxycholicAcid: (weightKg) => {
            return Calculations.calculateDose(weightKg, 10, 2); // 10mg/kg BID
        }
    },

    // IV fluid calculations
    calculateIVFluids(weightKg, ageInDays) {
        // Basic maintenance fluid calculation
        let mlPerKgPerDay;
        
        if (ageInDays === 1) mlPerKgPerDay = 60;
        else if (ageInDays === 2) mlPerKgPerDay = 80;
        else if (ageInDays === 3) mlPerKgPerDay = 100;
        else if (ageInDays <= 7) mlPerKgPerDay = 120;
        else if (ageInDays <= 30) mlPerKgPerDay = 150;
        else mlPerKgPerDay = 100;

        const totalDaily = weightKg * mlPerKgPerDay;
        const hourly = (totalDaily / 24).toFixed(1);

        return {
            dailyTotal: totalDaily.toFixed(0),
            hourlyRate: parseFloat(hourly),
            mlPerKgPerDay: mlPerKgPerDay
        };
    },

    // Normal vital signs ranges by age
    getNormalVitals(ageInDays) {
        // Heart Rate (bpm)
        const hr = ageInDays <= 7 
            ? { min: 120, max: 160 }
            : { min: 100, max: 150 };

        // Respiratory Rate (breaths/min)
        const rr = { min: 30, max: 60 };

        // Temperature (Celsius)
        const temp = { min: 36.5, max: 37.5 };

        // SpO2 (%)
        const spo2 = { min: 90, max: 100 };

        return { hr, rr, temp, spo2 };
    },

    // Check if vital sign is within normal range
    checkVitalStatus(value, range) {
        if (value < range.min) return 'low';
        if (value > range.max) return 'high';
        return 'normal';
    },

    // APGAR score interpretation
    interpretAPGAR(score) {
        if (score >= 7) return { status: 'normal', color: 'success' };
        if (score >= 4) return { status: 'moderate_distress', color: 'warning' };
        return { status: 'severe_distress', color: 'danger' };
    },

    // Calculate corrected age for preterm babies
    calculateCorrectedAge(dateOfBirth, gaWeeks) {
        const chronologicalAge = this.calculateDOL(dateOfBirth);
        const termEquivalent = 40; // weeks
        const correction = (termEquivalent - gaWeeks) * 7; // in days
        const correctedAge = chronologicalAge - correction;
        
        return {
            chronological: chronologicalAge,
            corrected: Math.max(0, correctedAge),
            correction: correction
        };
    },

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    },

    // Format date and time for display
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB'); // DD/MM/YYYY, HH:MM:SS format
    },

    // Weight category by birth weight (LBW, VLBW, ELBW)
    getBirthWeightCategory(weightKg) {
        const weightGrams = weightKg * 1000;
        
        if (weightGrams < 1000) {
            return {
                key: 'elbw',
                label: 'ELBW (Extremely Low Birth Weight)',
                fullLabel: 'Extremely Low Birth Weight',
                range: '< 1000g',
                color: 'danger',
                risk: 'All VLBW risks plus severe developmental delays, chronic lung disease'
            };
        } else if (weightGrams < 1500) {
            return {
                key: 'vlbw',
                label: 'VLBW (Very Low Birth Weight)',
                fullLabel: 'Very Low Birth Weight',
                range: '1000-1499g',
                color: 'warning',
                risk: 'Respiratory distress, intraventricular hemorrhage, necrotizing enterocolitis, retinopathy of prematurity'
            };
        } else if (weightGrams < 2500) {
            return {
                key: 'lbw',
                label: 'LBW (Low Birth Weight)',
                fullLabel: 'Low Birth Weight',
                range: '1500-2499g',
                color: 'warning',
                risk: 'Hypothermia, hypoglycemia, feeding difficulties, increased infection risk'
            };
        } else {
            return {
                key: 'normal',
                label: 'Normal Birth Weight',
                fullLabel: 'Normal Birth Weight',
                range: '≥ 2500g',
                color: 'success',
                risk: null
            };
        }
    },

    // Weight for Gestational Age (SGA, AGA, LGA) using Fenton 2025 data
    getWeightForGA(weightKg, gaWeeks, sex) {
        if (!gaWeeks || !sex) {
            return null;
        }

        // Round GA to nearest even week for lookup
        const roundedGA = Math.round(gaWeeks / 2) * 2;
        
        // Get Fenton data for this GA and sex
        const fentonData = this.getFentonPercentile(roundedGA, sex);
        
        if (!fentonData) {
            return null;
        }

        // Determine category based on percentiles
        if (weightKg < fentonData.p10) {
            return {
                key: 'sga',
                label: 'SGA (Small for Gestational Age)',
                fullLabel: 'Small for Gestational Age',
                percentile: '< 10th percentile',
                color: 'warning',
                risk: 'Hypoglycemia, polycythemia, hypothermia, neurodevelopmental delays'
            };
        } else if (weightKg <= fentonData.p90) {
            return {
                key: 'aga',
                label: 'AGA (Appropriate for Gestational Age)',
                fullLabel: 'Appropriate for Gestational Age',
                percentile: '10th-90th percentile',
                color: 'success',
                risk: null
            };
        } else {
            return {
                key: 'lga',
                label: 'LGA (Large for Gestational Age)',
                fullLabel: 'Large for Gestational Age',
                percentile: '> 90th percentile',
                color: 'warning',
                risk: 'Birth trauma, hypoglycemia, respiratory distress, increased cesarean section risk'
            };
        }
    },

    // Get Fenton percentile data for specific GA and sex
    getFentonPercentile(gaWeeks, sex) {
        // Simplified Fenton 2025 data (from growth-charts.json)
        const fentonData = {
            M: {
                24: { p3: 0.52, p10: 0.56, p50: 0.65, p90: 0.75, p97: 0.81 },
                26: { p3: 0.68, p10: 0.74, p50: 0.87, p90: 1.01, p97: 1.10 },
                28: { p3: 0.88, p10: 0.96, p50: 1.13, p90: 1.32, p97: 1.44 },
                30: { p3: 1.13, p10: 1.23, p50: 1.45, p90: 1.69, p97: 1.84 },
                32: { p3: 1.42, p10: 1.55, p50: 1.83, p90: 2.13, p97: 2.31 },
                34: { p3: 1.77, p10: 1.93, p50: 2.28, p90: 2.65, p97: 2.87 },
                36: { p3: 2.17, p10: 2.37, p50: 2.80, p90: 3.25, p97: 3.51 },
                38: { p3: 2.62, p10: 2.86, p50: 3.37, p90: 3.91, p97: 4.22 },
                40: { p3: 3.10, p10: 3.38, p50: 3.98, p90: 4.61, p97: 4.97 },
                42: { p3: 3.58, p10: 3.91, p50: 4.60, p90: 5.33, p97: 5.74 }
            },
            F: {
                24: { p3: 0.49, p10: 0.53, p50: 0.62, p90: 0.72, p97: 0.78 },
                26: { p3: 0.64, p10: 0.69, p50: 0.82, p90: 0.95, p97: 1.03 },
                28: { p3: 0.82, p10: 0.89, p50: 1.05, p90: 1.23, p97: 1.34 },
                30: { p3: 1.05, p10: 1.14, p50: 1.35, p90: 1.57, p97: 1.71 },
                32: { p3: 1.32, p10: 1.43, p50: 1.70, p90: 1.98, p97: 2.15 },
                34: { p3: 1.63, p10: 1.77, p50: 2.10, p90: 2.45, p97: 2.66 },
                36: { p3: 1.99, p10: 2.16, p50: 2.56, p90: 2.98, p97: 3.23 },
                38: { p3: 2.39, p10: 2.60, p50: 3.08, p90: 3.58, p97: 3.88 },
                40: { p3: 2.84, p10: 3.09, p50: 3.64, p90: 4.23, p97: 4.58 },
                42: { p3: 3.29, p10: 3.58, p50: 4.22, p90: 4.90, p97: 5.30 }
            }
        };

        if (gaWeeks < 24 || gaWeeks > 42) {
            return null;
        }

        return fentonData[sex]?.[gaWeeks] || null;
    }
};

// Make Calculations available globally
window.Calculations = Calculations;
