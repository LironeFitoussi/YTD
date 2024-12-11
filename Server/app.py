import os
from flask import Flask, request, jsonify
from flask_cors import CORS

import subprocess
import boto3
from botocore.exceptions import NoCredentialsError
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# AWS S3 credentials and bucket
S3_BUCKET = os.getenv('AWS_BUCKET_NAME')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION')

# S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

@app.route('/download-audio', methods=['GET'])
def download_audio():
    # Get YouTube URL from query parameters
    youtube_url = request.args.get('url')
    if not youtube_url:
        return jsonify({"error": "Missing 'url' query parameter"}), 400

    # cut https:// from the url
    youtube_url = youtube_url.replace('https://', '')
    try:
        # Create a unique file name
        output_file = "audio_output.mp3"

        # Run yt-dlp command to download audio
        subprocess.run([
            'yt-dlp', '-x', '--audio-format', 'mp3', '--audio-quality', '0', '-o', output_file, youtube_url
        ], check=False)

        # Upload to S3
        with open(output_file, 'rb') as f:
            s3_client.upload_fileobj(f, S3_BUCKET, output_file)

        # Generate S3 link
        s3_link = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{output_file}"

        # Clean up local file
        os.remove(output_file)
        
        return jsonify({"s3_link": s3_link})

    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Failed to download audio", "details": str(e)}), 500
    except NoCredentialsError:
        return jsonify({"error": "AWS credentials not configured correctly"}), 500
    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
