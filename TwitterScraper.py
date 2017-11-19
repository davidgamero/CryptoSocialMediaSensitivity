import json
import pandas as pd
import matplotlib.pyplot as plt
#Import the necessary methods from tweepy library
from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream

#Variables that contains the user credentials to access Twitter API 
access_token = "931843433173520384-HdNv5NTPj8QtKhYbXMpjT8MyBOEob42"
access_token_secret = "PHaCGqouY46lUvFPAeyvvFMlTK942VywbBve3vDeqMKim"
consumer_key = "C8BJloQw0sLBFi1Hy4imCVTSI"
consumer_secret = "EnfX5b4eale6gwmZ2mGnC9SVavMkan4MyzzKfaDqWMSxmKBMZI"

#Collect cached twitter data
cached_tweets_data_path = "out.txt"

cached_tweets_data = []
cached_tweets_file = open(cached_tweets_data_path, "r")
for line in cached_tweets_file:
    try:
        cached_tweet = json.loads(line)
        cached_tweets_data.append(tweet)
    except:
        #print("failed")
        continue

cached_tweets_file.close();


favourites = []
RT = []
followers = []
text = []
created_at = []
user_name = []
profile_pic = []

for tweet in cached_tweets_data:
    created = tweet['created_at']
    created_at.append(created[0:created.find("+")-1])
    text.append(tweet['text'])
    favourites.append(tweet['user']['favourites_count'])
    followers.append(tweet['user']['followers_count'])
    user_name.append(tweet['user']['screen_name'])
    profile_pic.append(tweet['user']['profile_image_url'])
    
    if "retweeted_status" in tweet:
        #print(line['retweeted_status']["retweet_count"])
        RT.append(tweet['retweeted_status']['retweet_count'])
    else:
        RT.append(0)
    
cached_tweet_dict = {"created_at":created_at,"user_name":user_name,"profile_pic":profile_pic,"text":text,"favourites":favourites,"RT":RT,"followers":followers}
    
df = pd.DataFrame(data=cached_tweet_dict)

df.sort_values(['RT'],ascending=False)

df.sort_values(['RT'],ascending=False)

df['z'] = df.apply(lambda row: row.RT + row.favourites, axis=1)

sorted=df.sort_values(["z"],ascending=False)








#Collect top 5 trending tweets and write to output.json
top_5_tweets = sorted[0:5]

top_5_tweets = top_5_tweets.reset_index()
a = top_5_tweets.to_json()

output = "json="+a

with open("output.json","w") as output_file:
    output_file.write(output)






    





