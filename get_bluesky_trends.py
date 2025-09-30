
import os
from atproto import Client


def get_trending_topics():

    client = Client()


    username = os.environ.get('BLUESKY_USERNAME')
    password = os.environ.get('BLUESKY_PASSWORD')

    try:
        client.login(username, password)

        response = client.app.bsky.feed.get_timeline()

        hashtags = {}

        for feed_item in response.feed:
            post = feed_item.post
            if hasattr(post.record, 'text'):
                text = post.record.text

                words = text.split()
                for word in words:
                    if word.startswith('#'):
                        tag = word.lower()
                        hashtags[tag] = hashtags.get(tag, 0) + 1


        trending = sorted(hashtags.items(), key=lambda x: x[1], reverse=True)

        print("Trending topics on Bluesky:\n")
        for i, (tag, count) in enumerate(trending[:10], 1):
            print(f"{i}. {tag} ({count} mentions)")

    except Exception as e:
        print(f"Error fetching trends: {e}")


if __name__ == "__main__":
    get_trending_topics()