from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    text = data.get("text", "")

    # Example logic (you will replace this with AI logic later)
    length = len(text)

    return jsonify({
        "message": "API working!",
        "length_of_text": length
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)

