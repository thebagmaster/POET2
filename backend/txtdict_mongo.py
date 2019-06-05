from pymongo import MongoClient
import pymongo
from pprint import pprint
from collections import Counter

id_gap = 1000
id_stop = 1000
id_started = 2000
id_good = 5000
id_bad = 6000

plcname = "L1_PLC1_DICT"
client = MongoClient()
col = client.oee[plcname]

def main():
    dic = {}
    filename='codes.txt'
    for line in open(filename):
        items = line.split('\t')
        dic[items[0]] = items[1]
    col.update({"id":1},{'$set':{'dict':dic}}, upsert=False)


if __name__ == "__main__":
    main()
