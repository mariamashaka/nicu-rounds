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
    }
};

// Make Calculations available globally
window.Calculations = Calculations;
