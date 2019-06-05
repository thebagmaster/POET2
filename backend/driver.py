import ConfigParser, os
import traceback
import ast
import plc
import sys
from time import sleep
import time
import math
from pymongo import MongoClient
import pymongo

from datetime import datetime
from datetime import timedelta

config = ConfigParser.ConfigParser()

min = 60
hour = min*min
day = 24*hour
id_gap = 1000
id_stop = 1000
id_started = 2000
id_good = 5000
id_bad = 6000
id_ignore = 10000

time_offset = 6
time_offset -= time.localtime().tm_isdst
time_offset *= hour


def main():
    read_config()
    global config

    plc_list = cfg_val(config.get('PLCS','List'))
    oee_readers = []
    for plc_name in plc_list:
        oee_readers.append(oee_reader(config,plc_name))

    for reader in oee_readers:
        reader.get_shift_data()

    while(1):
        sleep(1)
        try:
            for reader in oee_readers:
                reader.start()
        except KeyboardInterrupt:
           raise
        except:
            plc_list = cfg_val(config.get('PLCS','List'))
            oee_readers = []
            for plc_name in plc_list:
                oee_readers.append(oee_reader(config,plc_name))
            for reader in oee_readers:
                reader.get_shift_data()
            traceback.print_exc()

def read_config():
    global config
    config.readfp(open('settings.cfg'))

def cfg_val(literal):
    return ast.literal_eval(literal)

