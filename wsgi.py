import os
import sys

# Caminho absoluto para o diretório atual
current_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Current directory: {current_dir}")

# Caminho para o diretório backend
backend_path = os.path.join(current_dir, 'PriceMapProject', 'backend')
print(f"Backend path: {backend_path}")

# Adicionar os diretórios ao path do Python
sys.path.insert(0, backend_path)
sys.path.insert(0, current_dir)

# Listar os caminhos no sys.path
print("Python path:")
for p in sys.path:
    print(f"  - {p}")

# Lista os arquivos no diretório backend
print(f"Files in {backend_path}:")
try:
    for f in os.listdir(backend_path):
        print(f"  - {f}")
except Exception as e:
    print(f"Error listing files: {e}")

# Importar a aplicação
try:
    from pricemap.wsgi import application
    print("Successfully imported application from pricemap.wsgi")
except ImportError as e:
    print(f"ImportError: {e}")
    # Verificar se o módulo pricemap existe como pacote
    try:
        import pricemap
        print(f"pricemap module exists at: {pricemap.__file__}")
    except ImportError:
        print("pricemap module does not exist")
    
    # Se falhar, tente usar a aplicação padrão do Django
    try:
        from django.core.wsgi import get_wsgi_application
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pricemap.settings')
        application = get_wsgi_application()
        print("Using default Django WSGI application")
    except Exception as e:
        print(f"Error creating Django WSGI application: {e}")
        raise 