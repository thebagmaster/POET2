from pymongo import MongoClient
import pymongo
from pprint import pprint
from collections import Counter

id_gap = 1000
id_stop = 1000
id_started = 2000
id_good = 5000
id_bad = 6000

plcname = "L1_PLC1"
client = MongoClient()
col = client.oee[plcname]
agm = client.oee[plcname + "_M"]
agh = client.oee[plcname + "_H"]
agd = client.oee[plcname + "_D"]
#start = 1472688000
#end = 1472734400
#end = 1472774400
step = 60
hour = 60*60
day = 60*60*24

def main():

    print("removing dupes")
    rmdupe()
    print("removed")

    print("removing aggs")
    agm.remove()
    agh.remove()
    agd.remove()
    print("removed")

def rmdupe():
    pipeline = [
    { '$match'   : {'event': {'$lte': id_started+id_gap}}},
    {'$group': {
       '_id':{'time':'$time',
              'event':'$event'},
        'dups' : {'$addToSet':'$_id'}
    }},
    { '$sort'    : {'time': 1} }
    ]
    results = col.aggregate(pipeline)
    duplicates = [];
    for doc in results:
        doc['dups'].pop(0)
        for dupid in doc['dups']:
            duplicates.append(dupid)

    pprint(duplicates, width=1)
    col.remove({'_id':{'$in':duplicates}})

if __name__ == "__main__":
    main()
