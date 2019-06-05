import sys, getopt
sys.path.insert(0, "C:\Python27\Lib\site-packages")
#from pycomm.ab_comm.slc import Driver as SlcDriver
from pycomm.ab_comm.clx import Driver as ClxDriver
import logging

def main(argv):
    ip = ''
    read_register = ''
    write_register = ''
    values = ''
    number = 0
    try:
        opts, args = getopt.getopt(argv,"hi:r:n:w:v:")
    except getopt.GetoptError:
        print 'plc.py -i <ip> -r <read register> -w <write register> -n <num to read> -v <value1 value2>'
        sys.exit(2)
    for opt, arg in opts:
        if opt in ("-h","--help"):
            print 'plc.py -i <ip> -r <read register> -w <write register> -n <num to read> -v <value1,value2>'
            sys.exit()
        elif opt in ("-i","--ip"):
            ip = arg
        elif opt in ("-r", "--read"):
            read_register = arg
        elif opt in ("-n", "--number"):
            number = arg
        elif opt in ("-w", "--write"):
            write_register = arg
        elif opt in ("-v", "--value"):
            values = arg
    #c = SlcDriver()
    c = ClxDriver()
    if c.open(ip):
        if(write_register and values):
            c.write_tag(write_register, map(int, values.split()))
        if(read_register):
            vals = c.read_tag([read_register])
            if(isinstance(vals, list)):
                vals=map(str, vals)
                print " ".join(vals)
            else:
                print vals
        # print c.write_tag('N7:0', [-30, 32767, -32767])
        # print c.write_tag('N7:0', 21)
        # print c.read_tag('N7:0', 10)
        # c.write_tag('B3/3955', 1)
        # print c.read_tag('B3/3955')
        # c.write_tag('N7:0/2', 1)
        # print c.read_tag('N7:0/2')
        c.close()

if __name__ == "__main__":
    main(sys.argv[1:])