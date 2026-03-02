// --- PARTE 1 ---
// Tema Oscuro / Claro
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
}

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

// Configuración inicial de la librería QR
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
        if(currentTab === "tab-url" || currentTab === "tab-text") {
            btnCopyLink.classList.remove("hidden");
        } else {
            btnCopyLink.classList.add("hidden");
        }
    });
});

// Subida de Logo
logoInput.addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { 
            uploadedLogoData = e.target.result; 
            btnRemoveLogo.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
});

btnRemoveLogo.addEventListener("click", () => {
    logoInput.value = "";
    uploadedLogoData = "";
    btnRemoveLogo.style.display = "none";
});
// --- PARTE 2 ---
// Extraer Datos según pestaña
function getQrData() {
    let data = "";
    let labelText = ""; 
    switch (currentTab) {
        case "tab-url":
            data = document.getElementById("input-url").value.trim();
            labelText = "Enlace: " + data;
            break;
        case "tab-text":
            data = document.getElementById("input-text").value.trim();
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

// Generar QR y Animación
btnGenerate.addEventListener("click", () => {
    const { data, labelText } = getQrData();

    if (!data) {
        btnGenerate.textContent = "¡Rellena los datos!";
        setTimeout(() => btnGenerate.textContent = "Generar Código QR", 2000);
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

    qrContainer.innerHTML = "";
    qrWrapper.classList.remove("qr-animate");
    void qrWrapper.offsetWidth; 
    qrCode.append(qrContainer);
    qrWrapper.classList.add("qr-animate");

    btnDownPng.disabled = false;
    btnDownSvg.disabled = false;
    
    saveToHistory(data, labelText);
});

// Descargas y Copiar
btnDownPng.addEventListener("click", () => qrCode.download({ name: "mi-qr", extension: "png" }));
btnDownSvg.addEventListener("click", () => qrCode.download({ name: "mi-qr", extension: "svg" }));

btnCopyLink.addEventListener("click", () => {
    const { data } = getQrData();
    if(data) {
        navigator.clipboard.writeText(data);
        btnCopyLink.innerHTML = "¡Copiado!";
        setTimeout(() => btnCopyLink.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Copiar`, 2000);
    }
});

// --- SISTEMA DE HISTORIAL ---
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
    
    if (!historyContainer || !historyList) {
        return;
    }

    let historyArray ="""),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""INSERT_INPUT_HERE"""),
            ],
        ),
    ]
    tools = [
        types.Tool(code_execution=types.ToolCodeExecution),
        types.Tool(googleSearch=types.GoogleSearch(
        )),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_level="HIGH",
        ),
        tools=tools,
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if (
            chunk.parts is None
        ):
            continue
        if chunk.parts[0].text:
            print(chunk.parts[0].text, end="")
        if chunk.parts[0].executable_code:
            print(chunk.parts[0].executable_code)
        if chunk.parts[0].code_execution_result:
            print(chunk.parts[0].code_execution_result)

if __name__ == "__main__":
    generate()
