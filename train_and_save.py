import os
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
import joblib
import requests
from io import StringIO

DATA_URL = "https://raw.githubusercontent.com/ageron/handson-ml2/master/datasets/heart/heart.csv"

def download_dataset(out_path="data/heart.csv"):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    r = requests.get(DATA_URL, timeout=15)
    r.raise_for_status()
    df = pd.read_csv(StringIO(r.text))
    df.to_csv(out_path, index=False)
    return out_path

def load_data(path):
    df = pd.read_csv(path)
    if 'target' not in df.columns:
        raise ValueError("Expected 'target' column in dataset")
    return df

def build_preprocessor(df, target_col='target'):
    X = df.drop(columns=[target_col])
    num_cols = X.select_dtypes(include=['int64','float64']).columns.tolist()
    cat_cols = []
    num_transformer = Pipeline([('imputer', SimpleImputer(strategy='median')), ('scaler', StandardScaler())])
    preprocessor = ColumnTransformer([('num', num_transformer, num_cols), ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)], remainder='passthrough')
    return preprocessor, num_cols, cat_cols

def train_and_save(data_csv='data/heart.csv', out_path='models/best_pipeline.pkl'):
    if not os.path.exists(data_csv):
        download_dataset(data_csv)
    df = load_data(data_csv)
    preproc, num_cols, cat_cols = build_preprocessor(df)
    X = df.drop(columns=['target'])
    y = df['target']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    pipeline = Pipeline([('preproc', preproc), ('clf', RandomForestClassifier(random_state=42, class_weight='balanced'))])
    param_grid = {'clf__n_estimators':[100,200], 'clf__max_depth':[None,6,12]}
    gs = GridSearchCV(pipeline, param_grid, cv=5, scoring='f1', n_jobs=-1)
    print('Starting GridSearchCV...')
    gs.fit(X_train, y_train)
    print('Best params:', gs.best_params_)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    joblib.dump(gs.best_estimator_, out_path)
    print('Saved pipeline to', out_path)

if __name__ == '__main__':
    train_and_save()
