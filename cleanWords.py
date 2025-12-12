import enchant
# from nltk.corpus import brown
# broker = enchant.Broker()
# broker.describe()
# broker.list_languages()
import json
import csv

# print('h')

d = enchant.Dict("en")
# d2 = set(brown.words())
# en, en_US

'''
.check(s) checks if a word is in the dict
.suggest(s) suggests similarly spelled words
'''

nrcFilenames = {
    'anger': 'texts/nrc/anger-NRC-EmoIntv1-withZeroIntensityEntries.txt',
    'anticipation': 'texts/nrc/anticipation-NRC-EmoIntv1-withZeroIntensityEntries.txt',
    'disgust': 'texts/nrc/disgust-NRC-EmoIntv1-withZeroIntensityEntries.txt',
    'fear': 'texts/nrc/fear-NRC-EmoIntv1-withZeroIntensityEntries.txt',
    'joy': 'texts/nrc/joy-NRC-EmoIntv1-withZeroIntensityEntries.txt',
    'sadness': 'texts/nrc/sadness-NRC-EmoIntv1-withZeroIntensityEntries.txt',
    'surprise': 'texts/nrc/surprise-NRC-EmoIntv1-withZeroIntensityEntries.txt',
    'trust': 'texts/nrc/trust-NRC-EmoIntv1-withZeroIntensityEntries.txt'
}
emotions = ['anger','anticipation','disgust','fear','joy','sadness','surprise','trust']

print()

def checkWord(word):
    return d.check(word.upper())
    # return word.lower() in d2


def catalogNrc():
    allWords = {}
    invalidWords = {}
    for k in nrcFilenames:
        file = open(nrcFilenames[k], "r") #r is read mode
        lines = file.readlines()[1:]

        for line in lines:
            line = line[:-1].split('\t') #trim \n
            word, score = line[0], line[1]
            score = float(score)
            if score == 0:
                continue
            if checkWord(word): #word is valid
                if word in allWords:
                    allWords[word][k] = score
                else:
                    allWords[word] = {}
                    allWords[word][k] = score
            else: #word is invalid
                if word in invalidWords:
                    invalidWords[word][k] = score
                else:
                    invalidWords[word] = {}
                    invalidWords[word][k] = score
    
    print('======= NCR =======', f'(total: {len(allWords)} allWords, {len(invalidWords)} invalidWords)')
    print(allWords, end='\n\n')
    print(invalidWords, end='\n\n')
    print(f'(total: {len(allWords)} allWords, {len(invalidWords)} invalidWords)', end='\n\n\n')
    return allWords, invalidWords

def catalogTuring():
    allWords = {}
    invalidWords = {}
    rankings = []
    # rankN = 50
    file = open('texts/turing/a_minimal_turing_test_corrected.txt', "r")
    text = file.read()
    for i in range(len(text)):
        c = text[i]
        if c.isspace():
            before = text[:i]
            after = text[i+1:]
            text = before + ' ' + after
    
    text = text.split(' ')
    for i in range(0, len(text), 2):
        word, freq = text[i], text[i+1]
        if freq[-1] == ',':
            freq = freq[:-1]
        freq = freq[1:-1]
        if not freq.isdigit():
            continue
        freq = int(freq)
        if not checkWord(word):
            invalidWords[word] = freq
            continue
        
        allWords[word] = freq
        if len(rankings) == 0:
            rankings = [(word, freq)]
        else:
            for i in range(len(rankings)):
                rankWord, rankFreq = rankings[i]
                if freq > rankFreq:
                    rankings.insert(i, (word,freq))
                    # if len(rankings) > rankN:
                    #     rankings.pop()
                    break
            # if len(rankings) < rankN:
            rankings.append((word,freq))

    print(rankings)      
    
    print('======= Turing =======')
    print(allWords, end='\n\n')
    print(invalidWords, end='\n\n')
    print(f'(total: {len(allWords)} allWords, {len(invalidWords)} invalidWords)', end='\n\n\n')
    return allWords, invalidWords, rankings

def dictIntersection(d1, d2):
    smaller = d1 if len(d1) < len(d2) else d2
    larger = d1 if len(d1) > len(d2) else d2
    intersection = {}
    for word in smaller:
        if word in larger:
            smallerV = smaller[word]
            largerV = larger[word]
            intersection[word] = {}
            if type(smallerV) == int:
                intersection[word]['freq'] = smallerV
                intersection[word]['emotions'] = largerV
            else:
                intersection[word]['freq'] = largerV
                intersection[word]['emotions'] = smallerV
    print('======= Intersection =======')
    print(intersection, end='\n\n')
    print(f'(total: {len(intersection)} intersectionWords)', end='\n\n')
    return intersection

