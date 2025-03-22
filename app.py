from flask import Flask, request, jsonify, render_template
import requests

app = Flask(__name__)

# List of API keys to cycle through
API_KEYS = [
    "AIzaSyBPynKc6e5ubBq2Yc3Q3Tymlu5ZdDbWaQo",
    "AIzaSyAbRWM_BFSdeBqdYTxIypIwTnNN0ugKSIs",
    "AIzaSyB7bk_iuTZJDA0QLX4WzwsRbeVn1292mMg",
    "AIzaSyCZAoxgV7BP549regiWg29YRoOpYbF5dyY",
    "AIzaSyCLKcBeOIyjxlPVePhBer3Bjc6lt60gMWk"
]
current_api_index = 0  # Start with the first API key

def get_api_key():
    global current_api_index
    return API_KEYS[current_api_index]

def switch_api_key():
    global current_api_index
    current_api_index = (current_api_index + 1) % len(API_KEYS)
    print(f"Switched to API key {current_api_index + 1}")

def make_request(url):
    response = requests.get(url)
    data = response.json()
    if "error" in data and data["error"].get("code") == 403:
        switch_api_key()
        return None  # Indicate that the API key is exhausted
    return data

def search_youtube(song_name):
    while True:
        url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={song_name}&type=video&videoEmbeddable=any&key={get_api_key()}&maxResults=1"
        data = make_request(url)
        if data:
            break  # Stop retrying if request succeeds
    
    if "items" in data and len(data["items"]) > 0:
        video_id = data["items"][0]["id"]["videoId"]
        title = data["items"][0]["snippet"]["title"]
        channel = data["items"][0]["snippet"]["channelTitle"]
        video_details = get_video_details(video_id)
        
        return {
            "videoId": video_id,
            "title": title,
            "singer": channel,
            "release_date": video_details.get("publishedAt", "Unknown"),
            "views": video_details.get("viewCount", "Unknown"),
            "likes": video_details.get("likeCount", "Unknown"),
        }
    return None

def get_video_details(video_id):
    while True:
        url = f"https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id={video_id}&key={get_api_key()}"
        data = make_request(url)
        if data:
            break
    
    if "items" in data and len(data["items"]) > 0:
        details = data["items"][0]
        return {
            "publishedAt": details["snippet"]["publishedAt"].split("T")[0],
            "viewCount": details["statistics"].get("viewCount", "0"),
            "likeCount": details["statistics"].get("likeCount", "0"),
        }
    return {}

def get_recommendations(song_name):
    while True:
        url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={song_name} related&type=video&videoEmbeddable=any&key={get_api_key()}&maxResults=5"
        data = make_request(url)
        if data:
            break
    
    recommendations = []
    if "items" in data:
        for item in data["items"]:
            video_id = item["id"]["videoId"]
            title = item["snippet"]["title"]
            thumbnail = item["snippet"]["thumbnails"]["medium"]["url"]
            recommendations.append({
                "videoId": video_id,
                "title": title,
                "thumbnail": thumbnail
            })
    return recommendations

@app.route("/search", methods=["GET"])
def search_song():
    song_query = request.args.get("query")
    if not song_query:
        return jsonify({"error": "No search query provided"}), 400
    
    song_data = search_youtube(song_query)
    if song_data:
        recommendations = get_recommendations(song_query)
        return jsonify({"song": song_data, "recommendations": recommendations})
    else:
        return jsonify({"error": "No results found"}), 404

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
