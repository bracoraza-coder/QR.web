// Instancia de la librería qr-code-styling
const qrCode = new QRCodeStyling({
    width: 280,
    height: 280,
    type: "svg", // Renderizamos en SVG por defecto para que sea súper nítido
    data: "https://generador-qr.com",
    image: "",
    dotsOptions: {
        color: "#000000",
        type: "square" // square, rounded, dots, extra-rounded
    },
    backgroundOptions: {
        color: "#ffffff",
    },
    imageOptions: {
        crossOrigin: "anonymous",
        margin: 10 // Margen alrededor del logo
    },
    cornersSquareOptions: {
        type: "square"
    }
});

// Referencias del DOM
const qrContainer = document.getElementById("qr");
const btnGenerate = document.getElementById("btn-generate");
const btnDownPng = document.getElementById("btn-down-png");
const btnDownSvg = document.getElementById("btn-down-svg");
const logoInput = document.getElementById("logo-input");
const btnRemoveLogo = document.getElementById("btn-remove-logo");

// Lógica de Pestañas (Tabs)
let currentTab = "tab-url";
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        // Quitar activos
        tabs.forEach(t => t.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        
        // Poner activo el seleccionado
        tab.classList.add("active");
        currentTab = tab.getAttribute("data-target");
        document.getElementById(currentTab).classList.add("active");
    });
});

// Manejo de subida de Logo
let uploadedLogoData = "";
logoInput.addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedLogoData = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

btnRemoveLogo.addEventListener("click", () => {
    logoInput.value = "";
    uploadedLogoData = "";
});

// Formateo de datos basado en la pestaña seleccionada
function getQrData() {
    let data = "";
    
    switch (currentTab) {
        case "tab-url":
            data = document.getElementById("input-url").value.trim();
            break;
        case "tab-text":
            data = document.getElementById("input-text").value.trim();
            break;
        case "tab-email":
            const email = document.getElementById("input-email-to").value.trim();
            const sub = document.getElementById("input-email-sub").value.trim();
            if(email) data = `mailto:${email}?subject=${encodeURIComponent(sub)}`;
            break;
        case "tab-wa":
            const phone = document.getElementById("input-wa-phone").value.trim().replace(/\s+/g, '');
            const msg = document.getElementById("input-wa-msg").value.trim();
            if(phone) data = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
            break;
        case "tab-wifi":
            const ssid = document.getElementById("input-wifi-ssid").value.trim();
            const pass = document.getElementById("input-wifi-pass").value.trim();
            const type = document.getElementById("input-wifi-type").value;
            if(ssid) data = `WIFI:T:${type};S:${ssid};P:${pass};H:false;;`;
            break;
    }
    return data;
}

// Evento Principal: Generar
btnGenerate.addEventListener("click", () => {
    const data = getQrData();

    if (!data) {
        alert("Por favor, rellena los campos necesarios para tu código QR.");
        return;
    }

    // Obtener colores y estilos
    const colorDark = document.getElementById("color-dark").value;
    const colorLight = document.getElementById("color-light").value;
    const dotStyle = document.getElementById("dot-style").value;

    // Actualizar configuración
    qrCode.update({
        data: data,
        image: uploadedLogoData,
        dotsOptions: {
            color: colorDark,
            type: dotStyle
        },
        backgroundOptions: {
            color: colorLight
        },
        // Sincronizar los cuadrados de las esquinas con el estilo principal
        cornersSquareOptions: {
            type: dotStyle === 'dots' || dotStyle === 'rounded' ? 'extra-rounded' : 'square',
            color: colorDark
        }
    });

    // Limpiar contenedor e inyectar nuevo QR
    qrContainer.innerHTML = "";
    qrCode.append(qrContainer);

    // Habilitar descargas
    btnDownPng.disabled = false;
    btnDownSvg.disabled = false;
});

// Descargas Nativas
btnDownPng.addEventListener("click", () => {
    qrCode.download({ name: "qr-code", extension: "png" });
});

btnDownSvg.addEventListener("click", () => {
    qrCode.download({ name: "qr-code", extension: "svg" });
});

// Render inicial vacío (Opcional)
qrCode.append(qrContainer);