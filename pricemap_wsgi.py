"""
WSGI config for pricemap project.

It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
import sys

# Caminho para o diretório backend
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'PriceMapProject', 'backend')

# Adicionar o diretório backend ao path do Python
sys.path.insert(0, backend_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pricemap.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application() 