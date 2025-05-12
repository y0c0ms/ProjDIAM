"""
Módulo de ponte para permitir que o Render encontre o módulo pricemap.
Este arquivo é importado pelo gunicorn quando ele tenta carregar 'pricemap.wsgi:application'.
"""

import os
import sys

# Caminho para o diretório backend
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'PriceMapProject', 'backend')

# Adicionar o diretório backend ao path do Python
sys.path.insert(0, backend_path)

# Importar e reexportar os módulos de pricemap
from PriceMapProject.backend.pricemap import wsgi, urls, settings, asgi 