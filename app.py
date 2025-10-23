from flask import Flask, request, jsonify, render_template
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Habilita CORS para todas las rutas

# Dirección del Arduino (ESP8266 o ESP32)
ARDUINO_IP = "http://192.168.1.50"  # Cambiar cuando lo tengas

# 🏠 Ruta principal: muestra la página web
@app.route("/")
def home():
    return render_template("index.html")


# 🤖 Ruta para recibir comandos de la IA
@app.route("/comando", methods=["POST"])
def recibir_comando():
    data = request.get_json()
    comando = data.get("comando", "").lower()
    respuesta = interpretar_ia(comando)
    return jsonify({"respuesta": respuesta})


# 🔎 Mini IA básica
def interpretar_ia(texto):
    if "encender" in texto and "luz" in texto:
        enviar_a_arduino("encender_luz")
        return "Encendiendo la luz del salón"
    elif "apagar" in texto and "luz" in texto:
        enviar_a_arduino("apagar_luz")
        return "Apagando la luz del salón"
    elif "abrir" in texto and "puerta" in texto:
        enviar_a_arduino("abrir_puerta")
        return "Abriendo la puerta"
    elif "cerrar" in texto and "puerta" in texto:
        enviar_a_arduino("cerrar_puerta")
        return "Cerrando la puerta"
    else:
        return "No entendí el comando"


# 📡 Comunicación (simulada por ahora) con Arduino
def enviar_a_arduino(accion):
    try:
        url = f"{ARDUINO_IP}/{accion}"
        requests.get(url, timeout=2)
        print(f"Comando enviado: {accion}")
    except Exception as e:
        print("No se pudo conectar con el Arduino:", e)


# 🚀 Ejecutar servidor Flask
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
