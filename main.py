from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("maestra.html")

@app.route("/costoUniforme")
def costoUniforme():
    return render_template("CostoUniforme.html")

@app.route("/aestrella")
def aestrella():
    return render_template("AEstrella.html")

@app.route("/amplitud")
def amplitud():
    return render_template("Amplitud.html")

@app.route("/profundidadLimitada")
def profundidadLimitada():
    return render_template("ProfundidadLimitada.html")

@app.route("/voraz")
def voraz():
    return render_template("Voraz.html")

@app.route("/mejorOpcion")
def mejorOpcion():
    return render_template("MejorOpcion.html")



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)