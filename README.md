# ValuIQ — Full-Stack Real Estate ML Platform

ValuIQ is an end-to-end, production-ready machine learning web platform that provides automated property valuations, comparative model diagnostics, and bulk dataset inference. Built with a high-performance Python/FastAPI backend and a React/TanStack Start frontend, the entire stack is hosted live on Render.

---

## 🌐 Live Deployments & Links

| Service | Access Link | Description |
| :--- | :--- | :--- |
| **Live Frontend Dashboard** | [valuiq-dashboard-live.onrender.com](https://valuiq-dashboard-live.onrender.com) | Interactive React analytics and prediction UI |
| **Live Backend API** | [valuiq-api.onrender.com](https://valuiq-api.onrender.com) | FastAPI REST service serving model inference and diagnostics |
| **Interactive API Docs (Swagger)** | [valuiq-api.onrender.com/docs](https://valuiq-api.onrender.com/docs) | OpenAPI interactive endpoint testing interface |
| **GitHub Repository** | [github.com/YASH252902/real-estate-ml-platform](https://github.com/YASH252902/real-estate-ml-platform) | Source code for both API and client applications |

---

## 🚀 Key Features

* **Multi-Model Diagnostics:** Compares Ordinary Least Squares (OLS), Ridge (L2 Regularization), and Lasso (L1 Regularization) regression models side-by-side using R², Mean Squared Error (MSE), and Mean Absolute Error (MAE).
* **Feature Importance Engine:** Visualizes normalized regression coefficients to demonstrate key valuation drivers (e.g., median income, house age, average room count).
* **Interactive Single-Property Predictor:** Real-time property valuation interface driven by user-adjusted feature inputs.
* **Batch CSV Processing:** Bulk inference engine allowing users to upload datasets and download predictions at scale.
* **Dynamic API Gateway Configuration:** Client-side gateway selector allowing runtime switching between local development (`127.0.0.1:8000`) and cloud production endpoints.

---

## 🛠️ Architecture & Tech Stack

### Machine Learning & Backend
* **Language / Runtime:** Python 3.11.8
* **API Framework:** FastAPI & Uvicorn (ASGI)
* **ML Libraries:** Scikit-Learn, NumPy, Pandas
* **Persistence:** Joblib (`models_suite.joblib`, `scaler.joblib`, `metrics.joblib`, `feature_names.joblib`)
* **Dataset:** California Housing Dataset (standardized via `StandardScaler`)

### Frontend & UI
* **Framework:** React 18, TanStack Start (Nitro Engine)
* **Styling & Components:** Tailwind CSS, Radix UI, Lucide Icons
* **Data Visualization:** Recharts, D3
* **State Management:** TanStack React Query

### Cloud Infrastructure
* **Hosting Platform:** Render
* **Backend Deployment:** Python Web Service (`pip install -r requirements.txt && python train.py`)
* **Frontend Deployment:** Node.js Web Service running SSR output (`node .output/server/index.mjs`)

---

## 📡 API Endpoints Specification

| Method | Endpoint | Description | Payload / Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Health check and loaded model registry | None |
| `GET` | `/metrics` | Model performance scores and feature coefficients | None |
| `POST` | `/predict` | Single real estate valuation | JSON (`MedInc`, `HouseAge`, `AveRooms`, `AveBedrms`, `Population`, `model_type`) |
| `POST` | `/predict-batch` | High-throughput valuation for CSV files | Multipart Form (`file: .csv`, `model_type`) |

---

## 💻 Local Setup & Development

### 1. Clone the Repository
```bash
git clone [https://github.com/YASH252902/real-estate-ml-platform.git](https://github.com/YASH252902/real-estate-ml-platform.git)
cd real-estate-ml-platform

BACKEND SETUP 
# Create and activate virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train models and generate serialized artifacts
python train.py

# Start the development API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
The API will be available at http://127.0.0.1:8000 (API Docs at http://127.0.0.1:8000/docs)

FRONTEND SETUP 
cd frontend

# Install dependencies
npm install

# Start local development server
npm run dev
The dashboard will run locally at http://localhost:3000 (or http://localhost:5173)

⚙️ Cloud Deployment Configuration (Render)
Backend Service (Web Service)
Runtime: Python 3

Environment Variable: PYTHON_VERSION = 3.11.8

Build Command: pip install -r requirements.txt && python train.py

Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT

Frontend Service (Web Service)
Runtime: Node

Root Directory: frontend

Environment Variable: NITRO_PRESET = node-server

Build Command: npm install && npm run build

Start Command: node .output/server/index.mjs

