from flask import Flask, request, jsonify, render_template
import pandas as pd
import numpy as np
import requests
import itertools
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# Load dataset with error handling
def load_dataset():
    try:
        return pd.read_csv("songs_dataset.csv")
    except FileNotFoundError:
        print("Error: Dataset file not found!")
        return pd.DataFrame(columns=['song_name', 'title', 'artist', 'genre'])

df = load_dataset()
print(f"Dataset Loaded! Total Songs: {len(df)}")
# YouTube API Keys (Rotating to avoid rate limits)
API_KEYS = [
    "AIzaSyACoQhM3__ON9rZjmYp8I9TIE6b2Yas52w",
    "AIzaSyBPynKc6e5ubBq2Yc3Q3Tymlu5ZdDbWaQo",
    "AIzaSyAbRWM_BFSdeBqdYTxIypIwTnNN0ugKSIs",
    "AIzaSyB7bk_iuTZJDA0QLX4WzwsRbeVn1292mMg",
    "AIzaSyCZAoxgV7BP549regiWg29YRoOpYbF5dyY",
    "AIzaSyCLKcBeOIyjxlPVePhBer3Bjc6lt60gMWk"
]
api_key_cycle = itertools.cycle(API_KEYS)  # Cycle through API keys

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"

def fetch_songs_from_youtube(query):
    for _ in range(len(API_KEYS)):
        api_key = next(api_key_cycle)
        params = {"part": "snippet", "q": query, "type": "video", "key": api_key}
        try:
            response = requests.get(YOUTUBE_SEARCH_URL, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
            return [
                {"title": item["snippet"].get("title", "Unknown"), "videoId": item["id"].get("videoId", "")}
                for item in data.get("items", [])
            ]
        except requests.exceptions.RequestException as e:
            print(f"YouTube API error: {e}")
    return []

def preprocess_data():
    """Prepares the song dataset by computing TF-IDF similarity."""
    if df.empty:
        return None
    df['combined_features'] = df['song_name'].fillna('') + " " + df['title'].fillna('')
    vectorizer = TfidfVectorizer(stop_words='english')
    return vectorizer.fit_transform(df['combined_features'])

# Compute similarity matrix
tfidf_matrix = preprocess_data()
print(f"TF-IDF Matrix Shape: {tfidf_matrix.shape if tfidf_matrix is not None else 'None'}") 
if tfidf_matrix is not None:
    similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
else:
    similarity_matrix = None

def recommend_songs(song_name, top_n=5):
    """Returns top N similar songs based on content-based filtering."""
    if df.empty or similarity_matrix is None:
        return []
    
    matches = df[df['title'].str.lower() == song_name.lower()]
    if matches.empty:
        return []
    
    song_index = matches.index[0]
    similar_scores = list(enumerate(similarity_matrix[song_index]))
    similar_scores = sorted(similar_scores, key=lambda x: x[1], reverse=True)[1:top_n+1]
    return [df.iloc[i[0]][['title', 'artist', 'genre']].to_dict() for i in similar_scores]

@app.route("/search", methods=["GET"])
def search_song():
    song_query = request.args.get("query", "").strip()
    if not song_query:
        return jsonify({"error": "No search query provided"}), 400
    
    ml_recommendations = recommend_songs(song_query)
    youtube_results = fetch_songs_from_youtube(song_query)
    
    return jsonify({
        "song": song_query,
        "ml_recommendations": ml_recommendations,
        "youtube_results": youtube_results
    })



@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
