import os
import sys

# Caminho absoluto para o diretório atual
current_dir = os.path.dirname(os.path.abspath(__file__))

# Caminho para o diretório backend
backend_path = os.path.join(current_dir, 'PriceMapProject', 'backend')

# Adicionar os diretórios ao path do Python
sys.path.insert(0, backend_path)
sys.path.insert(0, current_dir)

# Configurações do Gunicorn
bind = "0.0.0.0:" + os.environ.get("PORT", "8000")
workers = int(os.environ.get("WEB_CONCURRENCY", 4))
timeout = 120
accesslog = "-"
errorlog = "-"
loglevel = "debug"
pythonpath = backend_path 