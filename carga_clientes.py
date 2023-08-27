import pandas as pd
import sqlalchemy
import os
import datetime

from werkzeug.security import generate_password_hash

engine = sqlalchemy.create_engine('mysql+pymysql://root:Di.IoT4.0@localhost/cobranza')
# Leer la tabla de Excel
df = pd.read_excel(os.path.join("C:\\Users\\apadra\\OneDrive - Corimon\\CORIMON\\CRP", "datos.xlsx"),sheet_name='1200 CRP',header =None,dtype={'rif':str,'codigo':str, 'username':str,'tipo':str,'seller':str,'zona':str,'email':str})



df =df.set_axis(['rif','codigo','username','tipo','seller','zona','email'],axis=1)
df = df.loc[1:]
df = df.drop_duplicates(['rif'],keep='last')

pass_df = pd.DataFrame()

pass_df = pass_df.assign(encrypted_password=df.rif)

for i in range(len(pass_df)):
    pass_df.iloc[i]['encrypted_password']=generate_password_hash(pass_df.iloc[i]['encrypted_password'])



df = pd.concat([df,pass_df],axis=1)

def zona_cliente(i):
    if i['zona'] == 'CAPITAL':
        i['zona'] = 'Capital'
        return i
    if i['zona'] == 'CENTRO':
        i['zona'] = 'Centro'
        return i
    if i['zona'] == 'ORIENTE':
        i['zona'] = 'Oriente'
        return i
    if i['zona'] == 'OCCIDENTE':
        i['zona'] = 'Occidente'
        return i

    
df = df.apply(zona_cliente,axis=1)

df = df.assign(nivel='cliente')
df = df.assign(created_at=datetime.datetime.now())
print(df)



df.to_sql(name='users',con=engine,if_exists="append",index=False)


"""
query = sqlalchemy.text("UPDATE users SET zona = REPLACE(zona,'CENTRO','Centro')")
query2 = sqlalchemy.text("UPDATE users SET zona = REPLACE(zona,'CAPITAL','Capital')")
query3 = sqlalchemy.text("UPDATE users SET zona = REPLACE(zona,'OCCIDENTE','Occidente')")
query4 = sqlalchemy.text("UPDATE users SET zona = REPLACE(zona,'ORIENTE','Oriente')")
query5 = sqlalchemy.text("UPDATE users SET nivel = COALESCE(nivel,'Cliente')")
session = engine.connect()
session.execute(query)
session.execute(query2)
session.execute(query3)
session.execute(query4)
session.execute(query5)


session.commit()
"""