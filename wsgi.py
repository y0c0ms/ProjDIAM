import os
import sys

# Adicionar o diretório do backend ao path do Python
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'PriceMapProject/backend'))

# Importar e reexportar o módulo wsgi do projeto Django
from pricemap.wsgi import application 