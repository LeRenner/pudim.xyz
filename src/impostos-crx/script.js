// Tax percentages
const TAX_RATES = {
    cofins: 0.03,    // 3%
    csll: 0.01,      // 1%
    irrf: 0.015,     // 1.5%
    pis: 0.0065      // 0.65%
};

// Get DOM elements
const valorNotaInput = document.getElementById('valorNota');
const cofinsElement = document.getElementById('cofins');
const csllElement = document.getElementById('csll');
const irrfElement = document.getElementById('irrf');
const pisElement = document.getElementById('pis');
const totalElement = document.getElementById('total');
const liquidoElement = document.getElementById('liquido');

// Format number to Brazilian Real currency
function formatBRL(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Parse Brazilian Real input to number
function parseBRL(value) {
    // Remove everything except digits and comma
    let cleaned = value.replace(/[^\d,]/g, '');
    // Replace comma with dot for parsing
    cleaned = cleaned.replace(',', '.');
    return parseFloat(cleaned) || 0;
}

// Format input as Brazilian Real while typing
function formatInputBRL(input) {
    let value = input.replace(/\D/g, ''); // Remove non-digits
    value = (parseInt(value) || 0) / 100; // Convert to decimal
    
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Calculate and update all tax values
function calculateTaxes() {
    // Get the raw value from input
    const rawValue = valorNotaInput.value.replace(/\D/g, '');
    const valorNota = (parseInt(rawValue) || 0) / 100;
    
    if (valorNota === 0) {
        // Reset all values to zero
        cofinsElement.textContent = formatBRL(0);
        csllElement.textContent = formatBRL(0);
        irrfElement.textContent = formatBRL(0);
        pisElement.textContent = formatBRL(0);
        totalElement.textContent = formatBRL(0);
        liquidoElement.textContent = formatBRL(0);
        return;
    }
    
    // Calculate each tax
    const cofins = valorNota * TAX_RATES.cofins;
    const csll = valorNota * TAX_RATES.csll;
    const irrf = valorNota * TAX_RATES.irrf;
    const pis = valorNota * TAX_RATES.pis;
    
    // Calculate total taxes
    const totalTaxes = cofins + csll + irrf + pis;
    
    // Calculate net value (valor líquido)
    const valorLiquido = valorNota - totalTaxes;
    
    // Update DOM with formatted values
    cofinsElement.textContent = formatBRL(cofins);
    csllElement.textContent = formatBRL(csll);
    irrfElement.textContent = formatBRL(irrf);
    pisElement.textContent = formatBRL(pis);
    totalElement.textContent = formatBRL(totalTaxes);
    liquidoElement.textContent = formatBRL(valorLiquido);
}

// Handle input formatting and calculation
valorNotaInput.addEventListener('input', function(e) {
    const cursorPosition = this.selectionStart;
    const oldLength = this.value.length;
    
    // Format the input
    this.value = formatInputBRL(this.value);
    
    // Adjust cursor position after formatting
    const newLength = this.value.length;
    const newCursorPosition = cursorPosition + (newLength - oldLength);
    this.setSelectionRange(newCursorPosition, newCursorPosition);
    
    // Calculate taxes
    calculateTaxes();
});

// Initialize with zero values
calculateTaxes();

// Focus input on load
window.addEventListener('load', function() {
    valorNotaInput.focus();
});
