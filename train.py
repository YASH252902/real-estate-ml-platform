import joblib
import pandas as pd
import numpy as np
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

def build_models():
    print("Loading California Housing dataset...")
    housing = fetch_california_housing(as_frame=True)
    X = housing.frame[['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 'Population']]
    y = housing.frame['MedHouseVal']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    models = {
        "OLS_Linear": LinearRegression(),
        "Ridge_L2": Ridge(alpha=1.0),
        "Lasso_L1": Lasso(alpha=0.01)
    }

    metrics_report = {}
    trained_models = {}

    for name, model in models.items():
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        
        # Lowercase keys matching Lovable's React components
        metrics_report[name] = {
            "r2_score": round(float(r2_score(y_test, y_pred)), 4),
            "r2": round(float(r2_score(y_test, y_pred)), 4),
            "mse": round(float(mean_squared_error(y_test, y_pred)), 4),
            "mae": round(float(mean_absolute_error(y_test, y_pred)), 4),
            "coefficients": {feature: round(float(coef), 4) for feature, coef in zip(X.columns, model.coef_)},
            # Adding uppercase fallbacks as well just in case
            "R2_Score": round(float(r2_score(y_test, y_pred)), 4),
            "MSE": round(float(mean_squared_error(y_test, y_pred)), 4),
            "MAE": round(float(mean_absolute_error(y_test, y_pred)), 4),
            "Coefficients": {feature: round(float(coef), 4) for feature, coef in zip(X.columns, model.coef_)}
        }
        trained_models[name] = model

    joblib.dump(trained_models, 'models_suite.joblib')
    joblib.dump(scaler, 'scaler.joblib')
    joblib.dump(metrics_report, 'metrics.joblib')
    joblib.dump(list(X.columns), 'feature_names.joblib')
    
    print("Successfully exported all models and metrics with matched keys.")

if __name__ == '__main__':
    build_models()