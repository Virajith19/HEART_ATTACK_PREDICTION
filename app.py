from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join('models','best_pipeline.pkl')
if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Model not found at {MODEL_PATH}. Run train_and_save.py first.")

model = joblib.load(MODEL_PATH)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({'error':'Empty request body'}), 400
    if isinstance(data, list):
        data = data[0]
    df = pd.DataFrame([data])
    for c in df.columns:
        try:
            df[c] = pd.to_numeric(df[c])
        except Exception:
            pass
    pred = model.predict(df)[0]
    prob = None
    if hasattr(model, 'predict_proba'):
        prob = float(model.predict_proba(df)[0,1])
    return jsonify({'prediction': int(pred), 'probability': None if prob is None else round(prob,4)})

@app.route('/explain', methods=['POST'])
def explain():
    data = request.get_json()
    if not data:
        return jsonify({'error':'Empty request body'}), 400
    if isinstance(data, list):
        data = data[0]
    df = pd.DataFrame([data])
    for c in df.columns:
        try:
            df[c] = pd.to_numeric(df[c])
        except Exception:
            pass
    try:
        top = []
        for col in df.columns:
            top.append((col, float(abs(df[col].iloc[0]))))
        top_sorted = sorted(top, key=lambda x: x[1], reverse=True)[:3]
        top_features = [{'feature':k, 'importance':v} for k,v in top_sorted]
        return jsonify({'top_features': top_features})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
