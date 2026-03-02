document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. MODO OSCURO
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const htmlTag = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        htmlTag.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.textContent = '☀️';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = htmlTag.getAttribute('data-theme') === 'dark';
            if (isDark) {
                htmlTag.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggle.textContent = '🌙';
            } else {
                htmlTag.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggle.textContent = '☀️';
            }
        });
    }

    // ==========================================
    // 2. CONFIGURACIÓN DE LA LIBRERÍA QR
    // ==========================================
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
    const logoInput = document.getElementById("logo-input");
    const btnRemoveLogo = document.getElementById("btn-remove-logo");

    let currentTab = "tab-url";
    let uploadedLogoData = "";

    // ==========================================
    // 3. CONTROL DE PESTAÑAS (TABS)
    // ==========================================
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            
            tab.classList.add("active");
            currentTab = tab.getAttribute("data-target");
            const target = document.getElementById(currentTab);
            if (target) target.classList.add("active");
        });
    });

    // ==========================================
    // 4. CONTROL DEL LOGO
    // ==========================================
    if (logoInput) {
        logoInput.addEventListener("change", function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => { 
                    uploadedLogoData = e.target.result; 
                    if (btnRemoveLogo) btnRemoveLogo.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnRemoveLogo) {
        btnRemoveLogo.addEventListener("click", () => {
            logoInput.value = "";
            uploadedLogoData = "";
            btnRemoveLogo.style.display = "none";
        });
    }

    // ==========================================
    // 5. OBTENER DATOS DE LOS FORMULARIOS
    // ==========================================
    function getQrData() {
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : "";
        };

        let data = "";
        let labelText = ""; 

        switch (currentTab) {
            case "tab-url":
                data = getVal("input-url");
                labelText = "Enlace: " + data;
                break;
            case "tab-text":
                data = getVal("input-text");
                labelText = "Texto: " + (data.length > 20 ? data.substring(0,20)+"..." : data);
                break;
            case "tab-email":
                const email = getVal("input-email-to");
                const sub = getVal("input-email-sub");
                if (email) data = `mailto:${email}?subject=${encodeURIComponent(sub)}`;
                labelText = "Email: " + email;
                break;
            case "tab-wa":
                const phone = getVal("input-wa-phone");
                const msg = getVal("input-wa-msg");
                if (phone) data = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                labelText = "WhatsApp: " + phone;
                break;
            case "tab-wifi":
                const ssid = getVal("input-wifi-ssid");
                const pass = getVal("input-wifi-pass");
                const typeEl = document.getElementById("input-wifi-type");
                const type = typeEl ? typeEl.value : "WPA";
                if (ssid) data = `WIFI:T:${type};S:${ssid};P:${pass};H:false;;`;
                labelText = "WiFi: " + ssid;
                break;
        }
        return { data, labelText };
    }

    // ==========================================
    // 6. BOTÓN GENERAR
    // ==========================================
    if (btnGenerate) {
        btnGenerate.addEventListener("click", () => {
            const { data, labelText } = getQrData();

            if (!data) {
                const oldText = btnGenerate.textContent;
                btnGenerate.textContent = "¡Rellena los datos!";
                setTimeout(() => btnGenerate.textContent = oldText, 2000);
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
                cornersSquareOptions: { 
                    type: (dotStyle === 'dots' || dotStyle === 'rounded') ? 'extra-rounded' : 'square', 
                    color: colorDark 
                }
            });

            if (qrContainer) qrContainer.innerHTML = "";
            if (qrWrapper) {
                qrWrapper.classList.remove("qr-animate");
                void qrWrapper.offsetWidth; 
                qrWrapper.classList.add("qr-animate");
            }
            qrCode.append(qrContainer);

            if (btnDownPng) btnDownPng.disabled = false;
            if (btnDownSvg) btnDownSvg.disabled = false;
            
            saveToHistory(data, labelText);
        });
    }

    // ==========================================
    // 7. DESCARGAS
    // ==========================================
    if (btnDownPng) {
        btnDownPng.addEventListener("click", () => {
            qrCode.download({ name: "mi-qr", extension: "png" });
        });
    }
    if (btnDownSvg) {
        btnDownSvg.addEventListener("click", () => {
            qrCode.download({ name: "mi-qr", extension: "svg" });
        });
    }

    // ==========================================
    // 8. HISTORIAL (CORREGIDO)
    // ==========================================
    function saveToHistory(data, label) {
        if (!data) return;
        
        let history = [];
        try {
            const saved = localStorage.getItem('qrHistory');
            if (saved) history = JSON.parse(saved);
        } catch(e) { history = []; }

        history = history.filter(item => item.data !== data);
        history.unshift({ data: data, label: label });
        if (history.length > 5) history.pop();

        localStorage.setItem('qrHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        const container = document.getElementById('history-container');
        const list = document.getElementById('history-list');

        if (!container || !list) return;

        let history = [];
        try {
            const saved = localStorage.getItem('qrHistory');
            if (saved) history = JSON.parse(saved);
        } catch(e) { history = []; }

        list.innerHTML = ""; 

        if (history.length === 0) {
            container.style.display = "none";
        } else {
            container.style.display = "block";
            history.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item.label;
                
                li.onclick = () => {
                    navigator.clipboard.writeText(item.data);
                    
                    const originalText = li.textContent;
                    li.textContent = "¡Copiado! ✅";
                    li.style.background = "#dcfce7";
                    li.style.color = "#166534";
                    
                    setTimeout(() => {
                        li.textContent = originalText;
                        li.style.background = "";
                        li.style.color = "";
                    }, 1500);
                };
                // ESTA LÍNEA FALTABA: Añadir el elemento a la lista
                list.appendChild(li);
            });
        }
    }

    // Cargar historial al arrancar
    renderHistory();
});
