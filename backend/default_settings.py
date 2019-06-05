import ConfigParser, os

config = ConfigParser.ConfigParser()

def main():
    global config
    output = 'settings.cfg'
    backup = 'settings.bak'

    plclist = []
    config.add_section('PLCS')

    defaultPLC(config,'L1_PLC1','192.168.2.16',plclist,'oee')

    config.set('PLCS','List',plclist)

    if os.path.exists(output) :
        try:
            os.rename(output,backup)
        except :
            os.remove(backup)
            os.rename(output,backup)

    with open(output, 'wb') as configfile:
        config.write(configfile)

def defaultPLC(cfg,name,ip,lst,db):
    lst.append(name)
    cfg.set('PLCS',name,ip)
    cfg.add_section(name)
    cfg.set(name, 'array_tags', ['Machine1.TimeStamp','Machine1.Code'])
    cfg.set(name, 'array_tags_length', [1000,1000])
    cfg.set(name, 'array_tags_frequency', [500,500])
    cfg.set(name, 'last_index_tag', 'Machine1.Index')
    cfg.set(name, 'last_index_frequency', 1000)
    cfg.set(name, 'tags', ['Part_MSec'])
    cfg.set(name, 'tags_frequency', [500])
    cfg.set(name, 'type', 'clx')
    cfg.set(name, 'db', db)



if __name__ == "__main__":
    main()
