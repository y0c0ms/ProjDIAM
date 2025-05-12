#!/usr/bin/env bash
# exit on error
set -o errexit

# Se executando na raiz, vá para o diretório de backend
cd PriceMapProject/backend

# Instalar dependências
pip install -r requirements.txt

# Coletar arquivos estáticos
python manage.py collectstatic --no-input

# Aplicar migrações
python manage.py migrate

# Garantir que a pasta do projeto seja adicionada ao PYTHONPATH
echo "export PYTHONPATH=$PYTHONPATH:$(pwd)" >> $HOME/.bashrc 