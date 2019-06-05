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

length = 15

first = 0
def main():
    start = 1485129600
    start += day*3
    days = 0

    print("removing dupes")
    rmdupe()
    print("removed")

    print("removing aggs")
    agm.remove()
    agh.remove()
    agd.remove()
    print("removed")

    while(days<length):
        end = start+day
        agday_min(start,end)
        agday_hour(start,end)
        agday_day(start,end)
        start += day
        days += 1
        print(start)

def agday_day(start,end):
    pipeline = [
    { '$match'   : {'time': {'$gt': start, '$lt': end}}},
    { '$sort'    : {'time': 1} },
    { '$project' : {'timebins': {'$subtract': ['$time',{'$mod':['$time', day]}]},
                'event': '$event',
                'qty': '$qty',
                'dt': '$dt'
        }
    },
    {'$group': {
       '_id':{'time':'$timebins',
              'event':'$event'},
        'qty':{'$sum':'$qty'},
        'dt':{'$sum':'$dt'}
    }}
    ]
    results = list(agh.aggregate(pipeline))
    for r in results:
        r['event'] = r['_id']['event']
        r['time'] = r['_id']['time']
        r.pop('_id', None)
    #pprint(results, width=4)
    insert_bulk(agd,results)

def agday_hour(start,end):
    pipeline = [
    { '$match'   : {'time': {'$gt': start, '$lt': end}}},
    { '$sort'    : {'time': 1} },
    { '$project' : {'timebins': {'$subtract': ['$time',{'$mod':['$time', hour]}]},
                'event': '$event',
                'qty': '$qty',
                'dt': '$dt'
        }
    },
    {'$group': {
       '_id':{'time':'$timebins',
              'event':'$event'},
        'qty':{'$sum':'$qty'},
        'dt':{'$sum':'$dt'}
    }}
    ]
    results = list(agm.aggregate(pipeline))
    for r in results:
        r['event'] = r['_id']['event']
        r['time'] = r['_id']['time']
        r.pop('_id', None)
    #pprint(results, width=4)
    insert_bulk(agh,results)


def agday_min(start,end):
    pipeline = [
    { '$match'   : {'time': {'$gt': start, '$lt': end}}},
    { '$sort'    : {'time': 1} },
    { '$project' : {'timebins': {'$subtract': ['$time',{'$mod':['$time', step]}]},
                'event': '$event'
        }
    },
    {'$group': {
       '_id':{'time':'$timebins',
              'event':'$event'},
        'qty':{'$sum':1}
    }}
    ]
    results = list(col.aggregate(pipeline))
    for r in results:
        r['event'] = r['_id']['event']
        r['time'] = r['_id']['time']
        r['dt'] = 0
        r.pop('_id', None)

    #pprint(results, width=4)

    dt = {}
    every = []
    current = start
    result = []

    while(current <= end):
        every.append(current)
        current+=step

    #get todays events
    pipeline = [
        { '$match'   : {'time': {'$gt': start, '$lt': end}}},
        { '$match'   : {'event': {'$lte': id_started+id_gap}}},
        { '$sort'    : {'time': 1}}
        ]
    prevent = list(col.aggregate(pipeline))

    #get yesterdays events
    #pipeline = [
    # { '$match'   : {'time': {'$gt': start-day, '$lt': start}}},
    # { '$match'   : {'event': {'$lte': id_started}}},
    # { '$sort'    : {'time': 1}},
    # { '$limit'   : 1 }
    # ]
    #first = list(col.aggregate(pipeline))
    first = list(col.find({"time":{'$lt': start}, "event": {'$lte': id_started+id_gap }}).limit(1).sort([('$natural',-1)]))

    if first != [] :
        prevent = first + prevent
    else:
        prevent = [{'time':start-day,'event':id_started-1}] + prevent
    prevent = prevent[::-1]
    #for p in prevent:
    #    print (p['event'] , p['time'])
    #pprint(prevent, width=800)
    #print(prevent)
    #return;

    for minute in every:
        for sec in range(step):
            event = getprevent(prevent,minute+sec)
            indx = find(results,'time',minute,'event',event)
            if(indx > 0):
                results[indx]['dt'] += 1
            else:
                results.append({'time':minute,'event':event,'dt':1})

        #print(minute,event)

    insert_bulk(agm,results)

    #pprint(results, width=4)
    #print(prevent)

def insert_bulk(col,docs):
    response = 0
    bulk = pymongo.bulk.BulkOperationBuilder(col,ordered=False)
    for doc in docs:
        bulk.insert(doc)

    try:
        res = bulk.execute()
        response = res['nInserted']
    except pymongo.errors.PyMongoError as e:
        pass

    if(response>0):
        print 'updated db Rows Inserted:' + str(response)


def find(lst, key, value, key2, value2):
    for i, dic in enumerate(lst):
        if dic[key] == value and dic[key2] == value2:
            return i
    return -1

def getprevent(prevent,sec):
    if len(prevent) > 0 :
        if sec < prevent[-1]['time'] :
            return first
        else:
            for r in prevent:
                #print(r['time'],sec)
                if r['time'] < sec:
                    return r['event']
    return -1

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
