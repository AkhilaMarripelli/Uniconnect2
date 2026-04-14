import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import numpy as np
from datetime import timedelta
import warnings

# Suppress statsmodels warnings for cleaner console output
warnings.filterwarnings("ignore")

def forecast_peak_usage(history_data: list):
    """
    history_data expects list of dicts: {"startTime": "...", "endTime": "..."}
    Returns a 24-element list of predicted values normalized between 0-1 (heatmap intensity).
    """
    if not history_data or len(history_data) < 5:
        # Fallback to mostly zeros if very little history
        return [0.0] * 24

    try:
        df = pd.DataFrame(history_data)
        df['startTime'] = pd.to_datetime(df['startTime'])
        
        # We need a continuous time series for ARIMA. 
        # Focus on the most recent 4 weeks to capture current trends and keep computation fast.
        min_time = df['startTime'].min()
        max_time = df['startTime'].max()
        cutoff = max_time - timedelta(days=28)
        
        if cutoff > min_time:
            df = df[df['startTime'] >= cutoff]
            
        df.set_index('startTime', inplace=True)
        
        # Resample to get number of bookings per hour
        # Replace NaN with 0 because gaps mean 0 bookings
        ts = df.resample('h').size().fillna(0)
        
        if len(ts) < 24:
            # Not quite enough hourly history
            return [0.0] * 24
            
        # Fit ARIMA model
        # Using ARIMA(2, 0, 2) which captures basic auto-regressive and moving average components quickly
        model = ARIMA(ts, order=(2, 0, 2))
        fitted = model.fit()
        
        # Predict the next 24 hours
        forecast = fitted.forecast(steps=24)
        
        # Cap all negative values to 0 (can't have negative bookings)
        forecast_values = np.clip(forecast.values, 0, None)
        
        # Normalize the result between 0.0 and 1.0 to fit the heatmap intensity requirement
        max_val = np.max(forecast_values)
        if max_val > 0:
            heatmap = forecast_values / max_val
        else:
            heatmap = forecast_values
            
        return [round(val, 3) for val in heatmap.tolist()]
        
    except Exception as e:
        print(f"[ML Peak Prediction Error] ARIMA failed: {e}")
        return [0.0] * 24
