import joblib
import pandas as pd
import numpy as np
from io import StringIO
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Advanced Real Estate ML Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_artifacts():
    return (
        joblib.load('models_suite.joblib'),
        joblib.load('scaler.joblib'),
        joblib.load('metrics.joblib'),
        joblib.load('feature_names.joblib')
    )

class PredictionRequest(BaseModel):
    MedInc: float
    HouseAge: float
    AveRooms: float
    AveBedrms: float
    Population: float
    model_type: str = "OLS_Linear"

@app.get("/")
def health_check():
    models, _, _, _ = get_artifacts()
    return {"status": "Active", "models_loaded": list(models.keys())}

@app.get("/metrics")
def get_metrics():
    _, _, metrics, _ = get_artifacts()
    # Return both top-level and nested to satisfy whatever structure the frontend checks
    response = {"metrics": metrics}
    response.update(metrics)
    return response

@app.post("/predict")
def predict_single(data: PredictionRequest):
    models, scaler, _, _ = get_artifacts()
    if data.model_type not in models:
        # Fallback if the frontend sends just "OLS", "Ridge", or "Lasso"
        mapping = {"OLS": "OLS_Linear", "Ridge": "Ridge_L2", "Lasso": "Lasso_L1"}
        model_key = mapping.get(data.model_type, data.model_type)
        if model_key not in models:
            raise HTTPException(status_code=400, detail="Invalid model type.")
    else:
        model_key = data.model_type
    
    features = np.array([[data.MedInc, data.HouseAge, data.AveRooms, data.AveBedrms, data.Population]])
    features_scaled = scaler.transform(features)
    
    model = models[model_key]
    prediction = max(0.0, float(model.predict(features_scaled)[0]) * 100000)
    
    return {
        "estimated_value_usd": round(prediction, 2),
        "prediction": round(prediction, 2),
        "model_used": model_key
    }

@app.post("/predict-batch")
async def predict_batch(file: UploadFile = File(...), model_type: str = "OLS_Linear"):
    models, scaler, _, feature_names = get_artifacts()
    mapping = {"OLS": "OLS_Linear", "Ridge": "Ridge_L2", "Lasso": "Lasso_L1"}
    model_key = mapping.get(model_type, model_type)
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed.")
    
    content = await file.read()
    df = pd.read_csv(StringIO(content.decode('utf-8')))
    
    if not all(col in df.columns for col in feature_names):
        raise HTTPException(status_code=400, detail=f"CSV must contain columns: {feature_names}")
    
    X_scaled = scaler.transform(df[feature_names])
    predictions = models[model_key].predict(X_scaled)
    
    df['Predicted_Value_USD'] = [max(0.0, float(p) * 100000) for p in predictions]
    return df.to_dict(orient='records')