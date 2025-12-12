import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
# import matplotlib.pyplot as plt
# import seaborn as sns
import pandas as pd
# %matplotlib inline
import umap
import json

words = pd.read_csv("exports/intersectionCSV.csv")
words.head()
# print(words)
# print(data)

def createUMAP():
    words_data = words[
                        ['freq','anger','anticipation','disgust','fear','joy','sadness','surprise','trust']
                    ].values
    scaled_words_data = StandardScaler().fit_transform(words_data)

    reducer = umap.UMAP(
        n_neighbors=20,
        min_dist=0.2,
        # n_components=2,
        metric='euclidean'
    )
    embedding = reducer.fit_transform(scaled_words_data)
    # print(embedding)
    allWords = []
    file = open('exports/intersection.json', "r")
    d = json.load(file)
    result = []
    for word in d:
        allWords.append(word)

    mapping = {'words':{}, 'metadata':{}}
    minX, minY, maxX, maxY = None, None, None, None
    for i in range(len(embedding)):
        row = embedding[i]
        x, y = row
        x, y = float(x), float(y)
        if minX == None or x < minX:
            minX = x
        if minY == None or y < minY:
            minY = y
        if maxX == None or x > maxX:
            maxX = x
        if maxY == None or y > maxY:
            maxY = y
        
        word = allWords[i]
        freq = d[word]['freq']
        mapping['words'][word] = {'x':x, 'y':y, 'freq':freq}
        print(mapping)
    mapping['metadata'] = {'minX':minX, 'minY':minY, 'maxX':maxX, 'maxY':maxY}
    return mapping

mapping = createUMAP()

sortBool = True
indentAmount = 4
with open('exports/umapData.json', 'w') as outfile:
    json.dump(mapping, outfile, sort_keys=sortBool, indent=indentAmount)
    outfile.close()