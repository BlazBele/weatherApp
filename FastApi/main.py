import os
import pandas as pd
import joblib
from supabase import create_client
from dotenv import load_dotenv
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import FileResponse

from datetime import datetime
import pytz
from fastapi.middleware.cors import CORSMiddleware


slovenia_tz = pytz.timezone("Europe/Ljubljana")
# START
app = FastAPI(title="Rain Prediction API", 
              description="API for predicting rain based on weather data")

# Cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "https://weatherapp-xht9.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Konfiguracija
MODEL_PATH = "rain_prediction_model.pkl"
DATA_PATH = "vremenski_podatki.csv"


class PredictionResult(BaseModel):
    prediction: bool
    probability: float
    message: str
    timestamp: datetime

class TrainingResult(BaseModel):
    status: bool
    accuracy: float
    message: str
    timestamp: datetime

def load_env_vars():
    load_dotenv()
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Manjkajo SUPABASE_URL ali SUPABASE_KEY v okolju.")
    return SUPABASE_URL, SUPABASE_KEY

def create_supabase_client(url, key):
    return create_client(url, key)

def save_data(df, filename=DATA_PATH):
    df.to_csv(filename, index=False)
    print(f"Podatki shranjeni v {filename}")

def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None

def save_model(model):
    joblib.dump(model, MODEL_PATH)
    print(f"Model shranjen v {MODEL_PATH}")


def fetch_data(start_id=788):
    try:
        SUPABASE_URL, SUPABASE_KEY = load_env_vars()
        supabase = create_supabase_client(SUPABASE_URL, SUPABASE_KEY)

        all_data = []
        chunk_size = 1000
        offset_start = 0
        required_columns = ['temperature', 'humidity', 'pressure0', 'wind_speed', 'rain', 'created_at']

        while True:
            to_index = offset_start + chunk_size - 1
            result = (
                supabase
                .table("VremenskiPodatki")
                .select(",".join(required_columns))
                .gte("id", start_id)
                .order("id")
                .range(offset_start, to_index)
                .execute()
            )

            if not result.data:
                break

            all_data.extend(result.data)

            if len(result.data) < chunk_size:
                break

            offset_start += chunk_size

        df = pd.DataFrame(all_data)
        save_data(df)
        return df
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Napaka pri pridobivanju podatkov: {str(e)}")

def prepare_data(df, hours_ahead=3):
    """Priprava podatkov za učenje modela"""
    try:
        df = df.copy()
        df['created_at'] = pd.to_datetime(df['created_at'])
        df = df.sort_values('created_at')
        
        df['target'] = df['rain'].shift(-hours_ahead * 3)

        df['temperature_change_20min'] = df['temperature'].diff()
        df['pressure_change_20min'] = df['pressure0'].diff()
        df['temperature_change_1h'] = df['temperature'].diff(3)
        df['pressure_change_1h'] = df['pressure0'].diff(3)
        df['rained_last_1h'] = df['rain'].rolling(3).sum().shift(1)
        df['temperature_rolling_3h'] = df['temperature'].rolling(9).mean()
        df['pressure_rolling_3h'] = df['pressure0'].rolling(9).mean()
        df['humidity_change_20min'] = df['humidity'].diff()
        df['humidity_change_1h'] = df['humidity'].diff(3)
        df['humidity_rolling_3h'] = df['humidity'].rolling(9).mean()
        df['wind_speed_rolling_3h'] = df['wind_speed'].rolling(9).mean()

        features = [
            'temperature', 'humidity', 'pressure0', 'rain',
            'temperature_change_20min',
            'temperature_change_1h', 'pressure_change_1h',
            'rained_last_1h', 'temperature_rolling_3h',
            'pressure_rolling_3h',
            'humidity_change_20min', 'humidity_change_1h',
            'humidity_rolling_3h', 'wind_speed_rolling_3h'
        ]
        
        df_clean = df.dropna(subset=features + ['target'])
        return df_clean[features], df_clean['target'].astype(int)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Napaka pri pripravi podatkov: {str(e)}")

def get_last_9_records():
    """Pridobi zadnjih 9 vrstic iz Supabase"""
    try:
        SUPABASE_URL, SUPABASE_KEY = load_env_vars()
        supabase = create_supabase_client(SUPABASE_URL, SUPABASE_KEY)
        
        result = (
            supabase
            .table("VremenskiPodatki")
            .select('temperature,humidity,pressure0,wind_speed,rain,created_at')
            .order('created_at', desc=True)
            .limit(9)  
            .execute()
        )
        
        df = pd.DataFrame(result.data)
        df['created_at'] = pd.to_datetime(df['created_at'])
        df = df.sort_values('created_at').reset_index(drop=True)
        return df
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Napaka pri pridobivanju zadnjih meritev: {str(e)}")

