from os import getenv
import sys
import pyodbc
from pycomm.ab_comm.clx import Driver as ClxDriver
import time
import threading

c = 0
cycles=0

def main():
global c
c = ClxDriver()
update()

def update():
    global c
    try:
        if c.open('192.168.1.95'):
        #print(c.read_tag(['SimulatedDT_Remaining'])[0][1])
            f_array = c.read_array("line1.FaultCode", 1500)
            t_array = c.read_array("line1.TimeStamp", 1500)
            d_array = c.read_array("line1.Duration", 1500)
            p_array = c.read_array("line1.ProductCount", 1500)
            c.close()
            
            
            conn = pyodbc.connect(r'Driver={SQL Server};Server=nth-server-12\SQLEXPRESS;Database=nth;Trusted_Connection=yes;')
            conn.autocommit = True
            cursor = conn.cursor()
            cursor.executemany(
                "BEGIN TRY INSERT INTO line1 VALUES (?, ?, ?, ?) END TRY BEGIN CATCH END CATCH",
                zip(zip(*t_array)[1],zip(*f_array)[1],zip(*d_array)[1],zip(*p_array)[1]))
            
            cursor.close()
            conn.close()
            global cycles
            cycles+=1
            print(cycles)
    except:
        pass
    threading.Timer(10, update).start()
    return

if __name__ == '__main__':
    main()