class oee_reader:
    def __init__(self,config,plc_name):
        self.current_index = self.last_index = 0
        self.config = config

        self.plc_name = plc_name
        self.ip = config.get('PLCS',plc_name)
        self.tags = cfg_val(config.get(plc_name, 'array_tags'))
        self.num = cfg_val(config.get(plc_name, 'array_tags_length'))
        self.freq = cfg_val(config.get(plc_name, 'array_tags_frequency'))
        self.last_index_tag = config.get(plc_name, 'last_index_tag')
        self.last_index_frequency = config.get(plc_name, 'last_index_frequency')
        self.ms = float(self.last_index_frequency)/1000
        self.type = config.get(plc_name, 'type')

        if(self.type == 'clx'):
            self.con_index = plc.AB_CLX()
            self.con_events = plc.AB_CLX()
            self.con_times = plc.AB_CLX()
        else:
            self.con_index = plc.AB_SLC()
            self.con_events = plc.AB_SLC()
            self.con_times = plc.AB_SLC()

        self.con_index.setRead(self.ip,self.last_index_tag,1)

        self.client = MongoClient()
        self.db = self.client[config.get(plc_name, 'db')]
        self.col = self.db[plc_name]
        self.response = 0

        self.agcol = {}
        self.agcol[min] = self.db[self.plc_name + "_M"]
        self.agcol[hour] = self.db[self.plc_name + "_H"]
        self.agcol[day] = self.db[self.plc_name + "_D"]

        self.last = {}
        self.last[min] = 0
        self.last[hour] = 0
        self.last[day] = 0

        self.tally={}
        self.tally[day] = {}
        self.tally[hour] = {}
        self.tally[min] = {}

        self.ags=[min,hour,day]
        self.agns={min:'min',hour:'hour',day:'day'}

        self.lasttime = 0
        self.lastevent = 1999
        self.over = {}

        self.shiftcol = self.db[self.plc_name + "_SHIFTS"]
        self.shifts = []

    def get_bit(self,byteval,idx):
        return ((byteval&(1<<idx))!=0);

    def get_shift_data(self):
        results = self.shiftcol.find()
        self.shifts = []
        for doc in results:
            begs = doc['start'].split(':')
            ends = doc['end'].split(':')
            days = []
            for i in range(7):
                if(self.get_bit(doc['days'],i)):
                    days.append(i)
            t = {
                'shift':doc['shift'],
                'begin':{'hour':int(begs[0]),'min':int(begs[1])},
                'end':{'hour':int(ends[0]),'min':int(ends[1])},
                'days':days
                }
            self.shifts.append(t)
            print(t)
    def get_shift(self,t):
        for s in self.shifts:
            start = datetime.now()
            end = datetime.now()
            now = datetime.fromtimestamp(t+time_offset)
            start = start.replace(hour=s['begin']['hour'],minute=s['begin']['min'])
            end = end.replace(hour=s['end']['hour'],minute=s['end']['min'])
            if(s['begin']['hour']>s['end']['hour']):
                end = end + timedelta(days=1)
            #print(start,now,end)
            if(start < now and now < end):
                return s['shift']
        return 0;

    def start(self):
        try:
            if(self.current_index < self.last_index):
                self.get_shift_data()
            self.con_index.read()
            #print(self.con_index.read_values)
            sleep(self.ms)
            if self.con_index.read_values :
                self.current_index = self.con_index.read_values[0]
                print self.plc_name + " " + str(self.last_index) + " " + str(self.current_index)
                if self.current_index != self.last_index :
                    self.read_event_data()
            else:
                self.con_index.setRead(self.ip,self.last_index_tag,1)
                self.con_index.read()
        except:
            self.con_index.setRead(self.ip,self.last_index_tag,1)

    def closeto(self,t,mod,last):
        return (last != int(t-t%mod))

    def read_event_data(self):
        self.response = 0
        docs = []
        time_tag = self.tags[0]#+'['+str(self.last_index)+']'
        event_tag = self.tags[1]#+'['+str(self.last_index)+']'

        diff = ((self.current_index+self.num[0]) - self.last_index)%self.num[0]
        self.con_times.setRead(self.ip,time_tag,self.num[0])
        self.con_times.read()
        self.con_events.setRead(self.ip,event_tag,self.num[0])
        self.con_events.read()

        for i in range(diff):
            doc = {}
            doc["time"] = int(self.con_times.read_values[(self.last_index+i)%self.num[0]][1])
            doc["event"] = int(self.con_events.read_values[(self.last_index+i)%self.num[0]][1])
            docs.append(doc)
            print str(doc["time"]) + " " + str(doc["event"])

        self.insert_bulk(self.col,docs)

        if(self.response>0):
            self.last_index = self.current_index
            print 'updated db ' + self.plc_name + ' Rows Inserted:' + str(self.response) + ' Last Event: ' + str(docs[0]['event'])

        self.tallydocs(docs)

    def getdictotaldt(self,dic):
        dt = 0
        if isinstance(dic, dict):
            for key, value in dic.iteritems():
                if('dt' in dic[key]):
                    dt += dic[key]['dt']
        return dt

    def tallydic(self,dic,mod,event,dt,shift):
        #dt = dt % mod
        qty = 1
        if(dt != 0):
            qty = 0
            if(self.over[mod]['dt'] > 0):
                self.adddic(self.tally[mod],self.over[mod]['event'],1,self.over[mod]['dt'],shift)
                print('added over:', self.over[mod]['dt'])
                self.over[mod]['dt'] = 0


            curtime = dt
            dt = curtime - self.lasttime
            #print(dt,curtime,self.lasttime,'over:',self.over[mod]['dt'])
            missed = int(dt/mod)
            self.over[mod]['dt'] = max(0,(curtime - self.last[mod])-mod)
            dt-=self.over[mod]['dt']

            if(self.over[mod]['dt'] > 0):
                self.over[mod]['dt'] %= mod

            self.over[mod]['event'] = event

            t = self.last[mod]+mod
            for l in range(missed):
                self.adddic(self.tally[mod],event,qty,dt,shift)
                self.ag(mod,t,True)
                t+=mod
                dt=mod

            #if(mod==min):
            #    print(event,dt,' missed:',missed,' over:',self.over[mod])
        if(self.over[mod]['dt'] == 0 or True):
            self.adddic(dic,event,qty,dt,shift)


    def adddic(self,dic,event,qty,dt,shift):
        if(event in dic):
            dic[event]['shift'] = shift
            dic[event]["qty"] += qty
            dic[event]["dt"] += dt
        else:
            dic[event] = {'qty':qty,'dt':dt,'shift':shift}

    def tallydics(self,event,dt,shift):
        for mod in self.ags:
            self.tallydic(self.tally[mod],mod,event,dt,shift)

    def tallydocs(self,docs):
        for doc in docs:
            #print(doc)
            t = int(doc["time"])

            tmod = {}
            for mod in self.ags:
                tmod[mod] = t%mod

            if(self.last[min] == 0):#first run
                for mod in self.ags:
                    self.last[mod] = t - tmod[mod]
                    self.over[mod] = {'event':1999,'dt':0}
                #print(self.last)

            shift = self.get_shift(doc['time'])
            if(self.lasttime != 0):
                self.tallydics(self.lastevent, t, shift)
            self.tallydics(doc["event"],0,shift)


            for mod in self.ags:
                if(self.closeto(t,mod,self.last[mod])):
                    t = int(t-tmod[mod])
                    self.ag(mod,t)
                    self.last[mod] = t

            if(doc["event"] < id_started + id_gap):
                self.lastevent = int(doc["event"])

            self.lasttime = int(doc["time"])

    def ag(self,mod,t,loop=False):
        print(self.agns[mod],t,loop)
        dic = self.tally[mod]
        col = self.agcol[mod]
        docs = []
        for key, value in dic.iteritems():
            dic[key]["time"] = t
            dic[key]["event"] = key
            docs.append(dic[key])
            #print (dic[key])
        self.insert_bulk(col,docs)
        dic.clear()
        print('')

    def insert_bulk(self,col,docs):
        response = 0
        ignores = 0
        bulk = pymongo.bulk.BulkOperationBuilder(col,ordered=False)
        for doc in docs:
            if(doc["event"] != id_ignore):
                bulk.insert(doc)
            else:
                ignores+=1
        try:
            if(ignores == len(docs)):
                self.response = ignores
            else:
                res = bulk.execute()
                self.response = res['nInserted']
        except pymongo.errors.PyMongoError as e:
            pass

        if(response>0):
            print 'updated db Rows Inserted:' + str(response)

    def rmdupe(self):
        pipeline = [
        { '$match'   : {'event': {'$lte': 200}}},
        {'$group': {
           '_id':{'time':'$time',
                  'event':'$event'},
            'dups' : {'$addToSet':'$_id'}
        }},
        { '$sort'    : {'time': 1} }
        ]
        results = self.col.aggregate(pipeline)
        duplicates = [];
        for doc in results:
            doc['dups'].pop(0)
            for dupid in doc['dups']:
                duplicates.append(dupid)

        #pprint(duplicates, width=1)
        self.col.remove({'_id':{'$in':duplicates}})

if __name__ == "__main__":
    main()
