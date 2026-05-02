import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib
import os

def train_and_save():
    # Paths
    current_dir = os.path.dirname(__file__)
    data_path = os.path.join(current_dir, 'data.csv')
    model_path = os.path.join(current_dir, 'model.pkl')
    vectorizer_path = os.path.join(current_dir, 'vectorizer.pkl')

    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found!")
        return

    # Load data
    print("Loading data...")
    df = pd.read_csv(data_path)

    # Initialize Vectorizer
    print("Processing text with TfidfVectorizer...")
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(df['text'])
    y = df['intent']

    # Train MultinomialNB model
    print("Training MultinomialNB model...")
    model = MultinomialNB()
    model.fit(X, y)

    # Save model and vectorizer
    print("Saving model and vectorizer as .pkl files...")
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    print(f"Success! Model saved to {model_path}")
    print(f"Success! Vectorizer saved to {vectorizer_path}")

if __name__ == "__main__":
    train_and_save()
