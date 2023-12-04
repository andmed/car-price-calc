document.addEventListener('DOMContentLoaded', function () {
    const settingsIcon = document.querySelector('.settings-icon');
    settingsIcon.addEventListener('click', openSettingsModal);
});

document.addEventListener("DOMContentLoaded", function () {
    // Check if the API key is set
    const apiKey = localStorage.getItem('exchangeApiKey');

    // If API key is not set, open the settings modal
    if (!apiKey) {
        openSettingsModal();
    }

    const carPriceInput = document.getElementById("carPrice");
    const auctionDropdown = document.getElementById("auctionDropdown");
    const deliveryPriceInput = document.getElementById("deliveryPrice");
    const dutyAndVat = document.getElementById("dutyAndVat");
    const otherExpenditure = document.getElementById("otherExpenditure");
    const totalPriceSpan = document.getElementById("totalPrice");

    let companyPrices; // Variable to store the loaded company prices
    let exchangeRate; // Variable to store the current exchange rate

    // Function to fetch exchange rate from JPY to EUR
    async function fetchExchangeRate() {
        // Retrieve the API key from localStorage
        const apiKey = localStorage.getItem('exchangeApiKey');
        
        // Check if the API key is available
        if (!apiKey) {
            console.error('API Key is missing. Please set the API key in the settings.');
            return;
        }
        const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/JPY/EUR/`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            exchangeRate = data.conversion_rate;
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
        }
    }

    // Load auction data and exchange rate from JSON file
    Promise.all([
        fetch("data.json").then(response => response.json()),
        fetchExchangeRate()
    ]).then(([data, rate]) => {
        companyPrices = data;
        // Populate auction dropdown
        for (const auction in data) {
            const option = document.createElement("option");
            option.value = auction;
            option.textContent = auction;
            auctionDropdown.appendChild(option);
        }

        // Update total price on initial load
        calculateTotalPrice();
    });

    // Add event listeners to inputs
    carPriceInput.addEventListener("input", calculateTotalPrice);
    auctionDropdown.addEventListener("change", calculateTotalPrice);
    deliveryPriceInput.addEventListener("input", calculateTotalPrice);

    // Function to calculate and update total price
    function calculateTotalPrice() {
    const carPrice = parseFloat(carPriceInput.value) || 0;
    const selectedAuction = auctionDropdown.value;
    const companyPrice = selectedAuction ? companyPrices[selectedAuction] : 0;
    const deliveryPrice = parseFloat(deliveryPriceInput.value) || 0;

    const totalPriceJPY = carPrice + companyPrice + deliveryPrice;
    const totalDeliverdPriceInEUR = totalPriceJPY * exchangeRate;

    const dutyAndVatPrice = (totalDeliverdPriceInEUR * 1.10 * 1.19) - totalDeliverdPriceInEUR;
    dutyAndVat.textContent = `EUR: ${dutyAndVatPrice.toLocaleString("en-US", { style: "currency", currency: "EUR" })}`;
    
    const otherExpenditureEUR = 400 + 180 + 150 + 30 + 50;
    otherExpenditure.textContent = `EUR: ${otherExpenditureEUR.toLocaleString("en-US", { style: "currency", currency: "EUR" })}`

    const totalPriceEUR = totalDeliverdPriceInEUR + dutyAndVatPrice + otherExpenditureEUR;

    totalPriceSpan.textContent = `EUR: ${totalPriceEUR.toLocaleString("en-US", { style: "currency", currency: "EUR" })}`;
    }
});

function openSettingsModal() {
    document.getElementById('settingsModal').style.display = 'block';
}
  
function closeSettingsModal() {
const modal = document.getElementById('settingsModal');
modal.style.display = 'none';
}

function saveApiKey() {
const apiKeyInput = document.getElementById('apiKey');
const apiKey = apiKeyInput.value.trim();

if (apiKey !== "") {
    // Save the apiKey to localStorage
    localStorage.setItem('exchangeApiKey', apiKey);
    console.log('API Key saved:', apiKey);

    // Clear the input field
    apiKeyInput.value = "";

    // Refresh the page to apply the new API key
    location.reload();
} else {
    alert('Please enter a valid API key.');
}
}

// ce3ee05747570a53fc2dfc8e