def dictUnion(d1, d2):
    union = {}
    for d in [d1, d2]:
        for word in d:
            if word not in union:
                union[word] = {}
            if type (d[word]) == int:
                union[word]['freq'] = d[word]
            else:
                union[word]['emotions'] = d[word]
    print('======= Union =======')
    print(union, end='\n\n')
    print(f'(total: {len(union)} unionWords)', end='\n\n')
    return union

def rankingsToStr(rankings):
    result = ''
    for word, freq in rankings:
        line = f'{word} {freq}\n'
        result += line
    return result[:-1] #trim last \n

def intersectionToCSV():
    file = open('exports/intersection.json', "r")
    d = json.load(file)
    result = []
    for word in d:
        dictRow = {'word':word}
        # dictRow = {}

        freq = d[word]['freq']
        dictRow['freq'] = freq

        emotionData = d[word]['emotions']
        for emotion in emotions:
            emotionV = emotionData.get(emotion, 0)
            dictRow[emotion] = emotionV
        
        result.append(dictRow)
    print(result)
    return result

def processSVG():
    file = open('p5/tsneSVG.txt', "r")
    fullText = file.read()
    splitByTranslate = fullText.split('translate(')
    limit = 3
    result = {'words':{}, 'metadata':None}
    minX, minY, maxX, maxY = None, None, None, None
    for i in range(1, len(splitByTranslate), 2): # len(splitByTranslate)
        numbersLine = splitByTranslate[i]
        numbersLine = numbersLine.split('circle')

        numbers = numbersLine[0][:-4].split(',')
        x, y = float(numbers[0]), float(numbers[1])
        if minX == None or x < minX:
            minX = x
        if minY == None or y < minY:
            minY = y
        if maxX == None or x > maxX:
            maxX = x
        if maxY == None or y > maxY:
            maxY = y
        # print(x, y)
        wordLine = splitByTranslate[i+1]
        wordLine = wordLine.split('#333"')[1:]
        wordLine = wordLine[0].split('text')
        word = wordLine[0][1:-2]
        # print(word)

        result['words'][word] = {'x':x, 'y':y}
    result['metadata'] = {'minX':minX, 'minY':minY, 'maxX':maxX, 'maxY':maxY}
    # print(result)
    return result

    

# nrcAllWords, nrcInvalidWords = catalogNrc()
# turingAllWords, turingInvalidWords, turingRankings = catalogTuring()
# rankingsStr = rankingsToStr(turingRankings)
# intersection = dictIntersection(nrcAllWords, turingAllWords)
# union = dictUnion(nrcAllWords, turingAllWords)
intersectionCSVDicts = intersectionToCSV()
# processedSVG = processSVG()

# Source - https://stackoverflow.com/questions/57314427/generate-a-json-file-with-python
# Posted by Anna Nevison
# Retrieved 2025-11-10, License - CC BY-SA 4.0

sortBool = True
indentAmount = 4

# with open('exports/nrcAllWords.json', 'w') as outfile: #w is write mode
#     json.dump(nrcAllWords, outfile, sort_keys=sortBool, indent=indentAmount)
#     outfile.close()
# with open('exports/nrcInvalidWords.json', 'w') as outfile:
#     json.dump(nrcInvalidWords, outfile, sort_keys=sortBool, indent=indentAmount)
#     outfile.close()

# with open('exports/turingAllWords.json', 'w') as outfile:
#     json.dump(turingAllWords, outfile, sort_keys=sortBool, indent=indentAmount)
#     outfile.close()
# with open('exports/turingInvalidWords.json', 'w') as outfile:
#     json.dump(turingInvalidWords, outfile, sort_keys=sortBool, indent=indentAmount)
#     outfile.close()
# with open('exports/turingRankings.txt', 'w') as outfile:
#     outfile.write(rankingsStr)
#     outfile.close()

# with open('exports/intersection.json', 'w') as outfile:
#     json.dump(intersection, outfile, sort_keys=sortBool, indent=indentAmount)
#     outfile.close()

# with open('exports/union.json', 'w') as outfile:
#     json.dump(union, outfile, sort_keys=sortBool, indent=indentAmount)
#     outfile.close()

with open('exports/intersectionCSV.csv', 'w', newline='') as outfile:
    fieldnames = ['word', 'freq'] + emotions
    # fieldnames = ['freq'] + emotions
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    for dictRow in intersectionCSVDicts:
        writer.writerow(dictRow)
    outfile.close()
    
# with open('exports/tsneSVGData.json', 'w') as outfile:
#     json.dump(processedSVG, outfile, sort_keys=sortBool, indent=indentAmount)
#     outfile.close()

# checkThese = ['pomeranian','flabbergasted','America','congradulations','ecstasy','falafel','homosapiens','huh','intimacy','pangaea','hello']
# for word in checkThese:
#     print(word.upper() + ':')
#     print(d.suggest(word), '\n')

# print(d.check('pangaea'))
# print(d.check('Pangaea'))
# print(d.check('HELLO'))


