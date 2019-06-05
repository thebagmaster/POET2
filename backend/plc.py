import sys, getopt
sys.path.insert(0, "C:\Python27\Lib\site-packages")
from pycomm.ab_comm.slc import Driver as SlcDriver
from pycomm.ab_comm.clx import Driver as ClxDriver
import logging
from time import sleep

class AB_CLX:
    def __init__(self):
        self.ip = ''
        self.read_tags = []
        self.write_tag = ''
        self.values = ''
        self.type = ''
        self.number = 1
        self.c = ClxDriver()
        self.read_values = []

    def setRead(self,ip,tag,num=None):
        self.c = ClxDriver()
        if num is None:
            num = 1
        self.ip = ip
        self.read_tags.append(tag)
        self.number = num

    def setWrite(self,ip,tag,values,type):
        self.ip = ip
        self.write_tag = tag
        self.values = values
        self.type = type

    def read(self):
        try:
            if self.c.open(self.ip):
                self.connected = True
                if(self.write_tag and self.values):
                    if(isinstance(self.values, list)):
                        self.c.write_array(self.write_tag, self.type, self.values)
                    else:
                        self.c.write_tag([(self.write_tag, self.values, self.type)])
                elif(self.read_tags):
                    if(self.number==1):
                        for tag in self.read_tags:
                            self.read_values = self.c.read_tag(tag)
                    elif(self.number>=1):
                        self.read_values = self.c.read_array(self.read_tags[0],int(self.number))
                self.c.close()
        except:
            self.connected = False

class AB_SLC:
    def __init__(self):
        self.ip = ''
        self.read_tags = []
        self.write_tag = ''
        self.values = ''
        self.type = ''
        self.number = 1
        self.c = SlcDriver()
        self.read_values = []

    def setRead(self,ip,tag,num=None):
        self.c = SlcDriver()
        if num is None:
            num = 1
        self.ip = ip
        self.read_tags.append(tag)
        self.number = num

    def setWrite(self,ip,tag,values,type):
        self.ip = ip
        self.write_tag = tag
        self.values = values
        self.type = type

    def read(self):
        try:
            if self.c.open(self.ip):
                self.connected = True
                if(self.write_tag and self.values):
                    if(isinstance(self.values, list)):
                        self.c.write_tag(self.write_tag, self.values)
                    else:
                        self.c.write_tag(self.write_tag, self.values)
                elif(self.read_tags):
                    if(self.number==1):
                        for tag in self.read_tags:
                            self.read_values = self.c.read_tag(tag)
                    elif(self.number>=1):
                        self.read_values = self.c.read_tag(self.read_tags[0],int(self.number))
                self.c.close()
        except:
            self.connected = False