def prepare_prediction_data(last_9_records):
    """Pripravi podatke za napoved iz zadnjih 9 meritev"""
    try:
        last_record = last_9_records.iloc[-1]
        prev_record = last_9_records.iloc[-2]
        hour_ago_record = last_9_records.iloc[-4] if len(last_9_records) >= 4 else prev_record

        rained_last_1h_val = last_9_records['rain'].iloc[-4:-1].sum()
        
        return {
            'temperature': last_record['temperature'],
            'humidity': last_record['humidity'],
            'pressure0': last_record['pressure0'],
            'rain': last_record['rain'],
            'wind_speed': last_record['wind_speed'],
            'temperature_change_20min': last_record['temperature'] - prev_record['temperature'],
            'pressure_change_20min': last_record['pressure0'] - prev_record['pressure0'],
            'temperature_change_1h': last_record['temperature'] - hour_ago_record['temperature'],
            'pressure_change_1h': last_record['pressure0'] - hour_ago_record['pressure0'],
            'rained_last_1h': int(rained_last_1h_val > 0),
            'temperature_rolling_3h': last_9_records['temperature'].mean(),
            'pressure_rolling_3h': last_9_records['pressure0'].mean(),
            'humidity_change_20min': last_record['humidity'] - prev_record['humidity'],
            'humidity_change_1h': last_record['humidity'] - hour_ago_record['humidity'],
            'humidity_rolling_3h': last_9_records['humidity'].mean(),
            'wind_speed_rolling_3h': last_9_records['wind_speed'].mean(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Napaka pri pripravi podatkov za napoved: {str(e)}")


def train_xgboost_model():
    """Train the XGBoost model and save it with updated train/val/test split and parameters"""
    try:
        df = fetch_data()
        X, y = prepare_data(df, hours_ahead=3)
        X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.2, random_state=42)

        # Nastavitve modela
        model = XGBClassifier(
            use_label_encoder=False,
            eval_metric='logloss',
            random_state=42,
            max_depth=3,
            reg_alpha=1,
            reg_lambda=1,
            early_stopping_rounds=10
        )

        # Treniranje z eval setom
        model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=True
        )

        # Napoved na testnih podatkih
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)

        save_model(model)

        return {
            "status": 1,
            "accuracy": round(float(acc), 4),
            "message": f"Uspešno in shranjeno v {MODEL_PATH}. Točnost: {acc:.4f}",
            "timestamp": datetime.now(slovenia_tz)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Napaka pri učenju modela: {str(e)}")


def make_prediction(input_data: dict):
    """Make a prediction using the trained model"""
    try:
        model = load_model()
        if model is None:
            raise HTTPException(status_code=404, detail="Model ni bil najden. Najprej izvedite usposabljanje.")
        
        features = [
            'temperature', 'humidity', 'pressure0', 'rain',
            'temperature_change_20min',
            'temperature_change_1h', 'pressure_change_1h',
            'rained_last_1h', 'temperature_rolling_3h',
            'pressure_rolling_3h',
            'humidity_change_20min', 'humidity_change_1h',
            'humidity_rolling_3h', 'wind_speed_rolling_3h'
        ]
        
        input_df = pd.DataFrame([input_data])
        X = input_df[features]
        
        pred = bool(model.predict(X)[0])
        prob = round(float(model.predict_proba(X)[0][1]), 2)
        
        return {
            "prediction": int(pred),
            "probability": float(prob),
            "message": "Napoved dežja: Dež bo" if pred == 1 else "Napoved dežja: Dežja ne bo",
            "timestamp": datetime.now(slovenia_tz)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Napaka pri napovedovanju: {str(e)}")

# API Endpointi
@app.get("/train", response_model=TrainingResult)
async def train_model():
    """
    Usposabljanje modela XGBoost za napovedovanje dežja.
    
    Pobira podatke iz Supabase, pripravi značilke in usposobi model.
    Shrani model na disk za prihodnjo uporabo.
    """
    return train_xgboost_model()

@app.get("/predict", response_model=PredictionResult)
async def predict_from_latest():
    try:
        last_9_records = get_last_9_records()
        prediction_data = prepare_prediction_data(last_9_records)
        return make_prediction(prediction_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/status")
async def model_status():
    model = load_model()
    return {
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "data_path": DATA_PATH,
        "timestamp": datetime.now(slovenia_tz)
    }

@app.get("/download")
async def download_model():
    filename = "rain_prediction_model.pkl"
    try:
        return FileResponse(path=filename, filename="download.pkl", media_type='application/octet-stream')
    except Exception:
        raise HTTPException(status_code=404, detail=f"Datoteka '{filename}' ni bila najdena.")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 1000))
    uvicorn.run(app, host="0.0.0.0", port=port)
