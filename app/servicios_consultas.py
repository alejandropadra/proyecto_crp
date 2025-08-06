import requests
from requests.auth import HTTPBasicAuth
import json
from typing import Dict, Optional, Any

class ConsultasSAP:
    """Este es el gestor de consultas a SAP, para no tener tantas sesiones de HTTP abiertas y solo abrir una sola"""
    
    def __init__(self, user_fuente: str, contra_fuente: str, ip_fuente: str, 
                verificacion_ssl: bool = True, timeout: int = 30):
        self.user_fuente = user_fuente
        self.contra_fuente = contra_fuente
        self.ip_fuente = ip_fuente
        self.verificacion_ssl = verificacion_ssl
        self.timeout = timeout
        
        # Aquí se Crea la sesión persistente
        self.session = requests.Session()
        self.session.auth = HTTPBasicAuth(user_fuente, contra_fuente)
        
    def _ejecutar_consulta(self, endpoint: str, args: Dict[str, Any] = None, 
                        headers: Dict[str, str] = None) -> Any:
        """
        Método interno para ejecutar consultas GET a SAP
        
        Returns:
            JSON procesado o None si hay error
        """
        url = self.ip_fuente + endpoint
        
        try:
            response = self.session.get(
                url,
                params=args or {},
                headers=headers or {},
                verify=self.verificacion_ssl,
                timeout=self.timeout
            )
            response.raise_for_status()
            
            # Procesar respuesta JSON
            datos_json = response.json()
            
            # Manejo especial para strings JSON
            if isinstance(datos_json, str):
                print("Procesando string JSON...")
                if datos_json.startswith('[') and datos_json.endswith(']'):
                    datos_json = datos_json[1:-1]
                datos_json = json.loads(datos_json) if datos_json.strip() else []
                
            return datos_json
            
        except requests.exceptions.Timeout:
            print(f"Error: Timeout en la consulta ({self.timeout} segundos)")
            return None
            
        except requests.exceptions.ConnectionError:
            print("Error: No se pudo conectar al servidor SAP")
            return None
            
        except requests.exceptions.HTTPError as e:
            print(f"Error HTTP: {e}")
            print(f"Status Code: {response.status_code}")
            if response.content:
                print(f"Respuesta del servidor: {response.text}")
            return None
            
        except json.JSONDecodeError as e:
            print(f"Error al procesar JSON: {e}")
            print(f"Contenido recibido: {response.text}")
            return None
            
        except Exception as e:
            print(f"Error inesperado: {e}")
            return None
    
    def consultar_deudores(self, rif: str, fecha_pago: str, 
                            tiempo: str, fecha_enc: str, cadena: str) -> Any:
        """
        Consulta endpoint de deudores
        
        Args:
            rif: RIF del cliente
            fecha_pago: Fecha de pago
            tiempo: Tiempo para header
            fecha_enc: Fecha encriptada para header
            cadena: Cadena MD5 para header
        """
        headers = {
            'Accept': 'application/json',
            'Origin': '',
            'BUKRS': '1200',
            'KUNNR': rif,
            'BUDAT': fecha_enc,
            'TIMLO': tiempo,
            'CORIMON': cadena
        }
        
        args = {
            'sap-client': '510',
            'SOCIEDAD': '1200',
            'CLIENTE': rif,
            'FEC_DEP': fecha_pago
        }
        
        response_json = self._ejecutar_consulta("/sap/bc/rest/zpasdeudores", args, headers)
        
        if response_json:
            
            try:
                if isinstance(response_json, str):
                    response_json = response_json[1:-1]
                    response_json = eval(response_json)
            
                if isinstance(response_json, dict):
                    return [response_json]

                return response_json
                
            except:
                return []
        
        return []
    
    def consultar_descuento_especial(self, fecha_pago: str) -> Dict[str, Any]:
        """
        Consulta descuentos especiales
        
        Args:
            fecha_pago: Fecha de pago
            
        Returns:
            Dict con 'descuento_div' y 'data'
        """
        args = {
            'sap-client': '510',
            'SOCIEDAD': '1200',
            'FEC_DEP': fecha_pago
        }
        
        response_json = self._ejecutar_consulta("/sap/bc/rest/zobdecesp", args)
        
        if response_json:
            try:
                # Procesamiento específico para descuentos
                response_str = str(response_json)
                response_str = response_str[1:-1]
                response_dict = eval(response_str)
                
                return {
                    'descuento_div': response_dict.get('descesp', 0),
                    'data': response_dict
                }
            except:
                return {'descuento_div': 0, 'data': []}
        
        return {'descuento_div': 0, 'data': []}
    
    def consultar_deudores_totales(self, rif: str, tiempo: str, fecha_enc: str, cadena: str) -> Dict[str, Any]:
        """
        Consulta totales de deudores
        
        Returns:
            Dict con los totales o dict vacío si hay error
        """
        headers = {
            'Accept': 'application/json',
            'Origin': '',
            'BUKRS': '1200',
            'KUNNR': rif,
            'BUDAT': fecha_enc,
            'TIMLO': tiempo,
            'CORIMON': cadena
        }
        
        args = {
            'sap-client': '510',
            'SOCIEDAD': '1200',
            'CLIENTE': rif,
            'TOTALES': 'X'
        }
        
        response_json = self._ejecutar_consulta("/sap/bc/rest/zpasdeudores", args, headers)
        if response_json:
            try:
                # Si es string, procesarlo como antes
                if isinstance(response_json, str):
                    if response_json.startswith('[') and response_json.endswith(']'):
                        response_json = response_json[1:-1]
                    response_json = json.loads(response_json)  # Mejor que eval()
                
                # Si es lista, tomar primer elemento
                elif isinstance(response_json, list) and len(response_json) > 0:
                    response_json = response_json[0]
                
                return response_json if isinstance(response_json, dict) else {}
                
            except (json.JSONDecodeError, IndexError) as e:
                print(f"Error: {e}")
                return {}

        return {}
    
    def consultar_retenciones(self, rif: str, tiempo: str, fecha_enc: str, cadena: str) -> Any:
        """
        Consulta retenciones del cliente
        
        Returns:
            Lista de retenciones o lista vacía si hay error
        """
        headers = {
            'Accept': 'application/json',
            'Origin': '',
            'BUKRS': '1200',
            'KUNNR': rif,
            'BUDAT': fecha_enc,
            'TIMLO': tiempo,
            'CORIMON': cadena
        }
        
        args = {
            'sap-client': '510',
            'ENVIO': 'C',
            'SOCIEDAD': '1200',
            'CLIENTE': rif,
        }
        
        response_json = self._ejecutar_consulta("/sap/bc/rest/zpasdeudores", args, headers)
        if response_json:
            try:
                if isinstance(response_json, str):
                    if response_json.startswith('[') and response_json.endswith(']'):
                        response_json = response_json[1:-1]
                    response_json = json.loads(response_json)  
            
                elif isinstance(response_json, list) and len(response_json) > 0:
                    response_json = response_json[0]
                
                return response_json if isinstance(response_json, dict) else {}
                
            except (json.JSONDecodeError, IndexError) as e:
                print(f"Error: {e}")
                return {}

        return {}
    
    
    
    def consultar_facturas_pendietes_retencion(self, rif: str, tiempo: str, fecha_enc: str, cadena: str) -> tuple[list, int]:
        """
        Consulta Facturas pendientes por retencion
        
        Args:
            rif: RIF del cliente
            tiempo: Tiempo para header
            fecha_enc: Fecha encriptada para header
            cadena: Cadena MD5 para header
            
        Returns:
            Tupla con (lista_datos, cantidad_elementos)
        """
        headers = {
            'Accept': 'application/json',
            'Origin': '',
            'BUKRS': '1200',
            'KUNNR': rif,
            'BUDAT': fecha_enc,
            'TIMLO': tiempo,
            'CORIMON': cadena
        }
        
        args = {
            'sap-client': '510',
            'ENVIO': 'D',
            'SOCIEDAD': '1200',
            'CLIENTE': rif,
        }
        
        response_json = self._ejecutar_consulta("/sap/bc/rest/zcertrete", args, headers)
        
        if response_json:
            try:
                if isinstance(response_json, str):
                    if response_json.startswith('[') and response_json.endswith(']'):
                        response_json = response_json[1:-1]
                    response_json = json.loads(response_json) if response_json.strip() else []
                
                elif isinstance(response_json, dict):
                    response_json = [response_json]
            
                elif isinstance(response_json, list):
                    pass
                
                else:
                    response_json = []
                    
                return response_json, len(response_json)
                
            except (json.JSONDecodeError, TypeError) as e:
                print(f"Error procesando certificados de retención: {e}")
                return [], 0
        
        return [], 0
    

    def consultar_retenciones_pendientes(self, rif: str, tiempo: str, fecha_enc: str, cadena: str) -> tuple[list, int]:
        """
        Consulta retenciones pendientes por validación
        
        Args:
            rif: RIF del cliente
            tiempo: Tiempo para header
            fecha_enc: Fecha encriptada para header
            cadena: Cadena MD5 para header
            
        Returns:
            Tupla con (lista_retenciones_pendientes, contador_pendientes)
        """
        headers = {
            'Accept': 'application/json',
            'Origin': '',
            'BUKRS': '1200',
            'KUNNR': rif,
            'BUDAT': fecha_enc,
            'TIMLO': tiempo,
            'CORIMON': cadena
        }
        
        args = {
            'sap-client': '510',
            'ENVIO': 'C',
            'SOCIEDAD': '1200',
            'CLIENTE': rif,
        }
        
        response_json = self._ejecutar_consulta("/sap/bc/rest/zcertrete", args, headers)
        
        if response_json:
            try:
                # Si es string, procesarlo
                if isinstance(response_json, str):
                    if response_json.startswith('[') and response_json.endswith(']'):
                        response_json = response_json[1:-1]
                    response_json = json.loads(response_json) if response_json.strip() else []
                
                # Si es dict, convertir a lista
                elif isinstance(response_json, dict):
                    response_json = [response_json]
                
                # Si es lista, mantenerla
                elif isinstance(response_json, list):
                    pass
                
                else:
                    response_json = []
                
                contador_pendientes = 0
                for retencion in response_json:
                    if isinstance(retencion, dict) and retencion.get('status') == "P":
                        contador_pendientes += 1
                        
                return response_json, contador_pendientes
                
            except (json.JSONDecodeError, TypeError) as e:
                print(f"Error procesando retenciones pendientes: {e}")
                return [], 0
        
        return [], 0
    
    
    
    def consulta_ivas_generico(self, rif: str, tiempo: str, fecha_enc: str, cadena: str) -> Any:
        """
        Consulta genérica de IVAs desde SAP
        
        Args:
            rif: RIF del cliente
            tiempo: Tiempo para header
            fecha_enc: Fecha encriptada para header
            cadena: Cadena MD5 para header
            
        Returns:
            Datos procesados según el tipo de respuesta:
            - Si es un diccionario único, retorna una lista con ese diccionario
            - Si es una lista, la retorna tal cual
            - Si es un string JSON, lo procesa y retorna
            - En caso de error, retorna lista vacía
        """
        headers = {
            'Accept': 'application/json',
            'Origin': '',
            'BUKRS': '1200',
            'KUNNR': rif,
            'BUDAT': fecha_enc,
            'TIMLO': tiempo,
            'CORIMON': cadena
        }
        
        args = {
            'sap-client': '510',
            'SOCIEDAD': '1200',
            'CLIENTE': rif,
            'PAGAIVA': 'X'
        }
        
        response_json = self._ejecutar_consulta("/sap/bc/rest/zpasdeudoiva", args, headers)
        
        if response_json:
            try:
                # Si es string, procesarlo
                if isinstance(response_json, str):
                    if response_json.startswith('[') and response_json.endswith(']'):
                        response_json = response_json[1:-1]
                    if response_json.strip():
                        try:
                            response_json = json.loads(response_json)
                        except json.JSONDecodeError:
                            response_json = eval(response_json)
                    else:
                        response_json = []
                
                # Si es un diccionario único, convertir a lista
                if isinstance(response_json, dict):
                    return response_json
                
                elif isinstance(response_json, list):
                    return response_json
                
                else:
                    print(f"Tipo de respuesta inesperado: {type(response_json)}")
                    return []
                    
            except (json.JSONDecodeError, SyntaxError, TypeError) as e:
                print(f"Error procesando respuesta de IVAs: {e}")
                print(f"Respuesta original: {response_json}")
                return []
        
        return []
    
    
    def consultar_documentos(self, rif: str, tiempo: str, fecha_enc: str, cadena: str) -> Any:
        """
        Consulta documentos del cliente en SAP
        
        Args:
            rif: RIF del cliente
            tiempo: Tiempo para header
            fecha_enc: Fecha encriptada para header
            cadena: Cadena MD5 para header
            
        Returns:
            Lista de documentos o lista vacía si hay error
        """
        headers = {
            'Accept': 'application/json',
            'Origin': '',
            'BUKRS': '1200',
            'KUNNR': rif,
            'BUDAT': fecha_enc,
            'TIMLO': tiempo,
            'CORIMON': cadena
        }
        
        args = {
            'sap-client': '510',
            'SOCIEDAD': '1200',
            'CLIENTE': rif,
        }
        
        response_json = self._ejecutar_consulta("/sap/bc/rest/zpasdeudores", args, headers)
        
        if response_json:
            try:
                # Si es string, procesarlo
                if isinstance(response_json, str):
                    if response_json.startswith('[') and response_json.endswith(']'):
                        response_json = response_json[1:-1]
                    response_json = json.loads(response_json) if response_json.strip() else []
                
                # Si es dict, convertir a lista
                elif isinstance(response_json, dict):
                    response_json = [response_json]
                
                # Si es lista, mantenerla
                elif isinstance(response_json, list):
                    pass
                
                else:
                    response_json = []
                    
                return response_json
                
            except (json.JSONDecodeError, TypeError) as e:
                print(f"Error procesando documentos: {e}")
                return []
        
        return []
        

    def consultar_ivas_pendientes(self, rif: str, tiempo: str, fecha_enc: str, cadena: str) -> tuple[list, int]:
        """
        Consulta IVAs pendientes por pagar
        
        Args:
            rif: RIF del cliente
            tiempo: Tiempo para header
            fecha_enc: Fecha encriptada para header
            cadena: Cadena MD5 para header
            
        Returns:
            Tupla con (lista_ivas_pendientes, contador_ivas_pendientes)
        """
        headers = {
            'Accept': 'application/json',
            'Origin': '',
            'BUKRS': '1200',
            'KUNNR': rif,
            'BUDAT': fecha_enc,
            'TIMLO': tiempo,
            'CORIMON': cadena
        }
        
        args = {
            'sap-client': '510',
            'SOCIEDAD': '1200',
            'CLIENTE': rif,
            'PAGAIVA': 'X'
        }
        
        response_json = self._ejecutar_consulta("/sap/bc/rest/zpasdeudoiva", args, headers)
        
        if response_json:
            try:
                # Si es string, procesarlo
                if isinstance(response_json, str):
                    if response_json.startswith('[') and response_json.endswith(']'):
                        response_json = response_json[1:-1]
                    response_json = json.loads(response_json) if response_json.strip() else []
                
                # Si es dict, convertir a lista
                elif isinstance(response_json, dict):
                    response_json = [response_json]
                
                # Si es lista, mantenerla
                elif isinstance(response_json, list):
                    pass
                
                else:
                    response_json = []
                
                # Filtrar IVAs pendientes (statusiva = "P")
                ivas_pendientes = []
                for iva in response_json:
                    if isinstance(iva, dict) and iva.get('statusiva') == 'P':
                        ivas_pendientes.append(iva)
                        
                return ivas_pendientes, len(ivas_pendientes)
                
            except (json.JSONDecodeError, TypeError) as e:
                print(f"Error procesando IVAs pendientes: {e}")
                return [], 0
        
        return [], 0
    
    def consulta_generica(self, endpoint: str, args: Dict[str, Any] = None, 
                            headers: Dict[str, str] = None) -> Any:
        """
        Método genérico para consultas que no tienen método específico
        
        Args:
            endpoint: Ruta del endpoint (ej: "/sap/bc/rest/nuevo")
            args: Parámetros de la consulta
            headers: Headers HTTP
        """
        return self._ejecutar_consulta(endpoint, args, headers)
    
    def cerrar_sesion(self):
        """Cierra la sesión HTTP"""
        self.session.close()