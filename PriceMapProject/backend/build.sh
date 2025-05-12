#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar dependências
pip install -r requirements.txt

# Coletar arquivos estáticos
python manage.py collectstatic --no-input

# Aplicar migrações
python manage.py migrate 