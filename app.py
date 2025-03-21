from flask import Flask, request, jsonify, render_template
import requests

app = Flask(__name__)
# AIzaSyAbRWM_BFSdeBqdYTxIypIwTnNN0ugKSIs
# AIzaSyB7bk_iuTZJDA0QLX4WzwsRbeVn1292mMg
# AIzaSyCZAoxgV7BP549regiWg29YRoOpYbF5dyY
YOUTUBE_API_KEY = "AIzaSyCZAoxgV7BP549regiWg29YRoOpYbF5dyY"

def search_youtube(song_name):
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={song_name}&type=video&videoEmbeddable=any&key={YOUTUBE_API_KEY}&maxResults=1"
    response = requests.get(url)
    data = response.json()
    print(data)
    if "items" in data and len(data["items"]) > 0:
        video_id = data["items"][0]["id"]["videoId"]
        title = data["items"][0]["snippet"]["title"]
        channel = data["items"][0]["snippet"]["channelTitle"]
        
        # Get video details (views, likes, publish date)
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

# Function to get video statistics
def get_video_details(video_id):
    url = f"https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id={video_id}&key={YOUTUBE_API_KEY}"
    response = requests.get(url)
    data = response.json()

    if "items" in data and len(data["items"]) > 0:
        details = data["items"][0]
        return {
            "publishedAt": details["snippet"]["publishedAt"].split("T")[0],  # Extract date only
            "viewCount": details["statistics"].get("viewCount", "0"),
            "likeCount": details["statistics"].get("likeCount", "0"),
        }
    return {}

# Function to get recommended songs
def get_recommendations(song_name):
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={song_name} related&type=video&videoEmbeddable=any&key={YOUTUBE_API_KEY}&maxResults=5"
    response = requests.get(url)
    data = response.json()

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

# API route for searching song
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
