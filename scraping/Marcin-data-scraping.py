# This script scrapes the data from Tim Marcin's blog post (URL below) and writes it to CSVs for future processing, cleaning, and analysis.

import pandas as pd
import requests
from bs4 import BeautifulSoup

URL = "https://mashable.com/article/best-episodes-the-office-ranked"
episode_name_data = []
episode_numerical_data = []
grouped_by_ep_data = []

# Request data from server at desired URL
webpage = requests.get(URL)

# Parse webpage content using BeautifulSoup html parser
soup = BeautifulSoup(webpage.content, "html.parser")

# Make array of all h2 elements (which, from inspecting the webpage, correspond to the episode number, season number, and episode name
episodes_raw_html = soup.find_all("h2")

# Loop through episodes_html array and append text only (ignoring html tags) to new array
for episode in episodes_raw_html:
    episode_name_data.append(episode.text)

# Loop through each li element under each ul element on webpage (which corresponds with each bullet point indicating desired numerical data for each episode)
# Then group the numerical data by episode
for ul_tag in soup.find_all("ul"):
    for li_tag in ul_tag.find_all("li"):
        episode_numerical_data.append(li_tag.text.strip())
    grouped_by_ep_data.append(episode_numerical_data)
    episode_numerical_data = []

# Create 2 separate dataframes from lists of scraped data
episode_ranking_marcin_df = pd.DataFrame(episode_name_data, columns=["episode"])
numerical_marcin_df = pd.DataFrame(grouped_by_ep_data)

# Write scraped data to local CSVs; will clean and combine them using Pandas in a separate Jupyter notebook
episode_ranking_marcin_df.to_csv("../data/marcin-data/ordered_episode_marcin_data.csv", index=None)
numerical_marcin_df.to_csv("../data/marcin-data/episode_numerical_marcin_data.csv", index=None)