from datetime import datetime
from typing import Dict, List, Tuple, Any, Optional
from .consts import *
import hashlib
from requests.auth import HTTPBasicAuth
import requests
import json
user_fuente = U_FUENTE
contra_fuente = C_FUENTE
ip_fuente = URL_FUENTE

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




def consulta_basica_sap(
    url,
    args,
    user_fuente = user_fuente,
    contra_fuente = contra_fuente,
    headers: Optional[Dict[str, str]] = None,
    verificacion_ssl = VERIFICACION_SSL,
    timeout: int= 30,
):
    if headers is None:
        headers = {}
    try:
        response = requests.get(
            url, 
            auth=HTTPBasicAuth(user_fuente, contra_fuente), 
            params=args, 
            headers=headers,
            verify=verificacion_ssl,
            timeout=timeout
        )
        response.raise_for_status()
        datos_json = response.json()
        if isinstance(datos_json, str):
            print("Procesando string JSON...")
            if datos_json.startswith('[') and datos_json.endswith(']'):
                datos_json = datos_json[1:-1]
            datos_json = json.loads(datos_json) if datos_json.strip() else []
        
            
    except requests.exceptions.Timeout:
        print(f"Error: Timeout en la consulta ({timeout} segundos)")
        
    except requests.exceptions.ConnectionError:
        print("Error: No se pudo conectar al servidor SAP")
        
    except requests.exceptions.HTTPError as e:
        print(f"Error HTTP: {e}")
        print(f"Status Code: {response.status_code}")
        if response.content:
            print(f"Respuesta del servidor: {response.text}")
    except json.JSONDecodeError as e:
        print(f"Error al procesar JSON: {e}")
        print(f"Contenido recibido: {response.text}")
    except Exception as e:
        print(f"Error inesperado: {e}")
        
    return datos_json