const voiceBtn = document.getElementById('voiceBtn');
const sendBtn = document.getElementById('sendBtn');
const commandInput = document.getElementById('commandInput');
const statusText = document.getElementById('statusText');
const testConnection = document.getElementById('testConnection');
const connectionStatus = document.getElementById('connectionStatus');

let luzEncendida = false;
let puertaAbierta = false;
let arduinoConectado = false;
let recognition;
let escuchando = false;

// === CONFIGURA AQUÍ LA URL DEL BACKEND ===
const BACKEND_URL = "http://192.168.56.1:5000/comando"; 
// ⚠️ CAMBIAR EN BASE A TU IP LOCAL"

// === PRUEBA DE VOZ ===
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = true;

  let silenceTimeout; // Variable para el temporizador de silencio

  recognition.onstart = () => {
    escuchando = true; // Cambia el estado a "escuchando"
    statusText.textContent = '🎤 Escuchando...';
  };

  recognition.onresult = (event) => {
    clearTimeout(silenceTimeout); // Reinicia el temporizador al detectar un resultado
    for (const result of event.results) {
      console.log(result[0].transcript); // Muestra el texto reconocido en la consola
    }
    // Configura el temporizador para detener el reconocimiento después de 3 segundos de silencio
    silenceTimeout = setTimeout(() => {
      recognition.stop();
      statusText.textContent = '🎤 Reconocimiento detenido por silencio.';
    }, 3000);
  };

  recognition.onerror = (event) => {
    console.error('Error en reconocimiento de voz:', event.error);
    if (event.error === 'network') {
      statusText.textContent = '❌ Error de red. Verifica tu conexión a Internet.';
    } else {
      statusText.textContent = '❌ Error al reconocer la voz.';
    }
    escuchando = false; // Reinicia el estado en caso de error
    clearTimeout(silenceTimeout); // Limpia el temporizador en caso de error
  };

  recognition.onend = () => {
    escuchando = false; // Cambia el estado a "no escuchando"
    statusText.textContent = '🎤 Reconocimiento de voz detenido.';
    clearTimeout(silenceTimeout); // Limpia el temporizador cuando se detiene
  };

  voiceBtn.addEventListener('click', () => {
    if (!escuchando) {
      recognition.start(); // Solo inicia si no está escuchando
    } else {
      console.log('El reconocimiento de voz ya está activo.');
    }
  });
} else {
  statusText.textContent = '⚠️ Tu navegador no soporta reconocimiento de voz.';
}

sendBtn.addEventListener('click', () => {
  const text = commandInput.value.toLowerCase();
  if (text.trim() !== '') {
    interpretarComando(text);
    commandInput.value = '';
  }
});

// === INTERPRETAR COMANDOS ===
function interpretarComando(frase) {
  enviarAI(frase); // Envía el comando al backend Flask

  if (frase.includes('encender luz') || frase.includes('prender luz')) {
    luzEncendida = true;
  } else if (frase.includes('apagar luz')) {
    luzEncendida = false;
  } else if (frase.includes('abrir puerta')) {
    puertaAbierta = true;
  } else if (frase.includes('cerrar puerta')) {
    puertaAbierta = false;
  }

  actualizarSimulacion();
}

// === SIMULACIÓN VISUAL ===
function actualizarSimulacion() {
  document.querySelector('#luzSala .estado').textContent = luzEncendida ? 'Encendida' : 'Apagada';
  document.querySelector('#puerta .estado').textContent = puertaAbierta ? 'Abierta' : 'Cerrada';
}

// === CONEXIÓN SIMULADA CON ARDUINO ===
testConnection.addEventListener('click', () => {
  connectionStatus.textContent = '🔄 Probando conexión...';
  setTimeout(() => {
    arduinoConectado = true;
    connectionStatus.textContent = '✅ Conectado (modo simulación)';
  }, 1500);
});

// === CONEXIÓN CON BACKEND PYTHON ===
async function enviarAI(comando) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comando })
    });

    const data = await res.json();
    statusText.textContent = `🤖 IA: ${data.respuesta}`;
  } catch (error) {
    console.error("Error:", error);
    statusText.textContent = "⚠️ No se pudo conectar con el backend. Modo simulador.";
  }
}



// === RESERVA PARA CONEXIÓN REAL ===
// function enviarComandoArduino(comando) {
//   if (!arduinoConectado) return;
//   fetch('http://192.168.x.x:8080/comando', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ accion: comando })
//   });
// }
