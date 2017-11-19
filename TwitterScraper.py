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
tweets_data_path = "bitcoin.txt"

tweets_data = []
tweets_file = open(tweets_data_path, "r")
for line in tweets_file:
    try:
        tweet = json.loads(line)
        tweets_data.append(tweet)
    except:
        #print("failed")
        continue

favourites = []
RT = []
followers = []
text = []
created_at = []
user_name = []
profile_pic = []

for tweet in tweets_data:
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
    
tweet_dict = {"created_at":created_at,"user_name":user_name,"profile_pic":profile_pic,"text":text,"favourites":favourites,"RT":RT,"followers":followers}
    
df = pd.DataFrame(data=tweet_dict)


import time

#This is a basic listener that parses the json lines.
class StdOutListener(StreamListener):

    def __init__(self, time_limit=60):
        self.start_time = time.time()
        self.limit = 60

    
    def on_data(self, data):
        if (time.time() - self.start_time) < self.limit:
            #print (data)
            current_tweet = json.loads(data)
            created = current_tweet['created_at']
            if "retweeted_status" in tweet:
            #print(line['retweeted_status']["retweet_count"])
                current_RT = current_tweet['retweeted_status']['retweet_count']
            else:
                current_RT=0
            current_tweet_dict={"created_at":created[0:created.find("+")-1],
                                "user_name":current_tweet['user']['screen_name'],
                                "profile_pic":current_tweet['user']['profile_image_url'],
                                "text":current_tweet['text'],
                                "favourites":current_tweet['user']['favourites_count'],
                                "RT":current_RT,
                                "followers":current_tweet['user']['followers_count']}

            new_df = pd.DataFrame([current_tweet_dict])
            df.append(new_df)
            
            return True
        else:
            return False

    def on_error(self, status):
        print (status)


while (True):

    #df.to_csv("out.csv")

    #Start sorting and generating database
    df.sort_values(['RT'],ascending=False)

    df['z'] = df.apply(lambda row: row.RT + row.favourites, axis=1)

    sorted=df.sort_values(["z"],ascending=False)
    

        
    #Collect top 5 trending tweets and write to output.json
    top_5_tweets = sorted[0:5]

    top_5_tweets = top_5_tweets.reset_index()
    a = top_5_tweets.to_json()

    output = "json="+a

    print("Updated Output.json")

    with open("output.json","w") as output_file:
        output_file.write(output)

    
        
    #This handles Twitter authetification and the connection to Twitter Streaming API
    l = StdOutListener()
    auth = OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    stream = Stream(auth, l)

    #This line filter Twitter Streams to capture data by the keywords: 'python', 'javascript', 'ruby'
    stream.filter(track=['bitcoin'])








    






