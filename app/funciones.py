from datetime import datetime

import hashlib


def obtener_hora_minutos_segundos_fecha():
    ahora = datetime.now()
    hora_min_seg = ahora.strftime("%H%M%S")
    fecha = ahora.strftime("%d%m%Y")
    return hora_min_seg,fecha

def cadena_md5(sociedad,cliente,hora_total,fecha):
    cadena = sociedad+cliente+hora_total+fecha
    cadena_md5 = hashlib.md5(cadena.encode()).hexdigest()
    return cadena_md5


def fecha_sap():
    fecha = datetime.now()
    fecha = fecha.strftime("%Y%m%d")
    fecha_objeto = datetime.strptime(fecha, "%Y%m%d")
    fecha = fecha_objeto.strftime("%Y%m%d")
    return fecha
