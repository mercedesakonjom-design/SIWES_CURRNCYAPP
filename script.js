
let amount = document.getElementById("amount");
let fromCurrency = document.getElementById("fromCurrency");
let toCurrency = document.getElementById("toCurrency");

let convertBtn = document.getElementById("convertBtn");
let swapBtn = document.getElementById("swap");

let resultText = document.getElementById("resultText");
let rateText = document.getElementById("rateText");
let error = document.getElementById("error");

// Only three currencies
let currencies = ["GBP", "NGN", "USD"];

// Populate dropdowns
currencies.forEach(currency => {
    fromCurrency.add(new Option(currency, currency));
    toCurrency.add(new Option(currency, currency));
});

// Default currencies
fromCurrency.value = "USD";
toCurrency.value = "NGN";

// Convert currency
async function convertCurrency() {

    let value = Number(amount.value);
    let from = fromCurrency.value;
    let to = toCurrency.value;

    error.innerText = "";

    if (!Number.isFinite(value) || value <= 0) {
        error.innerText = "Please enter a valid amount.";
        return;
    }

    convertBtn.innerText = "Converting...";
    convertBtn.disabled = true;

    try {

        let response = await fetch(
            `https://open.er-api.com/v6/latest/${from}`
        );

        if (!response.ok) throw new Error("API error");

        let data = await response.json();

        if (data.result !== "success") throw new Error("Rate unavailable");

        let rate = data.rates[to];
        let convertedAmount = value * rate;

        resultText.innerText =
            convertedAmount.toLocaleString(undefined, {
                maximumFractionDigits: 4
            }) + " " + to;

        rateText.innerText =
            `1 ${from} = ${rate.toFixed(4)} ${to}`;

    } catch (err) {

        try {
            // Backup API
            let response = await fetch(
                `https://latest.currency-api.pages.dev/v1/currencies/${from.toLowerCase()}.json`
            );

            if (!response.ok) throw new Error("Backup API failed");

            let data = await response.json();

            let rate = data[from.toLowerCase()][to.toLowerCase()];
            let convertedAmount = value * rate;

            resultText.innerText =
                convertedAmount.toLocaleString(undefined, {
                    maximumFractionDigits: 4
                }) + " " + to;

            rateText.innerText =
                `1 ${from} = ${rate.toFixed(4)} ${to}`;

        } catch (backupError) {

            resultText.innerText = "Conversion failed";
            rateText.innerText = "";
            error.innerText = "Unable to connect. Check your internet.";

            console.log(backupError);
        }

    } finally {

        convertBtn.innerText = "Convert Currency";
        convertBtn.disabled = false;

    }
}

// Convert button
convertBtn.addEventListener("click", convertCurrency);

// Swap currencies
swapBtn.addEventListener("click", () => {

    let temporary = fromCurrency.value;

    fromCurrency.value = toCurrency.value;
    toCurrency.value = temporary;

    convertCurrency();

});

// Press Enter to convert
amount.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        convertCurrency();
    }

});

// Initial conversion
convertCurrency();

