// --- PARTE 1: Configuración inicial ---

const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

// Establecer tema al cargar
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.textContent = '☀️';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️';
        }
    });
}

// Configuración inicial de la librería
const qrCode = new QRCodeStyling({
    width: 280,
    height: 280,
    type: "svg",
    data: "https://crearunqr.com",
    image: "",
    dotsOptions: { color: "#1e293b", type: "square" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", margin: 10 },
    cornersSquareOptions: { type: "square" }
});

const qrContainer = document.getElementById("qr");
const qrWrapper = document.getElementById("qr-wrapper");
const btnGenerate = document.getElementById("btn-generate");
const btnDownPng = document.getElementById("btn-down-png");
const btnDownSvg = document.getElementById("btn-down-svg");
const btnCopyLink = document.getElementById("btn-copy-link");
const logoInput = document.getElementById("logo-input");
const btnRemoveLogo = document.getElementById("btn-remove-logo");

let currentTab = "tab-url";
let uploadedLogoData = "";

// Pestañas
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        tab.classList.add("active");
        currentTab = tab.getAttribute("data-target");
        document.getElementById(currentTab).classList.add("active");
        
        // Mostrar botón de copiar solo si es URL o Texto
        if(btnCopyLink) {
            if(currentTab === "tab-url" || currentTab === "tab-text") {
                btnCopyLink.classList.remove("hidden");
            } else {
                btnCopyLink.classList.add("hidden");
            }
        }
    });
});

// Logo
if(logoInput) {
    logoInput.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { 
                uploadedLogoData = e.target.result; 
                if(btnRemoveLogo) btnRemoveLogo.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });
}

if(btnRemoveLogo) {
    btnRemoveLogo.addEventListener("click", () => {
        if(logoInput) logoInput.value = "";
        uploadedLogoData = "";
        btnRemoveLogo.style.display = "none";
    });
}

// Función extraer datos
function getQrData() {
    let data = "";
    let labelText = ""; 
    switch (currentTab) {
        case "tab-url":
            const urlVal = document.getElementById("input-url");
            data = urlVal ? urlVal.value.trim() : "";
            labelText = "Enlace: " + data;
            break;
        case "tab-text":
            const txtVal = document.getElementById("input-text");
            data = txtVal ? txtVal.value.trim() : "";
            labelText = "Texto: " + data.substring(0,20) + "...";
            break;
        case "tab-email":
            const email = document.getElementById("input-email-to").value.trim();
            const sub = document.getElementById("input-email-sub").value.trim();
            if(email) data = `mailto:${email}?subject=${encodeURIComponent(sub)}`;
            labelText = "Email: " + email;
            break;
        case "tab-wa":
            const phone = document.getElementById("input-wa-phone").value.trim();
            const msg = document.getElementById("input-wa-msg").value.trim();
            if(phone) data = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
            labelText = "WhatsApp: " + phone;
            break;
        case "tab-wifi":
            const ssid = document.getElementById("input-wifi-ssid").value.trim();
            const pass = document.getElementById("input-wifi-pass").value.trim();
            const type = document.getElementById("input-wifi-type").value;
            if(ssid) data = `WIFI:T:${type};S:${ssid};P:${pass};H:false;;`;
            labelText = "Wi-Fi: " + ssid;
            break;
    }
    return { data, labelText };
}

// Evento Generar
if(btnGenerate) {
    btnGenerate.addEventListener("click", () => {
        const { data, labelText } = getQrData();

        if (!data) {
            const originalText = btnGenerate.textContent;
            btnGenerate.textContent = "¡Faltan datos!";
            setTimeout(() => btnGenerate.textContent = originalText, 2000);
            return;
        }

        const colorDark = document.getElementById("color-dark").value;
        const colorLight = document.getElementById("color-light").value;
        const dotStyle = document.getElementById("dot-style").value;

        qrCode.update({
            data: data,
            image: uploadedLogoData,
            dotsOptions: { color: colorDark, type: dotStyle },
            backgroundOptions: { color: colorLight },
            cornersSquareOptions: { type: dotStyle === 'dots' || dotStyle === 'rounded' ? 'extra-rounded' : 'square', color: colorDark }
        });

        if(qrContainer) qrContainer.innerHTML = "";
        if(qrWrapper) {
            qrWrapper.classList.remove("qr-animate");
            void qrWrapper.offsetWidth; 
            qrCode.append(qrContainer);
            qrWrapper.classList.add("qr-animate");
        }

        if(btnDownPng) btnDownPng.disabled = false;
        if(btnDownSvg) btnDownSvg.disabled = false;
        
        saveToHistory(data, labelText);
    });
}

// Descargas
if(btnDownPng) btnDownPng.addEventListener("click", () => qrCode.download({ name: "mi-qr", extension: "png" }));
if(btnDownSvg) btnDownSvg.addEventListener("click", () => qrCode.download({ name: "mi-qr", extension: "svg" }));

if(btnCopyLink) {
    btnCopyLink.addEventListener("click", () => {
        const { data } = getQrData();
        if(data) {
            navigator.clipboard.writeText(data);
            const original = btnCopyLink.textContent;
            btnCopyLink.textContent = "¡Copiado!";
            setTimeout(() => btnCopyLink.textContent = original, 2000);
        }
    });
}

// Funciones de Historial
function saveToHistory(data, label) {
    if(!data) return;
    let history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
    history = history.filter(item => item.data !== data);
    history.unshift({ data: data, label: label, date: new Date().toLocaleTimeString() });
    if(history.length > 5) history.pop();
    localStorage.setItem('qrHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const historyContainer = document.getElementById('history-container');
    const historyList = document.getElementById('history-list');

    if (!historyContainer || !historyList) return;

    let history = [];
    const savedData = localStorage.getItem('qrHistory');
    if (savedData) {
        history = JSON.parse(savedData);
    }

    historyList.innerHTML = "";

    if (history.length === 0) {
        historyContainer.style.display = "none";
        return;
    }

    historyContainer.style.display = "block";

    history.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item.label;
        li.onclick = function() {
            // Opcional: Recargar al clicar en el historial (necesita lógica extra para rellenar inputs)
            alert("Has seleccionado del historial: " + item.label);
        };
        historyList.appendChild(li);
    });
}

// Ejecutar historial al cargar la página
renderHistory();
